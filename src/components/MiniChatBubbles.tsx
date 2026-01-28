"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const MESSAGES = [
  "Why isn't our business showing up on ChatGPT?",
  "Our competitor is all over Perplexity. Why not us?",
  "Can you prove we're being recommended more?",
  "The board wants an AI search strategy. Help.",
];

export function MiniChatBubbles({ className }: { className?: string }) {
  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    if (visibleCount >= MESSAGES.length) return;
    const timer = setTimeout(() => {
      setVisibleCount((c) => Math.min(c + 1, MESSAGES.length));
    }, 2000);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className={cn("flex flex-wrap justify-center gap-3", className)}>
      {MESSAGES.slice(0, visibleCount).map((msg, i) => (
        <div
          key={i}
          className="animate-in fade-in slide-in-from-bottom-1 duration-300 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-sm"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10 text-[10px] text-red-500">!</span>
          <span className="text-sm text-text-2">{msg}</span>
        </div>
      ))}
    </div>
  );
}

