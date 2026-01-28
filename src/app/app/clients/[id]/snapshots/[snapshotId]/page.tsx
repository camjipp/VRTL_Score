"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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

function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

// Score gauge with gradient ring
function HeroScoreGauge({ score }: { score: number | null }) {
  const r = 80;
  const c = 2 * Math.PI * r;
  const pctVal = score !== null ? score / 100 : 0;
  const dash = c * pctVal;
  
  const getGradient = () => {
    if (score === null) return { start: "#d1d5db", end: "#9ca3af" };
    if (score >= 80) return { start: "#10b981", end: "#059669" };
    if (score >= 50) return { start: "#f59e0b", end: "#d97706" };
    return { start: "#ef4444", end: "#dc2626" };
  };
  
  const gradient = getGradient();
  const gradientId = `score-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-48 w-48" viewBox="0 0 200 200">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient.start} />
            <stop offset="100%" stopColor={gradient.end} />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="16"
        />
        {/* Progress ring */}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 100 100)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-6xl font-bold text-text">{score ?? "—"}</span>
        <span className="text-sm font-medium text-text-3">VRTL Score</span>
      </div>
    </div>
  );
}

// Metric donut with percentage
function MetricDonut({ value, total, label, color }: { value: number; total: number; label: string; color: string }) {
  const pctVal = total > 0 ? value / total : 0;
  const r = 24;
  const c = 2 * Math.PI * r;
  const dash = c * pctVal;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className="h-16 w-16" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
          <circle
            cx="30"
            cy="30"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90 30 30)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-text">{pct(value, total)}%</span>
        </div>
      </div>
      <span className="mt-2 text-xs text-text-3">{label}</span>
      <span className="text-xs text-text-2">{value}/{total}</span>
    </div>
  );
}

// Horizontal bar for competitors
function CompetitorBar({ name, count, max, rank }: { name: string; count: number; max: number; rank: number }) {
  const w = max > 0 ? (count / max) * 100 : 0;
  const colors = ["bg-purple-500", "bg-blue-500", "bg-cyan-500", "bg-teal-500", "bg-emerald-500", "bg-amber-500"];
  const bgColors = ["bg-purple-50", "bg-blue-50", "bg-cyan-50", "bg-teal-50", "bg-emerald-50", "bg-amber-50"];

  return (
    <div className={cn("rounded-xl p-3", bgColors[rank % bgColors.length])}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-text-2">
            {rank + 1}
          </span>
          <span className="text-sm font-medium text-text">{name}</span>
        </div>
        <span className="text-sm font-bold text-text-2">{count}×</span>
      </div>
      <div className="h-2 rounded-full bg-white/50">
        <div
          className={cn("h-2 rounded-full transition-all duration-500", colors[rank % colors.length])}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

// Provider card with score
function ProviderCard({ provider, score }: { provider: string; score: number }) {
  const getColors = () => {
    if (score >= 80) return { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" };
    if (score >= 50) return { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200" };
    return { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-200" };
  };
  const colors = getColors();
  const label = score >= 80 ? "Strong" : score >= 50 ? "Moderate" : "Weak";

  return (
    <div className={cn("rounded-2xl p-5 ring-1", colors.bg, colors.ring)}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <span className="text-lg font-bold capitalize">{provider.charAt(0)}</span>
        </div>
        <div>
          <div className="text-sm font-medium capitalize text-text">{provider}</div>
          <div className={cn("text-xs font-medium", colors.text)}>{label}</div>
        </div>
      </div>
      <div className={cn("mt-4 text-4xl font-bold", colors.text)}>{score}</div>
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
    return {
      title: "Visibility gap",
      severity: "high",
      problem: `${clientName} isn't being surfaced in AI answers.`,
      why: "If you're not mentioned, you're not in the consideration set.",
      fixes: [
        "Publish comparison pages targeting competitor names",
        "Add citeable proof: case studies, benchmarks",
        "Clarify category keywords on key pages"
      ],
      competitorFocus
    };
  }

  if (weakPosition || weakStrength) {
    return {
      title: "Positioning needs work",
      severity: "medium",
      problem: `${clientName} is mentioned but not positioned as a top choice.`,
      why: "AI favors brands with clear differentiation.",
      fixes: [
        "Strengthen differentiation on homepage",
        "Build comparison tables vs competitors",
        "Add specific proof points near the top"
      ],
      competitorFocus
    };
  }

  if (lacksCitations) {
    return {
      title: "Needs citeable authority",
      severity: "medium",
      problem: "This signal lacks sources/citations.",
      why: "Models trust widely cited information.",
      fixes: [
        "Publish benchmarks with concrete stats",
        "Earn third-party citations",
        "Add structured data"
      ],
      competitorFocus
    };
  }

  if (tooGeneric) {
    return {
      title: "Too generic",
      severity: "low",
      problem: "Specific features aren't coming through.",
      why: "Generic descriptions make you interchangeable.",
      fixes: [
        "Create detailed feature pages",
        "Add use-case pages with outcomes",
        "Build internal linking hub"
      ],
      competitorFocus
    };
  }

  return {
    title: "Strong signal",
    severity: "low",
    problem: `${clientName} shows up well.`,
    why: "Keep reinforcing consistent positioning.",
    fixes: [
      "Reuse positioning language across pages",
      "Add fresh proof quarterly",
      "Maintain comparison coverage"
    ],
    competitorFocus
  };
}

