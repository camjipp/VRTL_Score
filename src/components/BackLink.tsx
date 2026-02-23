"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

type BackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-text-2 transition-colors hover:text-text",
        className
      )}
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
