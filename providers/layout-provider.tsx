"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type LayoutContextValue = {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPath, setSidebarPath] = useState(pathname);

  if (pathname !== sidebarPath) {
    setSidebarPath(pathname);
    setSidebarOpen(false);
  }

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  const value = useMemo(
    () => ({
      sidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [sidebarOpen, openSidebar, closeSidebar, toggleSidebar],
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider");
  }
  return context;
}
