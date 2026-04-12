"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [show, setShow] = React.useState(false);

    return (
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-[var(--radius-md)] px-4 pr-11 text-sm",
            "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]",
            "border border-[var(--color-border)]",
            "placeholder:text-[var(--color-text-muted)]",
            "transition-colors duration-150",
            "focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]",
            error &&
              "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "text-base md:text-sm",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
