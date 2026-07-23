/** Formats a number as USD currency, e.g. 1250 -> "$1,250.00". */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/** Formats a Date/ISO string as "Oct 24, 2026". */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/** Formats a Date/ISO string as "Oct 24, 2026 · 3:45 PM". */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

/** Formats a signed percentage delta, e.g. 12.5 -> "+12.5%", -1.2 -> "-1.2%". */
export function formatTrend(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}
