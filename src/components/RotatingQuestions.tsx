"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Question = {
  text: string;
  author: string;
  role: string;
};

const defaultQuestions: Question[] = [
  {
    text: "Can you prove we're getting recommended more often in AI?",
    author: "Marketing Director",
    role: "Enterprise Client",
  },
  {
    text: "We need a monthly AI Visibility Report like we do for SEO.",
    author: "VP of Growth",
    role: "Series B Startup",
  },
  {
    text: "Show me exactly where we show up vs competitors. With evidence.",
    author: "CMO",
    role: "E-commerce Brand",
  },
  {
    text: "We're paying a retainer. Prove month-to-month progress.",
    author: "CEO",
    role: "Agency Client",
  },
];

export function RotatingQuestions({
  className,
  questions = defaultQuestions,
  intervalMs = 4000,
}: {
  className?: string;
  questions?: Question[];
  intervalMs?: number;
}) {
  const [activeIdx, setActiveIdx] = React.useState(0);

  React.useEffect(() => {
    if (questions.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % questions.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [questions.length, intervalMs]);

  const active = questions[activeIdx]!;

  return (
    <div className={cn("relative", className)}>
      {/* Main question card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-8 md:p-10">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

        {/* Quote icon */}
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
          <svg className="h-6 w-6 text-white/60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        {/* Question text */}
        <div
          key={activeIdx}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <p className="text-xl font-medium leading-relaxed text-white md:text-2xl lg:text-3xl">
            &ldquo;{active.text}&rdquo;
          </p>

          <div className="mt-6 flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 text-sm font-bold text-white">
              {active.author.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{active.author}</div>
              <div className="text-sm text-white/50">{active.role}</div>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="mt-8 flex items-center gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIdx
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floating mini cards showing other questions */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {questions
          .filter((_, i) => i !== activeIdx)
          .slice(0, 3)
          .map((q) => (
            <button
              key={q.text}
              onClick={() => setActiveIdx(questions.findIndex((x) => x.text === q.text))}
              className="group rounded-xl border border-border bg-surface p-4 text-left transition-all hover:border-text/20 hover:shadow-md"
            >
              <p className="line-clamp-2 text-sm text-text-2 group-hover:text-text">
                &ldquo;{q.text}&rdquo;
              </p>
              <div className="mt-3 text-xs text-text-3">{q.author}</div>
            </button>
          ))}
      </div>
    </div>
  );
}
