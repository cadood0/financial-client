"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/shared/chart-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { cn } from "@/lib/utils";
import { getMonthlyRevenue } from "@/services/dashboard.service";
import { centsToDollars, formatCents } from "@/utils/currency";
import { formatMonthLabel } from "@/utils/date";

const ranges = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
] as const;

export function MonthlyRevenueChart() {
  const [months, setMonths] = useState<3 | 6 | 12>(12);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "monthly-revenue", months],
    queryFn: () => getMonthlyRevenue(months),
  });

  useQueryErrorToast(isError, error, "Unable to load monthly revenue.");

  const chartData = useMemo(
    () =>
      (data?.data ?? []).map((item) => ({
        label: formatMonthLabel(item.month),
        amount: centsToDollars(item.collected_cents),
        cents: item.collected_cents,
      })),
    [data],
  );

  return (
    <ChartCard
      title="Monthly Revenue"
      description="Comparison across the current fiscal year."
      actions={
        <div className="bg-muted flex rounded-lg p-1">
          {ranges.map((range) => (
            <Button
              key={range.months}
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-2.5 text-xs",
                months === range.months &&
                  "bg-background text-foreground shadow-sm",
              )}
              onClick={() => setMonths(range.months)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      }
      className="min-h-[360px]"
    >
      {isLoading ? <LoadingSkeleton rows={8} /> : null}
      {isError ? (
        <p className="text-destructive text-sm">Unable to load monthly revenue.</p>
      ) : null}
      {!isLoading && !isError && chartData.length === 0 ? (
        <EmptyState
          title="No revenue data"
          description="Collected payments will appear in this chart by month."
          className="py-10"
        />
      ) : null}
      {!isLoading && !isError && chartData.length > 0 ? (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  `$${Math.round(value).toLocaleString()}`
                }
              />
              <Tooltip
                formatter={(value) => formatCents(Math.round(Number(value) * 100))}
                labelStyle={{ color: "#111827" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#335C77"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#335C77" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </ChartCard>
  );
}
