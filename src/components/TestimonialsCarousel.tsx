"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  metric?: string;
  metricLabel?: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "We finally have a repeatable way to measure AI visibility across all our client accounts. The monthly reports practically write themselves.",
    author: "Sarah Chen",
    role: "Agency Director",
    metric: "82",
    metricLabel: "avg score",
  },
  {
    quote: "The evidence trail makes client conversations easy—no more hand-wavy conclusions about 'AI presence.' It's all documented.",
    author: "Marcus Webb",
    role: "Strategy Lead",
    metric: "+340%",
    metricLabel: "mentions",
  },
  {
    quote: "Scores and reports are consistent week to week. That predictability is the whole value for our enterprise clients.",
    author: "Elena Rodriguez",
    role: "VP Operations",
    metric: "30s",
    metricLabel: "to report",
  },
  {
    quote: "It's the first time we can benchmark AI recommendations like we benchmark SEO. Game changer for positioning.",
    author: "James Liu",
    role: "Account Director",
    metric: "Top 3",
    metricLabel: "in 60 days",
  },
];

export function TestimonialsCarousel({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = testimonials[activeIndex]!;

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main testimonial card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] p-8 md:p-12">
        {/* Decorative gradient */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-tl from-emerald-500/20 to-transparent blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr,auto] lg:items-center">
          {/* Quote section */}
          <div>
            <div className="mb-6 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-5 w-5 fill-amber-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <blockquote
              key={activeIndex}
              className="text-xl font-medium leading-relaxed text-white md:text-2xl lg:text-3xl animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              &ldquo;{active.quote}&rdquo;
            </blockquote>

            <div className="mt-8 flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 text-lg font-bold text-white">
                {active.author.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-white">{active.author}</div>
                <div className="text-sm text-white/60">{active.role}</div>
              </div>
            </div>
          </div>

          {/* Metric highlight */}
          {active.metric && (
            <div
              key={`metric-${activeIndex}`}
              className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-8 backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="text-5xl font-bold text-white md:text-6xl">
                {active.metric}
              </div>
              <div className="mt-2 text-sm text-white/60">{active.metricLabel}</div>
            </div>
          )}
        </div>

        {/* Navigation dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Mini testimonials below */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {testimonials
          .filter((_, i) => i !== activeIndex)
          .slice(0, 3)
          .map((t, i) => (
            <button
              key={t.author}
              onClick={() =>
                setActiveIndex(testimonials.findIndex((x) => x.author === t.author))
              }
              className="group rounded-2xl border border-border bg-surface p-6 text-left transition-all hover:border-text/20 hover:shadow-lg"
            >
              <p className="line-clamp-2 text-sm text-text-2 group-hover:text-text">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-text/5 text-xs font-bold">
                  {t.author.charAt(0)}
                </div>
                <div className="text-xs">
                  <div className="font-medium text-text">{t.author}</div>
                  <div className="text-text-3">{t.role}</div>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}

