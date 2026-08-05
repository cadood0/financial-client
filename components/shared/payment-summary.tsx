"use client";

import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { PeriodSummary } from "@/types/payment";

export function paymentStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "success" as const;
  if (normalized === "partial") return "warning" as const;
  return "danger" as const;
}

export function formatPaymentStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "Paid";
  if (normalized === "partial") return "Partial";
  if (normalized === "unpaid") return "Unpaid";
  return status;
}

type PaymentSummaryProps = {
  summary?: PeriodSummary | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  title?: string;
};

export function PaymentSummary({
  summary,
  isLoading = false,
  error = null,
  className,
  title = "Payment Summary",
}: PaymentSummaryProps) {
  return (
    <div className={cn("rounded-xl border bg-slate-50 p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        {summary ? (
          <StatusBadge tone={paymentStatusTone(summary.status)}>
            {formatPaymentStatus(summary.status)}
          </StatusBadge>
        ) : null}
      </div>

      {isLoading ? <LoadingSkeleton rows={3} /> : null}

      {!isLoading && error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : null}

      {!isLoading && !error && summary ? (
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-white/80 bg-white px-3 py-2.5 shadow-sm">
            <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
              Charge Amount
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums">
              <CurrencyFormatter cents={summary.charge_amount_cents} />
            </dd>
          </div>
          <div className="rounded-lg border border-white/80 bg-white px-3 py-2.5 shadow-sm">
            <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
              Paid Amount
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums">
              <CurrencyFormatter cents={summary.paid_cents} />
            </dd>
          </div>
          <div className="rounded-lg border border-white/80 bg-white px-3 py-2.5 shadow-sm">
            <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
              Remaining
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums">
              <CurrencyFormatter cents={summary.remaining_cents} />
            </dd>
          </div>
        </dl>
      ) : null}

      {!isLoading && !error && !summary ? (
        <EmptyState
          title="No summary yet"
          description="Choose a charge and period to load the live summary."
          className="border-0 bg-transparent py-6"
        />
      ) : null}
    </div>
  );
}
