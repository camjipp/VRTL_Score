"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const MESSAGES = [
  {
    text: "Why does our competitor show up on ChatGPT and we don't?",
    time: "Just now",
    priority: "high",
  },
  {
    text: "I asked Perplexity for recommendations and it didn't mention us.",
    time: "2 min ago",
    priority: "high",
  },
  {
    text: "Our board is asking about our AI search strategy. What do we tell them?",
    time: "5 min ago",
    priority: "medium",
  },
  {
    text: "Can you prove we're being recommended more than last month?",
    time: "10 min ago",
    priority: "medium",
  },
];

export function ClientChatBubbles({ className }: { className?: string }) {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    if (visibleCount >= MESSAGES.length) return;
    const timer = setTimeout(() => {
      setVisibleCount((c) => Math.min(c + 1, MESSAGES.length));
    }, 1500);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className={cn("space-y-3", className)}>
      {MESSAGES.slice(0, visibleCount).map((msg, i) => (
        <div
          key={i}
          className={cn(
            "animate-in slide-in-from-bottom-2 fade-in duration-300",
            i % 2 === 0 ? "mr-8 md:mr-16" : "ml-8 md:ml-16"
          )}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-xs font-bold text-white">
              {msg.priority === "high" ? "!" : "?"}
            </div>

            {/* Message bubble */}
            <div className="flex-1">
              <div className="rounded-2xl rounded-tl-sm border border-border bg-surface p-4 shadow-sm">
                <p className="text-sm text-text md:text-base">{msg.text}</p>
              </div>
              <div className="mt-1.5 flex items-center gap-2 px-1">
                <span className="text-xs text-text-3">{msg.time}</span>
                {msg.priority === "high" && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600">
                    Urgent
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {visibleCount < MESSAGES.length && (
        <div className="ml-8 md:ml-16 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-3" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-3" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-3" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
            <span className="text-xs text-text-3">Client is typing...</span>
          </div>
        </div>
      )}
    </div>
  );
}

