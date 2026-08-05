"use client";

import { Download, Printer, X } from "lucide-react";
import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import {
  DateFormatter,
  PeriodFormatter,
} from "@/components/shared/date-formatter";
import { toast } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Payment } from "@/types/payment";

type PaymentReceiptProps = {
  payment: Payment;
  onClose: () => void;
  className?: string;
};

export function PaymentReceipt({
  payment,
  onClose,
  className,
}: PaymentReceiptProps) {
  function handlePrint() {
    // Print preparation only — PDF/print pipeline not implemented yet.
    toast.message(
      "Print is prepared for this receipt.",
      "Print support will be connected in a later step.",
    );
  }

  function handleDownload() {
    // Download preparation only — PDF generation is intentionally not implemented.
    toast.message(
      "Download is prepared for this receipt.",
      "PDF generation will be connected in a later step.",
    );
  }

  return (
    <div className={cn("flex h-full min-h-[560px] flex-col", className)}>
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
            Transaction Confirmed
          </p>
          <h3 className="mt-1 text-lg font-semibold">Payment Receipt</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close receipt"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="mx-auto max-w-md rounded-xl border border-dashed border-slate-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-sm">
          <div className="text-center">
            <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
              FinAdmin Ledger
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight">
              Payment Successful
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Official contribution receipt
            </p>
          </div>

          <Separator className="my-5 border-dashed" />

          <dl className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Member</dt>
              <dd className="text-right font-medium">{payment.member_name}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Fee Type</dt>
              <dd className="text-right font-medium">{payment.fee_type_name}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Period</dt>
              <dd className="text-right font-medium">
                <PeriodFormatter value={payment.period} />
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="text-right text-base font-bold tabular-nums">
                <CurrencyFormatter cents={payment.amount_cents} />
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Recorded By</dt>
              <dd className="text-right font-medium">
                {payment.recorded_by_name}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Payment Date</dt>
              <dd className="text-right font-medium">
                <DateFormatter value={payment.created_at} />
              </dd>
            </div>
          </dl>

          <Separator className="my-5 border-dashed" />

          <div className="text-center">
            <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
              Ref · PAY-{payment.id}
            </p>
            <p className="text-muted-foreground mt-2 text-[11px]">
              Confidential banking record · Do not alter
            </p>
            <div
              aria-hidden
              className="mx-auto mt-4 h-10 w-40 bg-[repeating-linear-gradient(90deg,#111_0_2px,transparent_2px_4px)] opacity-70"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="size-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
