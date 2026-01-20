import * as React from "react";

import { cn } from "@/lib/cn";

export type AlertVariant = "neutral" | "success" | "warning" | "danger";

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variants: Record<AlertVariant, string> = {
  neutral: "border border-border bg-surface text-text",
  success: "border border-success/30 bg-success/10 text-text",
  warning: "border border-warning/30 bg-warning/10 text-text",
  danger: "border border-danger/30 bg-danger/10 text-text"
};

export function Alert({ className, variant = "neutral", ...props }: AlertProps) {
  return <div className={cn("rounded-2xl p-3", variants[variant], className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("text-sm font-semibold", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-1 text-sm text-text-2", className)} {...props} />;
}


