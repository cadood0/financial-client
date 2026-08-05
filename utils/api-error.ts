import axios from "axios";

import type { ApiErrorBody } from "@/types/api";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error) return body.error;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
