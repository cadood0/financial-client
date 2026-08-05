"use client";

import { useEffect } from "react";

import { toast } from "@/components/shared/toast";
import { getApiErrorMessage } from "@/utils/api-error";

/** Shows a toast when a React Query request fails. */
export function useQueryErrorToast(
  isError: boolean,
  error: unknown,
  fallback: string,
) {
  useEffect(() => {
    if (!isError) return;
    toast.error(getApiErrorMessage(error, fallback));
  }, [isError, error, fallback]);
}
