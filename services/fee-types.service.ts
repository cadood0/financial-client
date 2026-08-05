import { endpoints } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type {
  CreateFeeTypeRequest,
  FeeType,
  FeeTypesListParams,
  UpdateFeeTypeRequest,
} from "@/types/fee-type";

export async function listFeeTypes(params: FeeTypesListParams = {}) {
  const { data } = await api.get<PaginatedResponse<FeeType>>(
    endpoints.feeTypes,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.search || undefined,
      },
    },
  );
  return data;
}

export async function getFeeType(id: number) {
  const { data } = await api.get<FeeType>(`${endpoints.feeTypes}/${id}`);
  return data;
}

export async function createFeeType(payload: CreateFeeTypeRequest) {
  const { data } = await api.post<FeeType>(endpoints.feeTypes, payload);
  return data;
}

export async function updateFeeType(id: number, payload: UpdateFeeTypeRequest) {
  const { data } = await api.put<FeeType>(
    `${endpoints.feeTypes}/${id}`,
    payload,
  );
  return data;
}

export async function deleteFeeType(id: number) {
  await api.delete(`${endpoints.feeTypes}/${id}`);
}
