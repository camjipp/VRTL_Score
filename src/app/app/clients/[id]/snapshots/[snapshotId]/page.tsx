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

function ScoreGauge({ score, size = "large" }: { score: number | null; size?: "large" | "small" }) {
  const sizeClasses = size === "large" ? "h-28 w-28" : "h-14 w-14";
  const r = size === "large" ? 48 : 24;
  const viewBox = size === "large" ? "0 0 112 112" : "0 0 56 56";
  const center = size === "large" ? 56 : 28;
  const strokeW = size === "large" ? 8 : 4;
  const fontSize = size === "large" ? "text-3xl" : "text-sm";

  if (score === null) {
    return (
      <div className={cn("relative flex items-center justify-center", sizeClasses)}>
        <svg className={sizeClasses} viewBox={viewBox}>
          <circle cx={center} cy={center} r={r} fill="none" stroke="rgb(var(--border))" strokeWidth={strokeW} />
        </svg>
        <span className={cn("absolute font-bold text-text-3", fontSize)}>—</span>
      </div>
    );
  }

  const color = score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  const pctVal = score / 100;
  const c = 2 * Math.PI * r;
  const dash = c * pctVal;

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses)}>
      <svg className={cn(sizeClasses, "-rotate-90")} viewBox={viewBox}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="rgb(var(--border))" strokeWidth={strokeW} />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <span className={cn("absolute font-bold", fontSize)} style={{ color }}>{score}</span>
    </div>
  );
}

function Donut({ value, label, sublabel, color = "#2563eb" }: { value: number; label: string; sublabel?: string; color?: string }) {
  const v = clamp01(value);
  const r = 16;
  const c = 2 * Math.PI * r;
  const dash = c * v;
  return (
    <div className="flex items-center gap-3">
      <svg aria-hidden className="h-10 w-10" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgb(var(--border))" strokeWidth="5" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 20 20)"
        />
      </svg>
      <div>
        <div className="text-sm font-semibold text-text">{label}</div>
        {sublabel && <div className="text-xs text-text-3">{sublabel}</div>}
      </div>
    </div>
  );
}

function SimpleBar({ label, value, max, colorClass }: { label: string; value: number; max: number; colorClass: string }) {
  const w = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 truncate text-xs text-text-3">{label}</div>
      <div className="flex-1">
        <div className="h-2 w-full rounded-full bg-surface-2">
          <div className={cn("h-2 rounded-full", colorClass)} style={{ width: `${Math.round(w * 100)}%` }} />
        </div>
      </div>
      <div className="w-8 text-right text-xs font-semibold text-text">{value}</div>
    </div>
  );
}

