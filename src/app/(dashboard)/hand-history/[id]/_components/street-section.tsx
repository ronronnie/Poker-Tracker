"use client";

import * as React from "react";
import { PlayerAction, ShowdownPlayer } from "@/lib/hand-types";

const SUIT_INFO: Record<string, { sym: string; color: string }> = {
  s: { sym: "♠", color: "#e2e8f0" },
  h: { sym: "♥", color: "#ef4444" },
  d: { sym: "♦", color: "#ef4444" },
  c: { sym: "♣", color: "#22c55e" },
};

function MiniCard({ code }: { code: string }) {
  const rank = code.slice(0, -1);
  const suit = code.slice(-1);
  const info = SUIT_INFO[suit] ?? { sym: suit, color: "var(--color-text-muted)" };
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "30px",
        height: "38px",
        borderRadius: "4px",
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        fontSize: "11px",
        fontWeight: 700,
        color: info.color,
        gap: "1px",
        lineHeight: 1,
      }}
    >
      <span>{rank}</span>
      <span style={{ fontSize: "9px" }}>{info.sym}</span>
    </span>
  );
}

function ActionBadge({ action, amount }: { action: string; amount?: number | null }) {
  const COLOR: Record<string, string> = {
    fold: "#6b7280", check: "#f59e0b", call: "#22c55e",
    bet: "#3b82f6", raise: "#3b82f6", all_in: "#D4AF37",
  };
  const color = COLOR[action] ?? "#6b7280";
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: 700,
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        textTransform: "uppercase" as const,
        letterSpacing: "0.04em",
      }}
    >
      {action.replace("_", " ")}
      {amount != null && ` ₹${amount.toLocaleString("en-IN")}`}
    </span>
  );
}

export function StreetSection({
  title, communityCards, actions, heroId,
}: {
  title: string;
  communityCards?: string[];
  actions: PlayerAction[];
  heroId?: string;
}) {
  const [open, setOpen] = React.useState(true);
  const heroActions = actions.filter((a) => a.player_id === heroId);

  return (
    <div
      className="rounded-[var(--radius-lg)] overflow-hidden"
      style={{ border: "1px solid var(--color-border)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--color-bg-surface)",
          borderBottom: open ? "1px solid var(--color-border)" : "none",
          cursor: "pointer",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</span>
          {heroActions.length > 0 && (
            <div className="flex gap-1">
              {heroActions.map((a, i) => (
                <ActionBadge key={i} action={a.action} amount={a.amount} />
              ))}
            </div>
          )}
        </div>
        <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 py-3" style={{ background: "var(--color-bg-elevated)" }}>
          {communityCards && communityCards.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold w-12 shrink-0" style={{ color: "var(--color-text-muted)" }}>Board:</span>
              <div className="flex gap-1">
                {communityCards.map((c) => <MiniCard key={c} code={c} />)}
              </div>
            </div>
          )}

          {actions.length > 0 ? (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Player", "Position", "Action", "Amount"].map((h) => (
                      <th key={h} className="text-left py-1.5 pr-3 font-semibold" style={{ color: "var(--color-text-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {actions.map((a, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        background: a.is_hero ? "rgba(212,175,55,0.04)" : "transparent",
                      }}
                    >
                      <td className="py-2 pr-3 font-medium" style={{ color: a.is_hero ? "var(--color-gold)" : "var(--color-text-primary)" }}>
                        {a.player_name}
                      </td>
                      <td className="py-2 pr-3" style={{ color: "var(--color-text-muted)" }}>{a.position}</td>
                      <td className="py-2 pr-3">
                        <ActionBadge action={a.action} />
                      </td>
                      <td className="py-2" style={{ color: "var(--color-text-secondary)" }}>
                        {a.amount != null ? `₹${a.amount.toLocaleString("en-IN")}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>No actions recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function ShowdownSection({ players }: { players: ShowdownPlayer[] }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] overflow-hidden"
      style={{ border: "1px solid var(--color-border)" }}
    >
      <div className="px-4 py-3" style={{ background: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Showdown</span>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2" style={{ background: "var(--color-bg-elevated)" }}>
        {players.map((p) => (
          <div key={p.player_id} className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {p.hole_cards.length > 0
                ? p.hole_cards.map((c) => <MiniCard key={c} code={c} />)
                : <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Hidden</span>}
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              {p.player_name}
              <span className="ml-1 text-xs" style={{ color: "var(--color-text-muted)" }}>({p.position})</span>
            </span>
            {p.is_winner && (
              <span
                className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}
              >
                WINNER
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
