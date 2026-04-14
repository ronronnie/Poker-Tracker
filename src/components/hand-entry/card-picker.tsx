"use client";

import * as React from "react";
import { CardCode } from "@/lib/hand-types";

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS: { code: string; symbol: string; color: string }[] = [
  { code: "s", symbol: "♠", color: "#e2e8f0" },
  { code: "h", symbol: "♥", color: "#ef4444" },
  { code: "d", symbol: "♦", color: "#ef4444" },
  { code: "c", symbol: "♣", color: "#22c55e" },
];

interface CardPickerProps {
  selected: CardCode[];
  max: number;
  onChange: (cards: CardCode[]) => void;
  usedCards?: CardCode[];
}

export function CardPicker({ selected, max, onChange, usedCards = [] }: CardPickerProps) {
  function toggleCard(code: CardCode) {
    const isSelected = selected.includes(code);
    const isUsed = usedCards.includes(code);
    if (isUsed && !isSelected) return;

    if (isSelected) {
      onChange(selected.filter((c) => c !== code));
    } else {
      if (selected.length >= max) return;
      onChange([...selected, code]);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {SUITS.map((suit) => (
        <div key={suit.code} className="flex gap-0.5 flex-wrap">
          {RANKS.map((rank) => {
            const code: CardCode = `${rank}${suit.code}`;
            const isSelected = selected.includes(code);
            const isUsed = usedCards.includes(code) && !isSelected;
            const isDisabled = isUsed || (!isSelected && selected.length >= max);

            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleCard(code)}
                disabled={isDisabled}
                style={{
                  width: "36px",
                  height: "44px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 700,
                  lineHeight: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                  background: isSelected
                    ? "var(--color-gold)"
                    : "var(--color-bg-subtle)",
                  border: isSelected
                    ? "1px solid var(--color-gold)"
                    : "1px solid var(--color-border)",
                  color: isSelected
                    ? "#080808"
                    : isDisabled
                    ? "rgba(255,255,255,0.15)"
                    : suit.color,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isUsed ? 0.25 : 1,
                  transition: "background 0.1s, border 0.1s",
                }}
                aria-label={`${rank}${suit.symbol}`}
                aria-pressed={isSelected}
              >
                <span>{rank}</span>
                <span style={{ fontSize: "10px" }}>{suit.symbol}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
