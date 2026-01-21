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
    <div className="space-y-6">
      {/* Semrush-like pill selector */}
      <div className="flex flex-wrap items-center gap-2">
        {toolkits.map((t) => {
          const isActive = t.id === activeId;
          return (
            <button
              key={t.id}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                isActive
                  ? "border-border bg-accent text-white"
                  : "border-border bg-surface text-text hover:bg-surface-2"
              )}
              onClick={() => setActiveId(t.id)}
              type="button"
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Slideshow panel */}
      <Card className="p-6 shadow-none">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-text">{active.title}</div>
            <div className="mt-3 text-sm text-text-2">{active.description}</div>
            <ul className="mt-5 space-y-2 text-sm text-text-2">
              {active.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                  <span>
                    <span className="font-medium text-text">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <ButtonLink href={active.ctaHref} variant="primary">
                {active.ctaLabel}
              </ButtonLink>
            </div>
          </div>

          <div
            key={active.id}
            className="rounded-2xl border border-border bg-surface-2 p-6 transition duration-300 ease-out motion-reduce:transition-none animate-in fade-in slide-in-from-bottom-1"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-text-3">Preview</div>
            <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-text">Snapshot run</div>
                <div className="text-xs text-text-3">~2 min</div>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-2">Overall score</span>
                  <span className="font-semibold text-text">82</span>
                </div>
                <div className="h-2 w-full rounded-full bg-bg">
                  <div className="h-2 w-[70%] rounded-full bg-success/70" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-text-2">Evidence</span>
                  <span className="text-text-3">Attached</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-text-3">This is a sample panel for layout.</div>
          </div>
        </div>
      </Card>
    </div>
  );
}


