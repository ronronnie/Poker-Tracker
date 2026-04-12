"use client";

import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { formatINR, formatDuration, signOf } from "@/lib/format";

interface Session {
  id: string;
  date: Date;
  venue: string | null;
  game_type: string;
  stakes: string | null;
  buy_in: number;
  cash_out: number;
  duration_minutes: number | null;
}

const GAME_LABEL: Record<string, string> = {
  cash: "Cash",
  tournament: "Tournament",
  sit_and_go: "Sit & Go",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

interface RecentSessionsProps {
  sessions: Session[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <div
      className="rounded-[var(--radius-lg)] overflow-hidden"
      style={{ border: "1px solid var(--color-border)", background: "var(--color-bg-elevated)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <h2
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-secondary)" }}
        >
          Recent Sessions
        </h2>
        {sessions.length > 0 && (
          <Link
            href="/bankroll"
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: "var(--color-gold)" }}
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Empty state */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ background: "var(--color-bg-subtle)" }}
          >
            <Wallet className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
            No sessions yet
          </p>
          <p className="text-xs mb-5" style={{ color: "var(--color-text-muted)" }}>
            Log your first session to start seeing your stats here.
          </p>
          <Link
            href="/bankroll"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold transition-colors"
            style={{
              background: "var(--color-gold)",
              color: "#080808",
            }}
          >
            Log First Session
          </Link>
        </div>
      ) : (
        /* Session rows */
        <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
          {sessions.map((s) => {
            const pl = s.cash_out - s.buy_in;
            const isWin = pl > 0;
            const isLoss = pl < 0;
            const plColor = isWin
              ? "var(--color-success)"
              : isLoss
              ? "var(--color-danger)"
              : "var(--color-text-muted)";

            return (
              <div
                key={s.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                {/* Win/Loss indicator dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: isWin
                      ? "var(--color-success)"
                      : isLoss
                      ? "var(--color-danger)"
                      : "var(--color-text-muted)",
                  }}
                />

                {/* Session info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {s.venue || GAME_LABEL[s.game_type] || "Session"}
                    </p>
                    {s.stakes && (
                      <span
                        className="text-[11px] px-1.5 py-0.5 rounded font-medium shrink-0"
                        style={{
                          background: "var(--color-bg-subtle)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {s.stakes}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                    <span>{formatDate(s.date)}</span>
                    {s.duration_minutes && (
                      <>
                        <span>·</span>
                        <span>{formatDuration(s.duration_minutes)}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* P&L */}
                <div className="text-right shrink-0">
                  <p
                    className="text-sm font-bold"
                    style={{ color: plColor, fontFamily: "var(--font-primary)" }}
                  >
                    {signOf(pl)}{formatINR(Math.abs(pl))}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    Buy-in {formatINR(s.buy_in)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
