"use client";

import * as Toast from "@radix-ui/react-toast";
import { CheckCircle, XCircle, X } from "lucide-react";
import { useToaster } from "@/hooks/use-toast";

export function Toaster() {
  const toasts = useToaster();

  return (
    <Toast.Provider swipeDirection="right" duration={4000}>
      {toasts.map((t) => (
        <Toast.Root
          key={t.id}
          open
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "14px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-elevated)",
            border: `1px solid ${
              t.variant === "success"
                ? "rgba(34,197,94,0.3)"
                : t.variant === "error"
                ? "rgba(239,68,68,0.3)"
                : "var(--color-border)"
            }`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            minWidth: "280px",
            maxWidth: "360px",
            animation: "slideIn 0.25s ease",
          }}
        >
          {/* Icon */}
          {t.variant === "success" && (
            <CheckCircle
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "var(--color-success)" }}
            />
          )}
          {t.variant === "error" && (
            <XCircle
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "var(--color-danger)" }}
            />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Toast.Title
              className="text-sm font-semibold"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-secondary)",
              }}
            >
              {t.title}
            </Toast.Title>
            {t.description && (
              <Toast.Description
                className="text-xs mt-0.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t.description}
              </Toast.Description>
            )}
          </div>

          {/* Close */}
          <Toast.Close asChild>
            <button
              className="shrink-0 p-0.5 rounded transition-colors"
              style={{ color: "var(--color-text-muted)" }}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </Toast.Close>
        </Toast.Root>
      ))}

      <Toast.Viewport />

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Toast.Provider>
  );
}
