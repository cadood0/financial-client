import { formatCents } from "@/utils/currency";

type CurrencyFormatterProps = {
  cents: number;
  className?: string;
};

/** Formats API integer cents into a display currency string. */
export function CurrencyFormatter({ cents, className }: CurrencyFormatterProps) {
  return <span className={className}>{formatCents(cents)}</span>;
}

/** @deprecated Prefer CurrencyFormatter — kept for existing call sites. */
export const Currency = CurrencyFormatter;
