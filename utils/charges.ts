import type { MonthlyCharge } from "@/types/charge";

/** A charge is active when it has no end date, or the end date is still in the future. */
export function isActiveCharge(charge: MonthlyCharge, now = new Date()): boolean {
  if (!charge.end_date) return true;
  const end = new Date(charge.end_date);
  if (Number.isNaN(end.getTime())) return true;
  return end.getTime() >= now.getTime();
}

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function toMonthInputValue(value?: string | Date | null): string {
  if (!value) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value.slice(0, 7) : "";
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
