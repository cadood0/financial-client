"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(routes.dashboard);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
