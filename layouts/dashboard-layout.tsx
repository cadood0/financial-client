"use client";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { RecordPaymentWizard } from "@/modules/payments/record-payment-wizard";
import { LayoutProvider } from "@/providers/layout-provider";
import { RecordPaymentProvider } from "@/providers/record-payment-provider";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <LayoutProvider>
      <RecordPaymentProvider>
        <div className="bg-muted/40 flex h-dvh overflow-hidden">
          <Sidebar />
          <MobileSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Navbar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
        <RecordPaymentWizard />
      </RecordPaymentProvider>
    </LayoutProvider>
  );
}
