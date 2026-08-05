"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";

import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import { DataTable } from "@/components/shared/data-table";
import {
  DateFormatter,
  PeriodFormatter,
} from "@/components/shared/date-formatter";
import { PageHeader } from "@/components/shared/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell } from "@/components/ui/table";
import { usePageReset } from "@/hooks/use-page-reset";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { listCharges } from "@/services/charges.service";
import { listMembers } from "@/services/members.service";
import { listPayments } from "@/services/payments.service";

type PaymentHistoryProps = {
  initialMemberId?: number;
  initialChargeId?: number;
  showHeader?: boolean;
  title?: string;
  description?: string;
  lockedMemberId?: number;
};

export function PaymentHistory({
  initialMemberId = 0,
  initialChargeId = 0,
  showHeader = true,
  title = "Payment History",
  description = "Complete immutable record of every recorded contribution, newest first.",
  lockedMemberId,
}: PaymentHistoryProps) {
  const resolvedMemberId = lockedMemberId ?? initialMemberId;
  const [memberId, setMemberId] = useState(resolvedMemberId);
  const [chargeId, setChargeId] = useState(initialChargeId);
  const effectiveMemberId = lockedMemberId ?? memberId;
  const [page, setPage] = usePageReset([effectiveMemberId, chargeId]);

  const membersQuery = useQuery({
    queryKey: ["members", "options"],
    queryFn: () => listMembers({ page: 1, limit: 100 }),
    enabled: !lockedMemberId,
  });

  const chargesQuery = useQuery({
    queryKey: ["charges", "history-options", effectiveMemberId],
    queryFn: () =>
      listCharges({
        page: 1,
        limit: 100,
        member_id: effectiveMemberId || undefined,
      }),
  });

  const paymentsQuery = useQuery({
    queryKey: [
      "payments",
      "history",
      { memberId: effectiveMemberId, chargeId, page },
    ],
    queryFn: () =>
      listPayments({
        page,
        limit: 15,
        member_id: effectiveMemberId || undefined,
        charge_id: chargeId || undefined,
      }),
  });

  useQueryErrorToast(
    membersQuery.isError,
    membersQuery.error,
    "Unable to load members.",
  );
  useQueryErrorToast(
    chargesQuery.isError,
    chargesQuery.error,
    "Unable to load charges.",
  );
  useQueryErrorToast(
    paymentsQuery.isError,
    paymentsQuery.error,
    "Unable to load payment history.",
  );

  const payments = [...(paymentsQuery.data?.data ?? [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  function handleMemberChange(value: string | null) {
    const next = !value || value === "all" ? 0 : Number(value);
    setMemberId(next);
    setChargeId(0);
  }

  return (
    <div className="space-y-6">
      {showHeader ? (
        <PageHeader title={title} description={description} />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {!lockedMemberId ? (
          <Select
            value={memberId > 0 ? String(memberId) : "all"}
            onValueChange={handleMemberChange}
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
        ) : null}

        <Select
          value={chargeId > 0 ? String(chargeId) : "all"}
          onValueChange={(value) =>
            setChargeId(!value || value === "all" ? 0 : Number(value))
          }
        >
          <SelectTrigger className="h-10 w-full sm:w-[260px]">
            <SelectValue placeholder="All Charges" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Charges</SelectItem>
            {(chargesQuery.data?.data ?? []).map((charge) => (
              <SelectItem key={charge.id} value={String(charge.id)}>
                {charge.member_name} · {charge.fee_type_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
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
        errorMessage="Unable to load payment history."
        meta={paymentsQuery.data?.meta}
        onPageChange={setPage}
        paginationLabel="payments"
        emptyTitle="No payment history"
        emptyDescription="Recorded payments will appear here. Editing and deleting are not allowed."
        emptyIcon={History}
        getRowKey={(payment) => payment.id}
        renderRow={(payment) => (
          <>
            <TableCell>
              <DateFormatter value={payment.created_at} />
            </TableCell>
            <TableCell className="font-medium">{payment.member_name}</TableCell>
            <TableCell>{payment.fee_type_name}</TableCell>
            <TableCell>
              <PeriodFormatter value={payment.period} />
            </TableCell>
            <TableCell className="font-semibold tabular-nums">
              <CurrencyFormatter cents={payment.amount_cents} />
            </TableCell>
            <TableCell className="text-muted-foreground max-w-[200px] truncate">
              {payment.note || "—"}
            </TableCell>
            <TableCell>{payment.recorded_by_name}</TableCell>
          </>
        )}
      />
    </div>
  );
}
