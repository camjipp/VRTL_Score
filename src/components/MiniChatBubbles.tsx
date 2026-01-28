"use client";

import { cn } from "@/lib/cn";

const MESSAGES = [
  "Why isn't our business showing up on ChatGPT?",
  "Competitor is all over Perplexity. Why not us?",
  "Can you prove we're being recommended more?",
  "Board wants an AI search strategy.",
  "What's our visibility on Claude?",
  "Are we losing leads to AI answers?",
  "How do we rank on Gemini?",
  "Clients asking about AI search now.",
];

export function MiniChatBubbles({ className }: { className?: string }) {
  // Duplicate messages for seamless loop
  const allMessages = [...MESSAGES, ...MESSAGES];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-bg-2 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-bg-2 to-transparent" />

      {/* Marquee track */}
      <div className="flex animate-marquee gap-4">
        {allMessages.map((msg, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-2 rounded-full border border-border/50 bg-surface px-4 py-2 shadow-sm"
          >
            <span className="text-text-3">💬</span>
            <span className="whitespace-nowrap text-sm text-text-2">&quot;{msg}&quot;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
