import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Currency formatter — single source of truth.
 * Extend `CURRENCY_MAP` when new currencies are added.
 */
const CURRENCY_MAP: Record<string, { locale: string; currency: string }> = {
  INR: { locale: "en-IN", currency: "INR" },
  USD: { locale: "en-US", currency: "USD" },
  EUR: { locale: "de-DE", currency: "EUR" },
  GBP: { locale: "en-GB", currency: "GBP" },
};

export function formatCurrency(
  amount: number,
  currencyCode: string = "INR",
  options?: Intl.NumberFormatOptions
): string {
  const config = CURRENCY_MAP[currencyCode] ?? CURRENCY_MAP["INR"];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format duration in minutes to a human-readable string
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Compute profit/loss from buy-in and cash-out
 */
export function computePnL(buyIn: number, cashOut: number): number {
  return cashOut - buyIn;
}
