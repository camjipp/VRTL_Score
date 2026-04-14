"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { TopBar } from "@/components/TopBar";
import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";
type ModelFamily = "chatgpt" | "gemini" | "claude";
type ProviderFamilyScores = Partial<Record<ModelFamily, number>>;

type ClientWithStats = {
  id: string;
  name: string;
  website: string | null;
  industry: string;
  created_at: string;
  // Snapshot stats
  latestScore: number | null;
  previousScore: number | null;
  lastSnapshotAt: string | null;
  snapshotCount: number;
  recentScores: number[]; // Last 5 scores for sparkline
  status: "running" | "complete" | "none";
  // Detailed stats
  mentionRate: number | null;
  topPositionRate: number | null;
  citationRate: number | null;
  competitorRank: number | null;
  competitorCount: number;
  primaryDisplacer: string | null;
  authorityGap: number | null;
  bestModel: string | null;
  worstModel: string | null;
  providerFamilyScores: ProviderFamilyScores | null;
  hasAlert: boolean;
};

type PortfolioStats = {
  totalClients: number;
  avgScore: number;
  avgScoreDelta: number | null;
  snapshotsThisMonth: number;
  clientsWithAlerts: number;
  strongClients: number;
  moderateClients: number;
  weakClients: number;
  improvingClients: number;
  decliningClients: number;
};

type SnapshotDetailResponse = {
  summary: {
    responses_count: number;
    client_mentioned_count: number;
    sources_count: number;
    top_competitors: Array<{ name: string; count: number }>;
  };
  responses: Array<{
    client_mentioned: boolean;
    client_position: string | null;
  }>;
};

function displayUrl(url: string | null): string {
  if (!url) return "";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0].split("?")[0].slice(0, 30) || "";
  }
}

function displayModelName(name: string | null): string {
  if (!name) return "";
  const p = name.toLowerCase();
  if (p.includes("openai") || p.includes("chatgpt")) return "ChatGPT";
  if (p.includes("gemini") || p.includes("google")) return "Gemini";
  if (p.includes("anthropic") || p.includes("claude")) return "Claude";
  return name;
}

function modelFamilyFromProviderKey(model: string | null): ModelFamily | null {
  if (!model) return null;
  const p = model.toLowerCase();
  if (p.includes("openai") || p.includes("chatgpt")) return "chatgpt";
  if (p.includes("gemini") || p.includes("google")) return "gemini";
  if (p.includes("anthropic") || p.includes("claude")) return "claude";
  return null;
}

function modelFamilyLabel(family: ModelFamily): string {
  if (family === "chatgpt") return "ChatGPT";
  if (family === "gemini") return "Gemini";
  return "Claude";
}

type AuthorityState = "Dominant" | "Stable" | "Watchlist" | "Losing Ground";

function getAuthorityState(client: ClientWithStats): AuthorityState {
  if (client.latestScore === null) return "Watchlist";
  const delta = client.previousScore !== null ? client.latestScore - client.previousScore : 0;
  if (client.hasAlert || delta <= -5 || client.latestScore < 40) return "Losing Ground";
  if (client.latestScore >= 80) return "Dominant";
  if (client.latestScore >= 60) return "Stable";
  return "Watchlist";
}

function getAuthorityStateFromScore(score: number | null): AuthorityState {
  if (score === null) return "Watchlist";
  if (score >= 80) return "Dominant";
  if (score >= 60) return "Stable";
  if (score >= 40) return "Watchlist";
  return "Losing Ground";
}

/** Thin left accent for Risk Map cells — low contrast, score carries hierarchy */
function getAuthorityStateBar(state: AuthorityState): string {
  if (state === "Dominant") return "border-l-2 border-l-white/35 pl-1.5";
  if (state === "Stable") return "border-l-2 border-l-authority-stable/40 pl-1.5";
  if (state === "Watchlist") return "border-l-2 border-l-authority-watchlist/40 pl-1.5";
  return "border-l-2 border-l-authority-losing/40 pl-1.5";
}

type TriageBucket = "losing" | "watchlist" | "stable" | "dominant";

function triageBucket(c: ClientWithStats): TriageBucket {
  const s = getAuthorityState(c);
  if (s === "Losing Ground") return "losing";
  if (s === "Watchlist") return "watchlist";
  if (s === "Stable") return "stable";
  return "dominant";
}

function triageOrder(c: ClientWithStats): number {
  const b = triageBucket(c);
  if (b === "losing") return 0;
  if (b === "watchlist") return 1;
  if (b === "stable") return 2;
  return 3;
}

function StatusPill({ state }: { state: AuthorityState }) {
  const dotClass =
    state === "Dominant" ? "bg-white/70" :
    state === "Stable" ? "bg-authority-stable/90" :
    state === "Watchlist" ? "bg-authority-watchlist/90" : "bg-authority-losing/90";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium text-text-2")}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} aria-hidden />
      {state}
    </span>
  );
}

