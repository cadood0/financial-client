"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";

import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import { DataTable } from "@/components/shared/data-table";
import {
  DateFormatter,
  PeriodFormatter,
} from "@/components/shared/date-formatter";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell } from "@/components/ui/table";
import { routes } from "@/constants/routes";
import { usePageReset } from "@/hooks/use-page-reset";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { cn } from "@/lib/utils";
import { useRecordPayment } from "@/providers/record-payment-provider";
import { listMembers } from "@/services/members.service";
import { listPayments } from "@/services/payments.service";

export function PaymentsPage() {
  const searchParams = useSearchParams();
  const { openWizard } = useRecordPayment();

  const memberFromQuery = Number(searchParams.get("memberId") || 0);
  const shouldRecord = searchParams.get("record") === "1";

  const [memberOverride, setMemberOverride] = useState<number | null>(null);
  const memberId =
    memberOverride !== null
      ? memberOverride
      : memberFromQuery > 0
        ? memberFromQuery
        : 0;
  const [page, setPage] = usePageReset([memberId]);

  useEffect(() => {
    if (!shouldRecord) return;
    openWizard(memberFromQuery > 0 ? memberFromQuery : undefined);
  }, [shouldRecord, memberFromQuery, openWizard]);

  const membersQuery = useQuery({
    queryKey: ["members", "options"],
    queryFn: () => listMembers({ page: 1, limit: 100 }),
  });

  const paymentsQuery = useQuery({
    queryKey: ["payments", { memberId, page }],
    queryFn: () =>
      listPayments({
        page,
        limit: 15,
        member_id: memberId || undefined,
      }),
  });

  useQueryErrorToast(
    membersQuery.isError,
    membersQuery.error,
    "Unable to load members.",
  );
  useQueryErrorToast(
    paymentsQuery.isError,
    paymentsQuery.error,
    "Unable to load payment ledger.",
  );

  const payments = paymentsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Ledger"
        description="Permanent record of all financial contributions."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.paymentHistory}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Payment History
            </Link>
            <Button type="button" onClick={() => openWizard()}>
              Record Payment
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={memberId > 0 ? String(memberId) : "all"}
          onValueChange={(value) =>
            setMemberOverride(!value || value === "all" ? 0 : Number(value))
          }
        >
          <SelectTrigger className="h-10 w-full sm:w-[220px]">
            <SelectValue placeholder="All Members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {(membersQuery.data?.data ?? []).map((member) => (
              <SelectItem key={member.id} value={String(member.id)}>
                {member.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        className="border-slate-200 font-sans"
        columns={[
          { key: "date", header: "Date" },
          { key: "member", header: "Member" },
          { key: "fee_type", header: "Fee Type" },
          { key: "period", header: "Period" },
          { key: "amount", header: "Amount" },
          { key: "note", header: "Note" },
          { key: "recorded_by", header: "Recorded By" },
        ]}
        data={payments}
        isLoading={paymentsQuery.isLoading}
        isError={paymentsQuery.isError}
        errorMessage="Unable to load payment ledger."
        meta={paymentsQuery.data?.meta}
        onPageChange={setPage}
        paginationLabel="entries"
        emptyTitle="No payments in the ledger"
        emptyDescription="Recorded payments appear here as an immutable financial history."
        emptyIcon={BookOpen}
        getRowKey={(payment) => payment.id}
        renderRow={(payment) => (
          <>
            <TableCell className="align-top">
              <div className="space-y-0.5">
                <DateFormatter
                  value={payment.created_at}
                  className="font-medium"
                />
                <p className="text-muted-foreground font-mono text-[11px]">
                  {new Date(payment.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </TableCell>
            <TableCell className="align-top">
              <div>
                <p className="font-medium">{payment.member_name}</p>
                <p className="text-muted-foreground font-mono text-[11px]">
                  #MEM-{payment.member_id}
                </p>
              </div>
            </TableCell>
            <TableCell className="align-top">{payment.fee_type_name}</TableCell>
            <TableCell className="align-top">
              <PeriodFormatter value={payment.period} />
            </TableCell>
            <TableCell className="align-top font-semibold tabular-nums">
              <CurrencyFormatter cents={payment.amount_cents} />
            </TableCell>
            <TableCell className="text-muted-foreground align-top max-w-[220px] truncate">
              {payment.note || "—"}
            </TableCell>
            <TableCell className="align-top">{payment.recorded_by_name}</TableCell>
          </>
        )}
      />
    </div>
  );
}
