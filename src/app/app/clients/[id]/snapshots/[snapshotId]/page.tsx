"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { DownloadPdfButton } from "@/components/DownloadPdfButton";
import { ensureOnboarded } from "@/lib/onboard";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type SnapshotApiResponse = {
  snapshot: {
    id: string;
    status: string;
    vrtl_score: number | null;
    score_by_provider: Record<string, number> | null;
    created_at: string;
    started_at?: string | null;
    completed_at: string | null;
    error: string | null;
    prompt_pack_version: string | null;
    client_id: string;
  };
  client: {
    id: string;
    name: string;
    website: string | null;
    industry: string;
  };
  competitors: Array<{ id: string; name: string; website: string | null }>;
  summary: {
    responses_count: number;
    client_mentioned_count: number;
    sources_count: number;
    specific_features_count: number;
    top_competitors: Array<{ name: string; count: number }>;
  };
  responses: Array<{
    id: string;
    prompt_ordinal: number | null;
    created_at: string;
    parse_ok: boolean;
    client_mentioned: boolean;
    client_position: string | null;
    recommendation_strength: string | null;
    competitors_mentioned: string[];
    has_sources_or_citations: boolean;
    has_specific_features: boolean;
    evidence_snippet: string | null;
    // debug fields (optional)
    prompt_text?: string | null;
    raw_text?: string | null;
  }>;
  debug: { enabled: boolean; allowed: boolean; included: boolean };
};

type InsightCard = {
  title: string;
  severity: "high" | "medium" | "low";
  problem: string;
  why: string;
  fixes: string[];
  competitorFocus: string[];
};

type ReportSection = {
  id: string;
  label: string;
  icon: ReactNode;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function Donut({
  value,
  label,
  sublabel,
  color = "#2563eb"
}: {
  value: number; // 0..1
  label: string;
  sublabel?: string;
  color?: string;
}) {
  const v = clamp01(value);
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = c * v;
  return (
    <div className="flex items-center gap-3">
      <svg aria-hidden className="h-12 w-12" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="6" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <div>
        <div className="text-sm font-semibold text-text">{label}</div>
        {sublabel ? <div className="text-xs text-text-3">{sublabel}</div> : null}
      </div>
    </div>
  );
}

function SimpleBar({
  label,
  value,
  max,
  colorClass
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}) {
  const w = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div className="grid grid-cols-12 items-center gap-3">
      <div className="col-span-3 truncate text-xs text-text-3">{label}</div>
      <div className="col-span-7">
        <div className="h-2 w-full rounded-full bg-surface-2">
          <div className={cn("h-2 rounded-full", colorClass)} style={{ width: `${Math.round(w * 100)}%` }} />
        </div>
      </div>
      <div className="col-span-2 text-right text-xs font-semibold text-text">{value}</div>
    </div>
  );
}

function CompetitorBars({ items }: { items: Array<{ name: string; count: number }> }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="space-y-2">
      {items.slice(0, 8).map((c) => (
        <SimpleBar key={c.name} label={c.name} value={c.count} max={max} colorClass="bg-accent" />
      ))}
      {items.length === 0 ? <div className="text-sm text-text-3">No competitor mentions found.</div> : null}
    </div>
  );
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleString();
}

function statusVariant(status: string | null | undefined): BadgeVariant {
  const s = String(status ?? "").toLowerCase();
  if (!s) return "neutral";
  if (s.includes("complete") || s.includes("success") || s.includes("succeed")) return "success";
  if (s.includes("fail") || s.includes("error") || s.includes("cancel")) return "danger";
  if (s.includes("running") || s.includes("queued") || s.includes("pending") || s.includes("processing"))
    return "warning";
  return "neutral";
}