function ModelPill({ model }: { model: string | null }) {
  if (!model) return <span className="text-xs text-text-3">—</span>;
  return (
    <span className="inline-flex items-center rounded-app border border-white/20 bg-[#0B0F14] px-2 py-0.5 text-xs font-medium text-white/75">
      <ModelDot model={model} />
      {displayModelName(model)}
    </span>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-text-3">—</span>;
  if (value === 0) return <span className="tabular-nums text-text-2">0</span>;
  return (
    <span className={cn("tabular-nums font-medium", value > 0 ? "text-white/80" : "text-authority-losing")}>
      {value > 0 ? "+" : "−"}{Math.abs(value)}
    </span>
  );
}

/** Momentum = gap direction: ▲ widening (red), ▼ narrowing (green), — stable (gray). No animation. */
function MomentumArrow({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) return <span className="text-text-2">—</span>;
  if (delta < 0) return <span className="text-authority-losing" aria-label="Widening gap">▲</span>;
  return <span className="text-white/75" aria-label="Narrowing gap">▼</span>;
}

function TrendArrow({ value }: { value: number | null }) {
  return <MomentumArrow delta={value} />;
}

function ModelDot({ model }: { model: string | null }) {
  if (!model) return null;
  const p = (model || "").toLowerCase();
  const color = p.includes("openai") || p.includes("chatgpt") ? "bg-white/40"
    : p.includes("gemini") || p.includes("google") ? "bg-authority-watchlist"
    : p.includes("anthropic") || p.includes("claude") ? "bg-authority-losing"
    : "bg-authority-stable";
  return <span className={cn("mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full", color)} aria-hidden />;
}

function clientNeedsAttention(c: ClientWithStats): boolean {
  const b = triageBucket(c);
  const delta =
    c.latestScore !== null && c.previousScore !== null ? c.latestScore - c.previousScore : null;
  if (b === "losing") return true;
  if (b === "watchlist" && delta !== null && delta < 0) return true;
  return false;
}

function formatRelativeSnapshot(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function portfolioLastSnapshotLabel(clients: ClientWithStats[]): string {
  const dates = clients.map((c) => c.lastSnapshotAt).filter(Boolean) as string[];
  if (dates.length === 0) return "No snapshots yet";
  const latest = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]!;
  return `Last snapshot ${formatRelativeSnapshot(latest)}`;
}

/** Lowest average family score across clients with model data — portfolio weak point. */
function portfolioWeakestFamilyLabel(clients: ClientWithStats[]): string | null {
  const families: ModelFamily[] = ["chatgpt", "gemini", "claude"];
  const sums: Record<ModelFamily, { sum: number; n: number }> = {
    chatgpt: { sum: 0, n: 0 },
    gemini: { sum: 0, n: 0 },
    claude: { sum: 0, n: 0 },
  };
  clients.forEach((c) => {
    if (!c.providerFamilyScores) return;
    families.forEach((f) => {
      const s = c.providerFamilyScores![f];
      if (typeof s === "number") {
        sums[f].sum += s;
        sums[f].n += 1;
      }
    });
  });
  let worst: ModelFamily | null = null;
  let worstAvg = 101;
  families.forEach((f) => {
    if (sums[f].n === 0) return;
    const avg = sums[f].sum / sums[f].n;
    if (avg < worstAvg) {
      worstAvg = avg;
      worst = f;
    }
  });
  return worst ? modelFamilyLabel(worst) : null;
}

function attentionDetailSuffix(c: ClientWithStats): string {
  const parts: string[] = [];
  const delta =
    c.latestScore !== null && c.previousScore !== null ? c.latestScore - c.previousScore : null;
  if (delta !== null && delta !== 0) {
    parts.push(delta < 0 ? `↓ ${delta} pts` : `↑ +${delta} pts`);
  }
  const wm = c.worstModel;
  if (wm && c.providerFamilyScores) {
    const fam = modelFamilyFromProviderKey(wm);
    if (fam != null) {
      const sc = c.providerFamilyScores[fam];
      if (typeof sc === "number" && sc < 50) {
        parts.push(`${displayModelName(wm)} critical`);
      }
    }
  }
  return parts.join(" · ");
}

function clientStoryLine(c: ClientWithStats): string {
  const hasData = c.latestScore !== null;
  if (!hasData) return "";
  const state = getAuthorityState(c);
  const wm = c.worstModel ? displayModelName(c.worstModel) : null;
  if (state === "Dominant") return "Leading on every tracked model.";
  if (state === "Losing Ground") {
    return wm ? `Concentrated loss on ${wm}. Act now.` : "Critical gap. Act now.";
  }
  if (state === "Watchlist") {
    return wm ? `Slipping on ${wm}. Address before it compounds.` : "Elevated risk; isolate the gap with a snapshot.";
  }
  return "Stable. Shore up the weakest channel.";
}

function CardStatusBadge({ bucket }: { bucket: TriageBucket }) {
  const key =
    bucket === "losing" ? "losing" : bucket === "watchlist" ? "watchlist" : bucket === "stable" ? "stable" : "dominant";
  const label =
    key === "losing" ? "Losing ground" : key === "watchlist" ? "Watchlist" : key === "stable" ? "Stable" : "Dominant";
  const styles: Record<typeof key, string> = {
    dominant:
      "border-white/20 bg-white/[0.06] text-text",
    watchlist:
      "border-authority-watchlist/22 bg-authority-watchlist/[0.06] text-authority-watchlist",
    stable: "border-white/[0.08] bg-white/[0.03] text-text-2",
    losing: "border-authority-losing/25 bg-authority-losing/[0.08] text-authority-losing",
  };
  return (
    <span
      className={cn(
        "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
        styles[key]
      )}
    >
      {label}
    </span>
  );
}

function CardDeltaBadge({ delta }: { delta: number }) {
  const neg = delta < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tabular-nums tracking-tight",
        neg
          ? "border-authority-losing/18 bg-authority-losing/[0.06] text-authority-losing"
          : "border-white/[0.14] bg-white/[0.05] text-white/80"
      )}
    >
      {neg ? "↓" : "↑"} {neg ? Math.abs(delta) : `+${delta}`} vs last
    </span>
  );
}

