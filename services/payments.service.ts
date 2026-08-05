import { endpoints } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type {
  Payment,
  PaymentSummaryParams,
  PaymentsListParams,
  PeriodSummary,
  RecordPaymentRequest,
} from "@/types/payment";

export async function listPayments(params: PaymentsListParams = {}) {
  const { data } = await api.get<PaginatedResponse<Payment>>(
    endpoints.payments,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        member_id: params.member_id || undefined,
        charge_id: params.charge_id || undefined,
      },
    },
  );
  return data;
}

export async function getPayment(id: number) {
  const { data } = await api.get<Payment>(`${endpoints.payments}/${id}`);
  return data;
}

export async function recordPayment(payload: RecordPaymentRequest) {
  const { data } = await api.post<Payment>(endpoints.payments, payload);
  return data;
}

export async function getPaymentSummary(params: PaymentSummaryParams) {
  const { data } = await api.get<PeriodSummary>(endpoints.paymentsSummary, {
    params: {
      charge_id: params.charge_id,
      period: params.period,
    },
  });
  return data;
}
