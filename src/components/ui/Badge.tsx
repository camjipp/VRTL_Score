import * as React from "react";

import { cn } from "@/lib/cn";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "accent";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  neutral: "border border-border bg-surface-2 text-text-2",
  success: "border border-success/30 bg-success/10 text-success",
  warning: "border border-warning/30 bg-warning/10 text-warning",
  danger: "border border-danger/30 bg-danger/10 text-danger",
  accent: "border border-accent/30 bg-accent/10 text-accent"
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}


