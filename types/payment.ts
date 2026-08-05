export type Payment = {
  id: number;
  member_id: number;
  member_name: string;
  charge_id: number;
  fee_type_name: string;
  period: string;
  amount_cents: number;
  note: string;
  recorded_by: number;
  recorded_by_name: string;
  created_at: string;
};

export type RecordPaymentRequest = {
  charge_id: number;
  period: string;
  amount_cents: number;
  note?: string;
};

export type PeriodSummary = {
  charge_id: number;
  period: string;
  charge_amount_cents: number;
  paid_cents: number;
  remaining_cents: number;
  status: "unpaid" | "partial" | "paid" | string;
};

export type PaymentsListParams = {
  page?: number;
  limit?: number;
  member_id?: number;
  charge_id?: number;
};

export type PaymentSummaryParams = {
  charge_id: number;
  period: string;
};
