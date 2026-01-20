"use client";

import * as React from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Toolkit = {
  id: string;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
};

const toolkits: Toolkit[] = [
  {
    id: "snapshot",
    label: "Snapshot scoring",
    title: "Snapshot scoring",
    description: "Run the prompt pack and capture repeatable measurement runs.",
    bullets: ["Standardized prompts", "Structured evidence", "Comparable scoring"],
    ctaLabel: "Get insights",
    ctaHref: "/app"
  },
  {
    id: "competitive",
    label: "Competitive analysis",
    title: "Competitive analysis",
    description: "Track mentions and positioning versus a defined competitor set.",
    bullets: ["Mentions by prompt", "Positioning signals", "Top competitors"],
    ctaLabel: "Open app",
    ctaHref: "/app"
  },
  {
    id: "providers",
    label: "Provider breakdown",
    title: "Provider breakdown",
    description: "See where scores come from across models.",
    bullets: ["Per-model scoring", "Provider notes", "Evidence alongside metrics"],
    ctaLabel: "Get insights",
    ctaHref: "/app"
  },
  {
    id: "reporting",
    label: "Client reporting",
    title: "Client reporting",
    description: "Generate a polished PDF the same day.",
    bullets: ["Branded PDFs", "Confidence + evidence", "Ready for client delivery"],
    ctaLabel: "View pricing",
    ctaHref: "/pricing"
  }
];

export function LandingToolkits() {
  const [activeId, setActiveId] = React.useState(toolkits[0]?.id ?? "snapshot");
  const active = toolkits.find((t) => t.id === activeId) ?? toolkits[0]!;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-2">
        {toolkits.map((t) => {
          const isActive = t.id === activeId;
          return (
            <button
              key={t.id}
              className={cn(
                "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left text-sm transition",
                isActive ? "ring-2 ring-[rgb(var(--ring)/0.25)]" : "hover:bg-surface-2"
              )}
              onClick={() => setActiveId(t.id)}
              type="button"
            >
              <div className="font-medium text-text">{t.label}</div>
              <div className="mt-1 text-xs text-text-3">{t.description}</div>
            </button>
          );
        })}
      </div>

      <Card className="p-6 shadow-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold tracking-tight text-text">{active.title}</div>
            <div className="mt-2 text-sm text-text-2">{active.description}</div>
          </div>
          <ButtonLink href={active.ctaHref} size="sm" variant="primary">
            {active.ctaLabel}
          </ButtonLink>
        </div>

        <div
          key={active.id}
          className="mt-6 rounded-2xl border border-border bg-surface-2 p-5 transition duration-300 ease-out motion-reduce:transition-none animate-in fade-in slide-in-from-bottom-1"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-text-3">Included</div>
          <ul className="mt-3 space-y-2 text-sm text-text-2">
            {active.bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}


