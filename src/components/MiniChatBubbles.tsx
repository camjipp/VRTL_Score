"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const MESSAGES = [
  { text: "Why isn't our business showing up on ChatGPT?", urgent: true },
  { text: "Competitor is all over Perplexity. Why not us?", urgent: true },
  { text: "Can you prove we're being recommended more?", urgent: false },
  { text: "Board wants an AI search strategy.", urgent: false },
];

export function MiniChatBubbles({ className }: { className?: string }) {
  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    if (visibleCount >= MESSAGES.length) return;
    const timer = setTimeout(() => {
      setVisibleCount((c) => Math.min(c + 1, MESSAGES.length));
    }, 1500);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className={cn("relative", className)}>
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-32 w-32 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-32 w-32 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {MESSAGES.slice(0, visibleCount).map((msg, i) => (
          <div
            key={i}
            className={cn(
              "group animate-in fade-in slide-in-from-bottom-2 duration-500",
              "relative overflow-hidden rounded-2xl border bg-surface px-4 py-3 shadow-sm transition-all hover:shadow-md",
              msg.urgent ? "border-red-200 hover:border-red-300" : "border-border"
            )}
            style={{ animationDelay: `${i * 150}ms` }}
          >
            {/* Gradient border glow for urgent */}
            {msg.urgent && (
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 to-orange-500/5" />
            )}

            <div className="relative flex items-center gap-3">
              {/* Avatar/icon */}
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                msg.urgent 
                  ? "bg-gradient-to-br from-red-500 to-orange-500 text-white" 
                  : "bg-surface-2 text-text-3"
              )}>
                {msg.urgent ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Message */}
              <div>
                <p className="text-sm text-text">&quot;{msg.text}&quot;</p>
                <p className="mt-0.5 text-[10px] text-text-3">
                  {msg.urgent ? "High priority client" : "Client question"}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {visibleCount < MESSAGES.length && (
          <div className="animate-in fade-in duration-300 flex items-center gap-2 rounded-2xl border border-dashed border-border bg-surface/50 px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-text-3/50" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-text-3/50" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-text-3/50" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-text-3">More questions coming in...</span>
          </div>
        )}
      </div>
    </div>
  );
}
