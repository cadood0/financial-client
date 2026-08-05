"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import {
  DateFormatter,
  PeriodFormatter,
} from "@/components/shared/date-formatter";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { routes } from "@/constants/routes";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { listPayments } from "@/services/payments.service";

export function RecentActivity() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: () => listPayments({ page: 1, limit: 8 }),
  });

  useQueryErrorToast(isError, error, "Unable to load recent payments.");

  const payments = data?.data ?? [];

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <h3 className="text-base font-semibold tracking-tight">
          Recent Activity
        </h3>
        <Link
          href={routes.paymentHistory}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All Transactions
        </Link>
      </div>

      <div className="p-2 sm:p-4">
        {isLoading ? <LoadingSkeleton rows={6} /> : null}
        {isError ? (
          <p className="text-destructive px-3 py-6 text-sm">
            Unable to load recent payments.
          </p>
        ) : null}
        {!isLoading && !isError && payments.length === 0 ? (
          <EmptyState
            title="No payments recorded yet"
            description="Recorded payments will appear here as recent activity."
          />
        ) : null}
        {!isLoading && !isError && payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.member_name}
                  </TableCell>
                  <TableCell>{payment.fee_type_name}</TableCell>
                  <TableCell>
                    <PeriodFormatter value={payment.period} />
                  </TableCell>
                  <TableCell>
                    <CurrencyFormatter cents={payment.amount_cents} />
                  </TableCell>
                  <TableCell>
                    <DateFormatter value={payment.created_at} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>
    </div>
  );
}
