"use client";

import { Menu, Plus } from "lucide-react";

import { Profile } from "@/components/layout/profile";
import { Search } from "@/components/layout/search";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/providers/layout-provider";
import { useRecordPayment } from "@/providers/record-payment-provider";

type NavbarProps = {
  searchPlaceholder?: string;
  actionLabel?: string;
};

export function Navbar({
  searchPlaceholder = "Search data, members, or fees...",
  actionLabel = "Record Payment",
}: NavbarProps) {
  const { openSidebar } = useLayout();
  const { openWizard } = useRecordPayment();

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b px-3 backdrop-blur sm:gap-4 sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={openSidebar}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <Search placeholder={searchPlaceholder} className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          className="shrink-0 gap-1.5 shadow-sm"
          onClick={() => openWizard()}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">{actionLabel}</span>
        </Button>
        <Profile />
      </div>
    </header>
  );
}
