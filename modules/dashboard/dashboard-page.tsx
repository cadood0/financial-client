"use client";

import { PageHeader } from "@/components/shared/page-header";
import { MonthlyRevenueChart } from "@/modules/dashboard/monthly-revenue-chart";
import { RecentActivity } from "@/modules/dashboard/recent-activity";
import { RevenueByCity } from "@/modules/dashboard/revenue-by-city";
import { RevenueByFeeType } from "@/modules/dashboard/revenue-by-fee-type";
import { SummaryCards } from "@/modules/dashboard/summary-cards";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Welcome back. Here's what's happening with your finances today."
      />

      <SummaryCards />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <MonthlyRevenueChart />
        <div className="grid gap-4">
          <RevenueByCity />
          <RevenueByFeeType />
        </div>
      </div>

      <RecentActivity />
    </div>
  );
}