function scoreVariant(score: number | null | undefined): BadgeVariant {
  if (typeof score !== "number") return "neutral";
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-text-3";
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function getScoreBg(score: number | null): string {
  if (score === null) return "bg-surface-2";
  if (score >= 80) return "bg-green-500/10";
  if (score >= 50) return "bg-amber-500/10";
  return "bg-red-500/10";
}

type CompetitorConfidence = {
  level: "low" | "medium" | "high";
  label: "Low" | "Medium" | "High";
  message: string | null;
};

function getCompetitorConfidence(count: number): CompetitorConfidence {
  if (count <= 0) {
    return {
      level: "low",
      label: "Low",
      message: "Competitive analysis disabled — add 3+ competitors for full comparison."
    };
  }
  if (count < 3) {
    return {
      level: "medium",
      label: "Medium",
      message: "Competitive analysis limited — add 1–2 more competitors for best results."
    };
  }
  return { level: "high", label: "High", message: null };
}

function dedupeKeepOrder(items: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of items) {
    const key = x.trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function buildInsightCard(args: {
  clientName: string;
  response: SnapshotApiResponse["responses"][number];
  topCompetitors: string[];
}): InsightCard {
  const { clientName, response: r } = args;
  const competitorFocus = dedupeKeepOrder([...(r.competitors_mentioned ?? []), ...(args.topCompetitors ?? [])]).slice(
    0,
    3
  );

  const notMentioned = !r.client_mentioned;
  const weakPosition =
    r.client_mentioned &&
    (r.client_position === "middle" || r.client_position === "bottom" || r.client_position === "not_mentioned");
  const weakStrength =
    r.client_mentioned &&
    (r.recommendation_strength === "weak" || r.recommendation_strength === "none" || !r.recommendation_strength);
  const lacksCitations = !r.has_sources_or_citations;
  const tooGeneric = !r.has_specific_features;

  // Choose a primary narrative: Problem -> Why -> Fixes
  if (notMentioned) {
    const comps = competitorFocus.length ? ` (often compared with ${competitorFocus.join(", ")})` : "";
    return {
      title: "Visibility gap",
      severity: "high",
      problem: `${clientName} isn’t being surfaced in AI answers${comps}.`,
      why: "If you’re not mentioned, you’re not in the consideration set—competitors win mindshare by default.",
      fixes: [
        competitorFocus.length
          ? `Publish comparison pages: “${clientName} vs ${competitorFocus[0]}”, plus an “Alternatives to ${competitorFocus[0]}” page.`
          : "Publish comparison pages and “Alternatives to <top competitor>” pages to capture high-intent queries.",
        "Add proof that models can cite: case studies, benchmarks, and third‑party mentions (press/reviews).",
        "Clarify category + keywords: tighten the homepage H1, use-case pages, and internal linking around your core category terms."
      ],
      competitorFocus
    };
  }

  if (weakPosition || weakStrength) {
    return {
      title: "Positioning needs sharpening",
      severity: "medium",
      problem: `${clientName} is mentioned, but it’s not consistently positioned as a top recommendation.`,
      why: "AI answers favor brands with clear differentiation, concrete proof, and easy-to-compare feature language.",
      fixes: [
        "Strengthen differentiation: make your unique angle explicit (who it’s for, what you do better, and why now).",
        competitorFocus.length
          ? `Build “Why ${clientName}” + “${clientName} vs ${competitorFocus[0]}” pages with a clear comparison table.`
          : "Build “Why <brand>” + “<brand> vs <competitor>” pages with a clear comparison table.",
        "Add specific proof points (numbers, outcomes, testimonials) near the top of key pages."
      ],
      competitorFocus
    };
  }

  if (lacksCitations) {
    return {
      title: "Needs citeable authority",
      severity: "medium",
      problem: "This signal lacks sources/citations, which reduces trust and repeatability.",
      why: "Models tend to repeat information that is widely cited and consistent across reputable sources.",
      fixes: [
        "Publish a benchmark/report with concrete stats and a stable URL the model can reference.",
        "Earn citations: PR placements, partner pages, directory listings, and review sites with consistent messaging.",
        "Add structured data (Organization/Product/FAQ) and link to authoritative references where relevant."
      ],
      competitorFocus
    };
  }

  if (tooGeneric) {
    return {
      title: "Too generic to win",
      severity: "low",
      problem: "The output stays high-level—specific features and differentiators aren’t coming through clearly.",
      why: "Generic descriptions make you interchangeable, so the model won’t consistently choose you over alternatives.",
      fixes: [
        "Create feature pages (1 feature per page) with specifics: screenshots, workflows, limits, and integrations.",
        "Create use-case pages with exact outcomes and examples (templates, playbooks, before/after).",
        "Add an internal linking hub: “How it works” → feature pages → use cases → comparisons."
      ],
      competitorFocus
    };
  }

  return {
    title: "Strong signal",
    severity: "low",
    problem: `${clientName} shows up with solid positioning in this signal.`,
    why: "Consistency across signals compounds—keep reinforcing the same proof points and language.",
    fixes: [
      "Double down: reuse the same positioning language across homepage, pricing, and core feature pages.",
      "Add fresh proof quarterly (new case studies, metrics, integrations) to stay current.",
      competitorFocus.length ? `Maintain comparison coverage vs ${competitorFocus.join(", ")}.` : "Maintain comparison coverage vs key competitors."
    ],
    competitorFocus
  };
}

function buildActionPlan(args: {
  clientName: string;
  signalsTotal: number;
  clientMentionedCount: number;
  sourcesCount: number;
  featuresCount: number;
  topCompetitors: string[];
}) {
  const actions: string[] = [];
  const { clientName, signalsTotal, clientMentionedCount, sourcesCount, featuresCount, topCompetitors } = args;

  if (clientMentionedCount === 0) {
    actions.push(
      topCompetitors.length
        ? `Increase visibility: publish “${clientName} vs ${topCompetitors[0]}” + “Alternatives to ${topCompetitors[0]}”.`
        : `Increase visibility: publish comparison + alternatives pages for your top competitors.`
    );
  } else if (clientMentionedCount < Math.max(1, Math.ceil(signalsTotal * 0.5))) {
    actions.push("Increase visibility: add category/use‑case pages and reinforce consistent language across the site.");
  }

  if (sourcesCount < Math.max(1, Math.ceil(signalsTotal * 0.3))) {
    actions.push("Add citeable proof: publish a benchmark/report page + earn 3–5 third‑party citations (PR, partners, reviews).");
  }

  if (featuresCount < Math.max(1, Math.ceil(signalsTotal * 0.5))) {
    actions.push("Add specificity: create feature pages + use‑case pages with screenshots, workflows, and measurable outcomes.");
  }

  // Always useful
  actions.push("Sharpen positioning: make your differentiation explicit (who it’s for, what you do better, proof).");

  return actions.slice(0, 3);
}

export default function SnapshotDetailPage() {
  const params = useParams<{ id: string; snapshotId: string }>();
  const clientId = useMemo(() => (typeof params?.id === "string" ? params.id : ""), [params]);
  const snapshotId = useMemo(
    () => (typeof params?.snapshotId === "string" ? params.snapshotId : ""),
    [params]
  );

  const [data, setData] = useState<SnapshotApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");

  async function load(nextShowDebug = showDebug) {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await ensureOnboarded();
      const qs = new URLSearchParams({ snapshotId, clientId });
      if (nextShowDebug) qs.set("debug", "1");
      const res = await fetch(`/api/snapshots/detail?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as SnapshotApiResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!clientId || !snapshotId) return;
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, snapshotId]);

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-report-section]"));
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const top = visible[0]?.target as HTMLElement | undefined;
        const id = top?.id;
        if (id) setActiveSection(id);
      },
      { root: null, threshold: [0.15, 0.25, 0.4, 0.6] }
    );

    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading, data?.snapshot?.id]);

  const competitorConfidence = getCompetitorConfidence(data?.competitors?.length ?? 0);
  const providers = data?.snapshot.score_by_provider ?? null;
  const providerEntries = providers ? Object.entries(providers) : [];
  const topCompetitorNames = data?.summary.top_competitors?.map((c) => c.name) ?? [];
  const signalsTotal = data?.summary.responses_count ?? 0;
  const scoredSignals = data?.responses?.filter((r) => r.parse_ok) ?? [];
  const actionPlan = data
    ? buildActionPlan({
        clientName: data.client.name,
        signalsTotal,
        clientMentionedCount: data.summary.client_mentioned_count,
        sourcesCount: data.summary.sources_count,
        featuresCount: data.summary.specific_features_count,
        topCompetitors: topCompetitorNames.slice(0, 3)
      })
    : [];

  const reportSections: ReportSection[] = data
    ? [
        {
          id: "overview",
          label: "Overview",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 3 3 5-6" />
            </svg>
          )
        },
        {
          id: "action-plan",
          label: "Action plan",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          id: "landscape",
          label: "Landscape",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5M3.75 16.5h16.5" />
            </svg>
          )
        },
        {
          id: "findings",
          label: "Findings",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          )
        },
        {
          id: "providers",
          label: "Providers",
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v18h16.5V3H3.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h9M7.5 12h9M7.5 16.5h9" />
            </svg>
          )
        }
      ]
    : [];

  if (data?.debug.allowed) {
    reportSections.push({
      id: "debug",
      label: "Debug",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v2.25M14.25 3v2.25M4.5 9h15M6.75 9V21h10.5V9" />
        </svg>
      )
    });
  }

  return (
    <div className="mt-2">

      {loading ? (
        <div className="mt-6 space-y-4">
          <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
            <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-surface-2" />
        </div>
      ) : null}

      {error ? (
        <div className="mt-6">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      {!loading && data ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border bg-surface-2/50 px-5 py-4">
                <div className="text-xs font-medium uppercase tracking-wide text-text-3">Report</div>
                <div className="mt-1 text-sm font-semibold text-text">{data.client.name}</div>
                <div className="mt-1 text-xs text-text-3">
                  Snapshot <span className="font-mono">{data.snapshot.id.slice(0, 8)}…</span>
                </div>
              </div>

              <nav className="p-2">
                {reportSections.map((s) => {
                  const active = activeSection === s.id;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                        active ? "bg-accent/10 text-accent" : "text-text-2 hover:bg-surface-2"
                      )}
                    >
                      <span className={cn(active ? "text-accent" : "text-text-3")}>{s.icon}</span>
                      <span className="font-medium">{s.label}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="border-t border-border p-4">
                <Link
                  href={`/app/clients/${clientId}`}
                  className="inline-flex items-center gap-2 text-sm text-text-2 hover:text-text"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to client
                </Link>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-text-2">
                <Link href="/app" className="hover:text-text">
                  Reports
                </Link>{" "}
                <span className="text-text-3">/</span>{" "}
                <Link href={`/app/clients/${clientId}`} className="hover:text-text">
                  {data.client.name}
                </Link>{" "}
                <span className="text-text-3">/</span> <span className="text-text">AI Visibility Report</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DownloadPdfButton snapshotId={data.snapshot.id} />
                {data.debug.allowed ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = !showDebug;
                      setShowDebug(next);
                      void load(next);
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                      showDebug
                        ? "border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/15"
                        : "border-border text-text-2 hover:bg-surface-2"
                    )}
                    title={
                      data.debug.enabled
                        ? "Show internal debug fields (prompts/raw model output)"
                        : "Enable VRTL_ENABLE_DEBUG_RESPONSES=1 to allow debug"
                    }
                    disabled={!data.debug.enabled}
                  >
                    {showDebug ? "Hide debug" : "Show debug"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-5">
              <section className="space-y-6 scroll-mt-24" data-report-section id="overview">
                {/* Overview */}
                <div>
                  <h2 className="text-lg font-semibold text-text">Overview</h2>
                  <p className="mt-1 text-sm text-text-2">Key metrics, confidence, and coverage.</p>
                </div>

                {/* Header */}
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="relative h-2 bg-gradient-to-r from-accent via-purple-500 to-pink-500" />
                <div className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    Snapshot
                    <span className="font-mono text-[11px] text-accent/80">{data.snapshot.id.slice(0, 8)}…</span>
                  </div>
                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-text">
                    {data.client.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-2">
                    <Badge variant={statusVariant(data.snapshot.status)}>{data.snapshot.status}</Badge>
                    <span className="text-text-3">·</span>
                    <span>
                      <span className="text-text-3">Created</span> {formatDate(data.snapshot.created_at)}
                    </span>
                    <span className="text-text-3">·</span>
                    <span>
                      <span className="text-text-3">Completed</span> {formatDate(data.snapshot.completed_at)}
                    </span>
                  </div>
                  {data.snapshot.prompt_pack_version ? (
                    <div className="mt-2 text-xs text-text-3">
                      Prompt pack: <span className="font-mono">{data.snapshot.prompt_pack_version}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <DownloadPdfButton snapshotId={data.snapshot.id} />
                  {data.debug.allowed ? (
                    <button
                      type="button"
                      onClick={() => {
                        const next = !showDebug;
                        setShowDebug(next);
                        void load(next);
                      }}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                        showDebug
                          ? "border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/15"
                          : "border-border text-text-2 hover:bg-surface-2"
                      )}
                      title={
                        data.debug.enabled
                          ? "Show internal debug fields (prompts/raw model output)"
                          : "Enable VRTL_ENABLE_DEBUG_RESPONSES=1 to allow debug"
                      }
                      disabled={!data.debug.enabled}
                    >
                      {showDebug ? "Hide debug" : "Show debug"}
                    </button>
                  ) : null}
                </div>
              </div>

              {data.snapshot.error ? (
                <div className="mt-4">
                  <Alert variant="danger">
                    <AlertDescription>Error: {data.snapshot.error}</AlertDescription>
                  </Alert>
                </div>
              ) : null}
                </div>
              </div>

          {/* Dashboard */}
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-text-2">VRTL Score</div>
                <Badge variant={scoreVariant(data.snapshot.vrtl_score)}>
                  {data.snapshot.vrtl_score == null ? "—" : data.snapshot.vrtl_score}
                </Badge>
              </div>
              <div className={cn("mt-3 text-5xl font-bold tracking-tight", getScoreColor(data.snapshot.vrtl_score))}>
                {data.snapshot.vrtl_score ?? "—"}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-text-3">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    competitorConfidence.level === "high"
                      ? "bg-green-500"
                      : competitorConfidence.level === "medium"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  )}
                />
                Confidence: {competitorConfidence.label}
              </div>
              {competitorConfidence.message ? (
                <div className="mt-2 text-xs text-text-3">{competitorConfidence.message}</div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-4">
              <div className="text-sm font-medium text-text-2">Coverage</div>
              <div className="mt-3 grid gap-3">
                <Donut
                  value={data.summary.responses_count ? data.summary.client_mentioned_count / data.summary.responses_count : 0}
                  label={`${pct(data.summary.client_mentioned_count, data.summary.responses_count)}% mention rate`}
                  sublabel={`${data.summary.client_mentioned_count} of ${data.summary.responses_count} signals`}
                  color="#22c55e"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Donut
                    value={data.summary.responses_count ? data.summary.sources_count / data.summary.responses_count : 0}
                    label={`${pct(data.summary.sources_count, data.summary.responses_count)}% citeable`}
                    sublabel="Has sources"
                    color="#2563eb"
                  />
                  <Donut
                    value={data.summary.responses_count ? data.summary.specific_features_count / data.summary.responses_count : 0}
                    label={`${pct(data.summary.specific_features_count, data.summary.responses_count)}% specific`}
                    sublabel="Has feature detail"
                    color="#a855f7"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-text-2">Provider scores</div>
                <div className="text-xs text-text-3">{providerEntries.length ? `${providerEntries.length} providers` : "—"}</div>
              </div>
              <div className="mt-3 space-y-2">
                {providerEntries.length ? (
                  providerEntries.map(([provider, score]) => (
                    <SimpleBar
                      key={provider}
                      label={provider}
                      value={score}
                      max={100}
                      colorClass={score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}
                    />
                  ))
                ) : (
                  <div className="text-sm text-text-3">—</div>
                )}
              </div>
            </div>
          </div>
              </section>

          <section className="scroll-mt-24" data-report-section id="landscape">
            {/* Top competitors */}
            <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-text">Competitive landscape</h2>
                <p className="mt-1 text-sm text-text-2">Top competitors mentioned (bar chart).</p>
              </div>
              {data.client.website ? (
                <a
                  href={data.client.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-2 hover:bg-surface-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  Visit site
                </a>
              ) : null}
            </div>

            <div className="mt-4">
              <CompetitorBars items={data.summary.top_competitors} />
            </div>
            </div>
          </section>

          <section className="scroll-mt-24" data-report-section id="action-plan">
            {/* Action plan */}
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border bg-surface-2/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-text">Action plan</h2>
              <p className="mt-1 text-sm text-text-2">Three high-impact fixes to improve visibility and recommendations.</p>
            </div>
            <div className="p-6">
              <ol className="space-y-3">
                {actionPlan.map((item, idx) => (
                  <li key={`${idx}-${item}`} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                      {idx + 1}
                    </div>
                    <div className="text-sm text-text-2">
                      <span className="text-text">{item}</span>
                    </div>
                  </li>
                ))}
              </ol>
              {topCompetitorNames.length ? (
                <div className="mt-4 text-xs text-text-3">
                  Competitors to prioritize:{" "}
                  <span className="text-text-2">{topCompetitorNames.slice(0, 3).join(", ")}</span>
                </div>
              ) : null}
            </div>
            </div>
          </section>

          <section className="scroll-mt-24" data-report-section id="findings">
            {/* Findings */}
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border bg-surface-2/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-text">Findings</h2>
              <p className="mt-1 text-sm text-text-2">Short takeaways. Expand only if you need the details.</p>
            </div>

            <div className="divide-y divide-border">
              {data.responses.map((r, idx) => {
                const card = buildInsightCard({
                  clientName: data.client.name,
                  response: r,
                  topCompetitors: topCompetitorNames
                });
                const severityPill =
                  card.severity === "high"
                    ? "bg-red-500/10 text-red-600"
                    : card.severity === "medium"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-slate-500/10 text-slate-500";

                return (
                <div key={r.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-text-2">
                      <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-text-2">#{idx + 1}</span>
                      <span className={cn("rounded-full px-2 py-1 text-xs font-medium", severityPill)}>
                        {card.severity === "high" ? "High impact" : card.severity === "medium" ? "Medium" : "Low"}
                      </span>
                      {r.client_mentioned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Mentioned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-1 text-xs font-medium text-slate-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Not mentioned
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-3">{formatDate(r.created_at)}</div>
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer select-none">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-base font-semibold text-text">{card.title}</div>
                          <div className="mt-1 text-sm text-text-2">{card.problem}</div>
                        </div>
                        <span className="text-xs font-medium text-accent underline underline-offset-4">
                          View recommendations
                        </span>
                      </div>
                    </summary>

                    <div className="mt-3 grid gap-3 lg:grid-cols-12">
                      <div className="lg:col-span-7">
                        <div className="rounded-xl bg-surface-2/60 px-4 py-3">
                          <div className="text-xs font-medium text-text-3">Recommended fixes</div>
                          <ul className="mt-2 space-y-1 text-sm text-text-2">
                            {card.fixes.slice(0, 3).map((f) => (
                              <li key={f} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2 text-sm text-text-2">
                          <span className="font-medium text-text">Why it matters:</span> {card.why}
                        </div>
                      </div>

                      <div className="lg:col-span-5">
                        <div className="rounded-xl border border-border bg-bg px-4 py-3">
                          <div className="text-xs font-medium text-text-3">Signals</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {r.client_position ? (
                              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-2">
                                Position: {r.client_position}
                              </span>
                            ) : null}
                            {r.recommendation_strength ? (
                              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-2">
                                Strength: {r.recommendation_strength}
                              </span>
                            ) : null}
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                r.has_sources_or_citations ? "bg-blue-500/10 text-blue-600" : "bg-slate-500/10 text-slate-500"
                              )}
                            >
                              {r.has_sources_or_citations ? "Citeable" : "No citations"}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                r.has_specific_features ? "bg-purple-500/10 text-purple-600" : "bg-slate-500/10 text-slate-500"
                              )}
                            >
                              {r.has_specific_features ? "Specific" : "Generic"}
                            </span>
                          </div>
                          {r.evidence_snippet ? (
                            <div className="mt-3 text-sm text-text-2">
                              <div className="text-xs font-medium text-text-3">Evidence</div>
                              <div className="mt-1">“{r.evidence_snippet}”</div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </details>

                  {(r.competitors_mentioned.length || card.competitorFocus.length) ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {dedupeKeepOrder([...(r.competitors_mentioned ?? []), ...card.competitorFocus])
                        .slice(0, 8)
                        .map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text-2"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {showDebug && (r.prompt_text || r.raw_text) ? (
                    <details className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-medium text-red-600">
                        Debug details (internal)
                      </summary>
                      {r.prompt_text ? (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-red-600/80">Prompt</div>
                          <div className="mt-1 text-xs text-text-2">{r.prompt_text}</div>
                        </div>
                      ) : null}
                      {r.raw_text ? (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-red-600/80">Raw output</div>
                          <pre className="mt-1 max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-bg p-3 text-xs text-text-2">
                            {r.raw_text}
                          </pre>
                        </div>
                      ) : null}
                    </details>
                  ) : null}
                </div>
                );
              })}

              {data.responses.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-text-2">No responses found.</div>
              ) : null}
            </div>
            </div>
          </section>

          <section className="scroll-mt-24" data-report-section id="providers">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border bg-surface-2/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-text">Providers</h2>
                <p className="mt-1 text-sm text-text-2">
                  Provider scores help you spot consistency issues (one provider can be stricter than another).
                </p>
              </div>
              <div className="p-6">
                {providerEntries.length ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {providerEntries.map(([provider, score]) => (
                      <div
                        key={provider}
                        className={cn("rounded-2xl border border-border bg-bg p-4", getScoreBg(score))}
                      >
                        <div className="text-xs font-medium text-text-3 capitalize">{provider}</div>
                        <div className={cn("mt-1 text-2xl font-bold", getScoreColor(score))}>{score}</div>
                        <div className="mt-2 text-xs text-text-3">
                          {score >= 80 ? "Strong visibility" : score >= 50 ? "Mixed visibility" : "Weak visibility"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-text-2">No provider scores available.</div>
                )}
              </div>
            </div>
          </section>

          {data.debug.allowed ? (
            <section className="scroll-mt-24" data-report-section id="debug">
              <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5">
                <div className="border-b border-red-500/20 px-6 py-4">
                  <h2 className="text-lg font-semibold text-red-600">Debug (internal)</h2>
                  <p className="mt-1 text-sm text-red-600/80">
                    Raw outputs are hidden by default. Enable debug to view prompts/raw text inside each finding.
                  </p>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !showDebug;
                        setShowDebug(next);
                        void load(next);
                      }}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                        showDebug
                          ? "border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/15"
                          : "border-border bg-white/5 text-text-2 hover:bg-white/10"
                      )}
                      disabled={!data.debug.enabled}
                      title={
                        data.debug.enabled
                          ? "Toggle internal debug fields"
                          : "Enable VRTL_ENABLE_DEBUG_RESPONSES=1 to allow debug"
                      }
                    >
                      {showDebug ? "Disable debug" : "Enable debug"}
                    </button>
                    <div className="text-xs text-text-3">Keep this off for client-facing screenshots.</div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}


