import { endpoints } from "@/constants/api";
import { api } from "@/lib/axios";
import type {
  DashboardSummary,
  MonthlyRevenueResponse,
  RevenueByCityResponse,
  RevenueByFeeTypeResponse,
} from "@/types/dashboard";

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummary>(endpoints.dashboard.summary);
  return data;
}

export async function getMonthlyRevenue(months = 12) {
  const { data } = await api.get<MonthlyRevenueResponse>(
    endpoints.dashboard.monthlyRevenue,
    { params: { months } },
  );
  return data;
}

export async function getRevenueByCity() {
  const { data } = await api.get<RevenueByCityResponse>(
    endpoints.dashboard.revenueByCity,
  );
  return data;
}

export async function getRevenueByFeeType() {
  const { data } = await api.get<RevenueByFeeTypeResponse>(
    endpoints.dashboard.revenueByFeeType,
  );
  return data;
}
