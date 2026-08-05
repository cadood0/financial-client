export type MonthlyCharge = {
  id: number;
  member_id: number;
  member_name: string;
  fee_type_id: number;
  fee_type_name: string;
  amount_cents: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateChargeRequest = {
  member_id: number;
  fee_type_id: number;
  amount_cents: number;
  start_date: string;
  end_date?: string | null;
};

export type UpdateChargeRequest = {
  amount_cents: number;
  end_date?: string | null;
};

export type ChargesListParams = {
  page?: number;
  limit?: number;
  member_id?: number;
  fee_type_id?: number;
};
