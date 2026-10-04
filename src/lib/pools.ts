import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "./db";
import {
  markets,
  members,
  outcomes,
  pools,
  trades,
  type Market,
  type Member,
  type Outcome,
  type Pool,
} from "./db/schema";
import { prices } from "./lmsr";

export type OutcomeView = Outcome & { price: number };
export type MarketView = Market & {
  outcomes: OutcomeView[];
  volume: number;
  traders: number;
};
export type Holding = {
  marketId: string;
  outcomeId: string;
  shares: number;
  /** Net points spent on this outcome (buys minus sells). */
  spent: number;
};
export type LeaderRow = {
  member: Member;
  net: number;
  rank: number;
};
export type FeedItem = {
  id: string;
  marketId: string;
  memberName: string;
  marketQuestion: string;
  marketKind: Market["kind"];
  outcomeLabel: string;
  shares: number;
  cost: number;
  createdAt: Date;
};

export const getPool = cache(async (slug: string) =>
  db.query.pools.findFirst({ where: eq(pools.slug, slug) }),
);

export async function getMember(poolId: string, deviceId: string | null) {
  if (!deviceId) return undefined;
  return db.query.members.findFirst({
    where: and(eq(members.poolId, poolId), eq(members.deviceId, deviceId)),
  });
}

/** Outcomes sorted for display, with current LMSR prices attached. */
export function withPrices(market: Market, rows: Outcome[]): OutcomeView[] {
  const sorted = [...rows].sort(
    (a, b) => a.sortOrder - b.sortOrder || +a.createdAt - +b.createdAt,
  );
  const p = prices(
    sorted.map((o) => o.shares),
    market.liquidity,
  );
  return sorted.map((o, i) => ({ ...o, price: p[i] }));
}

export async function getMarkets(poolId: string): Promise<MarketView[]> {
  const ms = await db.query.markets.findMany({
    where: eq(markets.poolId, poolId),
    orderBy: [asc(markets.sortOrder), asc(markets.createdAt)],
  });
  if (!ms.length) return [];
  const ids = ms.map((m) => m.id);
  const [os, ts] = await Promise.all([
    db.select().from(outcomes).where(inArray(outcomes.marketId, ids)),
    db
      .select({
        marketId: trades.marketId,
        memberId: trades.memberId,
        cost: trades.cost,
      })
      .from(trades)
      .where(inArray(trades.marketId, ids)),
  ]);
  return ms.map((m) => {
    const mt = ts.filter((t) => t.marketId === m.id);
    return {
      ...m,
      outcomes: withPrices(
        m,
        os.filter((o) => o.marketId === m.id),
      ),
      volume: mt.reduce((s, t) => s + Math.abs(t.cost), 0),
      traders: new Set(mt.map((t) => t.memberId)).size,
    };
  });
}

export async function getHoldings(poolId: string): Promise<
  Map<string, Holding[]>
> {
  const rows = await db
    .select({
      memberId: trades.memberId,
      marketId: trades.marketId,
      outcomeId: trades.outcomeId,
      shares: trades.shares,
      cost: trades.cost,
    })
    .from(trades)
    .innerJoin(markets, eq(markets.id, trades.marketId))
    .where(eq(markets.poolId, poolId));

  const byMember = new Map<string, Map<string, Holding>>();
  for (const r of rows) {
    const mine = byMember.get(r.memberId) ?? new Map<string, Holding>();
    byMember.set(r.memberId, mine);
    const h = mine.get(r.outcomeId) ?? {
      marketId: r.marketId,
      outcomeId: r.outcomeId,
      shares: 0,
      spent: 0,
    };
    h.shares += r.shares;
    h.spent += r.cost;
    mine.set(r.outcomeId, h);
  }
  const out = new Map<string, Holding[]>();
  for (const [memberId, hs] of byMember)
    out.set(
      memberId,
      [...hs.values()].filter((h) => h.shares > 1e-9),
    );
  return out;
}

/** Mark-to-market value of open positions (resolved markets already paid out). */
export function positionValue(holdings: Holding[], ms: MarketView[]) {
  let value = 0;
  for (const h of holdings) {
    const m = ms.find((x) => x.id === h.marketId);
    if (!m || m.status === "resolved") continue;
    const o = m.outcomes.find((x) => x.id === h.outcomeId);
    value += h.shares * (o?.price ?? 0);
  }
  return value;
}

export function leaderboard(
  pool: Pool,
  all: Member[],
  holdings: Map<string, Holding[]>,
  ms: MarketView[],
): LeaderRow[] {
  const rows = all
    .filter((m) => m.role !== "parent")
    .map((member) => ({
      member,
      net: member.balance + positionValue(holdings.get(member.id) ?? [], ms),
    }))
    .sort((a, b) => b.net - a.net);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

export async function getFeed(poolId: string, limit = 20): Promise<FeedItem[]> {
  const rows = await db
    .select({
      id: trades.id,
      marketId: trades.marketId,
      memberName: members.displayName,
      marketQuestion: markets.question,
      marketKind: markets.kind,
      outcomeLabel: outcomes.label,
      shares: trades.shares,
      cost: trades.cost,
      createdAt: trades.createdAt,
    })
    .from(trades)
    .innerJoin(markets, eq(markets.id, trades.marketId))
    .innerJoin(members, eq(members.id, trades.memberId))
    .innerJoin(outcomes, eq(outcomes.id, trades.outcomeId))
    .where(eq(markets.poolId, poolId))
    .orderBy(desc(trades.createdAt))
    .limit(limit);
  return rows;
}

export async function getMembers(poolId: string) {
  return db.query.members.findMany({
    where: eq(members.poolId, poolId),
    orderBy: [asc(members.createdAt)],
  });
}

export async function getPriceHistory(market: MarketView) {
  const rows = await db
    .select({ pricesAfter: trades.pricesAfter, createdAt: trades.createdAt })
    .from(trades)
    .where(eq(trades.marketId, market.id))
    .orderBy(asc(trades.createdAt));
  const start = Object.fromEntries(
    market.outcomes.map((o) => [o.id, 1 / market.outcomes.length]),
  );
  return [
    { at: market.createdAt, prices: start as Record<string, number> },
    ...rows.map((r) => ({
      at: r.createdAt,
      prices: JSON.parse(r.pricesAfter) as Record<string, number>,
    })),
  ];
}

/** Everything the pool page needs, in one go. */
export const getPoolView = cache(async function getPoolView(
  slug: string,
  deviceId: string | null,
) {
  const pool = await getPool(slug);
  if (!pool) return null;
  const [me, ms, all, holdings, feed] = await Promise.all([
    getMember(pool.id, deviceId),
    getMarkets(pool.id),
    getMembers(pool.id),
    getHoldings(pool.id),
    getFeed(pool.id),
  ]);
  const board = leaderboard(pool, all, holdings, ms);
  return {
    pool,
    me,
    markets: ms,
    members: all,
    holdings,
    myHoldings: me ? (holdings.get(me.id) ?? []) : [],
    board,
    feed,
  };
});

export function isAdmin(pool: Pool, me: Member | undefined, key?: string | null) {
  return (
    (key != null && key === pool.adminKey) ||
    me?.role === "admin" ||
    me?.role === "parent"
  );
}
