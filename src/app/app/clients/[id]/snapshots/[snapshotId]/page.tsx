"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { BackLink } from "@/components/BackLink";
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

function getScoreColor(score: number | null): string {
  if (score === null) return "#999";
  if (score >= 80) return "#059669";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

// Clean score circle
function ScoreCircle({ score, size = "large" }: { score: number | null; size?: "large" | "small" }) {
  const isLarge = size === "large";
  const r = isLarge ? 70 : 36;
  const strokeWidth = isLarge ? 10 : 6;
  const viewBox = isLarge ? 160 : 84;
  const center = viewBox / 2;
  const c = 2 * Math.PI * r;
  const pctVal = score !== null ? score / 100 : 0;
  const dash = c * pctVal;
  const color = getScoreColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg className={isLarge ? "h-40 w-40" : "h-20 w-20"} viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="#E5E5E5" strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("font-bold", isLarge ? "text-5xl" : "text-xl")} style={{ color }}>
          {score ?? "—"}
        </span>
        {isLarge && <span className="text-xs text-[#999]">VRTL Score</span>}
      </div>
    </div>
  );
}

// Metric stat card
function MetricCard({ value, total, label, icon }: { value: number; total: number; label: string; icon: React.ReactNode }) {
  const percentage = pct(value, total);
  
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#666]">
          {icon}
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#0A0A0A]">{percentage}%</span>
            <span className="text-xs text-[#999]">{value}/{total}</span>
          </div>
          <div className="text-xs text-[#666]">{label}</div>
        </div>
      </div>
    </div>
  );
}

