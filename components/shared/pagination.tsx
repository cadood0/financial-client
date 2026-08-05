"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";
import { cn } from "@/lib/utils";

type PaginationProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
  label?: string;
};

function pageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  if (current > 3) items.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) items.push(page);

  if (current < total - 2) items.push("ellipsis");
  items.push(total);
  return items;
}

export function Pagination({
  meta,
  onPageChange,
  className,
  label = "entries",
}: PaginationProps) {
  const { page, limit, total, total_pages } = meta;
  if (total_pages <= 0) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-muted-foreground text-sm">
        Showing {from} to {to} of {total.toLocaleString()} {label}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        {pageItems(page, total_pages).map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="text-muted-foreground px-2 text-sm"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              size="icon-sm"
              variant={item === page ? "default" : "outline"}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={page >= total_pages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
