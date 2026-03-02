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
        "inline-flex items-center gap-2 rounded-app border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-text transition-colors hover:border-white/15 hover:bg-white/[0.08]",
        className
      )}
    >
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      {label}
    </Link>
  );
}
