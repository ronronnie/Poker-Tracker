// ── Currency & number formatting utilities ─────────────────────────────────────

/**
 * Format a number as INR currency.
 * Uses Indian locale — lakhs/crore grouping.
 * e.g. 123456 → "₹1,23,456"   |   -5000 → "-₹5,000"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format minutes as "Xh Ym" — e.g. 135 → "2h 15m"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format a percentage — e.g. 0.6667 → "66.7%"
 */
export function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Return a sign prefix string: "+" for positive, "" for negative (minus is built-in)
 */
export function signOf(value: number): string {
  return value > 0 ? "+" : "";
}
