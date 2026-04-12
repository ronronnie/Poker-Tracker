"use client";

import { formatINR, signOf } from "@/lib/format";

interface HeroStatProps {
  netPL: number;
  totalSessions: number;
  monthNetPL: number;
  monthSessions: number;
}

export function HeroStat({ netPL, totalSessions, monthNetPL, monthSessions }: HeroStatProps) {
  const isPositive = netPL > 0;
  const isNegative = netPL < 0;
  const hasData = totalSessions > 0;

  const borderColor = !hasData
    ? "var(--color-border)"
    : isPositive
    ? "rgba(34,197,94,0.35)"
    : isNegative
    ? "rgba(239,68,68,0.35)"
    : "var(--color-border)";

  const glowColor = !hasData
    ? "transparent"
    : isPositive
    ? "rgba(34,197,94,0.06)"
    : isNegative
    ? "rgba(239,68,68,0.06)"
    : "transparent";

  const valueColor = !hasData
    ? "var(--color-text-muted)"
    : isPositive
    ? "var(--color-success)"
    : isNegative
    ? "var(--color-danger)"
    : "var(--color-text-primary)";

  const monthColor = monthNetPL > 0
    ? "var(--color-success)"
    : monthNetPL < 0
    ? "var(--color-danger)"
    : "var(--color-text-muted)";

  return (
    <div
      className="w-full rounded-[var(--radius-lg)] p-6 sm:p-8 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-bg-surface) 100%)`,
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 40px ${glowColor}`,
      }}
    >
      {/* Subtle background card suit decoration */}
      <div
        className="absolute -right-4 -bottom-6 text-[120px] leading-none select-none pointer-events-none"
        style={{ color: "var(--color-border)", opacity: 0.5 }}
        aria-hidden
      >
        ♠
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        {/* Left: main P&L */}
        <div>
          <p
            className="text-xs font-medium tracking-widest uppercase mb-3"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}
          >
            All-time Net P&L
          </p>
          <p
            className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none"
            style={{ color: valueColor, fontFamily: "var(--font-primary)" }}
          >
            {hasData ? `${signOf(netPL)}${formatINR(netPL)}` : "₹0"}
          </p>
          {!hasData && (
            <p className="mt-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Log your first session to start tracking.
            </p>
          )}
        </div>

        {/* Right: secondary stats */}
        {hasData && (
          <div className="flex gap-6 sm:gap-8 shrink-0">
            <div className="text-right">
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}
              >
                This Month
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: monthColor, fontFamily: "var(--font-primary)" }}
              >
                {signOf(monthNetPL)}{formatINR(monthNetPL)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {monthSessions} session{monthSessions !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}
              >
                Total
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
              >
                {totalSessions}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                sessions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
