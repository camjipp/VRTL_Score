"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/cn";

const STATS = [
  { value: 3, suffix: "+", label: "AI Models", color: "from-emerald-500 to-cyan-500" },
  { value: 10, suffix: "+", label: "Signals", color: "from-violet-500 to-purple-500" },
  { value: 30, suffix: "s", label: "Setup Time", color: "from-amber-500 to-orange-500" },
];

const COMPETITORS = [
  { name: "Your client", score: 82, isClient: true },
  { name: "Competitor A", score: 61 },
  { name: "Competitor B", score: 47 },
  { name: "Competitor C", score: 34 },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1000;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="tabular-nums">
      {count}{suffix}
    </div>
  );
}

export function CompactMetrics({ className }: { className?: string }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("grid gap-10 lg:grid-cols-5 lg:gap-8", className)}>
      {/* Left: Stats with visual cards */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-4 text-center transition-all hover:shadow-lg"
            >
              {/* Gradient glow on hover */}
              <div className={cn(
                "pointer-events-none absolute inset-0 opacity-0 blur-xl transition-opacity group-hover:opacity-20",
                `bg-gradient-to-br ${stat.color}`
              )} />
              
              <div className={cn(
                "relative text-3xl font-bold bg-gradient-to-br bg-clip-text text-transparent md:text-4xl",
                stat.color
              )}>
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="relative mt-1 text-xs font-medium uppercase tracking-wide text-text-3">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-text-3">
          Per snapshot analysis
        </p>
      </div>

      {/* Right: Competitor visualization */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-bg p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text">AI Visibility Ranking</h3>
              <p className="text-xs text-text-3">See how your clients compare</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">Live data</span>
            </div>
          </div>

          <div className="space-y-4">
            {COMPETITORS.map((c, i) => (
              <div key={c.name} className="group">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.isClient && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                        1
                      </span>
                    )}
                    <span className={cn(
                      "text-sm",
                      c.isClient ? "font-semibold text-text" : "text-text-2"
                    )}>
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      c.isClient ? "text-emerald-600" : "text-text-3"
                    )}>
                      {c.score}
                    </span>
                    {c.isClient && (
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <div className="relative h-3 overflow-hidden rounded-full bg-surface-2">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)"
                  }} />
                  
                  <div
                    className={cn(
                      "relative h-full rounded-full transition-all duration-1000 ease-out",
                      c.isClient
                        ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 shadow-sm shadow-emerald-500/30"
                        : "bg-text/20"
                    )}
                    style={{
                      width: animated ? `${c.score}%` : "0%",
                      transitionDelay: `${i * 150}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
