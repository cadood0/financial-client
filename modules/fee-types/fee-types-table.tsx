"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, MoreHorizontal, Pencil, Scale, Trash2 } from "lucide-react";
import { toast } from "@/components/shared/toast";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { cn } from "@/lib/utils";
import { FeeTypeFormDialog } from "@/modules/fee-types/fee-type-form-dialog";
import { deleteFeeType, listFeeTypes } from "@/services/fee-types.service";
import type { FeeType } from "@/types/fee-type";
import { getApiErrorMessage } from "@/utils/api-error";

type FeeTypesTableProps = {
  search: string;
  page: number;
  onPageChange: (page: number) => void;
};

export function FeeTypesTable({
  search,
  page,
  onPageChange,
}: FeeTypesTableProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [deleting, setDeleting] = useState<FeeType | null>(null);

  const feeTypesQuery = useQuery({
    queryKey: ["fee-types", { search, page }],
    queryFn: () =>
      listFeeTypes({
        page,
        limit: 10,
        search: search || undefined,
      }),
  });

  useQueryErrorToast(
    feeTypesQuery.isError,
    feeTypesQuery.error,
    "Unable to load fee types.",
  );

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFeeType(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fee-types"] });
      toast.success("Fee type deleted");
      setDeleting(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete fee type"));
    },
  });

  const feeTypes = feeTypesQuery.data?.data ?? [];
  const meta = feeTypesQuery.data?.meta;

  return (
    <>
      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "description", header: "Description" },
          { key: "status", header: "Status" },
          { key: "actions", header: "Actions", className: "w-16 text-right" },
        ]}
        data={feeTypes}
        isLoading={feeTypesQuery.isLoading}
        isError={feeTypesQuery.isError}
        errorMessage="Unable to load fee types."
        meta={meta}
        onPageChange={onPageChange}
        paginationLabel="fee types"
        emptyTitle="No fee types found"
        emptyDescription="Create a fee type to categorize recurring charges."
        emptyIcon={Scale}
        getRowKey={(feeType) => feeType.id}
        getRowClassName={(feeType) =>
          !feeType.is_active ? "bg-muted/40 text-muted-foreground" : undefined
        }
        renderRow={(feeType) => (
          <>
            <TableCell
              className={cn(
                "font-medium",
                !feeType.is_active && "text-muted-foreground",
              )}
            >
              {feeType.name}
            </TableCell>
            <TableCell
              className={cn(
                "max-w-md",
                !feeType.is_active && "text-muted-foreground",
              )}
            >
              {feeType.description || "—"}
            </TableCell>
            <TableCell>
              {feeType.is_active ? (
                <StatusBadge tone="success">ACTIVE</StatusBadge>
              ) : (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5"
                      >
                        <StatusBadge tone="muted">INACTIVE</StatusBadge>
                        <Info className="text-muted-foreground size-3.5" />
                      </button>
                    }
                  />
                  <TooltipContent>
                    Inactive fee types cannot be attached to new monthly
                    charges.
                  </TooltipContent>
                </Tooltip>
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
                      aria-label="Fee type actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(feeType)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleting(feeType)}
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

      <FeeTypeFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        feeType={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete fee type?"
        description={`This will soft-delete ${deleting?.name ?? "this fee type"}.`}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
        }}
      />
    </>
  );
}
