"use client";

import { cn } from "@/lib/cn";

// Placeholder company names - replace with actual client logos when available
const logos = [
  "Dentsu",
  "Omnicom",
  "WPP",
  "Publicis",
  "IPG",
  "Havas",
  "Stagwell",
  "Accenture Song",
];

export function TrustLogos({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-bg to-transparent" />

      {/* Scrolling track */}
      <div className="flex animate-marquee items-center gap-12">
        {[...logos, ...logos].map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex shrink-0 items-center gap-3 text-text-3 transition-colors hover:text-text"
          >
            {/* Placeholder icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border">
              <span className="text-xs font-bold">{name.charAt(0)}</span>
            </div>
            <span className="whitespace-nowrap text-sm font-medium tracking-tight">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

