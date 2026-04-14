"use client";

import * as React from "react";
import { ActionType } from "@/lib/hand-types";

const ACTIONS: { value: ActionType; label: string; color: string; bg: string }[] = [
  { value: "fold",   label: "FOLD",   color: "#fff",     bg: "#6b7280" },
  { value: "check",  label: "CHECK",  color: "#080808",  bg: "#f59e0b" },
  { value: "call",   label: "CALL",   color: "#fff",     bg: "#22c55e" },
  { value: "bet",    label: "BET",    color: "#fff",     bg: "#3b82f6" },
  { value: "raise",  label: "RAISE",  color: "#fff",     bg: "#3b82f6" },
  { value: "all_in", label: "ALL IN", color: "#080808",  bg: "#D4AF37" },
];

interface ActionPickerProps {
  value: ActionType | "";
  onChange: (action: ActionType) => void;
}

export function ActionPicker({ value, onChange }: ActionPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ACTIONS.map((a) => {
        const isSelected = value === a.value;
        return (
          <button
            key={a.value}
            type="button"
            onClick={() => onChange(a.value)}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              background: isSelected ? a.bg : "var(--color-bg-subtle)",
              border: `1px solid ${isSelected ? a.bg : "var(--color-border)"}`,
              color: isSelected ? a.color : "var(--color-text-secondary)",
              cursor: "pointer",
              transition: "background 0.1s, border 0.1s, color 0.1s",
              boxShadow: isSelected ? `0 0 8px ${a.bg}55` : "none",
            }}
          >
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
