"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { ChartCard } from "@/components/shared/chart-card";
import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { getRevenueByFeeType } from "@/services/dashboard.service";
import { cn } from "@/lib/utils";

const palette = [
  "bg-[#335C77]",
  "bg-orange-400",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-rose-400",
];

export function RevenueByFeeType() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "revenue-by-fee-type"],
    queryFn: getRevenueByFeeType,
  });

  useQueryErrorToast(isError, error, "Unable to load fee type revenue.");

  const items = useMemo(() => data?.data ?? [], [data]);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.collected_cents, 0),
    [items],
  );

  return (
    <ChartCard title="Revenue by Fee Type">
      {isLoading ? <LoadingSkeleton rows={4} /> : null}
      {isError ? (
        <p className="text-destructive text-sm">
          Unable to load fee type revenue.
        </p>
      ) : null}
      {!isLoading && !isError && items.length === 0 ? (
        <EmptyState title="No fee type revenue yet" />
      ) : null}
      {!isLoading && !isError && items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((item, index) => {
            const percent =
              total === 0
                ? 0
                : Math.round((item.collected_cents / total) * 1000) / 10;
            const barWidth = total === 0 ? 0 : Math.max(percent, 2);
            return (
              <li key={item.fee_type_id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        palette[index % palette.length],
                      )}
                    />
                    <span className="truncate font-medium">
                      {item.fee_type_name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 tabular-nums">
                    <CurrencyFormatter
                      cents={item.collected_cents}
                      className="text-muted-foreground text-xs"
                    />
                    <span className="text-muted-foreground">{percent}%</span>
                  </div>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full origin-left rounded-full transition-transform",
                      palette[index % palette.length],
                    )}
                    style={{ transform: `scaleX(${barWidth / 100})` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </ChartCard>
  );
}
