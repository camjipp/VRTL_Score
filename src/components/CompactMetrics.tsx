"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const STATS = [
  { label: "AI models", value: "3+", sublabel: "queried per snapshot" },
  { label: "Signals", value: "10+", sublabel: "analyzed per report" },
  { label: "Seconds", value: "30", sublabel: "to add a client" },
];

const COMPETITORS = [
  { name: "Your client", score: 82, isClient: true },
  { name: "Competitor A", score: 61 },
  { name: "Competitor B", score: 47 },
];

export function CompactMetrics({ className }: { className?: string }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("grid gap-8 lg:grid-cols-2 lg:gap-12", className)}>
      {/* Left: Quick stats */}
      <div className="flex items-center justify-center gap-8 lg:gap-12">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-text md:text-4xl">{stat.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-text-3">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Right: Competitor bars */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 text-xs font-medium uppercase tracking-wide text-text-3">
          AI Visibility Comparison
        </div>
        <div className="space-y-3">
          {COMPETITORS.map((c, i) => (
            <div key={c.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={c.isClient ? "font-medium text-text" : "text-text-2"}>{c.name}</span>
                <span className={cn("tabular-nums", c.isClient ? "font-bold text-emerald-600" : "text-text-3")}>
                  {c.score}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    c.isClient ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-text/15"
                  )}
                  style={{
                    width: animated ? `${c.score}%` : "0%",
                    transitionDelay: `${i * 100}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

