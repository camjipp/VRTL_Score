import type { LinkProps } from "next/link";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/cn";

export type ButtonLinkVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonLinkSize = "sm" | "md" | "lg";

export type ButtonLinkProps = LinkProps & {
  className?: string;
  children: React.ReactNode;
  variant?: ButtonLinkVariant;
  size?: ButtonLinkSize;
  /** For links that should appear disabled (no click, no tab stop) */
  disabled?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
  "active:translate-y-px active:opacity-90";

const variantClasses: Record<ButtonLinkVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-2",
  secondary: "border border-border bg-surface text-text hover:bg-surface-2",
  outline: "border border-border bg-transparent text-text hover:bg-bg-2/40",
  ghost: "bg-transparent text-text hover:bg-bg-2/40",
  destructive: "bg-danger text-white hover:bg-danger/90"
};

const sizeClasses: Record<ButtonLinkSize, string> = {
  sm: "h-9 px-3",
  md: "h-10 px-4",
  lg: "h-11 px-5 text-base"
};

const disabledClasses = "pointer-events-none opacity-60 grayscale-[10%]";

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(base, variantClasses[variant], sizeClasses[size], disabled && disabledClasses, className)}
    />
  );
}


