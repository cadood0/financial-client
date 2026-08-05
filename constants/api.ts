export const API_BASE = "/api/v1";

export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/me",
  },
  members: "/members",
  cities: "/cities",
  feeTypes: "/feeTypes",
  monthlyCharges: "/monthly-charges",
  payments: "/payments",
  paymentsSummary: "/payments/summary",
  users: "/users",
  dashboard: {
    summary: "/dashboard/summary",
    monthlyRevenue: "/dashboard/monthly-revenue",
    revenueByCity: "/dashboard/revenue-by-city",
    revenueByFeeType: "/dashboard/revenue-by-fee-type",
  },
} as const;
