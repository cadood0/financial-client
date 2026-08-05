"use client";

import { SidebarContent } from "@/components/layout/sidebar-content";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLayout } from "@/providers/layout-provider";

export function MobileSidebar() {
  const { sidebarOpen, closeSidebar } = useLayout();

  return (
    <Sheet
      open={sidebarOpen}
      onOpenChange={(open) => {
        if (!open) closeSidebar();
      }}
    >
      <SheetContent
        side="left"
        showCloseButton={false}
        className="bg-sidebar w-72 max-w-[85vw] gap-0 p-0 sm:max-w-72"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Main application navigation</SheetDescription>
        </SheetHeader>
        <SidebarContent onNavigate={closeSidebar} />
      </SheetContent>
    </Sheet>
  );
}
