"use client";

import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, description ? { description } : undefined),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, description ? { description } : undefined),
  info: (message: string, description?: string) =>
    sonnerToast.message(message, description ? { description } : undefined),
  message: (message: string, description?: string) =>
    sonnerToast.message(message, description ? { description } : undefined),
};

export { Toaster } from "@/components/ui/sonner";
