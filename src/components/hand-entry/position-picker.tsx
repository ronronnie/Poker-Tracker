"use client";

import * as React from "react";

const POSITIONS = ["UTG", "UTG+1", "LJ", "HJ", "CO", "BTN", "SB", "BB"];

interface PositionPickerProps {
  value: string;
  onChange: (pos: string) => void;
  usedPositions?: string[];
}

export function PositionPicker({ value, onChange, usedPositions = [] }: PositionPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {POSITIONS.map((pos) => {
        const isSelected = value === pos;
        const isUsed = usedPositions.includes(pos) && !isSelected;
        return (
          <button
            key={pos}
            type="button"
            onClick={() => !isUsed && onChange(pos)}
            disabled={isUsed}
            style={{
              padding: "4px 10px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 600,
              background: isSelected ? "var(--color-gold)" : "var(--color-bg-subtle)",
              border: `1px solid ${isSelected ? "var(--color-gold)" : "var(--color-border)"}`,
              color: isSelected ? "#080808" : isUsed ? "var(--color-text-muted)" : "var(--color-text-secondary)",
              cursor: isUsed ? "not-allowed" : "pointer",
              opacity: isUsed ? 0.4 : 1,
              transition: "background 0.1s, border 0.1s, color 0.1s",
            }}
          >
            {pos}
          </button>
        );
      })}
    </div>
  );
}
