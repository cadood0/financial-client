import axios from "axios";

import {
  clearAccessToken,
  getAccessToken,
} from "@/lib/auth-token";
import { routes } from "@/constants/routes";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAccessToken();
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path !== routes.login) {
          const returnTo = `${path}${window.location.search}`;
          window.location.assign(
            `${routes.login}?next=${encodeURIComponent(returnTo)}`,
          );
        }
      }
    }
    return Promise.reject(error);
  },
);
