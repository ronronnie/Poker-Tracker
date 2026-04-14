"use client";

import * as React from "react";

interface NumpadProps {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}

export function Numpad({ value, onChange, placeholder = "0" }: NumpadProps) {
  const [display, setDisplay] = React.useState<string>(
    value != null ? String(value) : ""
  );

  React.useEffect(() => {
    setDisplay(value != null ? String(value) : "");
  }, [value]);

  function push(char: string) {
    setDisplay((prev) => {
      const next = prev + char;
      const num = parseFloat(next);
      if (!isNaN(num)) onChange(num);
      return next;
    });
  }

  function pushDouble() {
    setDisplay((prev) => {
      const next = prev + "00";
      const num = parseFloat(next);
      if (!isNaN(num)) onChange(num);
      return next;
    });
  }

  function backspace() {
    setDisplay((prev) => {
      const next = prev.slice(0, -1);
      if (next === "" || next === "-") {
        onChange(undefined);
        return "";
      }
      const num = parseFloat(next);
      if (!isNaN(num)) onChange(num);
      return next;
    });
  }

  function clear() {
    setDisplay("");
    onChange(undefined);
  }

  const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];

  return (
    <div className="flex flex-col gap-2" style={{ width: "100%" }}>
      {/* Display */}
      <div
        style={{
          background: "var(--color-bg-primary)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "20px",
          fontWeight: 700,
          fontFamily: "var(--font-primary)",
          color: display ? "var(--color-text-primary)" : "var(--color-text-muted)",
          minHeight: "48px",
          textAlign: "right",
          letterSpacing: "0.02em",
        }}
      >
        {display || placeholder}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => push(k)}
            style={{
              height: "44px",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: 600,
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
              transition: "background 0.1s",
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-bg-elevated)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-bg-subtle)";
            }}
          >
            {k}
          </button>
        ))}

        {/* Bottom row: 00, 0, backspace */}
        <button
          type="button"
          onClick={pushDouble}
          style={{
            height: "44px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            cursor: "pointer",
          }}
        >
          00
        </button>
        <button
          type="button"
          onClick={() => push("0")}
          style={{
            height: "44px",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: 600,
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            cursor: "pointer",
          }}
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          style={{
            height: "44px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
          }}
          aria-label="Backspace"
        >
          ←
        </button>

        {/* Clear — full width */}
        <button
          type="button"
          onClick={clear}
          style={{
            gridColumn: "1 / -1",
            height: "36px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--color-danger)",
            cursor: "pointer",
            letterSpacing: "0.05em",
          }}
        >
          × CLEAR
        </button>
      </div>
    </div>
  );
}
