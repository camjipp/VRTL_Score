"use client";

import { cn } from "@/lib/cn";

const AI_PROVIDERS = [
  { name: "ChatGPT", icon: "/ai/icons8-chatgpt.svg" },
  { name: "Claude", icon: "/ai/icons8-claude.svg" },
  { name: "Gemini", icon: "/ai/gemini.png" },
  { name: "Perplexity", icon: "/ai/perplexity.png" },
  { name: "Grok", icon: "/ai/grok.svg" },
  { name: "DeepSeek", icon: "/ai/deepseek.svg" },
];

export function TrustLogos({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden py-4", className)}>
      {/* Header text */}
      <div className="mb-4 text-center">
        <span className="text-xs font-medium uppercase tracking-widest text-text-3">
          Tracking visibility across
        </span>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-14 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-14 w-24 bg-gradient-to-l from-bg to-transparent" />

      {/* Scrolling track */}
      <div className="flex animate-marquee items-center gap-10">
        {[...AI_PROVIDERS, ...AI_PROVIDERS, ...AI_PROVIDERS, ...AI_PROVIDERS].map((provider, i) => (
          <div
            key={`${provider.name}-${i}`}
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-100"
          >
            {/* Logo */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={provider.name}
                src={provider.icon}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="whitespace-nowrap text-sm font-medium text-text-2">
              {provider.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