// Provider score bar
function ProviderRow({ provider, score }: { provider: string; score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  const label = score >= 80 ? "Strong" : score >= 50 ? "Moderate" : "Weak";
  const labelColor = score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A0A0A] text-xs font-bold text-white">
        {provider.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium capitalize text-[#0A0A0A]">{provider}</span>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium", labelColor)}>{label}</span>
            <span className="text-sm font-bold text-[#0A0A0A]">{score}</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-[#E5E5E5]">
          <div className={cn("h-2 rounded-full transition-all duration-500", color)} style={{ width: `${score}%` }} />
        </div>
      </div>
    </div>
  );
}

// Competitor bar
function CompetitorRow({ name, count, max, rank }: { name: string; count: number; max: number; rank: number }) {
  const w = max > 0 ? (count / max) * 100 : 0;

  return (
    <div className="flex items-center gap-4 py-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
        {rank + 1}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-[#0A0A0A]">{name}</span>
          <span className="text-xs text-[#666]">{count} mentions</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#E5E5E5]">
          <div className="h-1.5 rounded-full bg-[#0A0A0A] transition-all duration-500" style={{ width: `${w}%` }} />
        </div>
      </div>
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
      fixes: ["Publish comparison pages targeting competitor names", "Add citeable proof: case studies, benchmarks", "Clarify category keywords on key pages"],
      competitorFocus
    };
  }

  if (weakPosition || weakStrength) {
    return {
      title: "Positioning needs work",
      severity: "medium",
      problem: `${clientName} is mentioned but not positioned as a top choice.`,
      why: "AI favors brands with clear differentiation.",
      fixes: ["Strengthen differentiation on homepage", "Build comparison tables vs competitors", "Add specific proof points near the top"],
      competitorFocus
    };
  }

  if (lacksCitations) {
    return {
      title: "Needs citeable authority",
      severity: "medium",
      problem: "This signal lacks sources/citations.",
      why: "Models trust widely cited information.",
      fixes: ["Publish benchmarks with concrete stats", "Earn third-party citations", "Add structured data"],
      competitorFocus
    };
  }

  if (tooGeneric) {
    return {
      title: "Too generic",
      severity: "low",
      problem: "Specific features aren't coming through.",
      why: "Generic descriptions make you interchangeable.",
      fixes: ["Create detailed feature pages", "Add use-case pages with outcomes", "Build internal linking hub"],
      competitorFocus
    };
  }

  return {
    title: "Strong signal",
    severity: "low",
    problem: `${clientName} shows up well.`,
    why: "Keep reinforcing consistent positioning.",
    fixes: ["Reuse positioning language across pages", "Add fresh proof quarterly", "Maintain comparison coverage"],
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
    actions.push("Publish a benchmark report and earn third-party citations");
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
    <div className="space-y-6 p-6">
      <BackLink href={clientId ? `/app/clients/${clientId}` : "/app"} label={clientId ? "Back to Client" : "Back to Dashboard"} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/app" className="text-text-2 transition-colors hover:text-text">Clients</Link>
        <svg className="h-3.5 w-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <Link href={`/app/clients/${clientId}`} className="text-text-2 transition-colors hover:text-text">{data?.client?.name || "Client"}</Link>
        <svg className="h-3.5 w-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="font-medium text-text">Report</span>
      </nav>

      {loading && (
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-xl bg-[#F5F5F5]" />
          <div className="grid gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-[#F5F5F5]" />)}
          </div>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && data && (
        <>
          {/* Header card */}
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <ScoreCircle score={data.snapshot.vrtl_score} />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(data.snapshot.status)}>{data.snapshot.status}</Badge>
                  </div>
                  <h1 className="mt-2 text-2xl font-bold text-[#0A0A0A]">{data.client.name}</h1>
                  <p className="text-sm text-[#666]">
                    {formatDate(data.snapshot.completed_at)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <DownloadPdfButton snapshotId={data.snapshot.id} />
                {data.debug.allowed && (
                  <button
                    type="button"
                    onClick={() => { setShowDebug(!showDebug); void load(!showDebug); }}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      showDebug ? "border-red-200 bg-red-50 text-red-600" : "border-[#E5E5E5] bg-white text-[#666] hover:bg-[#F5F5F5]"
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

          {/* Key metrics */}
          <div className="grid gap-4 sm:grid-cols-4">
            <MetricCard
              value={data.summary.client_mentioned_count}
              total={signalsTotal}
              label="Mention rate"
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
            />
            <MetricCard
              value={data.summary.sources_count}
              total={signalsTotal}
              label="Citeable"
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>}
            />
            <MetricCard
              value={data.summary.specific_features_count}
              total={signalsTotal}
              label="Feature specific"
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>}
            />
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#666]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0A0A0A]">{signalsTotal}</div>
                  <div className="text-xs text-[#666]">Signals analyzed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority breakdown */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-700">{insightCounts.high || 0}</div>
                  <div className="text-xs text-red-600">High priority issues</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-700">{insightCounts.medium || 0}</div>
                  <div className="text-xs text-amber-600">Medium priority</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{insightCounts.low || 0}</div>
                  <div className="text-xs text-emerald-600">Strong signals</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action plan */}
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
            <h2 className="text-lg font-bold text-[#0A0A0A]">Recommended Actions</h2>
            <p className="text-sm text-[#666]">Top fixes to improve AI visibility</p>
            <div className="mt-4 space-y-3">
              {actionPlan.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] p-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-[#0A0A0A]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Two column: Providers + Competitors */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Providers */}
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
              <h2 className="text-lg font-bold text-[#0A0A0A]">Provider Scores</h2>
              <p className="text-sm text-[#666]">Performance across AI models</p>
              {providerEntries.length > 0 ? (
                <div className="mt-4 divide-y divide-[#E5E5E5]">
                  {providerEntries.map(([provider, score]) => (
                    <ProviderRow key={provider} provider={provider} score={score} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 py-8 text-center text-sm text-[#999]">No provider scores available</div>
              )}
            </div>

            {/* Competitors */}
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
              <h2 className="text-lg font-bold text-[#0A0A0A]">Competitor Mentions</h2>
              <p className="text-sm text-[#666]">Who appears in AI responses</p>
              {data.summary.top_competitors.length > 0 ? (
                <div className="mt-4 divide-y divide-[#E5E5E5]">
                  {data.summary.top_competitors.slice(0, 5).map((c, idx) => (
                    <CompetitorRow
                      key={c.name}
                      name={c.name}
                      count={c.count}
                      max={Math.max(...data.summary.top_competitors.map((x) => x.count))}
                      rank={idx}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-4 py-8 text-center text-sm text-[#999]">No competitor mentions found</div>
              )}
            </div>
          </div>

          {/* Findings */}
          <div className="rounded-xl border border-[#E5E5E5] bg-white">
            <div className="border-b border-[#E5E5E5] p-6">
              <h2 className="text-lg font-bold text-[#0A0A0A]">Detailed Findings</h2>
              <p className="text-sm text-[#666]">{data.responses.length} signals analyzed</p>
            </div>
            <div className="divide-y divide-[#E5E5E5]">
              {data.responses.map((r, idx) => {
                const card = buildInsightCard({ clientName: data.client.name, response: r, topCompetitors: topCompetitorNames });
                const severityStyles = {
                  high: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
                  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
                  low: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
                };
                const styles = severityStyles[card.severity];

                return (
                  <details key={r.id} className="group">
                    <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-[#FAFAF8]">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F5F5] text-xs font-bold text-[#666]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded-lg px-2 py-0.5 text-xs font-medium", styles.bg, styles.text, styles.border, "border")}>
                              {card.severity === "high" ? "High" : card.severity === "medium" ? "Medium" : "Strong"}
                            </span>
                            <span className="text-sm font-medium text-[#0A0A0A]">{card.title}</span>
                          </div>
                          {r.client_mentioned && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mentioned
                            </span>
                          )}
                        </div>
                      </div>
                      <svg className="h-5 w-5 text-[#999] transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </summary>
                    <div className="border-t border-[#E5E5E5] bg-[#FAFAF8] p-4">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-[#0A0A0A]">Problem</h4>
                          <p className="mt-1 text-sm text-[#666]">{card.problem}</p>
                          <h4 className="mt-3 text-sm font-medium text-[#0A0A0A]">Why it matters</h4>
                          <p className="mt-1 text-sm text-[#666]">{card.why}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[#0A0A0A]">Recommended fixes</h4>
                          <ul className="mt-2 space-y-2">
                            {card.fixes.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-[#666]">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0A0A0A]" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {r.evidence_snippet && (
                        <div className="mt-4 rounded-lg border border-[#E5E5E5] bg-white p-3 text-sm text-[#666]">
                          <strong className="text-[#0A0A0A]">Evidence:</strong> &quot;{r.evidence_snippet}&quot;
                        </div>
                      )}
                      {showDebug && (r.prompt_text || r.raw_text) && (
                        <details className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                          <summary className="cursor-pointer text-sm font-medium text-red-600">Debug details</summary>
                          {r.prompt_text && <div className="mt-2 text-xs text-[#666]"><strong className="text-red-600">Prompt:</strong> {r.prompt_text}</div>}
                          {r.raw_text && <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-[#666]">{r.raw_text}</pre>}
                        </details>
                      )}
                    </div>
                  </details>
                );
              })}
              {data.responses.length === 0 && (
                <div className="py-12 text-center text-sm text-[#999]">No findings available.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
