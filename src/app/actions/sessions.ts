"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, and, gte, lte, ilike, desc, sql } from "drizzle-orm";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SessionInput {
  date: string;          // "YYYY-MM-DD"
  venue?: string;
  game_type: "cash" | "tournament" | "sit_and_go";
  stakes?: string;
  buy_in: number;
  cash_out: number;
  duration_hours?: number;
  duration_mins?: number;
  notes?: string;
  group_id?: string;     // optional — tags session to a group
}

export interface SessionRow {
  id: string;
  date: Date;
  venue: string | null;
  game_type: "cash" | "tournament" | "sit_and_go";
  stakes: string | null;
  buy_in: number;
  cash_out: number;
  pl: number;
  duration_minutes: number | null;
  notes: string | null;
}

export interface SessionFilters {
  gameType?: string;   // "all" | "cash" | "tournament" | "sit_and_go"
  month?: string;      // "YYYY-MM" | "all"
  venue?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function toDate(dateStr: string): Date {
  // Use noon UTC to avoid date-shifting from timezone offsets
  return new Date(`${dateStr}T12:00:00.000Z`);
}

function toDurationMinutes(hours?: number, mins?: number): number | null {
  const h = hours ?? 0;
  const m = mins ?? 0;
  const total = h * 60 + m;
  return total > 0 ? total : null;
}

function revalidate() {
  revalidatePath("/bankroll");
  revalidatePath("/dashboard");
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export async function createSession(input: SessionInput): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  await db.insert(sessions).values({
    user_id: userId,
    date: toDate(input.date),
    venue: input.venue?.trim() || null,
    game_type: input.game_type,
    stakes: input.stakes?.trim() || null,
    buy_in: input.buy_in.toString(),
    cash_out: input.cash_out.toString(),
    duration_minutes: toDurationMinutes(input.duration_hours, input.duration_mins),
    notes: input.notes?.trim() || null,
    group_id: input.group_id || null,
  });

  revalidate();
}

export async function updateSession(id: string, input: SessionInput): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  await db
    .update(sessions)
    .set({
      date: toDate(input.date),
      venue: input.venue?.trim() || null,
      game_type: input.game_type,
      stakes: input.stakes?.trim() || null,
      buy_in: input.buy_in.toString(),
      cash_out: input.cash_out.toString(),
      duration_minutes: toDurationMinutes(input.duration_hours, input.duration_mins),
      notes: input.notes?.trim() || null,
      group_id: input.group_id || null,
      updated_at: new Date(),
    })
    .where(and(eq(sessions.id, id), eq(sessions.user_id, userId)));

  revalidate();
}

export async function deleteSession(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  await db
    .delete(sessions)
    .where(and(eq(sessions.id, id), eq(sessions.user_id, userId)));

  revalidate();
}

// ── Queries ────────────────────────────────────────────────────────────────────

export async function getSessions(filters?: SessionFilters): Promise<SessionRow[]> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const conditions = [eq(sessions.user_id, userId)];

  // Game type filter
  if (filters?.gameType && filters.gameType !== "all") {
    conditions.push(
      eq(sessions.game_type, filters.gameType as "cash" | "tournament" | "sit_and_go")
    );
  }

  // Month filter — "YYYY-MM"
  if (filters?.month && filters.month !== "all") {
    const [year, month] = filters.month.split("-").map(Number);
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to   = new Date(Date.UTC(year, month, 1)); // exclusive upper bound
    conditions.push(gte(sessions.date, from));
    conditions.push(lte(sessions.date, to));
  }

  // Venue search
  if (filters?.venue && filters.venue.trim().length > 0) {
    conditions.push(ilike(sessions.venue, `%${filters.venue.trim()}%`));
  }

  const rows = await db
    .select()
    .from(sessions)
    .where(and(...conditions))
    .orderBy(desc(sessions.date));

  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    venue: r.venue,
    game_type: r.game_type as SessionRow["game_type"],
    stakes: r.stakes,
    buy_in: parseFloat(r.buy_in),
    cash_out: parseFloat(r.cash_out),
    pl: parseFloat(r.cash_out) - parseFloat(r.buy_in),
    duration_minutes: r.duration_minutes,
    notes: r.notes,
  }));
}

