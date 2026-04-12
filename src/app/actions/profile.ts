"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { profiles, sessions } from "@/lib/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";

// ── Get profile from DB ────────────────────────────────────────────────────────
export async function getProfile() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return profile ?? null;
}

// ── Update profile ─────────────────────────────────────────────────────────────
export async function updateProfile(data: {
  full_name?: string;
  username?: string;
}): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // Username uniqueness check
  if (data.username?.trim()) {
    const [taken] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(eq(profiles.username, data.username.trim()), ne(profiles.id, userId)))
      .limit(1);
    if (taken) throw new Error("That username is already taken.");
  }

  await db
    .update(profiles)
    .set({
      full_name: data.full_name?.trim() || null,
      username:  data.username?.trim()  || null,
      updated_at: new Date(),
    })
    .where(eq(profiles.id, userId));

  revalidatePath("/profile");
}

// ── Profile stats (all-time) ───────────────────────────────────────────────────
export interface ProfileStats {
  netPL: number;
  totalSessions: number;
  winningSessions: number;
  totalMinutes: number;
  bestSession: number;
}

export async function getProfileStats(): Promise<ProfileStats> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [row] = await db
    .select({
      netPL:            sql<string>`COALESCE(SUM(cash_out - buy_in), 0)`,
      totalSessions:    sql<number>`COUNT(*)::int`,
      winningSessions:  sql<number>`COUNT(*) FILTER (WHERE cash_out > buy_in)::int`,
      totalMinutes:     sql<number>`COALESCE(SUM(duration_minutes), 0)::int`,
      bestSession:      sql<string>`COALESCE(MAX(cash_out - buy_in), 0)`,
    })
    .from(sessions)
    .where(eq(sessions.user_id, userId));

  return {
    netPL:           parseFloat(row.netPL           ?? "0"),
    totalSessions:   row.totalSessions   ?? 0,
    winningSessions: row.winningSessions ?? 0,
    totalMinutes:    row.totalMinutes    ?? 0,
    bestSession:     parseFloat(row.bestSession      ?? "0"),
  };
}
