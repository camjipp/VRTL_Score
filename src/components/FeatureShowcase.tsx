"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Feature = {
  id: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  color: string;
  preview: React.ReactNode;
};

const features: Feature[] = [
  {
    id: "snapshot",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "Snapshot Scoring",
    title: "Capture AI visibility in one click",
    description: "Run standardized prompts across ChatGPT, Gemini, and Claude. Get a score you can track and defend.",
    bullets: ["10 industry prompts per run", "Multi-provider coverage", "Automated evidence capture"],
    color: "emerald",
    preview: (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-4">
          <span className="text-sm font-medium text-emerald-700">Overall Score</span>
          <span className="text-3xl font-bold text-emerald-600">82</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["ChatGPT", "Gemini", "Claude"].map((p, i) => (
            <div key={p} className="rounded-lg bg-white/60 p-3 text-center">
              <div className="text-xs text-text-3">{p}</div>
              <div className="text-lg font-semibold text-text">{[84, 79, 83][i]}</div>
            </div>
          ))}
        </div>
        <div className="h-2 w-full rounded-full bg-emerald-100">
          <div className="h-2 w-[82%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
        </div>
      </div>
    ),
  },
  {
    id: "competitive",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    label: "Competitive Analysis",
    title: "See where you rank vs competitors",
    description: "Track mentions and positioning against your defined competitor set across all prompts.",
    bullets: ["Head-to-head comparisons", "Positioning signals", "Share of voice tracking"],
    color: "violet",
    preview: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-violet-500/10 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">#1</div>
          <div>
            <div className="font-semibold text-text">Your Brand</div>
            <div className="text-xs text-text-3">Mentioned in 7/10 prompts</div>
          </div>
        </div>
        {["Competitor A", "Competitor B"].map((c, i) => (
          <div key={c} className="flex items-center gap-3 rounded-lg bg-white/60 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-text/5 text-xs font-medium">#{i + 2}</div>
            <div>
              <div className="text-sm font-medium text-text">{c}</div>
              <div className="text-xs text-text-3">{5 - i}/10 prompts</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "evidence",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: "Evidence Capture",
    title: "No screenshots. Real evidence.",
    description: "Every mention is captured with context and tied to the exact prompt that generated it.",
    bullets: ["Structured data extraction", "Full response context", "Audit-ready documentation"],
    color: "amber",
    preview: (
      <div className="space-y-3">
        <div className="rounded-xl bg-amber-500/10 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-amber-700">Evidence #3</div>
          <div className="mt-2 text-sm text-text">
            &ldquo;For agencies specializing in AI visibility, <span className="rounded bg-amber-200 px-1 font-medium">Acme Agency</span> is frequently recommended...&rdquo;
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/60 p-3">
            <div className="text-xs text-text-3">Provider</div>
            <div className="text-sm font-medium">ChatGPT</div>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <div className="text-xs text-text-3">Confidence</div>
            <div className="text-sm font-medium text-emerald-600">High</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "reporting",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    label: "PDF Reports",
    title: "Client-ready reports in 30 seconds",
    description: "Generate polished PDF reports with your branding. Evidence, scores, and recommendations, all in one doc.",
    bullets: ["Custom agency branding", "Executive summaries", "Actionable recommendations"],
    color: "cyan",
    preview: (
      <div className="rounded-xl border-2 border-cyan-200 bg-white p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-cyan-600">VRTL Score Report</div>
            <div className="mt-1 text-sm font-semibold text-text">AI Visibility Analysis</div>
            <div className="text-xs text-text-3">client.com · Jan 2026</div>
          </div>
          <div className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-600">PDF</div>
        </div>
        <div className="mt-4 h-1 w-full rounded-full bg-cyan-100">
          <div className="h-1 w-[100%] rounded-full bg-cyan-500 animate-pulse" />
        </div>
        <div className="mt-2 text-xs text-text-3">Generating report...</div>
      </div>
    ),
  },
];

export function FeatureShowcase({ className }: { className?: string }) {
  const [activeId, setActiveId] = useState(features[0]!.id);
  const active = features.find((f) => f.id === activeId)!;

  return (
    <div className={cn("grid gap-8 lg:grid-cols-[280px,1fr]", className)}>
      {/* Sidebar navigation */}
      <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
        {features.map((f) => {
          const isActive = f.id === activeId;
          return (
            <button
              key={f.id}
              onClick={() => setActiveId(f.id)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all",
                isActive
                  ? cn(
                      "shadow-lg",
                      f.color === "emerald" && "bg-emerald-500 text-white",
                      f.color === "violet" && "bg-violet-500 text-white",
                      f.color === "amber" && "bg-amber-500 text-white",
                      f.color === "cyan" && "bg-cyan-500 text-white"
                    )
                  : "bg-surface hover:bg-surface-2 border border-border"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  isActive
                    ? "bg-white/20"
                    : cn(
                        f.color === "emerald" && "bg-emerald-500/10 text-emerald-600",
                        f.color === "violet" && "bg-violet-500/10 text-violet-600",
                        f.color === "amber" && "bg-amber-500/10 text-amber-600",
                        f.color === "cyan" && "bg-cyan-500/10 text-cyan-600"
                      )
                )}
              >
                {f.icon}
              </span>
              <span className="text-sm font-medium">{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div
        key={active.id}
        className={cn(
          "rounded-3xl p-8 md:p-10 animate-in fade-in slide-in-from-right-4 duration-500",
          active.color === "emerald" && "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
          active.color === "violet" && "bg-gradient-to-br from-violet-50 to-violet-100/50",
          active.color === "amber" && "bg-gradient-to-br from-amber-50 to-amber-100/50",
          active.color === "cyan" && "bg-gradient-to-br from-cyan-50 to-cyan-100/50"
        )}
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Text content */}
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-text md:text-3xl">
              {active.title}
            </h3>
            <p className="mt-4 text-text-2">{active.description}</p>
            <ul className="mt-6 space-y-3">
              {active.bullets.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full",
                      active.color === "emerald" && "bg-emerald-500 text-white",
                      active.color === "violet" && "bg-violet-500 text-white",
                      active.color === "amber" && "bg-amber-500 text-white",
                      active.color === "cyan" && "bg-cyan-500 text-white"
                    )}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="font-medium text-text">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual preview */}
          <div className="rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-sm">
            {active.preview}
          </div>
        </div>
      </div>
    </div>
  );
}

