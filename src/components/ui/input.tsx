import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // base
          "flex h-11 w-full rounded-[var(--radius-md)] px-4 text-sm",
          "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]",
          "border border-[var(--color-border)]",
          "placeholder:text-[var(--color-text-muted)]",
          // focus
          "transition-colors duration-150",
          "focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]",
          // error
          error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]",
          // disabled
          "disabled:cursor-not-allowed disabled:opacity-40",
          // mobile: prevent zoom on iOS
          "text-base md:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
