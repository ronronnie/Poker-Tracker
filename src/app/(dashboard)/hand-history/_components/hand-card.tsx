"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HandRow } from "@/app/actions/hand-history";
import { HandData } from "@/lib/hand-types";
import { formatINR } from "@/lib/format";

// ── Constants ──────────────────────────────────────────────────────────────────

const GAME_LABEL: Record<string, string> = {
  cash: "Cash",
  tournament: "Tournament",
  sit_and_go: "Sit & Go",
};

const RESULT_CONFIG: Record<string, { label: string; color: string; borderColor: string; amountPrefix: string }> = {
  won:      { label: "WON",      color: "#22c55e", borderColor: "#22c55e", amountPrefix: "+"  },
  lost:     { label: "LOST",     color: "#ef4444", borderColor: "#ef4444", amountPrefix: "−"  },
  split:    { label: "SPLIT",    color: "#D4AF37", borderColor: "#D4AF37", amountPrefix: "±"  },
  observed: { label: "OBS",      color: "#6b7280", borderColor: "#4b5563", amountPrefix: ""   },
};

const SUIT_COLORS: Record<string, { sym: string; color: string }> = {
  s: { sym: "♠", color: "#cbd5e1" },
  h: { sym: "♥", color: "#f87171" },
  d: { sym: "♦", color: "#f87171" },
  c: { sym: "♣", color: "#4ade80" },
};

const STREETS = ["Pre", "Flop", "Turn", "River"];

// ── Sub-components ─────────────────────────────────────────────────────────────

function HoleCard({ code }: { code: string }) {
  const rank = code.slice(0, -1);
  const suit = code.slice(-1);
  const { sym, color } = SUIT_COLORS[suit] ?? { sym: suit, color: "#94a3b8" };
  return (
    <div
      style={{
        width: "34px",
        height: "44px",
        borderRadius: "5px",
        background: "#1c1c1e",
        border: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "13px", fontWeight: 800, color, lineHeight: 1, fontFamily: "var(--font-primary)" }}>{rank}</span>
      <span style={{ fontSize: "10px", color, lineHeight: 1 }}>{sym}</span>
    </div>
  );
}

function getStreetDepth(data: HandData | null): number {
  if (!data) return 0;
  if (data.river) return 4;
  if (data.turn)  return 3;
  if (data.flop)  return 2;
  return 1;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function HandCard({ hand }: { hand: HandRow }) {
  const router = useRouter();
  const [hovered, setHovered] = React.useState(false);

  const depth   = getStreetDepth(hand.hand_data);
  const cfg     = hand.result ? RESULT_CONFIG[hand.result] : null;
  const accentColor = cfg?.borderColor ?? "var(--color-border)";

  const dateStr = new Date(hand.date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/hand-history/${hand.id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/hand-history/${hand.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        borderRadius: "10px",
        overflow: "hidden",
        border: `1px solid ${hovered ? accentColor + "66" : "var(--color-border)"}`,
        background: hovered ? "var(--color-bg-elevated)" : "var(--color-bg-surface)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: hovered ? `0 4px 20px rgba(0,0,0,0.3), inset 0 0 0 0 transparent` : "none",
      }}
    >
      {/* Left accent bar */}
      <div style={{ width: "3px", flexShrink: 0, background: accentColor, opacity: cfg ? 0.9 : 0.3 }} />

      {/* Card body */}
      <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>

        {/* Main row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {/* Hole cards */}
          {hand.hero_hole_cards && hand.hero_hole_cards.length > 0 ? (
            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
              {hand.hero_hole_cards.map((c) => <HoleCard key={c} code={c} />)}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ width: "34px", height: "44px", borderRadius: "5px", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "16px", opacity: 0.15 }}>?</span>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }} suppressHydrationWarning>
                {dateStr}
              </span>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", background: "var(--color-bg-subtle)", padding: "2px 7px", borderRadius: "4px", border: "1px solid var(--color-border)" }}>
                {GAME_LABEL[hand.game_type] ?? hand.game_type}
                {hand.stakes ? ` · ${hand.stakes}` : ""}
              </span>
              {hand.hero_position && (
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-gold)", background: "rgba(212,175,55,0.1)", padding: "2px 7px", borderRadius: "4px", border: "1px solid rgba(212,175,55,0.25)" }}>
                  {hand.hero_position}
                </span>
              )}
            </div>

            {/* Street progression */}
            {depth > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0", marginTop: "6px" }}>
                {STREETS.map((s, i) => {
                  const active = i < depth;
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: active ? accentColor : "rgba(255,255,255,0.1)", border: `1px solid ${active ? accentColor : "rgba(255,255,255,0.15)"}`, transition: "background 0.15s", flexShrink: 0 }} />
                        <span style={{ fontSize: "10px", color: active ? "var(--color-text-secondary)" : "var(--color-text-muted)", opacity: active ? 1 : 0.4 }}>
                          {s}
                        </span>
                      </div>
                      {i < STREETS.length - 1 && (
                        <div style={{ width: "16px", height: "1px", background: i < depth - 1 ? accentColor + "55" : "rgba(255,255,255,0.08)", margin: "0 2px" }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: amount + result */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
            {cfg && hand.result_amount != null && (
              <span style={{ fontSize: "16px", fontWeight: 800, color: cfg.color, fontFamily: "var(--font-primary)", letterSpacing: "-0.02em" }}>
                {cfg.amountPrefix}{formatINR(Math.abs(hand.result_amount))}
              </span>
            )}
            {cfg && (
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", color: cfg.color, background: `${cfg.color}18`, padding: "2px 8px", borderRadius: "9999px", border: `1px solid ${cfg.color}33` }}>
                {cfg.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
