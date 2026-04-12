"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export interface DashboardStats {
  // All-time
  netPL: number;
  totalSessions: number;
  winningSessions: number;
  totalMinutes: number;
  bestSession: number;
  worstSession: number;
  totalBuyIn: number;
  // This month
  monthNetPL: number;
  monthSessions: number;
  // Recent sessions
  recentSessions: {
    id: string;
    date: Date;
    venue: string | null;
    game_type: string;
    stakes: string | null;
    buy_in: number;
    cash_out: number;
    duration_minutes: number | null;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // ── All-time aggregates ──────────────────────────────────────────────────────
  const [agg] = await db
    .select({
      netPL: sql<string>`COALESCE(SUM(cash_out - buy_in), 0)`,
      totalSessions: sql<number>`COUNT(*)::int`,
      winningSessions: sql<number>`COUNT(*) FILTER (WHERE cash_out > buy_in)::int`,
      totalMinutes: sql<number>`COALESCE(SUM(duration_minutes), 0)::int`,
      bestSession: sql<string>`COALESCE(MAX(cash_out - buy_in), 0)`,
      worstSession: sql<string>`COALESCE(MIN(cash_out - buy_in), 0)`,
      totalBuyIn: sql<string>`COALESCE(SUM(buy_in), 0)`,
    })
    .from(sessions)
    .where(eq(sessions.user_id, userId));

  // ── This month aggregates ────────────────────────────────────────────────────
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthAgg] = await db
    .select({
      netPL: sql<string>`COALESCE(SUM(cash_out - buy_in), 0)`,
      sessions: sql<number>`COUNT(*)::int`,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.user_id, userId),
        gte(sessions.date, startOfMonth)
      )
    );

  // ── Recent sessions (last 5) ─────────────────────────────────────────────────
  const recent = await db
    .select({
      id: sessions.id,
      date: sessions.date,
      venue: sessions.venue,
      game_type: sessions.game_type,
      stakes: sessions.stakes,
      buy_in: sessions.buy_in,
      cash_out: sessions.cash_out,
      duration_minutes: sessions.duration_minutes,
    })
    .from(sessions)
    .where(eq(sessions.user_id, userId))
    .orderBy(desc(sessions.date))
    .limit(5);

  return {
    netPL: parseFloat(agg.netPL ?? "0"),
    totalSessions: agg.totalSessions ?? 0,
    winningSessions: agg.winningSessions ?? 0,
    totalMinutes: agg.totalMinutes ?? 0,
    bestSession: parseFloat(agg.bestSession ?? "0"),
    worstSession: parseFloat(agg.worstSession ?? "0"),
    totalBuyIn: parseFloat(agg.totalBuyIn ?? "0"),
    monthNetPL: parseFloat(monthAgg.netPL ?? "0"),
    monthSessions: monthAgg.sessions ?? 0,
    recentSessions: recent.map((r) => ({
      ...r,
      buy_in: parseFloat(r.buy_in),
      cash_out: parseFloat(r.cash_out),
    })),
  };
}
