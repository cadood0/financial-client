import { formatDate, formatPeriod } from "@/utils/date";

type DateFormatterProps = {
  value: string | null | undefined;
  className?: string;
};

/** Formats API RFC3339 timestamps into a readable date. */
export function DateFormatter({ value, className }: DateFormatterProps) {
  return <span className={className}>{formatDate(value)}</span>;
}

export function PeriodFormatter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return <span className={className}>{formatPeriod(value)}</span>;
}

/** @deprecated Prefer DateFormatter */
export const DateText = DateFormatter;
/** @deprecated Prefer PeriodFormatter */
export const PeriodText = PeriodFormatter;
