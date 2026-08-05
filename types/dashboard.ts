export type DashboardSummary = {
  total_members: number;
  total_cities: number;
  total_collected_cents: number;
  expected_to_date_cents: number;
  outstanding_cents: number;
};

export type MonthlyRevenueItem = {
  month: string;
  collected_cents: number;
};

export type MonthlyRevenueResponse = {
  data: MonthlyRevenueItem[];
};

export type CityRevenueItem = {
  city_id: number;
  city_name: string;
  collected_cents: number;
};

export type RevenueByCityResponse = {
  data: CityRevenueItem[];
};

export type FeeTypeRevenueItem = {
  fee_type_id: number;
  fee_type_name: string;
  collected_cents: number;
};

export type RevenueByFeeTypeResponse = {
  data: FeeTypeRevenueItem[];
};