function CompetitorBars({ items }: { items: Array<{ name: string; count: number }> }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="space-y-2">
      {items.slice(0, 6).map((c) => (
        <SimpleBar key={c.name} label={c.name} value={c.count} max={max} colorClass="bg-purple-500" />
      ))}
      {items.length === 0 && <div className="text-sm text-text-3">No competitor mentions found.</div>}
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
  if (s.includes("complete") || s.includes("success")) return "success";
  if (s.includes("fail") || s.includes("error") || s.includes("cancel")) return "danger";
  if (s.includes("running") || s.includes("queued") || s.includes("pending")) return "warning";
  return "neutral";
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-text-3";
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function dedupeKeepOrder(items: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of items) {
    const key = x.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function buildInsightCard(args: { clientName: string; response: SnapshotApiResponse["responses"][number]; topCompetitors: string[] }): InsightCard {
  const { clientName, response: r, topCompetitors } = args;
  const competitorFocus = dedupeKeepOrder([...(r.competitors_mentioned ?? []), ...topCompetitors]).slice(0, 3);

  const notMentioned = !r.client_mentioned;
  const weakPosition = r.client_mentioned && (r.client_position === "middle" || r.client_position === "bottom" || r.client_position === "not_mentioned");
  const weakStrength = r.client_mentioned && (r.recommendation_strength === "weak" || r.recommendation_strength === "none" || !r.recommendation_strength);
  const lacksCitations = !r.has_sources_or_citations;
  const tooGeneric = !r.has_specific_features;

  if (notMentioned) {
    const comps = competitorFocus.length ? ` (often compared with ${competitorFocus.join(", ")})` : "";
    return {
      title: "Visibility gap",
      severity: "high",
      problem: `${clientName} isn't being surfaced in AI answers${comps}.`,
      why: "If you're not mentioned, you're not in the consideration set—competitors win mindshare by default.",
      fixes: [
        competitorFocus.length ? `Publish comparison pages: "${clientName} vs ${competitorFocus[0]}", plus "Alternatives to ${competitorFocus[0]}" page.` : "Publish comparison pages and 'Alternatives to <competitor>' pages.",
        "Add proof that models can cite: case studies, benchmarks, and third-party mentions.",
        "Clarify category + keywords: tighten the homepage H1 and use-case pages."
      ],
      competitorFocus
    };
  }

  if (weakPosition || weakStrength) {
    return {
      title: "Positioning needs work",
      severity: "medium",
      problem: `${clientName} is mentioned, but not consistently positioned as a top recommendation.`,
      why: "AI answers favor brands with clear differentiation and concrete proof.",
      fixes: [
        "Strengthen differentiation: make your unique angle explicit.",
        competitorFocus.length ? `Build "${clientName} vs ${competitorFocus[0]}" pages with comparison tables.` : "Build comparison pages with clear tables.",
        "Add specific proof points (numbers, outcomes) near the top of key pages."
      ],
      competitorFocus
    };
  }

  if (lacksCitations) {
    return {
      title: "Needs citeable authority",
      severity: "medium",
      problem: "This signal lacks sources/citations, reducing trust.",
      why: "Models repeat information that is widely cited and consistent.",
      fixes: [
        "Publish a benchmark/report with concrete stats.",
        "Earn citations: PR placements, partner pages, directory listings.",
        "Add structured data and link to authoritative references."
      ],
      competitorFocus
    };
  }

  if (tooGeneric) {
    return {
      title: "Too generic to win",
      severity: "low",
      problem: "Specific features and differentiators aren't coming through.",
      why: "Generic descriptions make you interchangeable.",
      fixes: [
        "Create feature pages with specifics: screenshots, workflows, limits.",
        "Create use-case pages with exact outcomes and examples.",
        "Add internal linking hub connecting features to use cases."
      ],
      competitorFocus
    };
  }

  return {
    title: "Strong signal",
    severity: "low",
    problem: `${clientName} shows up with solid positioning.`,
    why: "Consistency across signals compounds—keep reinforcing.",
    fixes: [
      "Double down: reuse the same positioning language across pages.",
      "Add fresh proof quarterly (new case studies, metrics).",
      competitorFocus.length ? `Maintain comparison coverage vs ${competitorFocus.join(", ")}.` : "Maintain comparison coverage."
    ],
    competitorFocus
  };
}

function buildActionPlan(args: { clientName: string; signalsTotal: number; clientMentionedCount: number; sourcesCount: number; featuresCount: number; topCompetitors: string[] }) {
  const actions: string[] = [];
  const { clientName, signalsTotal, clientMentionedCount, sourcesCount, featuresCount, topCompetitors } = args;

  if (clientMentionedCount === 0) {
    actions.push(topCompetitors.length ? `Increase visibility: publish "${clientName} vs ${topCompetitors[0]}" + "Alternatives to ${topCompetitors[0]}".` : `Increase visibility: publish comparison + alternatives pages.`);
  } else if (clientMentionedCount < Math.ceil(signalsTotal * 0.5)) {
    actions.push("Increase visibility: add category/use-case pages with consistent language.");
  }

  if (sourcesCount < Math.ceil(signalsTotal * 0.3)) {
    actions.push("Add citeable proof: publish a benchmark/report + earn third-party citations.");
  }

  if (featuresCount < Math.ceil(signalsTotal * 0.5)) {
    actions.push("Add specificity: create feature pages + use-case pages with measurable outcomes.");
  }

  actions.push("Sharpen positioning: make differentiation explicit (who it's for, what you do better).");
  return actions.slice(0, 3);
}

export default function SnapshotDetailPage() {
  const params = useParams<{ id: string; snapshotId: string }>();
  const clientId = useMemo(() => (typeof params?.id === "string" ? params.id : ""), [params]);
  const snapshotId = useMemo(() => (typeof params?.snapshotId === "string" ? params.snapshotId : ""), [params]);

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
      const res = await fetch(`/api/snapshots/detail?${qs.toString()}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as SnapshotApiResponse);
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
    if (loading || typeof window === "undefined") return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-report-section]"));
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const id = (visible[0]?.target as HTMLElement | undefined)?.id;
        if (id) setActiveSection(id);
      },
      { root: null, threshold: [0.15, 0.25, 0.4, 0.6] }
    );
    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading, data?.snapshot?.id]);

  const providers = data?.snapshot.score_by_provider ?? null;
  const providerEntries = providers ? Object.entries(providers) : [];
  const topCompetitorNames = data?.summary.top_competitors?.map((c) => c.name) ?? [];
  const signalsTotal = data?.summary.responses_count ?? 0;
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
        { id: "overview", label: "Overview", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 3 3 5-6" /></svg> },
        { id: "action-plan", label: "Action Plan", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { id: "landscape", label: "Landscape", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5M3.75 16.5h16.5" /></svg> },
        { id: "findings", label: "Findings", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg> },
        { id: "providers", label: "Providers", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v18h16.5V3H3.75zM7.5 7.5h9M7.5 12h9M7.5 16.5h9" /></svg> }
      ]
    : [];

  if (data?.debug.allowed) {
    reportSections.push({ id: "debug", label: "Debug", icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg> });
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/app" className="text-text-2 hover:text-text">Dashboard</Link>
        <span className="text-text-3">/</span>
        <Link href={`/app/clients/${clientId}`} className="text-text-2 hover:text-text">{data?.client?.name || "Client"}</Link>
        <span className="text-text-3">/</span>
        <span className="text-text">Report</span>
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-surface-2" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
            <div className="h-64 animate-pulse rounded-2xl bg-surface-2 lg:col-span-2" />
          </div>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && data && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 overflow-hidden rounded-2xl border border-border bg-surface">
              {/* Logo + client */}
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/VRTL_Solo.png" alt="VRTL" className="h-8 w-8" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-text">{data.client.name}</div>
                    <div className="text-xs text-text-3">AI Visibility Report</div>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="p-2">
                {reportSections.map((s) => {
                  const active = activeSection === s.id;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                        active ? "bg-accent/10 text-accent" : "text-text-2 hover:bg-surface-2 hover:text-text"
                      )}
                    >
                      <span className={cn(active ? "text-accent" : "text-text-3")}>{s.icon}</span>
                      <span className="font-medium">{s.label}</span>
                    </a>
                  );
                })}
              </nav>

              {/* Actions */}
              <div className="border-t border-border p-3">
                <DownloadPdfButton snapshotId={data.snapshot.id} />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="space-y-6 lg:col-span-9">
            {/* Header card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-purple-500 to-pink-500" />
              <div className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(data.snapshot.status)}>{data.snapshot.status}</Badge>
                      <span className="text-xs text-text-3">ID: {data.snapshot.id.slice(0, 8)}…</span>
                    </div>
                    <h1 className="mt-2 text-2xl font-bold text-text">{data.client.name}</h1>
                    <div className="mt-1 text-sm text-text-2">
                      Completed {formatDate(data.snapshot.completed_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DownloadPdfButton snapshotId={data.snapshot.id} />
                    {data.debug.allowed && (
                      <button
                        type="button"
                        onClick={() => { setShowDebug(!showDebug); void load(!showDebug); }}
                        className={cn(
                          "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                          showDebug ? "border-red-500/30 bg-red-500/10 text-red-600" : "border-border text-text-2 hover:bg-surface-2"
                        )}
                      >
                        {showDebug ? "Hide debug" : "Debug"}
                      </button>
                    )}
                  </div>
                </div>

                {data.snapshot.error && (
                  <div className="mt-4">
                    <Alert variant="danger">
                      <AlertDescription>Error: {data.snapshot.error}</AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </div>

            {/* Overview section */}
            <section id="overview" data-report-section className="scroll-mt-20 space-y-4">
              <h2 className="text-lg font-semibold text-text">Overview</h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Score card */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="text-sm font-medium text-text-2">VRTL Score</div>
                  <div className="mt-3 flex items-center gap-4">
                    <ScoreGauge score={data.snapshot.vrtl_score} />
                    <div>
                      <div className={cn("text-sm font-medium", getScoreColor(data.snapshot.vrtl_score))}>
                        {data.snapshot.vrtl_score !== null
                          ? data.snapshot.vrtl_score >= 80 ? "Strong" : data.snapshot.vrtl_score >= 50 ? "Moderate" : "Weak"
                          : "No data"}
                      </div>
                      <div className="mt-1 text-xs text-text-3">AI visibility</div>
                    </div>
                  </div>
                </div>

                {/* Coverage card */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="text-sm font-medium text-text-2">Coverage</div>
                  <div className="mt-3 space-y-3">
                    <Donut
                      value={signalsTotal ? data.summary.client_mentioned_count / signalsTotal : 0}
                      label={`${pct(data.summary.client_mentioned_count, signalsTotal)}% mention rate`}
                      sublabel={`${data.summary.client_mentioned_count}/${signalsTotal} signals`}
                      color="#059669"
                    />
                    <div className="flex gap-4">
                      <Donut
                        value={signalsTotal ? data.summary.sources_count / signalsTotal : 0}
                        label={`${pct(data.summary.sources_count, signalsTotal)}%`}
                        sublabel="Citeable"
                        color="#2563eb"
                      />
                      <Donut
                        value={signalsTotal ? data.summary.specific_features_count / signalsTotal : 0}
                        label={`${pct(data.summary.specific_features_count, signalsTotal)}%`}
                        sublabel="Specific"
                        color="#7c3aed"
                      />
                    </div>
                  </div>
                </div>

                {/* Providers card */}
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-text-2">Providers</div>
                    <div className="text-xs text-text-3">{providerEntries.length} total</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {providerEntries.length > 0 ? (
                      providerEntries.map(([provider, score]) => (
                        <SimpleBar
                          key={provider}
                          label={provider}
                          value={score}
                          max={100}
                          colorClass={score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}
                        />
                      ))
                    ) : (
                      <div className="text-sm text-text-3">No provider data</div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Action plan section */}
            <section id="action-plan" data-report-section className="scroll-mt-20">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="font-semibold text-text">Action Plan</h2>
                  <p className="text-xs text-text-3">Top 3 fixes to improve AI visibility</p>
                </div>
                <div className="p-5">
                  <ol className="space-y-3">
                    {actionPlan.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">
                          {idx + 1}
                        </div>
                        <div className="text-sm text-text-2">{item}</div>
                      </li>
                    ))}
                  </ol>
                  {topCompetitorNames.length > 0 && (
                    <div className="mt-4 text-xs text-text-3">
                      Focus competitors: <span className="text-text-2">{topCompetitorNames.slice(0, 3).join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Landscape section */}
            <section id="landscape" data-report-section className="scroll-mt-20">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="font-semibold text-text">Competitive Landscape</h2>
                  <p className="text-xs text-text-3">How often competitors are mentioned</p>
                </div>
                <div className="p-5">
                  <CompetitorBars items={data.summary.top_competitors} />
                </div>
              </div>
            </section>

            {/* Findings section */}
            <section id="findings" data-report-section className="scroll-mt-20">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="font-semibold text-text">Findings</h2>
                  <p className="text-xs text-text-3">{data.responses.length} signals analyzed</p>
                </div>
                <div className="divide-y divide-border">
                  {data.responses.map((r, idx) => {
                    const card = buildInsightCard({ clientName: data.client.name, response: r, topCompetitors: topCompetitorNames });
                    const severityColor = card.severity === "high" ? "text-red-600 bg-red-500/10" : card.severity === "medium" ? "text-amber-600 bg-amber-500/10" : "text-text-2 bg-surface-2";

                    return (
                      <details key={r.id} className="group">
                        <summary className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-surface-2">
                          <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-text-2">#{idx + 1}</span>
                            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", severityColor)}>
                              {card.severity === "high" ? "High" : card.severity === "medium" ? "Medium" : "Low"}
                            </span>
                            <span className="font-medium text-text">{card.title}</span>
                            {r.client_mentioned && (
                              <span className="flex items-center gap-1 text-xs text-emerald-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mentioned
                              </span>
                            )}
                          </div>
                          <svg className="h-5 w-5 text-text-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </summary>
                        <div className="border-t border-border bg-surface-2/50 px-5 py-4">
                          <p className="text-sm text-text-2">{card.problem}</p>
                          <p className="mt-2 text-xs text-text-3"><strong className="text-text-2">Why:</strong> {card.why}</p>
                          <div className="mt-3">
                            <div className="text-xs font-medium text-text-3">Recommended fixes</div>
                            <ul className="mt-2 space-y-1.5">
                              {card.fixes.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-text-2">
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {r.evidence_snippet && (
                            <div className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-text-3">
                              <strong className="text-text-2">Evidence:</strong> &quot;{r.evidence_snippet}&quot;
                            </div>
                          )}
                          {showDebug && (r.prompt_text || r.raw_text) && (
                            <details className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                              <summary className="cursor-pointer text-xs font-medium text-red-600">Debug details</summary>
                              {r.prompt_text && <div className="mt-2 text-xs text-text-3"><strong className="text-red-600/80">Prompt:</strong> {r.prompt_text}</div>}
                              {r.raw_text && <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-text-3">{r.raw_text}</pre>}
                            </details>
                          )}
                        </div>
                      </details>
                    );
                  })}
                  {data.responses.length === 0 && (
                    <div className="py-12 text-center text-sm text-text-3">No findings available.</div>
                  )}
                </div>
              </div>
            </section>

            {/* Providers section */}
            <section id="providers" data-report-section className="scroll-mt-20">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="font-semibold text-text">Provider Scores</h2>
                  <p className="text-xs text-text-3">How you score across different AI providers</p>
                </div>
                <div className="p-5">
                  {providerEntries.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {providerEntries.map(([provider, score]) => (
                        <div key={provider} className="rounded-xl border border-border bg-surface-2 p-4">
                          <div className="text-xs font-medium capitalize text-text-3">{provider}</div>
                          <div className={cn("mt-1 text-2xl font-bold", getScoreColor(score))}>{score}</div>
                          <div className="mt-1 text-xs text-text-3">
                            {score >= 80 ? "Strong" : score >= 50 ? "Moderate" : "Weak"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-text-3">No provider scores available.</div>
                  )}
                </div>
              </div>
            </section>

            {/* Debug section */}
            {data.debug.allowed && (
              <section id="debug" data-report-section className="scroll-mt-20">
                <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5">
                  <div className="border-b border-red-500/20 px-5 py-4">
                    <h2 className="font-semibold text-red-600">Debug (internal)</h2>
                    <p className="text-xs text-red-600/60">Enable to view prompts/raw output in findings</p>
                  </div>
                  <div className="p-5">
                    <button
                      type="button"
                      onClick={() => { setShowDebug(!showDebug); void load(!showDebug); }}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                        showDebug ? "border-red-500/30 bg-red-500/10 text-red-600" : "border-border bg-surface-2 text-text-2 hover:bg-surface-2/80"
                      )}
                    >
                      {showDebug ? "Disable debug" : "Enable debug"}
                    </button>
                    <p className="mt-2 text-xs text-text-3">Keep off for client-facing screenshots.</p>
                  </div>
                </div>
              </section>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
