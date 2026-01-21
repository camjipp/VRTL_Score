"use client";

import * as React from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type BentoItem = {
  title: string;
  description: string;
  meta?: string;
  size?: "sm" | "md" | "lg";
};

const items: BentoItem[] = [
  {
    title: "Snapshot scoring",
    description: "Standardized prompts that produce comparable runs.",
    meta: "Repeatable measurement",
    size: "lg"
  },
  {
    title: "Provider breakdown",
    description: "See how the score changes across models and providers.",
    meta: "ChatGPT · Gemini · Claude",
    size: "md"
  },
  {
    title: "Competitive context",
    description: "Mentions and positioning versus your competitor set.",
    meta: "Mentions + positioning",
    size: "md"
  },
  {
    title: "Evidence by prompt",
    description: "Structured fields + raw excerpts tied to the score.",
    meta: "Defensible deliverables",
    size: "md"
  },
  {
    title: "Client-ready report",
    description: "A PDF clients can scan in minutes.",
    meta: "Executive summary → evidence",
    size: "md"
  }
];

function sizeClass(size: BentoItem["size"]) {
  if (size === "lg") return "md:col-span-2 md:row-span-2";
  return "";
}

export function LandingBento({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3 md:auto-rows-[170px]", className)}>
      {items.map((it) => (
        <Card key={it.title} className={cn("p-6 shadow-none", sizeClass(it.size))}>
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-3">{it.meta}</div>
              <div className="mt-3 text-lg font-semibold tracking-tight text-text">{it.title}</div>
              <div className="mt-2 text-sm text-text-2">{it.description}</div>
            </div>

            <div className="mt-6">
              <div className="h-1 w-10 rounded-full bg-text/10" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


