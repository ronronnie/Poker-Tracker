import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  uuid,
  pgEnum,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ─────────────────────────────────────────────────────────────────────

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
  "premium",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "inactive",
  "trialing",
  "canceled",
]);

export const gameTypeEnum = pgEnum("game_type", [
  "cash",
  "tournament",
  "sit_and_go",
]);

export const groupRoleEnum = pgEnum("group_role", ["admin", "member"]);

// ── Profiles ──────────────────────────────────────────────────────────────────
// id is a TEXT field to hold Clerk's user ID format (e.g. user_2abc123)

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  full_name: text("full_name"),
  username: text("username").unique(),
  avatar_url: text("avatar_url"),
  currency: text("currency").default("INR").notNull(),

  // Subscription — dummy for now, schema is future-ready
  subscription_tier: subscriptionTierEnum("subscription_tier")
    .default("free")
    .notNull(),
  subscription_status: subscriptionStatusEnum("subscription_status")
    .default("active")
    .notNull(),
  subscription_expires_at: timestamp("subscription_expires_at"),
  stripe_customer_id: text("stripe_customer_id"),

  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ── Groups ────────────────────────────────────────────────────────────────────

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  created_by: text("created_by")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  invite_code: text("invite_code").unique(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  group_id: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  user_id: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  role: groupRoleEnum("role").default("member").notNull(),
  joined_at: timestamp("joined_at").defaultNow().notNull(),
});

// ── Sessions (Bank Roll) ──────────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  venue: text("venue"),
  game_type: gameTypeEnum("game_type").default("cash").notNull(),
  stakes: text("stakes"),
  buy_in: numeric("buy_in", { precision: 12, scale: 2 }).notNull(),
  cash_out: numeric("cash_out", { precision: 12, scale: 2 }).notNull(),
  duration_minutes: integer("duration_minutes"),
  notes: text("notes"),
  group_id: uuid("group_id").references(() => groups.id, {
    onDelete: "set null",
  }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ── Hand Histories ────────────────────────────────────────────────────────────
// Schema only — UI is a future module (currently "Coming Soon")

export const handHistories = pgTable("hand_histories", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  session_id: uuid("session_id").references(() => sessions.id, {
    onDelete: "set null",
  }),
  date: timestamp("date").notNull(),
  hero_cards: jsonb("hero_cards").$type<string[]>(),
  board_cards: jsonb("board_cards").$type<string[]>(),
  position: text("position"),
  pot_size: numeric("pot_size", { precision: 12, scale: 2 }),
  outcome: numeric("outcome", { precision: 12, scale: 2 }),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ── Relations ─────────────────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ many }) => ({
  sessions: many(sessions),
  groupMemberships: many(groupMembers),
  handHistories: many(handHistories),
  createdGroups: many(groups),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(profiles, {
    fields: [groups.created_by],
    references: [profiles.id],
  }),
  members: many(groupMembers),
  sessions: many(sessions),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.group_id],
    references: [groups.id],
  }),
  user: one(profiles, {
    fields: [groupMembers.user_id],
    references: [profiles.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(profiles, {
    fields: [sessions.user_id],
    references: [profiles.id],
  }),
  group: one(groups, {
    fields: [sessions.group_id],
    references: [groups.id],
  }),
  handHistories: many(handHistories),
}));

export const handHistoriesRelations = relations(handHistories, ({ one }) => ({
  user: one(profiles, {
    fields: [handHistories.user_id],
    references: [profiles.id],
  }),
  session: one(sessions, {
    fields: [handHistories.session_id],
    references: [sessions.id],
  }),
}));
