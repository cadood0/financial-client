import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatisticsCardProps = {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  trend?: React.ReactNode;
  badge?: React.ReactNode;
  highlighted?: boolean;
  className?: string;
};

export function StatisticsCard({
  label,
  value,
  icon: Icon,
  trend,
  badge,
  highlighted = false,
  className,
}: StatisticsCardProps) {
  return (
    <div
      className={cn(
        "bg-card relative rounded-xl border p-5 shadow-sm",
        highlighted && "border-orange-200 bg-orange-50/60",
        className,
      )}
    >
      {badge ? <div className="absolute top-4 right-4">{badge}</div> : null}
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-lg",
              highlighted
                ? "bg-orange-100 text-orange-700"
                : "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-5" />
          </span>
        ) : null}
        {trend ? <div className="text-sm">{trend}</div> : null}
      </div>
      <p className="text-muted-foreground mt-4 text-[11px] font-semibold tracking-[0.12em] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tracking-tight",
          highlighted && "text-orange-800",
        )}
      >
        {value}
      </p>
    </div>
  );
}
