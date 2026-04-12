import { Suspense } from "react";
import { Plus } from "lucide-react";
import { getSessions } from "@/app/actions/sessions";
import { SessionForm } from "./_components/session-form";
import { SessionsList } from "./_components/sessions-list";
import { FilterBar } from "./_components/filter-bar";
import { ExportButton } from "./_components/export-button";
import { Button } from "@/components/ui/button";
import { formatINR, formatDuration, signOf, computeSummary } from "@/lib/format";

// ── searchParams is a Promise in Next.js 16 ───────────────────────────────────
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ── Summary strip ──────────────────────────────────────────────────────────────
function SummaryStrip({
  netPL,
  totalSessions,
  winningSessions,
  totalMinutes,
}: {
  netPL: number;
  totalSessions: number;
  winningSessions: number;
  totalMinutes: number;
}) {
  const winRate = totalSessions > 0 ? Math.round((winningSessions / totalSessions) * 100) : 0;
  const plColor =
    netPL > 0
      ? "var(--color-success)"
      : netPL < 0
      ? "var(--color-danger)"
      : "var(--color-text-primary)";

  const stats = [
    {
      label: "Net P&L",
      value: totalSessions > 0 ? `${signOf(netPL)}${formatINR(netPL)}` : "₹0",
      color: totalSessions > 0 ? plColor : "var(--color-text-muted)",
    },
    {
      label: "Sessions",
      value: String(totalSessions),
      color: "var(--color-text-primary)",
    },
    {
      label: "Win Rate",
      value: totalSessions > 0 ? `${winRate}%` : "—",
      color:
        totalSessions === 0
          ? "var(--color-text-muted)"
          : winRate >= 50
          ? "var(--color-success)"
          : "var(--color-danger)",
    },
    {
      label: "Total Time",
      value: totalMinutes > 0 ? formatDuration(totalMinutes) : "—",
      color: "var(--color-text-primary)",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-[var(--radius-lg)]"
      style={{ background: "var(--color-border)" }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center justify-center py-4 px-3 text-center"
          style={{ background: "var(--color-bg-elevated)" }}
        >
          <p
            className="text-lg font-bold leading-tight"
            style={{ color: s.color, fontFamily: "var(--font-primary)" }}
          >
            {s.value}
          </p>
          <p className="text-[11px] mt-1 uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function BankrollPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const filters = {
    gameType: typeof sp.gameType === "string" ? sp.gameType : undefined,
    month:    typeof sp.month    === "string" ? sp.month    : undefined,
    venue:    typeof sp.venue    === "string" ? sp.venue    : undefined,
  };

  const sessions = await getSessions(filters);
  const summary  = computeSummary(sessions);

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1
            className="text-2xl font-extrabold truncate"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
          >
            Bankroll
          </h1>
          <p className="text-sm mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
            {summary.totalSessions === 0
              ? "No sessions logged yet."
              : `${summary.totalSessions} session${summary.totalSessions !== 1 ? "s" : ""} on record.`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Export XLS — only shown when there's data */}
          {summary.totalSessions > 0 && <ExportButton />}

          {/* Log Session */}
          <SessionForm
            trigger={
              <Button variant="primary" size="sm" className="gap-1.5">
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden xs:inline sm:inline">Log Session</span>
                <span className="xs:hidden sm:hidden">Log</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* ── Summary strip ───────────────────────────────────────────────────── */}
      <SummaryStrip
        netPL={summary.netPL}
        totalSessions={summary.totalSessions}
        winningSessions={summary.winningSessions}
        totalMinutes={summary.totalMinutes}
      />

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="mt-4">
        <Suspense>
          <FilterBar />
        </Suspense>
      </div>

      {/* ── Sessions list ───────────────────────────────────────────────────── */}
      <div className="mt-4">
        <SessionsList sessions={sessions} />
      </div>
    </>
  );
}
