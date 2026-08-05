"use client";

import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchProps = {
  placeholder?: string;
  className?: string;
};

export function Search({
  placeholder = "Search data, members, or fees...",
  className,
}: SearchProps) {
  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
      <Input
        type="search"
        placeholder={placeholder}
        aria-label="Search"
        className="bg-muted/50 placeholder:text-muted-foreground/80 h-10 rounded-full border-transparent pr-4 pl-10 shadow-none focus-visible:bg-background"
      />
    </div>
  );
}
