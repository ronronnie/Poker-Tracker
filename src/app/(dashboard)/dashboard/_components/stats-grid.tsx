"use client";

import {
  Target,
  Clock,
  TrendingUp,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Zap,
} from "lucide-react";
import { formatINR, formatDuration, signOf } from "@/lib/format";

// ── Stat card primitive ────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  valueColor,
  iconColor,
  accentBorder,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
  iconColor?: string;
  accentBorder?: string;
}) {
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-[var(--radius-lg)]"
      style={{
        background: "var(--color-bg-elevated)",
        border: `1px solid ${accentBorder ?? "var(--color-border)"}`,
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
        style={{ background: "var(--color-bg-subtle)" }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: iconColor ?? "var(--color-text-muted)" }}
        />
      </div>
      {/* Value */}
      <div>
        <p
          className="text-xl font-bold leading-tight"
          style={{
            color: valueColor ?? "var(--color-text-primary)",
            fontFamily: "var(--font-primary)",
          }}
        >
          {value}
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}
        >
          {label}
        </p>
        {sub && (
          <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Stats grid ─────────────────────────────────────────────────────────────────
interface StatsGridProps {
  totalSessions: number;
  winningSessions: number;
  totalMinutes: number;
  netPL: number;
  bestSession: number;
  worstSession: number;
  monthNetPL: number;
  monthSessions: number;
}

export function StatsGrid({
  totalSessions,
  winningSessions,
  totalMinutes,
  netPL,
  bestSession,
  worstSession,
  monthNetPL,
  monthSessions,
}: StatsGridProps) {
  const hasData = totalSessions > 0;
  const winRate = hasData ? winningSessions / totalSessions : 0;
  const totalHours = totalMinutes / 60;
  const avgPerSession = hasData ? netPL / totalSessions : 0;
  const hourlyRate = totalHours > 0 ? netPL / totalHours : 0;

  const pctLabel = hasData
    ? `${winningSessions}W / ${totalSessions - winningSessions}L`
    : "—";

  return (
    <div className="flex flex-col gap-4">
      {/* ── Row 1: Core performance ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Target}
          label="Sessions"
          value={hasData ? String(totalSessions) : "0"}
          sub={hasData ? pctLabel : "No sessions yet"}
        />
        <StatCard
          icon={Clock}
          label="Hours Played"
          value={hasData ? formatDuration(totalMinutes) : "—"}
          sub={
            hasData && totalHours > 0
              ? `${formatINR(Math.round(hourlyRate))}/hr`
              : undefined
          }
        />
        <StatCard
          icon={TrendingUp}
          label="Win Rate"
          value={hasData ? `${Math.round(winRate * 100)}%` : "—"}
          valueColor={
            !hasData
              ? "var(--color-text-muted)"
              : winRate >= 0.5
              ? "var(--color-success)"
              : "var(--color-danger)"
          }
          iconColor={
            !hasData
              ? "var(--color-text-muted)"
              : winRate >= 0.5
              ? "var(--color-success)"
              : "var(--color-danger)"
          }
        />
        <StatCard
          icon={BarChart2}
          label="Avg / Session"
          value={
            hasData
              ? `${signOf(avgPerSession)}${formatINR(Math.round(avgPerSession))}`
              : "—"
          }
          valueColor={
            !hasData
              ? "var(--color-text-muted)"
              : avgPerSession >= 0
              ? "var(--color-success)"
              : "var(--color-danger)"
          }
        />
      </div>

      {/* ── Row 2: Best / Worst + Month ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={ArrowUpRight}
          label="Best Session"
          value={hasData ? `+${formatINR(bestSession)}` : "—"}
          valueColor={hasData ? "var(--color-success)" : "var(--color-text-muted)"}
          iconColor="var(--color-success)"
          accentBorder={hasData ? "rgba(34,197,94,0.2)" : undefined}
        />
        <StatCard
          icon={ArrowDownRight}
          label="Worst Session"
          value={
            hasData
              ? worstSession < 0
                ? formatINR(worstSession)
                : `+${formatINR(worstSession)}`
              : "—"
          }
          valueColor={
            !hasData
              ? "var(--color-text-muted)"
              : worstSession < 0
              ? "var(--color-danger)"
              : "var(--color-text-primary)"
          }
          iconColor={worstSession < 0 && hasData ? "var(--color-danger)" : undefined}
          accentBorder={hasData && worstSession < 0 ? "rgba(239,68,68,0.2)" : undefined}
        />
        <StatCard
          icon={CalendarDays}
          label="This Month"
          value={
            monthSessions > 0
              ? `${signOf(monthNetPL)}${formatINR(monthNetPL)}`
              : "—"
          }
          valueColor={
            monthSessions === 0
              ? "var(--color-text-muted)"
              : monthNetPL >= 0
              ? "var(--color-success)"
              : "var(--color-danger)"
          }
          sub={monthSessions > 0 ? `${monthSessions} session${monthSessions !== 1 ? "s" : ""}` : "No sessions this month"}
        />
        <StatCard
          icon={Zap}
          label="Hourly Rate"
          value={
            totalHours > 0
              ? `${signOf(hourlyRate)}${formatINR(Math.round(hourlyRate))}/hr`
              : "—"
          }
          valueColor={
            totalHours === 0
              ? "var(--color-text-muted)"
              : hourlyRate >= 0
              ? "var(--color-success)"
              : "var(--color-danger)"
          }
          sub={totalHours > 0 ? `over ${Math.round(totalHours)}h` : "Log session duration"}
        />
      </div>
    </div>
  );
}
