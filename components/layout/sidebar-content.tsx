"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut } from "lucide-react";

import { mainNav } from "@/constants/navigation";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type SidebarContentProps = {
  onNavigate?: () => void;
  className?: string;
};

export function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href={routes.dashboard}
      onClick={onNavigate}
      className="flex items-center gap-3 px-1"
    >
      <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg shadow-sm">
        <Building2 className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="text-foreground block text-[15px] leading-tight font-semibold tracking-tight">
          FinAdmin
        </span>
        <span className="text-muted-foreground block text-[10px] font-medium tracking-[0.12em] uppercase">
          Management System
        </span>
      </span>
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
      {mainNav.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-90" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarLogout() {
  const { logout } = useAuth();

  return (
    <div className="border-sidebar-border mt-auto border-t px-3 py-4">
      <button
        type="button"
        onClick={logout}
        className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
      >
        <LogOut className="size-4 shrink-0" />
        Logout
      </button>
    </div>
  );
}

export function SidebarContent({ onNavigate, className }: SidebarContentProps) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="px-4 py-5">
        <SidebarBrand onNavigate={onNavigate} />
      </div>
      <SidebarNav onNavigate={onNavigate} />
      <SidebarLogout />
    </div>
  );
}
