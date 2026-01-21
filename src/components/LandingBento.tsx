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
    title: "Proof engine",
    description: "Standardized prompts across major LLMs → structured evidence → a score you can defend.",
    meta: "What agencies sell",
    size: "lg"
  },
  {
    title: "Monthly reporting cadence",
    description: "Run the same snapshot pack month-to-month and show progress without reinvention.",
    meta: "Retention leverage",
    size: "md"
  },
  {
    title: "Recommended vs competitors",
    description: "Measure whether the brand is mentioned and where it ranks against competitors.",
    meta: "Credibility",
    size: "md"
  },
  {
    title: "Evidence, not screenshots",
    description: "No manual ChatGPT screenshots. Evidence is captured and tied to each prompt.",
    meta: "Time saved",
    size: "md"
  },
  {
    title: "Premium PDF deliverable",
    description: "A one-click AI Visibility Report agencies can brand and send.",
    meta: "The product",
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


