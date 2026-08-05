import { endpoints } from "@/constants/api";
import { api } from "@/lib/axios";
import type { LoginRequest, LoginResponse, User } from "@/types/auth";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(endpoints.auth.login, payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>(endpoints.auth.me);
  return data;
}
