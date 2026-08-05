"use client";

import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type ProfileProps = {
  showDetails?: boolean;
  className?: string;
};

export function Profile({ showDetails = true, className }: ProfileProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className={cn("flex items-center gap-3", className)}
        aria-hidden
      >
        {showDetails ? (
          <div className="hidden space-y-1.5 text-right md:block">
            <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            <div className="bg-muted ml-auto h-2.5 w-16 animate-pulse rounded" />
          </div>
        ) : null}
        <div className="bg-muted size-9 animate-pulse rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showDetails ? (
        <div className="hidden min-w-0 text-right md:block">
          <p className="truncate text-sm leading-none font-semibold">
            {user.name}
          </p>
          <p className="text-muted-foreground mt-1 truncate text-[11px] tracking-wide uppercase">
            {user.email}
          </p>
        </div>
      ) : null}
      <div
        aria-label={user.name}
        className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-black/5"
      >
        {initials(user.name) || "U"}
      </div>
    </div>
  );
}
