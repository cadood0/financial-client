import { endpoints } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type {
  CitiesListParams,
  City,
  CreateCityRequest,
  UpdateCityRequest,
} from "@/types/city";

export async function listCities(params: CitiesListParams = {}) {
  const { data } = await api.get<PaginatedResponse<City>>(endpoints.cities, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
    },
  });
  return data;
}

export async function getCity(id: number) {
  const { data } = await api.get<City>(`${endpoints.cities}/${id}`);
  return data;
}

export async function createCity(payload: CreateCityRequest) {
  const { data } = await api.post<City>(endpoints.cities, payload);
  return data;
}

export async function updateCity(id: number, payload: UpdateCityRequest) {
  const { data } = await api.put<City>(`${endpoints.cities}/${id}`, payload);
  return data;
}

export async function deleteCity(id: number) {
  const { data } = await api.delete(`${endpoints.cities}/${id}`);
  return data;
}
