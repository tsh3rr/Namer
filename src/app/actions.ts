"use server";

import { and, eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, type Tx } from "@/lib/db";
import {
  markets,
  members,
  outcomes,
  pools,
  trades,
  type Market,
  type MarketKind,
} from "@/lib/db/schema";
import { makeSlug, newAdminKey, newId } from "@/lib/ids";
import { prices, proceedsForShares, sharesForAmount } from "@/lib/lmsr";
import {
  MARKET_TEMPLATES,
  cleanName,
  defaultOutcomes,
  labelKey,
  templateFor,
} from "@/lib/markets";
import { getMember, getPool, isAdmin } from "@/lib/pools";
import { ensureDeviceId, getDeviceId } from "@/lib/session";
import { BRAND } from "@/lib/brand";

export type ActionState = { error?: string; ok?: string } | undefined;

const displayName = z
  .string()
  .trim()
  .min(1, "Wie heißt du?")
  .max(32, "Bitte höchstens 32 Zeichen.");

async function insertMarket(
  tx: Tx,
  poolId: string,
  kind: MarketKind,
  question: string,
  liquidity: number,
  allowNewOutcomes: boolean,
  labels: { label: string; isCatchAll?: boolean }[],
  sortOrder: number,
  createdBy?: string,
) {
  const marketId = newId();
  await tx.insert(markets).values({
    id: marketId,
    poolId,
    kind,
    question,
    liquidity,
    allowNewOutcomes,
    sortOrder,
  });
  const seen = new Set<string>();
  const rows = labels
    .filter((o) => {
      const k = labelKey(o.label);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((o, i) => ({
      id: newId(),
      marketId,
      label: o.label,
      labelKey: labelKey(o.label),
      isCatchAll: !!o.isCatchAll,
      // Keep the catch-all last no matter how many names get added later.
      sortOrder: o.isCatchAll ? 10_000 : i,
      createdBy,
    }));
  if (rows.length) await tx.insert(outcomes).values(rows);
  return marketId;
}

/* ------------------------------------------------------------------ */
/* Onboarding: create a pool                                           */
/* ------------------------------------------------------------------ */

const createSchema = z.object({
  role: z.enum(["parent", "friend"]),
  creatorName: displayName,
  babyName: z.string().trim().min(1, "Gib eurem Baby einen Spitznamen.").max(40),
  parentNames: z.string().trim().max(60).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  markets: z
    .array(z.enum(["gender", "name", "date", "weight", "length"]))
    .min(1, "Wähle mindestens eine Frage aus."),
  nameIdeas: z.string().max(400).optional(),
  stakes: z.string().trim().max(140).optional(),
});

export async function createPool(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = createSchema.safeParse({
    role: form.get("role"),
    creatorName: form.get("creatorName"),
    babyName: form.get("babyName"),
    parentNames: form.get("parentNames") || undefined,
    dueDate: form.get("dueDate") || undefined,
    markets: form.getAll("markets"),
    nameIdeas: form.get("nameIdeas") || undefined,
    stakes: form.get("stakes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const deviceId = await ensureDeviceId();
  const poolId = newId();
  const slug = makeSlug(d.babyName);
  const nameIdeas = (d.nameIdeas ?? "")
    .split(/[,\n]/)
    .map(cleanName)
    .filter(Boolean)
    .slice(0, 12);

  await db.transaction(async (tx) => {
    await tx.insert(pools).values({
      id: poolId,
      slug,
      babyName: d.babyName,
      parentNames: d.parentNames || null,
      dueDate: d.dueDate || null,
      adminKey: newAdminKey(),
      stakes: d.stakes || null,
    });
    await tx.insert(members).values({
      id: newId(),
      poolId,
      deviceId,
      displayName: d.creatorName,
      // Parents know too much to bet fairly; they host instead.
      role: d.role === "parent" ? "parent" : "admin",
      balance: 1000,
    });
    let order = 0;
    for (const t of MARKET_TEMPLATES) {
      if (!d.markets.includes(t.kind)) continue;
      await insertMarket(
        tx,
        poolId,
        t.kind,
        t.question,
        t.liquidity,
        t.allowNewOutcomes,
        defaultOutcomes(t.kind, { dueDate: d.dueDate, nameIdeas }),
        order++,
      );
    }
  });

  redirect(`/p/${slug}/einladen?neu=1`);
}

/* ------------------------------------------------------------------ */
/* Onboarding: join a pool from an invite link                         */
/* ------------------------------------------------------------------ */

export async function joinPool(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const slug = String(form.get("slug") ?? "");
  const parsedName = displayName.safeParse(form.get("displayName"));
  if (!parsedName.success) return { error: parsedName.error.issues[0].message };
  const pool = await getPool(slug);
  if (!pool) return { error: "Diese Tipprunde gibt es nicht (mehr)." };

  const deviceId = await ensureDeviceId();
  const existing = await getMember(pool.id, deviceId);
  if (existing) redirect(`/p/${slug}`);

  const ref = String(form.get("ref") ?? "");
  // The host link carries the admin key: whoever opens it co-hosts.
  const isHost = form.get("key") === pool.adminKey;
  const role = isHost
    ? form.get("asParent") === "1"
      ? "parent"
      : "admin"
    : "player";

  await db.transaction(async (tx) => {
    const inviter = ref
      ? await tx.query.members.findFirst({
          where: and(eq(members.id, ref), eq(members.poolId, pool.id)),
        })
      : undefined;
    await tx.insert(members).values({
      id: newId(),
      poolId: pool.id,
      deviceId,
      displayName: parsedName.data,
      role,
      balance: pool.startingPoints,
      invitedBy: inviter?.id ?? null,
    });
    // Viral loop: whoever brought a new player gets a bonus.
    if (inviter && inviter.role !== "parent")
      await tx
        .update(members)
        .set({ balance: sql`${members.balance} + ${pool.inviteBonus}` })
        .where(eq(members.id, inviter.id));
  });

  redirect(`/p/${slug}?willkommen=1`);
}

/** An existing player opened the host link: make them a co-host. */
export async function claimHost(form: FormData) {
  const slug = String(form.get("slug") ?? "");
  const pool = await getPool(slug);
  if (!pool || form.get("key") !== pool.adminKey) redirect(`/p/${slug}`);
  const me = await getMember(pool.id, await getDeviceId());
  if (me?.role === "player")
    await db
      .update(members)
      .set({ role: form.get("asParent") === "1" ? "parent" : "admin" })
      .where(eq(members.id, me.id));
  redirect(`/p/${slug}/verwalten`);
}

/* ------------------------------------------------------------------ */
/* Trading                                                             */
/* ------------------------------------------------------------------ */

async function loadTradeContext(tx: Tx, marketId: string, deviceId: string) {
  const market = await tx.query.markets.findFirst({
    where: eq(markets.id, marketId),
  });
  if (!market) throw new UserError("Diese Frage gibt es nicht.");
  const me = await tx.query.members.findFirst({
    where: and(eq(members.poolId, market.poolId), eq(members.deviceId, deviceId)),
  });
  if (!me) throw new UserError("Tritt der Tipprunde zuerst bei.");
  if (me.role === "parent")
    throw new UserError("Eltern wissen zu viel 😉 Ihr dürft nur zuschauen.");
  if (market.status !== "open")
    throw new UserError("Diese Frage ist bereits geschlossen.");
  const os = (
    await tx.query.outcomes.findMany({ where: eq(outcomes.marketId, marketId) })
  ).sort((a, b) => a.sortOrder - b.sortOrder || +a.createdAt - +b.createdAt);
  return { market, me, os };
}

class UserError extends Error {}

function priceMap(market: Market, os: { id: string; shares: number }[]) {
  const p = prices(
    os.map((o) => o.shares),
    market.liquidity,
  );
  return JSON.stringify(Object.fromEntries(os.map((o, i) => [o.id, p[i]])));
}

const tradeSchema = z.object({
  marketId: z.string().min(1),
  outcomeId: z.string().min(1),
  side: z.enum(["buy", "sell"]),
  amount: z.coerce.number().positive("Gib einen Betrag ein.").max(1_000_000),
});

export async function placeTrade(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = tradeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { marketId, outcomeId, side, amount } = parsed.data;
  const deviceId = await getDeviceId();
  if (!deviceId) return { error: "Tritt der Tipprunde zuerst bei." };

  try {
    const msg = await db.transaction(async (tx) => {
      const { market, me, os } = await loadTradeContext(tx, marketId, deviceId);
      const i = os.findIndex((o) => o.id === outcomeId);
      if (i < 0) throw new UserError("Unbekannte Option.");
      const q = os.map((o) => o.shares);

      let shares: number;
      let cost: number;
      if (side === "buy") {
        if (amount > me.balance + 1e-9)
          throw new UserError("So viele Punkte hast du nicht.");
        cost = amount;
        shares = sharesForAmount(q, market.liquidity, i, amount);
      } else {
        const [{ held }] = await tx
          .select({ held: sql<number>`coalesce(sum(${trades.shares}), 0)` })
          .from(trades)
          .where(
            and(eq(trades.memberId, me.id), eq(trades.outcomeId, outcomeId)),
          );
        // "amount" is the number of shares to sell.
        const toSell = Math.min(amount, held);
        if (toSell <= 1e-9) throw new UserError("Du hältst hier keine Anteile.");
        shares = -toSell;
        cost = -proceedsForShares(q, market.liquidity, i, toSell);
      }

      os[i] = { ...os[i], shares: os[i].shares + shares };
      await tx
        .update(outcomes)
        .set({ shares: os[i].shares })
        .where(eq(outcomes.id, outcomeId));
      await tx
        .update(members)
        .set({ balance: sql`${members.balance} - ${cost}` })
        .where(eq(members.id, me.id));
      await tx.insert(trades).values({
        id: newId(),
        marketId,
        outcomeId,
        memberId: me.id,
        shares,
        cost,
        pricesAfter: priceMap(market, os),
      });
      return side === "buy"
        ? `Tipp abgegeben: ${shares.toFixed(1)} Anteile „${os[i].label}“`
        : `Verkauft für ${(-cost).toFixed(0)} Punkte`;
    });
    refresh();
    return { ok: msg };
  } catch (e) {
    if (e instanceof UserError) return { error: e.message };
    throw e;
  }
}

/** Anyone can propose a name; optionally put points on it straight away. */
export async function suggestOutcome(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const marketId = String(form.get("marketId") ?? "");
  const label = cleanName(String(form.get("label") ?? ""));
  if (!labelKey(label)) return { error: "Welcher Name?" };
  const deviceId = await getDeviceId();
  if (!deviceId) return { error: "Tritt der Tipprunde zuerst bei." };

  try {
    await db.transaction(async (tx) => {
      const market = await tx.query.markets.findFirst({
        where: eq(markets.id, marketId),
      });
      if (!market?.allowNewOutcomes)
        throw new UserError("Hier können keine Optionen ergänzt werden.");
      if (market.status !== "open")
        throw new UserError("Diese Frage ist bereits geschlossen.");
      const me = await tx.query.members.findFirst({
        where: and(
          eq(members.poolId, market.poolId),
          eq(members.deviceId, deviceId),
        ),
      });
      if (!me) throw new UserError("Tritt der Tipprunde zuerst bei.");
      const dup = await tx.query.outcomes.findFirst({
        where: and(
          eq(outcomes.marketId, marketId),
          eq(outcomes.labelKey, labelKey(label)),
        ),
      });
      if (dup) throw new UserError(`„${dup.label}“ steht schon zur Wahl.`);
      const count = await tx.$count(outcomes, eq(outcomes.marketId, marketId));
      if (count >= 60) throw new UserError("Die Namensliste ist voll.");
      await tx.insert(outcomes).values({
        id: newId(),
        marketId,
        label,
        labelKey: labelKey(label),
        sortOrder: count,
        createdBy: me.id,
      });
    });
    refresh();
    return { ok: `„${label}“ ist jetzt dabei!` };
  } catch (e) {
    if (e instanceof UserError) return { error: e.message };
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/* Hosting (parents / creator)                                         */
/* ------------------------------------------------------------------ */

async function requireAdmin(slug: string, key?: string | null) {
  const pool = await getPool(slug);
  if (!pool) throw new UserError("Diese Tipprunde gibt es nicht.");
  const me = await getMember(pool.id, await getDeviceId());
  if (!isAdmin(pool, me, key)) throw new UserError("Nur für Gastgeber.");
  return { pool, me };
}

async function adminMarket(form: FormData) {
  const slug = String(form.get("slug") ?? "");
  const { pool } = await requireAdmin(slug, form.get("key") as string | null);
  const market = await db.query.markets.findFirst({
    where: and(
      eq(markets.id, String(form.get("marketId") ?? "")),
      eq(markets.poolId, pool.id),
    ),
  });
  if (!market) throw new UserError("Diese Frage gibt es nicht.");
  return { pool, market };
}

async function guard(fn: () => Promise<string | void>): Promise<ActionState> {
  try {
    const ok = await fn();
    refresh();
    return ok ? { ok } : {};
  } catch (e) {
    if (e instanceof UserError) return { error: e.message };
    throw e;
  }
}

export async function setMarketOpen(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  return guard(async () => {
    const { market } = await adminMarket(form);
    if (market.status === "resolved")
      throw new UserError("Bereits aufgelöst.");
    const open = form.get("open") === "1";
    await db
      .update(markets)
      .set({ status: open ? "open" : "closed" })
      .where(eq(markets.id, market.id));
    return open ? "Frage wieder geöffnet." : "Frage geschlossen.";
  });
}

export async function resolveMarket(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  return guard(async () => {
    const { pool, market } = await adminMarket(form);
    if (market.status === "resolved")
      throw new UserError("Diese Frage ist schon aufgelöst.");
    const outcomeId = String(form.get("outcomeId") ?? "");
    const revealedName = cleanName(String(form.get("revealedName") ?? ""));

    await db.transaction(async (tx) => {
      const winner = await tx.query.outcomes.findFirst({
        where: and(eq(outcomes.id, outcomeId), eq(outcomes.marketId, market.id)),
      });
      if (!winner) throw new UserError("Bitte wähle das Ergebnis.");
      // Every winning share pays out exactly 1 point.
      const payouts = await tx
        .select({
          memberId: trades.memberId,
          shares: sql<number>`sum(${trades.shares})`,
        })
        .from(trades)
        .where(eq(trades.outcomeId, winner.id))
        .groupBy(trades.memberId);
      for (const p of payouts) {
        if (p.shares <= 1e-9) continue;
        await tx
          .update(members)
          .set({ balance: sql`${members.balance} + ${p.shares}` })
          .where(eq(members.id, p.memberId));
      }
      await tx
        .update(markets)
        .set({ status: "resolved", resolvedOutcomeId: winner.id })
        .where(eq(markets.id, market.id));
      if (market.kind === "name")
        await tx
          .update(pools)
          .set({
            revealedName: winner.isCatchAll ? revealedName || null : winner.label,
          })
          .where(eq(pools.id, pool.id));
    });
    return "Aufgelöst! Gewinne wurden ausgezahlt 🎉";
  });
}

const customSchema = z.object({
  question: z.string().trim().min(3, "Wie lautet die Frage?").max(80),
  options: z
    .array(z.string().trim().min(1).max(40))
    .min(2, "Mindestens zwei Antworten.")
    .max(8),
});

export async function addMarket(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  return guard(async () => {
    const slug = String(form.get("slug") ?? "");
    const { pool } = await requireAdmin(slug, form.get("key") as string | null);
    const kind = String(form.get("kind") ?? "");
    const order = await db.$count(markets, eq(markets.poolId, pool.id));

    if (kind === "custom") {
      if (!pool.premium)
        throw new UserError(`Eigene Fragen gibt es mit ${BRAND.plusName}.`);
      const parsed = customSchema.safeParse({
        question: form.get("question"),
        options: String(form.get("options") ?? "")
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter(Boolean),
      });
      if (!parsed.success) throw new UserError(parsed.error.issues[0].message);
      await db.transaction((tx) =>
        insertMarket(
          tx,
          pool.id,
          "custom",
          parsed.data.question,
          100,
          false,
          parsed.data.options.map((label) => ({ label })),
          order,
        ),
      );
      return "Neue Frage ist live!";
    }

    const t = templateFor(kind as MarketKind);
    if (!t || kind === "custom") throw new UserError("Unbekannte Frage.");
    const exists = await db.query.markets.findFirst({
      where: and(eq(markets.poolId, pool.id), eq(markets.kind, t.kind)),
    });
    if (exists) throw new UserError("Diese Frage gibt es schon.");
    await db.transaction((tx) =>
      insertMarket(
        tx,
        pool.id,
        t.kind,
        t.question,
        t.liquidity,
        t.allowNewOutcomes,
        defaultOutcomes(t.kind, { dueDate: pool.dueDate }),
        order,
      ),
    );
    return `${t.title} ist jetzt dabei!`;
  });
}

const settingsSchema = z.object({
  babyName: z.string().trim().min(1).max(40),
  parentNames: z.string().trim().max(60),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  stakes: z.string().trim().max(140),
  theme: z.enum(["blush", "sky", "sage", "sun"]),
});

export async function updateSettings(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  return guard(async () => {
    const slug = String(form.get("slug") ?? "");
    const { pool } = await requireAdmin(slug, form.get("key") as string | null);
    const parsed = settingsSchema.safeParse({
      babyName: form.get("babyName"),
      parentNames: form.get("parentNames") ?? "",
      dueDate: form.get("dueDate") ?? "",
      stakes: form.get("stakes") ?? "",
      theme: form.get("theme") ?? pool.theme,
    });
    if (!parsed.success) throw new UserError(parsed.error.issues[0].message);
    const d = parsed.data;
    if (d.theme !== "blush" && d.theme !== pool.theme && !pool.premium)
      throw new UserError(`Weitere Farbwelten gibt es mit ${BRAND.plusName}.`);
    await db
      .update(pools)
      .set({
        babyName: d.babyName,
        parentNames: d.parentNames || null,
        dueDate: d.dueDate || null,
        stakes: d.stakes || null,
        theme: d.theme,
      })
      .where(eq(pools.id, pool.id));
    return "Gespeichert.";
  });
}
