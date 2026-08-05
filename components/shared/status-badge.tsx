import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneClass = {
  success: "border-transparent bg-emerald-50 text-emerald-700",
  warning: "border-transparent bg-amber-50 text-amber-700",
  danger: "border-transparent bg-red-50 text-red-700",
  muted: "border-transparent bg-muted text-muted-foreground",
  info: "border-transparent bg-sky-50 text-sky-700",
} as const;

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: keyof typeof toneClass;
  className?: string;
};

export function StatusBadge({
  children,
  tone = "muted",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 font-medium", toneClass[tone], className)}
    >
      {children}
    </Badge>
  );
}