function buildActionPlan(args: { clientName: string; signalsTotal: number; clientMentionedCount: number; sourcesCount: number; featuresCount: number; topCompetitors: string[] }) {
  const actions: string[] = [];
  const { clientName, signalsTotal, clientMentionedCount, sourcesCount, featuresCount, topCompetitors } = args;

  if (clientMentionedCount === 0) {
    actions.push(topCompetitors.length ? `Publish "${clientName} vs ${topCompetitors[0]}" comparison page` : "Create comparison pages targeting competitors");
  } else if (clientMentionedCount < Math.ceil(signalsTotal * 0.5)) {
    actions.push("Add category/use-case pages with consistent language");
  }

  if (sourcesCount < Math.ceil(signalsTotal * 0.3)) {
    actions.push("Publish a benchmark report + earn third-party citations");
  }

  if (featuresCount < Math.ceil(signalsTotal * 0.5)) {
    actions.push("Create feature pages with measurable outcomes");
  }

  actions.push("Sharpen positioning: clarify who it's for and what you do better");
  return actions.slice(0, 4);
}

export default function SnapshotDetailPage() {
  const params = useParams<{ id: string; snapshotId: string }>();
  const clientId = useMemo(() => (typeof params?.id === "string" ? params.id : ""), [params]);
  const snapshotId = useMemo(() => (typeof params?.snapshotId === "string" ? params.snapshotId : ""), [params]);

  const [data, setData] = useState<SnapshotApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

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
      const err = e as { message?: string };
      setError(err?.message || String(e));
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

  // Count insights by severity
  const insightCounts = data?.responses.reduce((acc, r) => {
    const card = buildInsightCard({ clientName: data.client.name, response: r, topCompetitors: topCompetitorNames });
    acc[card.severity] = (acc[card.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  return (
    <div className="space-y-8">
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
          <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
            <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
            <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          </div>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && data && (
        <div className="space-y-8">
          {/* Hero section */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
              {/* Score */}
              <HeroScoreGauge score={data.snapshot.vrtl_score} />

              {/* Info + metrics */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <Badge variant={statusVariant(data.snapshot.status)}>{data.snapshot.status}</Badge>
                  <span className="text-xs text-text-3">ID: {data.snapshot.id.slice(0, 8)}…</span>
                </div>
                <h1 className="mt-3 text-3xl font-bold text-text">{data.client.name}</h1>
                <p className="mt-1 text-sm text-text-2">
                  Completed {formatDate(data.snapshot.completed_at)}
                </p>

                {/* Metric donuts */}
                <div className="mt-6 flex items-center justify-center gap-8 lg:justify-start">
                  <MetricDonut
                    value={data.summary.client_mentioned_count}
                    total={signalsTotal}
                    label="Mention rate"
                    color="#059669"
                  />
                  <MetricDonut
                    value={data.summary.sources_count}
                    total={signalsTotal}
                    label="Citeable"
                    color="#2563eb"
                  />
                  <MetricDonut
                    value={data.summary.specific_features_count}
                    total={signalsTotal}
                    label="Specific"
                    color="#7c3aed"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <DownloadPdfButton snapshotId={data.snapshot.id} />
                {data.debug.allowed && (
                  <button
                    type="button"
                    onClick={() => { setShowDebug(!showDebug); void load(!showDebug); }}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                      showDebug ? "border-red-200 bg-red-50 text-red-600" : "border-border bg-white text-text-2 hover:bg-surface-2"
                    )}
                  >
                    {showDebug ? "Hide debug" : "Debug"}
                  </button>
                )}
              </div>
            </div>

            {data.snapshot.error && (
              <div className="mt-6">
                <Alert variant="danger">
                  <AlertDescription>Error: {data.snapshot.error}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Insight summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-red-50 p-5 ring-1 ring-red-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-700">{insightCounts.high || 0}</div>
                  <div className="text-xs text-red-600">High priority</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-700">{insightCounts.medium || 0}</div>
                  <div className="text-xs text-amber-600">Medium priority</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{insightCounts.low || 0}</div>
                  <div className="text-xs text-emerald-600">Low / strong</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action plan */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text">Action Plan</h2>
              <p className="text-sm text-text-3">Top fixes to improve AI visibility</p>
            </div>
            <div className="space-y-4">
              {actionPlan.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 rounded-xl bg-surface-2 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                    {idx + 1}
                  </div>
                  <div className="text-sm text-text">{item}</div>
                </div>
              ))}
            </div>
            {topCompetitorNames.length > 0 && (
              <div className="mt-4 text-xs text-text-3">
                Focus competitors: <span className="font-medium text-text-2">{topCompetitorNames.slice(0, 3).join(", ")}</span>
              </div>
            )}
          </div>

          {/* Two column layout for landscape + providers */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Competitive landscape */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-text">Competitive Landscape</h2>
                <p className="text-sm text-text-3">How often competitors appear in AI responses</p>
              </div>
              {data.summary.top_competitors.length > 0 ? (
                <div className="space-y-3">
                  {data.summary.top_competitors.slice(0, 6).map((c, idx) => (
                    <CompetitorBar
                      key={c.name}
                      name={c.name}
                      count={c.count}
                      max={Math.max(...data.summary.top_competitors.map((x) => x.count))}
                      rank={idx}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-text-3">No competitor mentions found</div>
              )}
            </div>

            {/* Providers */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-text">Provider Scores</h2>
                <p className="text-sm text-text-3">Performance across AI providers</p>
              </div>
              {providerEntries.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {providerEntries.map(([provider, score]) => (
                    <ProviderCard key={provider} provider={provider} score={score} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-text-3">No provider scores available</div>
              )}
            </div>
          </div>

          {/* Findings */}
          <div className="rounded-2xl border border-border bg-surface">
            <div className="border-b border-border p-6">
              <h2 className="text-xl font-bold text-text">Findings</h2>
              <p className="text-sm text-text-3">{data.responses.length} signals analyzed</p>
            </div>
            <div className="divide-y divide-border">
              {data.responses.map((r, idx) => {
                const card = buildInsightCard({ clientName: data.client.name, response: r, topCompetitors: topCompetitorNames });
                const severityStyles = {
                  high: { badge: "bg-red-100 text-red-700", icon: "bg-red-50 text-red-600" },
                  medium: { badge: "bg-amber-100 text-amber-700", icon: "bg-amber-50 text-amber-600" },
                  low: { badge: "bg-emerald-100 text-emerald-700", icon: "bg-emerald-50 text-emerald-600" }
                };
                const styles = severityStyles[card.severity];

                return (
                  <details key={r.id} className="group">
                    <summary className="flex cursor-pointer items-center justify-between p-5 hover:bg-surface-2">
                      <div className="flex items-center gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-sm font-bold text-text-3">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", styles.badge)}>
                              {card.severity === "high" ? "High" : card.severity === "medium" ? "Medium" : "Low"}
                            </span>
                            <span className="font-medium text-text">{card.title}</span>
                          </div>
                          {r.client_mentioned && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Client mentioned
                            </span>
                          )}
                        </div>
                      </div>
                      <svg className="h-5 w-5 text-text-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </summary>
                    <div className="border-t border-border bg-surface-2/50 p-5">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-text">Problem</h4>
                          <p className="mt-1 text-sm text-text-2">{card.problem}</p>
                          <h4 className="mt-3 text-sm font-medium text-text">Why it matters</h4>
                          <p className="mt-1 text-sm text-text-2">{card.why}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-text">Fixes</h4>
                          <ul className="mt-2 space-y-2">
                            {card.fixes.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-text-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {r.evidence_snippet && (
                        <div className="mt-4 rounded-xl bg-surface-2 p-4 text-sm text-text-2">
                          <strong className="text-text">Evidence:</strong> &quot;{r.evidence_snippet}&quot;
                        </div>
                      )}
                      {showDebug && (r.prompt_text || r.raw_text) && (
                        <details className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                          <summary className="cursor-pointer text-sm font-medium text-red-600">Debug details</summary>
                          {r.prompt_text && <div className="mt-2 text-xs text-text-3"><strong className="text-red-600">Prompt:</strong> {r.prompt_text}</div>}
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

          {/* Debug section */}
          {data.debug.allowed && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="text-xl font-bold text-red-700">Debug (internal)</h2>
              <p className="text-sm text-red-600/70">Enable to view prompts/raw output in findings</p>
              <button
                type="button"
                onClick={() => { setShowDebug(!showDebug); void load(!showDebug); }}
                className={cn(
                  "mt-4 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                  showDebug ? "border-red-300 bg-red-100 text-red-700" : "border-red-200 bg-white text-red-600 hover:bg-red-100"
                )}
              >
                {showDebug ? "Disable debug" : "Enable debug"}
              </button>
              <p className="mt-2 text-xs text-red-600/60">Keep off for client-facing screenshots.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
