"use client";

import { SidebarContent } from "@/components/layout/sidebar-content";

export function Sidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden h-full w-64 shrink-0 border-r border-sidebar-border lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  );
}
