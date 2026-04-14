"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const GAME_FILTERS = [
  { value: "all",        label: "All" },
  { value: "cash",       label: "Cash" },
  { value: "tournament", label: "Tournament" },
  { value: "sit_and_go", label: "Sit & Go" },
];

const RESULT_FILTERS = [
  { value: "all",      label: "All" },
  { value: "won",      label: "Won",      color: "#22c55e" },
  { value: "lost",     label: "Lost",     color: "#ef4444" },
  { value: "split",    label: "Split",    color: "#D4AF37" },
  { value: "observed", label: "Observed", color: "#6b7280" },
];

interface Props {
  gameType: string;
  result: string;
}

export function HandFilters({ gameType, result }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [pendingFilter, setPendingFilter] = React.useState<string | null>(null);

  function navigate(params: { gameType?: string; result?: string }) {
    const next = { gameType, result, ...params };
    const qs = Object.entries(next)
      .filter(([, v]) => v !== "all")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    const href = `/hand-history${qs ? `?${qs}` : ""}`;
    setPendingFilter(`${params.gameType ?? ""}${params.result ?? ""}`);
    startTransition(() => { router.push(href); });
  }

  const isLoading = isPending;

  return (
    <div
      className="flex flex-col gap-3 p-3 rounded-[var(--radius-lg)]"
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        opacity: isLoading ? 0.7 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {/* Game type row */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold shrink-0 w-14"
          style={{ color: "var(--color-text-muted)" }}
        >
          Game
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {GAME_FILTERS.map((f) => {
            const isActive = gameType === f.value;
            const isThisPending = isPending && pendingFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => navigate({ gameType: f.value })}
                disabled={isPending}
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: isActive ? "var(--color-gold)" : "var(--color-bg-elevated)",
                  border: `1px solid ${isActive ? "var(--color-gold)" : "var(--color-border)"}`,
                  color: isActive ? "#080808" : "var(--color-text-secondary)",
                  cursor: isPending ? "default" : "pointer",
                  transition: "all 0.1s",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {isThisPending && (
                  <span
                    style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      border: "1.5px solid currentColor", borderTopColor: "transparent",
                      display: "inline-block", animation: "spin 0.6s linear infinite",
                    }}
                  />
                )}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--color-border)" }} />

      {/* Result row */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold shrink-0 w-14"
          style={{ color: "var(--color-text-muted)" }}
        >
          Result
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {RESULT_FILTERS.map((f) => {
            const isActive = result === f.value;
            const isThisPending = isPending && pendingFilter === f.value;
            const activeColor = "color" in f ? f.color : "var(--color-gold)";
            return (
              <button
                key={f.value}
                onClick={() => navigate({ result: f.value })}
                disabled={isPending}
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: isActive
                    ? (f.value === "all" ? "rgba(212,175,55,0.15)" : `${activeColor}18`)
                    : "var(--color-bg-elevated)",
                  border: `1px solid ${isActive ? (f.value === "all" ? "rgba(212,175,55,0.4)" : `${activeColor}55`) : "var(--color-border)"}`,
                  color: isActive ? (f.value === "all" ? "var(--color-gold)" : activeColor) : "var(--color-text-secondary)",
                  cursor: isPending ? "default" : "pointer",
                  transition: "all 0.1s",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {isThisPending && (
                  <span
                    style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      border: "1.5px solid currentColor", borderTopColor: "transparent",
                      display: "inline-block", animation: "spin 0.6s linear infinite",
                    }}
                  />
                )}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
