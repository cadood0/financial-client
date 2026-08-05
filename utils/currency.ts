/** Convert integer cents from the API to a display currency string. */
export function formatCents(
  cents: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    ...options,
  }).format(cents / 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

/** Convert a dollar amount string/number to integer cents. */
export function dollarsToCents(value: string | number): number {
  const numeric =
    typeof value === "number" ? value : Number.parseFloat(value || "0");
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 100);
}
