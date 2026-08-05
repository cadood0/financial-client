"use client";

import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Pagination } from "@/components/shared/pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaginationMeta } from "@/types/api";
import { cn } from "@/lib/utils";

export type DataTableColumn = {
  key: string;
  header: string;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  paginationLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  getRowKey: (row: T) => string | number;
  getRowClassName?: (row: T, index: number) => string | undefined;
  renderRow: (row: T, index: number) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage = "Unable to load data.",
  meta,
  onPageChange,
  paginationLabel = "entries",
  emptyTitle = "No results found",
  emptyDescription,
  emptyIcon,
  getRowKey,
  getRowClassName,
  renderRow,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "bg-card overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
    >
      <div className="p-2 sm:p-4">
        {isLoading ? <LoadingSkeleton rows={8} /> : null}

        {isError ? (
          <p className="text-destructive px-3 py-8 text-sm">{errorMessage}</p>
        ) : null}

        {!isLoading && !isError && data.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={emptyIcon}
          />
        ) : null}

        {!isLoading && !isError && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={getRowKey(row)}
                  className={getRowClassName?.(row, index)}
                >
                  {renderRow(row, index)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>

      {meta && meta.total_pages > 0 && onPageChange ? (
        <div className="border-t px-4 py-3">
          <Pagination
            meta={meta}
            onPageChange={onPageChange}
            label={paginationLabel}
          />
        </div>
      ) : null}
    </div>
  );
}
