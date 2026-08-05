import { endpoints } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type {
  CreateMemberRequest,
  Member,
  MembersListParams,
  UpdateMemberRequest,
} from "@/types/member";

export async function listMembers(params: MembersListParams = {}) {
  const { data } = await api.get<PaginatedResponse<Member>>(endpoints.members, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      city_id: params.city_id || undefined,
    },
  });
  return data;
}

export async function getMember(id: number) {
  const { data } = await api.get<Member>(`${endpoints.members}/${id}`);
  return data;
}

export async function createMember(payload: CreateMemberRequest) {
  const { data } = await api.post<Member>(endpoints.members, payload);
  return data;
}

export async function updateMember(id: number, payload: UpdateMemberRequest) {
  const { data } = await api.put<Member>(`${endpoints.members}/${id}`, payload);
  return data;
}

export async function deleteMember(id: number) {
  await api.delete(`${endpoints.members}/${id}`);
}
