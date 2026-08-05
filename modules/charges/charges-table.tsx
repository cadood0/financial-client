"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Receipt, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import { DataTable } from "@/components/shared/data-table";
import { DateFormatter } from "@/components/shared/date-formatter";
import { StatusBadge } from "@/components/shared/status-badge";
import { toast } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { ChargeFormDialog } from "@/modules/charges/charge-form-dialog";
import { deleteCharge, listCharges } from "@/services/charges.service";
import type { MonthlyCharge } from "@/types/charge";
import { getApiErrorMessage } from "@/utils/api-error";

type ChargesTableProps = {
  memberId: number;
  feeTypeId: number;
  page: number;
  onPageChange: (page: number) => void;
};

export function ChargesTable({
  memberId,
  feeTypeId,
  page,
  onPageChange,
}: ChargesTableProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<MonthlyCharge | null>(null);
  const [deleting, setDeleting] = useState<MonthlyCharge | null>(null);

  const chargesQuery = useQuery({
    queryKey: ["charges", { memberId, feeTypeId, page }],
    queryFn: () =>
      listCharges({
        page,
        limit: 10,
        member_id: memberId || undefined,
        fee_type_id: feeTypeId || undefined,
      }),
  });

  useQueryErrorToast(
    chargesQuery.isError,
    chargesQuery.error,
    "Unable to load monthly charges.",
  );

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCharge(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["charges"] });
      toast.success("Charge deleted");
      setDeleting(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete charge"));
    },
  });

  const charges = chargesQuery.data?.data ?? [];
  const meta = chargesQuery.data?.meta;

  return (
    <>
      <DataTable
        columns={[
          { key: "member", header: "Member" },
          { key: "fee_type", header: "Fee Type" },
          { key: "amount", header: "Monthly Amount" },
          { key: "start", header: "Start Date" },
          { key: "end", header: "End Date" },
          { key: "actions", header: "Actions", className: "w-16 text-right" },
        ]}
        data={charges}
        isLoading={chargesQuery.isLoading}
        isError={chargesQuery.isError}
        errorMessage="Unable to load monthly charges."
        meta={meta}
        onPageChange={onPageChange}
        paginationLabel="charges"
        emptyTitle="No monthly charges found"
        emptyDescription="Create a charge to start recurring billing for a member."
        emptyIcon={Receipt}
        getRowKey={(charge) => charge.id}
        renderRow={(charge) => (
          <>
            <TableCell>
              <div>
                <p className="font-medium">{charge.member_name}</p>
                <p className="text-muted-foreground text-xs">
                  ID: #{charge.member_id}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge tone="info">{charge.fee_type_name}</StatusBadge>
            </TableCell>
            <TableCell className="font-medium tabular-nums">
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
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Charge actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(charge)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleting(charge)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </>
        )}
      />

      <ChargeFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        charge={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete monthly charge?"
        description={`This will remove the ${deleting?.fee_type_name ?? "charge"} for ${deleting?.member_name ?? "this member"}.`}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
        }}
      />
    </>
  );
}
