"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { handHistories, sessions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { HandData } from "@/lib/hand-types";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreateHandInput {
  date: string;
  game_type: "cash" | "tournament" | "sit_and_go";
  stakes?: string;
  session_id?: string;
  table_size?: number;
  hero_position?: string;
  hero_hole_cards?: string[];
  result?: string;
  result_amount?: number;
  pot_total?: number;
  notes?: string;
  hand_data: HandData;
}

export interface HandRow {
  id: string;
  date: Date;
  game_type: string;
  stakes: string | null;
  hero_position: string | null;
  hero_hole_cards: string[] | null;
  result: string | null;
  result_amount: number | null;
  pot_total: number | null;
  hand_data: HandData | null;
  session_id: string | null;
}

export interface HandDetail extends HandRow {
  notes: string | null;
}

export interface SessionOption {
  id: string;
  date: Date;
  venue: string | null;
  stakes: string | null;
  game_type: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function toDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00.000Z`);
}

function revalidate() {
  revalidatePath("/hand-history");
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export async function createHand(input: CreateHandInput): Promise<{ id: string }> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [row] = await db
    .insert(handHistories)
    .values({
      user_id: userId,
      session_id: input.session_id || null,
      date: toDate(input.date),
      game_type: input.game_type,
      stakes: input.stakes?.trim() || null,
      table_size: input.table_size ?? null,
      hero_position: input.hero_position || null,
      hero_hole_cards: input.hero_hole_cards?.length ? input.hero_hole_cards : null,
      result: input.result || null,
      result_amount: input.result_amount != null ? input.result_amount.toString() : null,
      pot_total: input.pot_total != null ? input.pot_total.toString() : null,
      notes: input.notes?.trim() || null,
      hand_data: input.hand_data,
    })
    .returning({ id: handHistories.id });

  revalidate();
  return { id: row.id };
}

export async function deleteHand(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  await db
    .delete(handHistories)
    .where(and(eq(handHistories.id, id), eq(handHistories.user_id, userId)));

  revalidate();
}

// ── Queries ────────────────────────────────────────────────────────────────────

export async function getHands(filters?: {
  gameType?: string;
  result?: string;
}): Promise<HandRow[]> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const rows = await db
    .select()
    .from(handHistories)
    .where(eq(handHistories.user_id, userId))
    .orderBy(desc(handHistories.date));

  let result = rows.map((r) => ({
    id: r.id,
    date: r.date,
    game_type: r.game_type,
    stakes: r.stakes,
    hero_position: r.hero_position,
    hero_hole_cards: r.hero_hole_cards as string[] | null,
    result: r.result,
    result_amount: r.result_amount != null ? parseFloat(r.result_amount) : null,
    pot_total: r.pot_total != null ? parseFloat(r.pot_total) : null,
    hand_data: r.hand_data as HandData | null,
    session_id: r.session_id,
  }));

  if (filters?.gameType && filters.gameType !== "all") {
    result = result.filter((r) => r.game_type === filters.gameType);
  }
  if (filters?.result && filters.result !== "all") {
    result = result.filter((r) => r.result === filters.result);
  }

  return result;
}

export async function getHandById(id: string): Promise<HandDetail | null> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const rows = await db
    .select()
    .from(handHistories)
    .where(and(eq(handHistories.id, id), eq(handHistories.user_id, userId)))
    .limit(1);

  if (rows.length === 0) return null;

  const r = rows[0];
  return {
    id: r.id,
    date: r.date,
    game_type: r.game_type,
    stakes: r.stakes,
    hero_position: r.hero_position,
    hero_hole_cards: r.hero_hole_cards as string[] | null,
    result: r.result,
    result_amount: r.result_amount != null ? parseFloat(r.result_amount) : null,
    pot_total: r.pot_total != null ? parseFloat(r.pot_total) : null,
    hand_data: r.hand_data as HandData | null,
    session_id: r.session_id,
    notes: r.notes,
  };
}

export async function getSessionOptions(): Promise<SessionOption[]> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const rows = await db
    .select({
      id: sessions.id,
      date: sessions.date,
      venue: sessions.venue,
      stakes: sessions.stakes,
      game_type: sessions.game_type,
    })
    .from(sessions)
    .where(eq(sessions.user_id, userId))
    .orderBy(desc(sessions.date));

  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    venue: r.venue,
    stakes: r.stakes,
    game_type: r.game_type,
  }));
}
