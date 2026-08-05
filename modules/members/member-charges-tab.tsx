"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Receipt } from "lucide-react";

import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import { DataTable } from "@/components/shared/data-table";
import { DateFormatter } from "@/components/shared/date-formatter";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableCell } from "@/components/ui/table";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { listCharges } from "@/services/charges.service";

export function MemberChargesTab({ memberId }: { memberId: number }) {
  const [page, setPage] = useState(1);

  const chargesQuery = useQuery({
    queryKey: ["members", memberId, "charges", page],
    queryFn: () =>
      listCharges({
        page,
        limit: 10,
        member_id: memberId,
      }),
  });

  useQueryErrorToast(
    chargesQuery.isError,
    chargesQuery.error,
    "Unable to load charges.",
  );

  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: "fee_type", header: "Fee Type" },
          { key: "amount", header: "Monthly Amount" },
          { key: "start", header: "Start Date" },
          { key: "end", header: "End Date" },
        ]}
        data={chargesQuery.data?.data ?? []}
        isLoading={chargesQuery.isLoading}
        isError={chargesQuery.isError}
        errorMessage="Unable to load charges."
        meta={chargesQuery.data?.meta}
        onPageChange={setPage}
        paginationLabel="charges"
        emptyTitle="No charges yet"
        emptyDescription="Monthly charges for this member will appear here."
        emptyIcon={Receipt}
        getRowKey={(charge) => charge.id}
        renderRow={(charge) => (
          <>
            <TableCell className="font-medium">{charge.fee_type_name}</TableCell>
            <TableCell>
              <CurrencyFormatter cents={charge.amount_cents} />
            </TableCell>
            <TableCell>
              <DateFormatter value={charge.start_date} />
            </TableCell>
            <TableCell>
              {charge.end_date ? (
                <DateFormatter value={charge.end_date} />
              ) : (
                <StatusBadge tone="muted">Ongoing</StatusBadge>
              )}
            </TableCell>
          </>
        )}
      />
      <p className="text-muted-foreground text-xs">
        Need a new charge? Manage them in{" "}
        <Link href="/monthly-charges" className="text-primary underline">
          Monthly Charges
        </Link>
        .
      </p>
    </div>
  );
}
