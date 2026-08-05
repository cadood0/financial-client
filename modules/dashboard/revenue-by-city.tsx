"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { ChartCard } from "@/components/shared/chart-card";
import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { getRevenueByCity } from "@/services/dashboard.service";

export function RevenueByCity() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "revenue-by-city"],
    queryFn: getRevenueByCity,
  });

  useQueryErrorToast(isError, error, "Unable to load city revenue.");

  const items = useMemo(() => data?.data ?? [], [data]);
  const max = useMemo(
    () => Math.max(...items.map((item) => item.collected_cents), 0),
    [items],
  );

  return (
    <ChartCard title="Revenue by City">
      {isLoading ? <LoadingSkeleton rows={5} /> : null}
      {isError ? (
        <p className="text-destructive text-sm">Unable to load city revenue.</p>
      ) : null}
      {!isLoading && !isError && items.length === 0 ? (
        <EmptyState title="No city revenue yet" />
      ) : null}
      {!isLoading && !isError && items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((item) => {
            const width =
              max === 0 ? 0 : Math.max((item.collected_cents / max) * 100, 2);
            return (
              <li key={item.city_id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{item.city_name}</span>
                  <CurrencyFormatter
                    cents={item.collected_cents}
                    className="text-muted-foreground tabular-nums"
                  />
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full origin-left rounded-full transition-transform"
                    style={{ transform: `scaleX(${width / 100})` }}
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
