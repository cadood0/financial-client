"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardLayout } from "@/layouts/dashboard-layout";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
