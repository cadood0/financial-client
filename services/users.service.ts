import { endpoints } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type { User } from "@/types/auth";
import type {
  RegisterUserRequest,
  UpdateUserRequest,
  UsersListParams,
} from "@/types/user";

export async function listUsers(params: UsersListParams = {}) {
  const { data } = await api.get<PaginatedResponse<User>>(endpoints.users, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
    },
  });
  return data;
}

export async function getUser(id: number) {
  const { data } = await api.get<User>(`${endpoints.users}/${id}`);
  return data;
}

export async function registerUser(payload: RegisterUserRequest) {
  const { data } = await api.post<User>(endpoints.auth.register, payload);
  return data;
}

export async function updateUser(id: number, payload: UpdateUserRequest) {
  const { data } = await api.put<User>(`${endpoints.users}/${id}`, payload);
  return data;
}

export async function deleteUser(id: number) {
  await api.delete(`${endpoints.users}/${id}`);
}
