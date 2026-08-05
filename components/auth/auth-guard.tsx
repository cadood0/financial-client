"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LayoutLoading } from "@/components/layout/layout-loading";
import { routes } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(routes.login);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LayoutLoading label="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <LayoutLoading label="Redirecting..." />;
  }

  return children;
}
