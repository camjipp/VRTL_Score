"use client";

import { cn } from "@/lib/cn";

const INDUSTRIES = [
  "Healthcare",
  "Legal",
  "Real Estate",
  "Financial Services",
  "SaaS",
  "E-commerce",
  "Professional Services",
  "Education",
  "Home Services",
  "Hospitality",
];

export function IndustryMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-bg to-transparent" />

      {/* Scrolling track */}
      <div className="flex animate-marquee items-center gap-6">
        {[...INDUSTRIES, ...INDUSTRIES, ...INDUSTRIES].map((industry, i) => (
          <span
            key={`${industry}-${i}`}
            className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-2"
          >
            {industry}
          </span>
        ))}
      </div>
    </div>
  );
}

