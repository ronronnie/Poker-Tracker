"use client";

import * as React from "react";
import { Pencil, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { SessionForm } from "./session-form";
import { deleteSession, type SessionRow } from "@/app/actions/sessions";
import { toast } from "@/hooks/use-toast";
import { formatINR, formatDuration, signOf } from "@/lib/format";

// ── Helpers ────────────────────────────────────────────────────────────────────
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

// ── Delete button with inline confirm ─────────────────────────────────────────
function DeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      await deleteSession(id);
      toast({ title: "Session deleted", variant: "default" });
    } catch {
      toast({ title: "Failed to delete", variant: "error" });
      setPending(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-[11px] font-semibold px-2 py-1 rounded"
          style={{
            background: "rgba(239,68,68,0.15)",
            color: "var(--color-danger)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          {pending ? "…" : "Delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[11px] font-medium px-2 py-1 rounded"
          style={{ color: "var(--color-text-muted)", background: "var(--color-bg-subtle)" }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-[var(--radius-sm)] transition-colors"
      style={{ color: "var(--color-text-muted)" }}
      title="Delete session"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ background: "var(--color-bg-elevated)" }}
      >
        <Wallet className="w-6 h-6" style={{ color: "var(--color-text-muted)" }} />
      </div>
      <p className="text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
        No sessions found
      </p>
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        Hit <span style={{ color: "var(--color-gold)" }}>+ Log Session</span> to record your first one.
      </p>
    </div>
  );
}

// ── Desktop table row ──────────────────────────────────────────────────────────
function TableRow({ session }: { session: SessionRow }) {
  const isWin  = session.pl > 0;
  const isLoss = session.pl < 0;
  const plColor = isWin
    ? "var(--color-success)"
    : isLoss
    ? "var(--color-danger)"
    : "var(--color-text-muted)";

  return (
    <tr className="group" style={{ borderBottom: "1px solid var(--color-border)" }}>
      {/* Date */}
      <td className="px-4 py-3.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {formatDate(session.date)}
      </td>

      {/* Venue + type */}
      <td className="px-4 py-3.5">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          {session.venue || "—"}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {GAME_LABEL[session.game_type]}
        </p>
      </td>

      {/* Stakes */}
      <td className="px-4 py-3.5">
        {session.stakes ? (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)" }}
          >
            {session.stakes}
          </span>
        ) : (
          <span style={{ color: "var(--color-text-muted)" }}>—</span>
        )}
      </td>

      {/* Buy-in */}
      <td className="px-4 py-3.5 text-sm text-right" style={{ color: "var(--color-text-secondary)" }}>
        {formatINR(session.buy_in)}
      </td>

      {/* Cash-out */}
      <td className="px-4 py-3.5 text-sm text-right" style={{ color: "var(--color-text-secondary)" }}>
        {formatINR(session.cash_out)}
      </td>

      {/* Duration */}
      <td className="px-4 py-3.5 text-sm text-right" style={{ color: "var(--color-text-muted)" }}>
        {session.duration_minutes ? formatDuration(session.duration_minutes) : "—"}
      </td>

      {/* P&L */}
      <td className="px-4 py-3.5 text-right">
        <span
          className="text-sm font-bold"
          style={{ color: plColor, fontFamily: "var(--font-primary)" }}
        >
          {signOf(session.pl)}{formatINR(Math.abs(session.pl))}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <SessionForm
            trigger={
              <button
                className="p-1.5 rounded-[var(--radius-sm)] transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                title="Edit session"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            }
            session={session}
          />
          <DeleteButton id={session.id} />
        </div>
      </td>
    </tr>
  );
}

// ── Mobile card ────────────────────────────────────────────────────────────────
function MobileCard({ session }: { session: SessionRow }) {
  const isWin  = session.pl > 0;
  const isLoss = session.pl < 0;
  const plColor = isWin
    ? "var(--color-success)"
    : isLoss
    ? "var(--color-danger)"
    : "var(--color-text-muted)";

  return (
    <div
      className="p-4 rounded-[var(--radius-lg)]"
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Top row: date + P&L */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {formatDate(session.date)}
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-text-primary)" }}>
            {session.venue || GAME_LABEL[session.game_type]}
          </p>
        </div>
        <span
          className="text-lg font-bold"
          style={{ color: plColor, fontFamily: "var(--font-primary)" }}
        >
          {signOf(session.pl)}{formatINR(Math.abs(session.pl))}
        </span>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[11px] px-1.5 py-0.5 rounded font-medium"
          style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)" }}
        >
          {GAME_LABEL[session.game_type]}
        </span>
        {session.stakes && (
          <span
            className="text-[11px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)" }}
          >
            {session.stakes}
          </span>
        )}
        {session.duration_minutes && (
          <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            {formatDuration(session.duration_minutes)}
          </span>
        )}
      </div>

      {/* Buy-in → Cash-out + actions */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {formatINR(session.buy_in)} → {formatINR(session.cash_out)}
        </p>
        <div className="flex items-center gap-1">
          <SessionForm
            trigger={
              <button
                className="p-1.5 rounded-[var(--radius-sm)]"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            }
            session={session}
          />
          <DeleteButton id={session.id} />
        </div>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function SessionsList({ sessions }: { sessions: SessionRow[] }) {
  if (sessions.length === 0) return <EmptyState />;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-[var(--radius-lg)]" style={{ border: "1px solid var(--color-border)" }}>
        <table className="w-full" style={{ background: "var(--color-bg-elevated)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Date", "Venue", "Stakes", "Buy-in", "Cash-out", "Duration", "P&L", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 3 && i <= 6 ? "text-right" : "text-left"}`}
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <TableRow key={s.id} session={s} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {sessions.map((s) => (
          <MobileCard key={s.id} session={s} />
        ))}
      </div>
    </>
  );
}
