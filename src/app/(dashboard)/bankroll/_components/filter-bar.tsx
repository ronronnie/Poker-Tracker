"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Select } from "@/components/ui/select";

// ── Month options (last 18 months + "All") ────────────────────────────────────
function buildMonthOptions() {
  const options = [{ value: "all", label: "All Time" }];
  const now = new Date();
  for (let i = 0; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-IN", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

const MONTH_OPTIONS = buildMonthOptions();

const GAME_OPTIONS = [
  { value: "all",         label: "All Types" },
  { value: "cash",        label: "Cash Game" },
  { value: "tournament",  label: "Tournament" },
  { value: "sit_and_go",  label: "Sit & Go" },
];

// ── Component ──────────────────────────────────────────────────────────────────
export function FilterBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  const gameType    = params.get("gameType") ?? "all";
  const month       = params.get("month")    ?? "all";
  const venueSearch = params.get("venue")    ?? "";

  const [venueInput, setVenueInput] = React.useState(venueSearch);

  // Debounce venue search (500ms)
  React.useEffect(() => {
    const t = setTimeout(() => {
      applyFilter("venue", venueInput || null);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueInput]);

  function applyFilter(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    router.replace(`${pathname}?${next.toString()}`);
  }

  const hasActiveFilters =
    gameType !== "all" || month !== "all" || venueSearch !== "";

  function clearFilters() {
    setVenueInput("");
    router.replace(pathname);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Game type */}
      <div className="w-full sm:w-40">
        <Select
          value={gameType}
          onValueChange={(v) => applyFilter("gameType", v)}
          options={GAME_OPTIONS}
        />
      </div>

      {/* Month */}
      <div className="w-full sm:w-52">
        <Select
          value={month}
          onValueChange={(v) => applyFilter("month", v)}
          options={MONTH_OPTIONS}
        />
      </div>

      {/* Venue search */}
      <div className="flex-1 relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "var(--color-text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search venue…"
          value={venueInput}
          onChange={(e) => setVenueInput(e.target.value)}
          className="flex h-11 w-full rounded-[var(--radius-md)] pl-9 pr-4 text-sm"
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-gold)";
            e.currentTarget.style.boxShadow = "0 0 0 1px var(--color-gold)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 h-11 rounded-[var(--radius-md)] text-sm font-medium shrink-0 transition-colors"
          style={{
            color: "var(--color-text-muted)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
          }}
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
