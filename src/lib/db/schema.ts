import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

/** A "Tipprunde": one baby, many markets. */
export const pools = sqliteTable("pools", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  babyName: text("baby_name").notNull(), // e.g. "Baby Müller"
  parentNames: text("parent_names"),
  dueDate: text("due_date"), // ISO date (yyyy-mm-dd)
  adminKey: text("admin_key").notNull(),
  startingPoints: integer("starting_points").notNull().default(1000),
  inviteBonus: integer("invite_bonus").notNull().default(100),
  stakes: text("stakes"), // fun real-world stakes ("Verlierer bringen Windeln mit")
  theme: text("theme").notNull().default("blush"),
  premium: integer("premium", { mode: "boolean" }).notNull().default(false),
  revealedName: text("revealed_name"),
  createdAt: createdAt(),
});

/** A participant inside one pool, identified by an anonymous device cookie. */
export const members = sqliteTable(
  "members",
  {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
      .notNull()
      .references(() => pools.id, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role", { enum: ["parent", "admin", "player"] })
      .notNull()
      .default("player"),
    balance: real("balance").notNull(),
    invitedBy: text("invited_by"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("members_pool_device").on(t.poolId, t.deviceId),
    index("members_pool").on(t.poolId),
  ],
);

export const MARKET_KINDS = [
  "gender",
  "name",
  "date",
  "weight",
  "length",
  "custom",
] as const;
export type MarketKind = (typeof MARKET_KINDS)[number];

export const markets = sqliteTable(
  "markets",
  {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
      .notNull()
      .references(() => pools.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: MARKET_KINDS }).notNull(),
    question: text("question").notNull(),
    /** LMSR liquidity parameter: higher = prices move less per point. */
    liquidity: real("liquidity").notNull(),
    allowNewOutcomes: integer("allow_new_outcomes", { mode: "boolean" })
      .notNull()
      .default(false),
    status: text("status", { enum: ["open", "closed", "resolved"] })
      .notNull()
      .default("open"),
    resolvedOutcomeId: text("resolved_outcome_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("markets_pool").on(t.poolId)],
);

export const outcomes = sqliteTable(
  "outcomes",
  {
    id: text("id").primaryKey(),
    marketId: text("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    /** Normalised label used for de-duplication of user-suggested names. */
    labelKey: text("label_key").notNull(),
    /** Outstanding shares held by all players (the LMSR "q" vector). */
    shares: real("shares").notNull().default(0),
    isCatchAll: integer("is_catch_all", { mode: "boolean" })
      .notNull()
      .default(false),
    createdBy: text("created_by"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("outcomes_market_label").on(t.marketId, t.labelKey)],
);

export const trades = sqliteTable(
  "trades",
  {
    id: text("id").primaryKey(),
    marketId: text("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "cascade" }),
    outcomeId: text("outcome_id")
      .notNull()
      .references(() => outcomes.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    /** Positive = bought, negative = sold. */
    shares: real("shares").notNull(),
    /** Points paid (positive) or received (negative). */
    cost: real("cost").notNull(),
    /** JSON map outcomeId -> price after this trade, for the price chart. */
    pricesAfter: text("prices_after").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("trades_market").on(t.marketId),
    index("trades_member").on(t.memberId),
  ],
);

export type Pool = typeof pools.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Market = typeof markets.$inferSelect;
export type Outcome = typeof outcomes.$inferSelect;
export type Trade = typeof trades.$inferSelect;
