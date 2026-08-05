"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Building2,
  Landmark,
  UsersRound,
  Wallet,
} from "lucide-react";

import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatisticsCard } from "@/components/shared/statistics-card";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { getDashboardSummary } from "@/services/dashboard.service";

export function SummaryCards() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
  });

  useQueryErrorToast(isError, error, "Unable to load dashboard summary.");

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} rows={3} className="rounded-xl border p-5" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-destructive text-sm">Unable to load dashboard summary.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatisticsCard
        label="Total Members"
        value={data.total_members.toLocaleString()}
        icon={UsersRound}
        trend={
          <span className="text-emerald-600 inline-flex items-center gap-0.5 text-xs font-medium">
            <ArrowUpRight className="size-3.5" />
            Live
          </span>
        }
      />
      <StatisticsCard
        label="Total Cities"
        value={data.total_cities.toLocaleString()}
        icon={Building2}
        trend={<span className="text-muted-foreground text-xs">Active regions</span>}
      />
      <StatisticsCard
        label="Total Collected"
        value={<CurrencyFormatter cents={data.total_collected_cents} />}
        icon={Landmark}
        trend={
          <span className="text-emerald-600 inline-flex items-center gap-0.5 text-xs font-medium">
            <ArrowUpRight className="size-3.5" />
            Ledger
          </span>
        }
      />
      <StatisticsCard
        label="Outstanding Balance"
        value={<CurrencyFormatter cents={data.outstanding_cents} />}
        icon={Wallet}
        highlighted
        badge={<StatusBadge tone="warning">Attention</StatusBadge>}
      />
    </div>
  );
}
