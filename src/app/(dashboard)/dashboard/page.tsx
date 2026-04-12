import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getDashboardStats } from "@/app/actions/dashboard";
import { HeroStat } from "./_components/hero-stat";
import { StatsGrid } from "./_components/stats-grid";
import { RecentSessions } from "./_components/recent-sessions";
import { WelcomeToast } from "@/components/welcome-toast";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const [user, stats] = await Promise.all([
    currentUser(),
    getDashboardStats(),
  ]);

  const firstName = user?.firstName ?? "there";

  return (
    <>
      {/* Welcome toast on first sign-up */}
      <Suspense>
        <WelcomeToast />
      </Suspense>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1
          className="text-2xl font-extrabold"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
        >
          {greeting()}, {firstName} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          {stats.totalSessions === 0
            ? "Welcome to Outs. Let's get your first session logged."
            : "Here's how your game is looking."}
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Hero P&L card */}
        <HeroStat
          netPL={stats.netPL}
          totalSessions={stats.totalSessions}
          monthNetPL={stats.monthNetPL}
          monthSessions={stats.monthSessions}
        />

        {/* Stats grid */}
        <StatsGrid
          totalSessions={stats.totalSessions}
          winningSessions={stats.winningSessions}
          totalMinutes={stats.totalMinutes}
          netPL={stats.netPL}
          bestSession={stats.bestSession}
          worstSession={stats.worstSession}
          monthNetPL={stats.monthNetPL}
          monthSessions={stats.monthSessions}
        />

        {/* Recent sessions */}
        <RecentSessions sessions={stats.recentSessions} />
      </div>
    </>
  );
}
