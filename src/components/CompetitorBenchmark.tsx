"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const COMPETITORS = [
  { name: "Your Client", score: 82, isClient: true },
  { name: "Competitor A", score: 67, isClient: false },
  { name: "Competitor B", score: 54, isClient: false },
  { name: "Competitor C", score: 41, isClient: false },
];

export function CompetitorBenchmark({ className }: { className?: string }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const maxScore = Math.max(...COMPETITORS.map((c) => c.score));

  return (
    <div className={cn("space-y-4", className)}>
      {COMPETITORS.map((competitor, i) => (
        <div key={competitor.name} className="group">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium",
                competitor.isClient ? "text-text" : "text-text-2"
              )}>
                {competitor.name}
              </span>
              {competitor.isClient && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  #1
                </span>
              )}
            </div>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              competitor.isClient ? "text-emerald-600" : "text-text-2"
            )}>
              {competitor.score}%
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-3 overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                competitor.isClient
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                  : "bg-text/20"
              )}
              style={{
                width: animated ? `${(competitor.score / maxScore) * 100}%` : "0%",
                transitionDelay: `${i * 150}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

