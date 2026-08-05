import { endpoints } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type {
  ChargesListParams,
  CreateChargeRequest,
  MonthlyCharge,
  UpdateChargeRequest,
} from "@/types/charge";

export async function listCharges(params: ChargesListParams = {}) {
  const { data } = await api.get<PaginatedResponse<MonthlyCharge>>(
    endpoints.monthlyCharges,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        member_id: params.member_id || undefined,
        fee_type_id: params.fee_type_id || undefined,
      },
    },
  );
  return data;
}

export async function getCharge(id: number) {
  const { data } = await api.get<MonthlyCharge>(
    `${endpoints.monthlyCharges}/${id}`,
  );
  return data;
}

export async function createCharge(payload: CreateChargeRequest) {
  const { data } = await api.post<MonthlyCharge>(
    endpoints.monthlyCharges,
    payload,
  );
  return data;
}

export async function updateCharge(id: number, payload: UpdateChargeRequest) {
  const { data } = await api.put<MonthlyCharge>(
    `${endpoints.monthlyCharges}/${id}`,
    payload,
  );
  return data;
}

export async function deleteCharge(id: number) {
  await api.delete(`${endpoints.monthlyCharges}/${id}`);
}
