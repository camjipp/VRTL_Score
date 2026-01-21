"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Stat = {
  value: string;
  suffix?: string;
  label: string;
  sublabel?: string;
};

const stats: Stat[] = [
  { value: "10", suffix: "K+", label: "prompts run", sublabel: "monthly" },
  { value: "3", suffix: "+", label: "LLM providers", sublabel: "ChatGPT, Gemini, Claude" },
  { value: "30", suffix: "s", label: "avg report time", sublabel: "one-click PDF" },
  { value: "100", suffix: "%", label: "evidence captured", sublabel: "no screenshots" },
];

function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, start]);

  return count;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const numericValue = parseInt(stat.value, 10);
  const count = useCountUp(numericValue, 1200 + index * 200, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-gradient-to-br p-8 transition-all duration-500",
        "hover:scale-[1.02] hover:shadow-2xl",
        index === 0 && "from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20",
        index === 1 && "from-violet-500/10 via-violet-500/5 to-transparent border border-violet-500/20",
        index === 2 && "from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20",
        index === 3 && "from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Decorative orb */}
      <div
        className={cn(
          "absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50",
          index === 0 && "bg-emerald-500",
          index === 1 && "bg-violet-500",
          index === 2 && "bg-amber-500",
          index === 3 && "bg-cyan-500"
        )}
      />

      <div className="relative">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "text-5xl font-bold tracking-tight tabular-nums md:text-6xl",
              index === 0 && "text-emerald-600",
              index === 1 && "text-violet-600",
              index === 2 && "text-amber-600",
              index === 3 && "text-cyan-600"
            )}
          >
            {count}
          </span>
          {stat.suffix && (
            <span
              className={cn(
                "text-2xl font-semibold md:text-3xl",
                index === 0 && "text-emerald-600/70",
                index === 1 && "text-violet-600/70",
                index === 2 && "text-amber-600/70",
                index === 3 && "text-cyan-600/70"
              )}
            >
              {stat.suffix}
            </span>
          )}
        </div>
        <div className="mt-3 text-lg font-semibold text-text">{stat.label}</div>
        {stat.sublabel && (
          <div className="mt-1 text-sm text-text-3">{stat.sublabel}</div>
        )}
      </div>
    </div>
  );
}

export function BigStats({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}

