"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

type TopBarProps = {
  title: string;
  primaryAction?: ReactNode;
  filters?: ReactNode;
  className?: string;
};

export function TopBar({ title, primaryAction, filters, className }: TopBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-white/5 bg-bg px-6 py-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <h1 className="text-base font-semibold text-text">{title}</h1>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {filters}
        {primaryAction}
      </div>
    </div>
  );
}
