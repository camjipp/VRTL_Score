"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

type Question = {
  label: string;
  time: string;
  text: string;
};

const defaultQuestions: Question[] = [
  {
    label: "Client",
    time: "Just now",
    text: "“Can you prove we’re getting recommended more often in AI?”"
  },
  {
    label: "Client",
    time: "8 mins ago",
    text: "“We need a monthly AI Visibility Report like we do for SEO. Can you ship it?”"
  },
  {
    label: "Client",
    time: "2 mins ago",
    text: "“Show me exactly where we show up vs competitors — with evidence.”"
  },
  {
    label: "Client",
    time: "Today",
    text: "“We’re paying a retainer. What changed month-to-month? Prove progress.”"
  }
];

export function RotatingQuestions({
  className,
  questions = defaultQuestions,
  intervalMs = 3200
}: {
  className?: string;
  questions?: Question[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (questions.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % questions.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [questions.length, intervalMs]);

  const active = questions[idx] ?? questions[0]!;

  return (
    <div className={cn("rounded-2xl border border-border bg-surface px-5 py-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-3">What clients ask</div>
        <div className="text-xs text-text-3">
          <span className="font-medium text-text-2">{active.label}</span> · {active.time}
        </div>
      </div>
      <div
        key={idx}
        className="mt-3 text-base font-medium leading-relaxed text-text transition duration-300 ease-out motion-reduce:transition-none animate-in fade-in slide-in-from-bottom-1"
      >
        {active.text}
      </div>
    </div>
  );
}