function PriorityAlertBar({
  clients,
  triageFilter,
  onToggleFilter,
}: {
  clients: ClientWithStats[];
  triageFilter: TriageBucket | null;
  onToggleFilter: (b: TriageBucket) => void;
}) {
  const sorted = useMemo(
    () =>
      [...clients].sort((a, b) => {
        const o = triageOrder(a) - triageOrder(b);
        if (o !== 0) return o;
        return (a.latestScore ?? -1) - (b.latestScore ?? -1);
      }),
    [clients]
  );
  const attention = useMemo(() => sorted.filter(clientNeedsAttention), [sorted]);
  const stable = attention.length === 0;

  const counts = useMemo(() => {
    let dominant = 0;
    let watchlist = 0;
    let losing = 0;
    clients.forEach((c) => {
      const b = triageBucket(c);
      if (b === "dominant") dominant += 1;
      else if (b === "watchlist") watchlist += 1;
      else if (b === "losing") losing += 1;
    });
    return { dominant, watchlist, losing };
  }, [clients]);

  const weakestPortfolio = useMemo(() => portfolioWeakestFamilyLabel(clients), [clients]);
  const snapshotLine = portfolioLastSnapshotLabel(clients);

  const filterBtn = (b: "losing" | "watchlist" | "dominant") =>
    cn(
      "min-w-[4.5rem] px-3 py-2 text-[11px] font-semibold tracking-tight transition-[color,background-color,box-shadow]",
      triageFilter === b
        ? b === "dominant"
          ? "rounded-[7px] bg-white/[0.1] text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          : b === "losing"
            ? "rounded-[7px] bg-authority-losing/12 text-authority-losing shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            : "rounded-[7px] bg-authority-watchlist/12 text-authority-watchlist shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        : "rounded-[7px] text-text-3 hover:bg-white/[0.04] hover:text-text-2"
    );

  return (
    <div className="relative mb-3 overflow-hidden rounded-2xl border border-white/20 bg-[#0B0F14]">
      <div className="relative">
        <div className="border-b border-white/[0.08] px-4 py-3 sm:px-5 sm:py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">Portfolio overview</p>
          <div className="mt-4">
            <div className="flex flex-wrap items-end gap-x-7 gap-y-5 sm:gap-x-9 lg:gap-x-10">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/75">Dominant</p>
                <p className="mt-1 text-[1.65rem] font-semibold leading-none tabular-nums tracking-tight text-text sm:text-[1.85rem]">
                  {counts.dominant}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/75">Watchlist</p>
                <p
                  className={cn(
                    "mt-1 text-[1.65rem] font-semibold leading-none tabular-nums tracking-tight sm:text-[1.85rem]",
                    counts.watchlist > 0 ? "text-authority-watchlist" : "text-text"
                  )}
                >
                  {counts.watchlist}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/75">Losing ground</p>
                <p
                  className={cn(
                    "mt-1 text-[1.65rem] font-semibold leading-none tabular-nums tracking-tight sm:text-[1.85rem]",
                    counts.losing > 0 ? "text-authority-losing" : "text-text"
                  )}
                >
                  {counts.losing}
                </p>
              </div>
              <div className="min-w-[min(100%,10rem)] flex-1 border-t border-white/[0.08] pt-3.5 sm:min-w-[9.5rem] sm:border-l sm:border-t-0 sm:border-white/[0.08] sm:pl-7 sm:pt-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/75">Coverage</p>
                <p className="mt-1 text-[13px] font-medium leading-snug text-white/75">{snapshotLine}</p>
              </div>
              <div className="min-w-[min(100%,10rem)] flex-1 sm:min-w-[8.5rem]">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/75">Portfolio weak point</p>
                <p className="mt-1 text-[13px] font-semibold">
                  {weakestPortfolio ? (
                    <span className="text-text">{weakestPortfolio}</span>
                  ) : (
                    <span className="font-medium text-text-3">Insufficient data</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2.5 sm:gap-y-1">
            {stable ? (
              <>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/65" aria-hidden />
                  <span className="text-[13px] font-semibold text-text">Portfolio stable.</span>
                </span>
                <span className="pl-3.5 text-[13px] text-white/75 sm:pl-2">
                  No clients at risk.
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-authority-losing/90" aria-hidden />
                  <span className="text-[13px] font-semibold text-text">
                    {attention.length === 1 ? "1 client needs attention." : `${attention.length} clients need attention.`}
                  </span>
                </span>
                <span className="break-words pl-3.5 text-[13px] leading-snug text-white/75 sm:pl-1">
                  {attention[0]!.name}
                  {(() => {
                    const d = attentionDetailSuffix(attention[0]!);
                    return d ? ` · ${d}` : "";
                  })()}
                  {attention.length > 1
                    ? ` · Also: ${attention
                        .slice(1, 3)
                        .map((c) => c.name)
                        .join(", ")}${attention.length > 3 ? ", …" : ""}`
                    : ""}
                </span>
                {attention.length > 1 ? (
                  <a
                    href="#clients-overview"
                    className="shrink-0 pl-3.5 text-[12px] font-medium text-text-2 underline-offset-4 hover:text-text hover:underline sm:pl-2"
                  >
                    Review queue
                  </a>
                ) : null}
              </>
            )}
          </div>
          <div
            className="inline-flex w-full shrink-0 items-center gap-px rounded-xl p-px ring-1 ring-inset ring-white/[0.05] sm:w-auto sm:rounded-[11px]"
            role="group"
            aria-label="Filter by status"
          >
            {(["losing", "watchlist", "dominant"] as const).map((b) => (
              <button key={b} type="button" onClick={() => onToggleFilter(b)} className={filterBtn(b)}>
                {b === "losing" ? "Losing" : b === "watchlist" ? "Watchlist" : "Dominant"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function faviconDomain(website: string | null): string | null {
  if (!website) return null;
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function ClientCard({ client }: { client: ClientWithStats }) {
  const router = useRouter();
  const hasData = client.latestScore !== null;
  const bucket = triageBucket(client);
  const needsAttention = clientNeedsAttention(client);
  const domain = faviconDomain(client.website);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;
  const weakestLabel = client.worstModel ? displayModelName(client.worstModel) : null;
  const displacer = client.primaryDisplacer?.trim() || null;
  const showDisplacer = Boolean(displacer && displacer !== "—");
  const delta =
    client.latestScore !== null && client.previousScore !== null
      ? client.latestScore - client.previousScore
      : null;
  const showDelta = delta !== null && delta !== 0;
  const story = clientStoryLine(client);

  const goClient = () => router.push(`/app/clients/${client.id}`);

  const urgencySurface =
    bucket === "losing"
      ? "ring-1 ring-inset ring-authority-losing/12"
      : needsAttention && bucket === "watchlist"
        ? "ring-1 ring-inset ring-authority-watchlist/14"
        : "";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goClient}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goClient();
        }
      }}
      className={cn(
        "client-card group relative flex h-full min-h-[236px] cursor-pointer flex-col overflow-hidden rounded-2xl",
        "border border-white/20 bg-[#0B0F14] transition-[border-color,box-shadow] duration-200",
        "hover:border-white/25",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/12",
        urgencySurface
      )}
    >
      <div className="relative flex h-full flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/35 ring-1 ring-inset ring-white/10">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" className="h-[20px] w-[20px] object-contain" width={20} height={20} />
            ) : (
              <span className="text-[11px] font-semibold text-text-3">{client.name.charAt(0)}</span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold tracking-tight text-text">{client.name}</p>
                {client.website ? (
                  <p className="mt-1 truncate text-[11px] font-medium text-white/75">{displayUrl(client.website)}</p>
                ) : null}
              </div>
              <CardStatusBadge bucket={bucket} />
            </div>
          </div>
          <svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
            className="mt-1 shrink-0 text-text-3/80 transition-colors group-hover:text-text-2"
            aria-hidden
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {!hasData ? (
          <div className="mt-5 flex flex-1 flex-col rounded-xl bg-black/15 px-4 py-5 ring-1 ring-inset ring-dashed ring-white/[0.06]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-3/90">Awaiting signal</p>
            <p className="mt-2.5 text-[15px] font-semibold leading-snug tracking-tight text-text">No authority baseline yet</p>
            <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-text-2">
              Run a snapshot to index this brand across tracked models and surface displacers.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/app/clients/${client.id}`);
              }}
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-[#22c55e] px-4 py-2 text-[12px] font-semibold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-colors hover:bg-[#16a34a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              Run snapshot
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 border-t border-white/[0.08] pt-3.5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">Authority index</p>
                <div className="mt-1 flex flex-wrap items-end gap-2.5">
                  <span className="text-6xl font-semibold tabular-nums leading-[0.95] tracking-tight text-text">
                    {client.latestScore}
                  </span>
                  {showDelta ? <CardDeltaBadge delta={delta!} /> : null}
                </div>
                <p className="mt-1 text-[10px] font-normal leading-snug text-white/65">Composite across models · 0–100</p>
              </div>
            </div>
            <p className="mt-3.5 flex-1 text-[13px] font-normal leading-relaxed text-white/75">{story}</p>
            <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.08] pt-3 text-[12px]">
              {weakestLabel ? (
                <span className="text-text-3">
                  Weakest model
                  <span className="ml-2 font-semibold text-text">{weakestLabel}</span>
                </span>
              ) : null}
              {showDisplacer ? (
                <span className="text-text-3">
                  Displaced by
                  <span className="ml-2 font-medium text-text-2">{displacer}</span>
                </span>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClientCardsGrid({ clients }: { clients: ClientWithStats[] }) {
  return (
    <section id="clients-overview">
      <div className="grid grid-cols-1 items-stretch gap-2 sm:gap-2.5 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </section>
  );
}

/* Section 2: Clients Requiring Attention — Watchlist + Losing only, dense table */
function ClientsRequiringAttention({ clients }: { clients: ClientWithStats[] }) {
  const attention = useMemo(() => {
    return clients.filter((c) => {
      const state = getAuthorityState(c);
      if (state === "Watchlist" || state === "Losing Ground") return true;
      const delta = c.latestScore !== null && c.previousScore !== null ? c.latestScore - c.previousScore : null;
      return delta !== null && delta < 0;
    });
  }, [clients]);

  if (attention.length === 0) {
    return (
      <section className="rounded-app-lg border border-white/20 bg-[#0B0F14]">
        <div className="px-3 py-2 text-xs text-white/75">Portfolio stable. No widening gaps.</div>
      </section>
    );
  }

  return (
    <section className="rounded-app-lg border border-white/20 bg-[#0B0F14] overflow-hidden">
      <div className="border-b border-white/[0.08] px-3 py-2">
        <h2 className="text-sm font-semibold text-text">Clients Requiring Attention</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-black/25">
              <th className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">Client</th>
              <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2 text-right">Index</th>
              <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2 text-right">Gap</th>
              <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">Weakest</th>
              <th className="w-8 px-1 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2 text-center" title="Gap trend">Δ</th>
              <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">Displacer</th>
            </tr>
          </thead>
          <tbody>
            {attention.map((c) => {
              const delta = c.latestScore !== null && c.previousScore !== null ? c.latestScore - c.previousScore : null;
              return (
                <tr key={c.id} className="border-b border-white/[0.08] last:border-b-0">
                  <td className="px-3 py-1.5 font-medium text-text">
                    <Link href={`/app/clients/${c.id}`} className="hover:underline">{c.name}</Link>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text">{c.latestScore ?? "—"}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text-2">{c.authorityGap ?? "—"}</td>
                  <td className="px-2 py-1.5 text-text-2">{c.worstModel ? displayModelName(c.worstModel) : "—"}</td>
                  <td className="w-8 px-1 py-1.5 text-center" title={delta == null ? "" : delta < 0 ? "Gap widening" : "Gap narrowing"}>
                    <MomentumArrow delta={delta} />
                  </td>
                  <td className="px-2 py-1.5 text-text-2">{c.primaryDisplacer ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* Section 3: Model Exposure — Stakent-style: one card per model, prominent metric + structured row */
function ModelExposureSummary({ clients }: { clients: ClientWithStats[] }) {
  const totalClients = clients.length;
  const byModel = useMemo(() => {
    const out: Record<ModelFamily, {
      dominant: number;
      stable: number;
      watchlist: number;
      losing: number;
      widening: number;
      analyzed: number;
      gapSum: number;
      gapCount: number;
      scoreSum: number;
    }> = {
      chatgpt: { dominant: 0, stable: 0, watchlist: 0, losing: 0, widening: 0, analyzed: 0, gapSum: 0, gapCount: 0, scoreSum: 0 },
      gemini: { dominant: 0, stable: 0, watchlist: 0, losing: 0, widening: 0, analyzed: 0, gapSum: 0, gapCount: 0, scoreSum: 0 },
      claude: { dominant: 0, stable: 0, watchlist: 0, losing: 0, widening: 0, analyzed: 0, gapSum: 0, gapCount: 0, scoreSum: 0 },
    };
    clients.forEach((c) => {
      const delta = c.latestScore !== null && c.previousScore !== null ? c.latestScore - c.previousScore : null;
      const widening = delta !== null && delta < 0;
      const worstFamily = c.worstModel ? modelFamilyFromProviderKey(c.worstModel) : null;
      MODEL_FAMILIES.forEach((family) => {
        const score = c.providerFamilyScores?.[family] ?? null;
        if (score !== null) {
          out[family].analyzed++;
          out[family].gapSum += 100 - score;
          out[family].gapCount++;
          out[family].scoreSum += score;
        }
        const state = getAuthorityStateFromScore(score);
        if (state === "Dominant") out[family].dominant++;
        else if (state === "Stable") out[family].stable++;
        else if (state === "Watchlist") out[family].watchlist++;
        else out[family].losing++;
        if (widening && worstFamily === family) out[family].widening++;
      });
    });
    return out;
  }, [clients]);

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium uppercase tracking-wider text-white/75">Model Exposure</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MODEL_FAMILIES.map((family) => {
          const d = byModel[family];
          const avgGap = d.gapCount > 0 ? Math.round(d.gapSum / d.gapCount) : null;
          const avgIndex = d.analyzed > 0 ? Math.round(d.scoreSum / d.analyzed) : null;
          return (
            <div key={family} className="rounded-app-lg border border-white/20 bg-[#0B0F14] p-4">
              <div className="text-xs font-medium text-white/75 mb-1.5">{modelFamilyLabel(family)}</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight text-text">{d.analyzed}<span className="text-sm font-normal text-text-3">/{totalClients}</span></div>
              <div className="text-[10px] text-white/65 mt-0.5">clients analyzed</div>
              <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-3">State</span>
                  <span className="tabular-nums text-text-2">D <strong>{d.dominant}</strong> · S <strong>{d.stable}</strong> · W <strong>{d.watchlist}</strong> · L <strong>{d.losing}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Avg gap to leader</span>
                  <span className="tabular-nums text-text">{avgGap ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Avg index</span>
                  <span className="tabular-nums text-text">{avgIndex ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Widening gaps</span>
                  <span className={cn("tabular-nums", d.widening > 0 ? "text-authority-losing" : "text-text-2")}>{d.widening > 0 ? d.widening : "—"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* Section 2: AI Authority Risk Map — neutral cells, 3px left bar = state, arrow = momentum */
const MODEL_FAMILIES: ModelFamily[] = ["chatgpt", "gemini", "claude"];

function RiskMapCell({
  score,
  delta,
  stateBar,
  title,
}: {
  score: number | null;
  delta: number | null;
  stateBar: string;
  title: string;
}) {
  const deltaFormatted = delta !== null && delta !== 0 ? (delta > 0 ? `+${delta}` : `${delta}`) : null;
  return (
    <td className="w-20 min-w-[4.5rem] bg-transparent px-0 py-0 align-top text-right" title={title}>
      <div className={cn("flex flex-col py-1.5 pr-1.5 text-right", stateBar)}>
        <span className="text-lg font-semibold tabular-nums text-text leading-tight">{score ?? "—"}</span>
        {deltaFormatted !== null && (
          <span className={cn("text-[10px] tabular-nums", delta !== null && delta < 0 ? "text-authority-losing" : "text-white/75")}>
            {deltaFormatted}
          </span>
        )}
        <span className="mt-0.5" title={delta == null ? "" : delta < 0 ? "Gap widening" : "Gap narrowing"}>
          <MomentumArrow delta={delta} />
        </span>
      </div>
    </td>
  );
}

function RiskMap({ clients }: { clients: ClientWithStats[] }) {
  return (
    <section className="rounded-app-lg border border-white/20 bg-[#0B0F14] overflow-hidden">
      <div className="border-b border-white/[0.08] px-3 py-2">
        <h2 className="text-sm font-semibold text-text">AI Authority Risk Map</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-black/25">
              <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-text-2">Client</th>
              {MODEL_FAMILIES.map((f) => (
                <th key={f} className="w-20 min-w-[4.5rem] px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-2">
                  {modelFamilyLabel(f)}
                </th>
              ))}
              <th className="w-20 min-w-[4.5rem] px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-text-2">Overall</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const overallState = getAuthorityState(client);
              const overallDelta = client.latestScore !== null && client.previousScore !== null ? client.latestScore - client.previousScore : null;
              const hoverOverall = [client.primaryDisplacer && `Displacer: ${client.primaryDisplacer}`, client.authorityGap != null && `Gap: ${client.authorityGap}`, overallDelta != null && `Change: ${overallDelta >= 0 ? "+" : ""}${overallDelta}`].filter(Boolean).join(". ");
              return (
                <tr key={client.id} className="border-b border-white/[0.08] last:border-b-0">
                  <td className="px-3 py-1.5 font-medium text-text">
                    <Link href={`/app/clients/${client.id}`} className="hover:underline">{client.name}</Link>
                  </td>
                  {MODEL_FAMILIES.map((family) => {
                    const score = client.providerFamilyScores?.[family] ?? null;
                    const state = getAuthorityStateFromScore(score);
                    const hoverText = score != null ? [`Index ${score}`, client.primaryDisplacer && `Displacer: ${client.primaryDisplacer}`, overallDelta != null && `Change: ${overallDelta >= 0 ? "+" : ""}${overallDelta}`].filter(Boolean).join(". ") : "No data";
                    return (
                      <RiskMapCell
                        key={family}
                        score={score}
                        delta={overallDelta}
                        stateBar={getAuthorityStateBar(state)}
                        title={hoverText}
                      />
                    );
                  })}
                  <RiskMapCell
                    score={client.latestScore}
                    delta={overallDelta}
                    stateBar={getAuthorityStateBar(overallState)}
                    title={hoverOverall}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* Top Competitive Threats — when empty, single-line system status; otherwise top 5 */
function TopThreats({ clients }: { clients: ClientWithStats[] }) {
  const top5 = useMemo(() => {
    const withGap = [...clients].filter((c) => (c.authorityGap ?? 0) > 0);
    const delta = (c: ClientWithStats) =>
      c.latestScore !== null && c.previousScore !== null ? c.latestScore - c.previousScore : null;
    return withGap
      .sort((a, b) => {
        const aWidening = (delta(a) ?? 0) < 0 ? 1 : 0;
        const bWidening = (delta(b) ?? 0) < 0 ? 1 : 0;
        if (bWidening !== aWidening) return bWidening - aWidening;
        return (b.authorityGap ?? 0) - (a.authorityGap ?? 0);
      })
      .slice(0, 5);
  }, [clients]);

  const isEmpty = top5.length === 0;

  if (isEmpty) {
    return (
      <section className="rounded-app-lg border border-white/20 bg-[#0B0F14] px-3 py-2">
        <span className="text-xs text-white/75">System status: No competitive threats above threshold.</span>
      </section>
    );
  }

  return (
    <section className="rounded-app-lg border border-white/20 bg-[#0B0F14] overflow-hidden">
      <div className="border-b border-white/[0.08] px-3 py-2">
        <h2 className="text-sm font-semibold text-text">Top Competitive Threats</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-black/25">
              <th className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">Client</th>
              <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">Model</th>
              <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">Displacer</th>
              <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2 text-right">Gap</th>
              <th className="w-8 px-1 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-text-2">Δ</th>
            </tr>
          </thead>
          <tbody>
            {top5.map((c) => {
              const delta = c.latestScore !== null && c.previousScore !== null ? c.latestScore - c.previousScore : null;
              return (
                <tr key={c.id} className="border-b border-white/[0.08] last:border-b-0">
                  <td className="px-3 py-1.5 font-medium text-text">{c.name}</td>
                  <td className="px-2 py-1.5 text-text-2">{c.worstModel ? displayModelName(c.worstModel) : "—"}</td>
                  <td className="px-2 py-1.5 text-text-2">{c.primaryDisplacer ?? "—"}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text">{c.authorityGap ?? "—"}</td>
                  <td className="w-8 px-1 py-1.5 text-center" title={delta == null ? "" : delta < 0 ? "Gap widening" : "Gap narrowing"}><TrendArrow value={delta} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusDot({ score, status }: { score: number | null; status: string }) {
  if (status === "running") return <span className="h-2.5 w-2.5 rounded-full bg-authority-watchlist" />;
  if (score === null) return <span className="h-2.5 w-2.5 rounded-full bg-authority-stable/60" />;
  if (score >= 70) return <span className="h-2.5 w-2.5 rounded-full bg-white/55" />;
  if (score >= 40) return <span className="h-2.5 w-2.5 rounded-full bg-authority-watchlist" />;
  return <span className="h-2.5 w-2.5 rounded-full bg-authority-losing" />;
}

function ClientTable({ clients }: { clients: ClientWithStats[] }) {
  const router = useRouter();

  return (
    <div className="rounded-app-lg border border-white/20 bg-[#0B0F14] overflow-hidden">
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-white/[0.08] bg-black/25">
            <th className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">Client</th>
            <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">State</th>
            <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2 text-right">Index</th>
            <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2 text-right">Trend</th>
            <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">Displacer</th>
            <th className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-2">Weakest</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const delta = client.latestScore !== null && client.previousScore !== null
              ? client.latestScore - client.previousScore
              : null;
            const state = getAuthorityState(client);
            const hasNoData = client.status === "none" && client.latestScore === null;

            return (
              <tr
                key={client.id}
                onClick={() => !hasNoData && router.push(`/app/clients/${client.id}`)}
                className={cn(
                  "border-b border-white/[0.08] last:border-b-0 transition-colors",
                  hasNoData ? "bg-black/20 hover:bg-black/30" : "cursor-pointer hover:bg-white/[0.03]"
                )}
              >
                {hasNoData ? (
                  <td colSpan={6} className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <StatusDot score={client.latestScore} status={client.status} />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-text">{client.name}</span>
                        <span className="ml-2 text-xs text-text-2">Run a snapshot to measure authority</span>
                        <Link
                          href={`/app/clients/${client.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="ml-2 inline-flex items-center gap-1 rounded-md bg-[#22c55e] px-2.5 py-1 text-[11px] font-semibold text-black transition-colors hover:bg-[#16a34a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                        >
                          Run snapshot
                        </Link>
                      </div>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <StatusDot score={client.latestScore} status={client.status} />
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-text">{client.name}</span>
                          {client.website ? (
                            <div className="text-[10px] text-text-2">{displayUrl(client.website)}</div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-1.5"><StatusPill state={state} /></td>
                    <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-text">{client.latestScore ?? "—"}</td>
                    <td className="px-2 py-1.5 text-right"><Delta value={delta} /></td>
                    <td className="px-2 py-1.5 text-text-2">
                      {client.primaryDisplacer ? (
                        <span>
                          {client.primaryDisplacer}
                          {client.authorityGap != null ? ` · ${client.authorityGap}` : ""}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-text-2">
                      {client.worstModel ? (
                        <Link
                          href={`/app/clients/${client.id}#cross-model`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-text-2 transition-colors hover:text-text"
                        >
                          <ModelPill model={client.worstModel} />
                        </Link>
                      ) : (
                        <span className="text-text-3">—</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-[#0B0F14] px-10 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-w-2xl sm:px-14 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
        }}
      />
      <svg
        className="pointer-events-none absolute -right-8 bottom-0 h-40 w-56 text-white/[0.04] sm:h-48 sm:w-64"
        viewBox="0 0 200 80"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 65 L40 52 L72 58 L110 38 L148 48 L200 22"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M0 65 L200 65" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
      </svg>
      <div className="relative z-[1] mx-auto max-w-lg text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Portfolio</p>
        <h2 className="mt-3 font-app-display text-2xl font-normal tracking-tight text-text sm:text-[1.75rem]">
          Your portfolio is empty
        </h2>
        <p className="mt-3 text-[15px] font-medium leading-snug text-white/88 sm:text-base">
          No data yet — your clients are already being ranked by AI.
        </p>
        <p className="mt-3 text-[14px] font-light leading-relaxed text-white/65 sm:text-[15px]">
          Add your first client to see where they appear in AI — and who is replacing them.
        </p>
        <Link
          href="/app/clients/new"
          className="mt-9 inline-flex h-12 min-w-[min(100%,280px)] items-center justify-center rounded-xl bg-[#22c55e] px-8 text-[15px] font-semibold tracking-tight text-black shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_32px_rgba(34,197,94,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:bg-[#16a34a] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_40px_rgba(34,197,94,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14] sm:h-[3.25rem] sm:min-w-[300px] sm:px-10 sm:text-base"
        >
          + Add your first client
        </Link>
      </div>
    </div>
  );
}

export default function AppPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [triageFilter, setTriageFilter] = useState<TriageBucket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoFailedBanner, setShowLogoFailedBanner] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const { agencyId } = await ensureOnboarded();
        if (cancelled) return;

        // Get clients
        const clientsRes = await supabase
          .from("clients")
          .select("id, name, website, industry, created_at")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false });

        if (clientsRes.error) throw clientsRes.error;
        const clientList = clientsRes.data ?? [];

        if (clientList.length === 0) {
          if (!cancelled) {
            setClients([]);
            setPortfolioStats({
              totalClients: 0, avgScore: 0, avgScoreDelta: null,
              snapshotsThisMonth: 0, clientsWithAlerts: 0,
              strongClients: 0, moderateClients: 0, weakClients: 0,
              improvingClients: 0, decliningClients: 0,
            });
            setLoading(false);
          }
          return;
        }

        // Get snapshots for all clients
        const clientIds = clientList.map(c => c.id);
        const snapshotsRes = await supabase
          .from("snapshots")
          .select("id, client_id, status, vrtl_score, score_by_provider, created_at, completed_at")
          .in("client_id", clientIds)
          .order("created_at", { ascending: false });

        const snapshots = snapshotsRes.data ?? [];

        // Get competitors count for each client
        const competitorsRes = await supabase
          .from("competitors")
          .select("client_id, id")
          .in("client_id", clientIds);

        const competitorsByClient = new Map<string, number>();
        (competitorsRes.data ?? []).forEach(c => {
          competitorsByClient.set(c.client_id, (competitorsByClient.get(c.client_id) || 0) + 1);
        });

        // Get snapshot details for metrics
        const latestSnapshotIds = clientList.map(c => {
          const completed = snapshots.filter(s => {
            const st = String(s.status ?? "").toLowerCase();
            return s.client_id === c.id && (st.includes("complete") || st.includes("success"));
          });
          return completed[0]?.id;
        }).filter(Boolean);

        const detailsMap = new Map<string, SnapshotDetailResponse>();
        if (latestSnapshotIds.length > 0) {
          const detailsPromises = latestSnapshotIds.map(async (snapshotId) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            try {
              const res = await fetch(`/api/snapshots/detail?snapshotId=${snapshotId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
              });
              if (!res.ok) return null;
              const data: SnapshotDetailResponse = await res.json();
              return { snapshotId, data };
            } catch {
              return null;
            }
          });
          const detailsResults = await Promise.all(detailsPromises);
          detailsResults.forEach(result => {
            if (result && result.data) {
              detailsMap.set(result.snapshotId, result.data);
            }
          });
        }

        // Build client stats
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const clientsWithStats: ClientWithStats[] = clientList.map(client => {
          const clientSnapshots = snapshots.filter(s => s.client_id === client.id);
          const completedSnapshots = clientSnapshots.filter(s => {
            const st = String(s.status ?? "").toLowerCase();
            return st.includes("complete") || st.includes("success");
          });
          const runningSnapshot = clientSnapshots.find(s => {
            const st = String(s.status ?? "").toLowerCase();
            return st.includes("running") || st.includes("pending") || st.includes("queued");
          });

          const scores = completedSnapshots
            .map(s => s.vrtl_score)
            .filter((s): s is number => typeof s === "number");

          const latestScore = scores.length > 0 ? scores[0] : null;
          const previousScore = scores.length > 1 ? scores[1] : null;
          const lastSnapshotAt = completedSnapshots[0]?.completed_at || completedSnapshots[0]?.created_at || null;
          const recentScores = scores.slice(0, 5).reverse();

          // Detail stats
          const latestSnapshotId = completedSnapshots[0]?.id;
          const detail = latestSnapshotId ? detailsMap.get(latestSnapshotId) : null;

          let mentionRate = null;
          let topPositionRate = null;
          let citationRate = null;
          let competitorRank = null;
          let primaryDisplacer: string | null = null;
          let authorityGap: number | null = null;

          if (detail) {
            const total = detail.summary.responses_count || 1;
            mentionRate = Math.round((detail.summary.client_mentioned_count / total) * 100);
            citationRate = Math.round((detail.summary.sources_count / total) * 100);
            const topPositionCount = detail.responses?.filter(r => r.client_mentioned && r.client_position === "top").length || 0;
            topPositionRate = Math.round((topPositionCount / total) * 100);
            const clientMentions = detail.summary.client_mentioned_count;
            const competitors = detail.summary.top_competitors || [];
            const allEntities = [
              { name: client.name, mentions: clientMentions, isClient: true },
              ...competitors.map(c => ({ name: c.name, mentions: c.count, isClient: false }))
            ].sort((a, b) => b.mentions - a.mentions);
            competitorRank = allEntities.findIndex(e => e.isClient) + 1;
            const topCompetitor = competitors[0] ?? null;
            if (topCompetitor && topCompetitor.count >= clientMentions) {
              primaryDisplacer = topCompetitor.name;
              // Authority Gap = Leader Index − Client Index (estimated from mention displacement)
              const mentionGap = topCompetitor.count - clientMentions;
              const clientScore = latestScore ?? 0;
              const estimatedLeaderIndex = Math.min(100, clientScore + Math.max(10, mentionGap * 2));
              authorityGap = Math.round(Math.max(0, estimatedLeaderIndex - clientScore));
            }
          }

          // Best/worst models
          let bestModel = null;
          let worstModel = null;
          let providerFamilyScores: ProviderFamilyScores | null = null;
          if (completedSnapshots[0]?.score_by_provider) {
            const scoreByProvider = completedSnapshots[0].score_by_provider as Record<string, number>;
            const providers = Object.entries(scoreByProvider);
            if (providers.length > 0) {
              const sorted = providers.sort((a, b) => b[1] - a[1]);
              bestModel = sorted[0][0];
              worstModel = sorted[sorted.length - 1][0];
            }

            providerFamilyScores = {};
            for (const [provider, score] of Object.entries(scoreByProvider)) {
              const family = modelFamilyFromProviderKey(provider);
              if (!family) continue;
              const current = providerFamilyScores[family];
              if (typeof current !== "number" || score > current) {
                providerFamilyScores[family] = score;
              }
            }
          }

          const hasAlert = (previousScore !== null && latestScore !== null && (previousScore - latestScore) >= 5) ||
                           (competitorRank !== null && competitorRank > 1);

          const competitorCount = competitorsByClient.get(client.id) || 0;

          return {
            ...client, latestScore, previousScore, lastSnapshotAt,
            snapshotCount: completedSnapshots.length, recentScores,
            status: runningSnapshot ? "running" : completedSnapshots.length > 0 ? "complete" : "none" as const,
            mentionRate, topPositionRate, citationRate, competitorRank,
            competitorCount, primaryDisplacer, authorityGap, bestModel, worstModel, providerFamilyScores, hasAlert,
          };
        });

        // Portfolio stats
        const scoresForAvg = clientsWithStats
          .map(c => c.latestScore)
          .filter((s): s is number => typeof s === "number");

        const avgScore = scoresForAvg.length > 0
          ? Math.round(scoresForAvg.reduce((sum, s) => sum + s, 0) / scoresForAvg.length)
          : 0;

        // Calculate avg score delta
        const deltas = clientsWithStats
          .filter(c => c.latestScore !== null && c.previousScore !== null)
          .map(c => c.latestScore! - c.previousScore!);
        const avgScoreDelta = deltas.length > 0
          ? Math.round(deltas.reduce((sum, d) => sum + d, 0) / deltas.length)
          : null;

        const snapshotsThisMonth = snapshots.filter(s => new Date(s.created_at) >= monthStart).length;
        const clientsWithAlerts = clientsWithStats.filter(c => c.hasAlert).length;
        const strongClients = clientsWithStats.filter(c => c.latestScore !== null && c.latestScore >= 70).length;
        const moderateClients = clientsWithStats.filter(c => c.latestScore !== null && c.latestScore >= 40 && c.latestScore < 70).length;
        const weakClients = clientsWithStats.filter(c => c.latestScore !== null && c.latestScore < 40).length;
        const improvingClients = clientsWithStats.filter(c => c.latestScore !== null && c.previousScore !== null && c.latestScore > c.previousScore).length;
        const decliningClients = clientsWithStats.filter(c => c.latestScore !== null && c.previousScore !== null && c.latestScore < c.previousScore).length;

        if (!cancelled) {
          setClients(clientsWithStats);
          setPortfolioStats({
            totalClients: clientList.length, avgScore, avgScoreDelta,
            snapshotsThisMonth, clientsWithAlerts,
            strongClients, moderateClients, weakClients,
            improvingClients, decliningClients,
          });
        }
      } catch (e) {
        const err = e as { message?: string };
        if (!cancelled) setError(err?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [supabase]);

  // One-time banner if user just completed onboarding but logo upload failed
  useEffect(() => {
    try {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("onboarding_logo_failed") === "1") {
        sessionStorage.removeItem("onboarding_logo_failed");
        setShowLogoFailedBanner(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.website && c.website.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [clients, searchQuery]);

  const triageSortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      const o = triageOrder(a) - triageOrder(b);
      if (o !== 0) return o;
      const sa = a.latestScore ?? -1;
      const sb = b.latestScore ?? -1;
      return sa - sb;
    });
  }, [filteredClients]);

  const displayedSortedClients = useMemo(() => {
    if (triageFilter === null) return triageSortedClients;
    return triageSortedClients.filter((c) => triageBucket(c) === triageFilter);
  }, [triageSortedClients, triageFilter]);

  const runSnapshotHref = useMemo(() => {
    if (clients.length === 0) return "/app/clients/new";
    const sorted = [...clients].sort((a, b) => {
      const o = triageOrder(a) - triageOrder(b);
      if (o !== 0) return o;
      const sa = a.latestScore ?? 999;
      const sb = b.latestScore ?? 999;
      return sa - sb;
    });
    return `/app/clients/${sorted[0]!.id}`;
  }, [clients]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-text-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-app bg-authority-losing/15">
          <svg className="h-6 w-6 text-authority-losing" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-text">Something went wrong</h2>
        <p className="mt-2 text-sm text-text-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-medium text-text-2 hover:text-text">
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <TopBar
        primaryAction={
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Link
              href={runSnapshotHref}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#22c55e] px-3.5 text-[13px] font-semibold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-colors hover:bg-[#16a34a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d10]"
            >
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Run snapshot
            </Link>
            <Link
              href="/app/clients/new"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.06] bg-black/20 px-3.5 text-[13px] font-medium text-text-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors hover:border-white/[0.1] hover:bg-black/30 hover:text-text"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add client
            </Link>
          </div>
        }
        filters={
          <div className="relative w-full">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              placeholder="Search portfolio…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/[0.12] bg-black/25 py-2 pl-9 pr-3 text-[13px] text-text placeholder:text-text-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-colors focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/15"
            />
          </div>
        }
      />

      <div className="flex-1 space-y-2 px-5 pb-5 pt-3 sm:space-y-2.5 sm:px-6 sm:pt-3.5">
        {clients.length > 0 ? (
          <h1 className="font-app-display text-[1.375rem] font-normal leading-tight tracking-tight text-text sm:text-2xl">
            Dashboard
          </h1>
        ) : null}
        {showLogoFailedBanner && (
          <Alert variant="warning" className="flex items-center justify-between gap-4">
            <AlertDescription>
              Logo couldn&apos;t be uploaded during setup. You can add it later in{" "}
              <Link href="/app/settings" className="font-medium underline underline-offset-2 hover:no-underline">
                Settings
              </Link>
              .
            </AlertDescription>
            <button
              type="button"
              onClick={() => setShowLogoFailedBanner(false)}
              className="shrink-0 rounded p-1 text-text-2 hover:bg-white/10 hover:text-text"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Alert>
        )}
        {clients.length > 0 ? (
          <PriorityAlertBar
            clients={filteredClients}
            triageFilter={triageFilter}
            onToggleFilter={(b) => setTriageFilter((f) => (f === b ? null : b))}
          />
        ) : null}
        {clients.length === 0 ? (
          <div className="flex min-h-[min(70vh,640px)] flex-col items-center justify-center py-10 sm:min-h-[min(72vh,680px)] sm:py-14">
            <EmptyState />
          </div>
        ) : triageSortedClients.length === 0 && searchQuery ? (
          <div className="rounded-2xl border border-white/20 bg-[#0B0F14] px-6 py-7 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75">No matches</p>
            <p className="mt-2 text-sm text-white/75">
              Nothing in this portfolio matches <span className="text-text">&quot;{searchQuery}&quot;</span>
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-[13px] font-medium text-text underline-offset-4 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <ClientCardsGrid clients={displayedSortedClients} />
        )}
      </div>
    </>
  );
}
