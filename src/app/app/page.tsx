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

/** 3px left bar color for Risk Map cells (no full-cell tint) */
function getAuthorityStateBar(state: AuthorityState): string {
  if (state === "Dominant") return "border-l-authority-dominant";
  if (state === "Stable") return "border-l-authority-stable";
  if (state === "Watchlist") return "border-l-authority-watchlist";
  return "border-l-authority-losing";
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
    state === "Dominant" ? "bg-authority-dominant/90" :
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
    <span className="inline-flex items-center rounded-app border border-white/5 bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-2">
      <ModelDot model={model} />
      {displayModelName(model)}
    </span>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-text-3">—</span>;
  if (value === 0) return <span className="tabular-nums text-text-2">0</span>;
  return (
    <span className={cn("tabular-nums font-medium", value > 0 ? "text-authority-dominant" : "text-authority-losing")}>
      {value > 0 ? "+" : "−"}{Math.abs(value)}
    </span>
  );
}

/** Momentum = gap direction: ▲ widening (red), ▼ narrowing (green), — stable (gray). No animation. */
function MomentumArrow({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) return <span className="text-text-2">—</span>;
  if (delta < 0) return <span className="text-authority-losing" aria-label="Widening gap">▲</span>;
  return <span className="text-authority-dominant" aria-label="Narrowing gap">▼</span>;
}

function TrendArrow({ value }: { value: number | null }) {
  return <MomentumArrow delta={value} />;
}

function ModelDot({ model }: { model: string | null }) {
  if (!model) return null;
  const p = (model || "").toLowerCase();
  const color = p.includes("openai") || p.includes("chatgpt") ? "bg-authority-dominant"
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
  if (state === "Dominant") return "Leading across all tracked models";
  if (state === "Losing Ground") {
    return wm ? `Authority failure on ${wm}. Act now.` : "Critical authority gap. Act now.";
  }
  if (state === "Watchlist") {
    return wm ? `Losing ground on ${wm}. Needs attention.` : "Flagged for monitoring. Run a snapshot to diagnose.";
  }
  return "Stable authority signal. Monitor weak channels.";
}

const CARD_STATUS_STYLES: Record<
  "dominant" | "watchlist" | "stable" | "losing",
  { bg: string; color: string; label: string }
> = {
  dominant: { bg: "#EAF3DE", color: "#3B6D11", label: "Dominant" },
  watchlist: { bg: "#FAEEDA", color: "#854F0B", label: "Watchlist" },
  stable: { bg: "rgba(148, 163, 184, 0.2)", color: "#CBD5E1", label: "Stable" },
  losing: { bg: "#FCEBEB", color: "#A32D2D", label: "Losing ground" },
};

function CardStatusBadge({ bucket }: { bucket: TriageBucket }) {
  const key = bucket === "losing" ? "losing" : bucket === "watchlist" ? "watchlist" : bucket === "stable" ? "stable" : "dominant";
  const s = CARD_STATUS_STYLES[key];
  return (
    <span
      className="shrink-0 rounded-[20px] font-medium"
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 9px",
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

function CardDeltaBadge({ delta }: { delta: number }) {
  const neg = delta < 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-[20px] font-medium tabular-nums"
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "3px 9px",
        borderRadius: 20,
        background: neg ? "#FCEBEB" : "#EAF3DE",
        color: neg ? "#A32D2D" : "#3B6D11",
      }}
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

  const pillClass = (b: TriageBucket) =>
    cn(
      "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
      triageFilter === b
        ? "border-white/20 bg-white/[0.08] text-text"
        : "border-white/[0.08] bg-transparent text-text-2 hover:border-white/15 hover:text-text"
    );

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-white/[0.12] py-2.5 text-[13px]">
      {stable ? (
        <>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#639922]" aria-hidden />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="font-medium text-text">All clients stable</span>
            <span className="text-text-2">· {portfolioLastSnapshotLabel(clients)}</span>
          </div>
        </>
      ) : (
        <>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E24B4A]" aria-hidden />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="font-medium text-text">
              {attention.length} client{attention.length === 1 ? "" : "s"}{" "}
              {attention.length === 1 ? "needs" : "need"} attention
            </span>
            <span className="text-text-2">
              → {attention[0]!.name}
              {(() => {
                const d = attentionDetailSuffix(attention[0]!);
                return d ? ` ${d}` : "";
              })()}
              {attention.length > 1
                ? `, ${attention
                    .slice(1, 3)
                    .map((c) => c.name)
                    .join(", ")}${attention.length > 3 ? ", …" : ""}`
                : ""}
            </span>
          </div>
          {attention.length > 1 ? (
            <a href="#clients-overview" className="shrink-0 text-[12px] text-text-2 no-underline hover:text-text">
              View all
            </a>
          ) : null}
        </>
      )}
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto">
        {(["losing", "watchlist", "dominant"] as const).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onToggleFilter(b)}
            className={pillClass(b)}
          >
            {b === "losing" ? "Losing Ground" : b === "watchlist" ? "Watchlist" : "Dominant"}
          </button>
        ))}
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
        "client-card group flex h-full min-h-[200px] cursor-pointer flex-col rounded-[12px] border border-white/[0.12] bg-surface p-5 transition-[border-color] duration-150",
        "hover:border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      )}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden bg-white/[0.06]"
          style={{ borderRadius: 6 }}
        >
          {faviconUrl ? (
            <img src={faviconUrl} alt="" className="h-[18px] w-[18px] object-contain" width={18} height={18} />
          ) : (
            <span className="text-[10px] font-medium text-text-3">{client.name.charAt(0)}</span>
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-text">{client.name}</span>
        <CardStatusBadge bucket={bucket} />
        <svg
          width={16}
          height={16}
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0 text-text-3"
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
        <>
          <div className="flex flex-1 flex-col items-start justify-center gap-3 py-2">
            <span className="text-[13px] text-text-3">No snapshot data</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/app/clients/${client.id}`);
              }}
              className="cursor-pointer rounded-lg border border-white/15 bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-text-2 transition-colors hover:border-white/25 hover:text-text"
            >
              Run snapshot
            </button>
          </div>
          <div
            className="mt-auto border-t border-white/[0.12]"
            style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 0.5 }}
            aria-hidden
          />
        </>
      ) : (
        <>
          <div className="mb-2 flex items-baseline gap-2.5">
            <span
              className="tabular-nums text-text"
              style={{ fontSize: 48, fontWeight: 500, letterSpacing: "-2px", lineHeight: 1 }}
            >
              {client.latestScore}
            </span>
            {showDelta ? <CardDeltaBadge delta={delta!} /> : null}
          </div>
          <p className="mb-auto flex-1 text-[13px] leading-snug text-text-2" style={{ lineHeight: 1.4 }}>
            {story}
          </p>
          <div
            className="mt-3 flex flex-wrap items-center gap-4 border-t border-white/[0.12]"
            style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 0.5 }}
          >
            {weakestLabel ? (
              <span className="text-[12px] text-text-3">
                Weakest
                <span className="ml-1.5 font-medium text-text-2">{weakestLabel}</span>
              </span>
            ) : null}
            {showDisplacer ? (
              <span className="text-[12px] text-text-3">
                Displaced by
                <span className="ml-1.5 font-medium text-text-2">{displacer}</span>
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

function ClientCardsGrid({ clients }: { clients: ClientWithStats[] }) {
  return (
    <section id="clients-overview">
      <div
        className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3"
        style={{ gap: 16 }}
      >
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
      <section className="rounded-app-lg border border-white/5 bg-surface">
        <div className="px-3 py-2 text-xs text-text-2">Portfolio stable. No widening gaps detected.</div>
      </section>
    );
  }

  return (
    <section className="rounded-app-lg border border-white/5 bg-surface overflow-hidden">
      <div className="border-b border-white/5 px-3 py-2">
        <h2 className="text-sm font-semibold text-text">Clients Requiring Attention</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-white/5 bg-surface-2/60">
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
                <tr key={c.id} className="border-b border-white/5 last:border-b-0">
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
    <section className="space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-text-3">Model Exposure</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MODEL_FAMILIES.map((family) => {
          const d = byModel[family];
          const avgGap = d.gapCount > 0 ? Math.round(d.gapSum / d.gapCount) : null;
          const avgIndex = d.analyzed > 0 ? Math.round(d.scoreSum / d.analyzed) : null;
          return (
            <div key={family} className="rounded-app-lg border border-white/5 bg-surface p-4">
              <div className="text-xs font-medium text-text-2 mb-2">{modelFamilyLabel(family)}</div>
              <div className="text-2xl font-semibold tabular-nums text-text">{d.analyzed}<span className="text-sm font-normal text-text-3">/{totalClients}</span></div>
              <div className="text-[10px] text-text-3 mt-0.5">clients analyzed</div>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs">
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
    <td className="w-20 min-w-[4.5rem] bg-surface px-0 py-0 align-top text-right" title={title}>
      <div className={cn("flex flex-col border-l-[3px] py-1 pl-1.5 pr-1.5 text-right", stateBar)}>
        <span className="text-lg font-semibold tabular-nums text-text leading-tight">{score ?? "—"}</span>
        {deltaFormatted !== null && (
          <span className={cn("text-[10px] tabular-nums", delta !== null && delta < 0 ? "text-authority-losing" : "text-authority-dominant")}>
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
    <section className="rounded-app-lg border border-white/5 bg-surface overflow-hidden">
      <div className="border-b border-white/5 px-3 py-2">
        <h2 className="text-sm font-semibold text-text">AI Authority Risk Map</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-white/5 bg-surface-2/60">
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
                <tr key={client.id} className="border-b border-white/5 last:border-b-0">
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
      <section className="rounded-app-lg border border-white/5 bg-surface px-3 py-2">
        <span className="text-xs text-text-2">System status: No competitive threats above threshold.</span>
      </section>
    );
  }

  return (
    <section className="rounded-app-lg border border-white/5 bg-surface overflow-hidden">
      <div className="border-b border-white/5 px-3 py-2">
        <h2 className="text-sm font-semibold text-text">Top Competitive Threats</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-white/5 bg-surface-2/60">
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
                <tr key={c.id} className="border-b border-white/5 last:border-b-0">
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
  if (score >= 70) return <span className="h-2.5 w-2.5 rounded-full bg-authority-dominant" />;
  if (score >= 40) return <span className="h-2.5 w-2.5 rounded-full bg-authority-watchlist" />;
  return <span className="h-2.5 w-2.5 rounded-full bg-authority-losing" />;
}

function ClientTable({ clients }: { clients: ClientWithStats[] }) {
  const router = useRouter();

  return (
    <div className="rounded-app-lg border border-white/5 bg-surface overflow-hidden">
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-white/5 bg-surface-2/60">
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
                  "border-b border-white/5 last:border-b-0 transition-colors",
                  hasNoData ? "bg-surface-2/40 hover:bg-surface-2/60" : "cursor-pointer hover:bg-surface-2/50"
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
                          className="ml-2 inline-flex items-center gap-1 rounded-app border border-white/10 bg-surface px-2 py-1 text-[11px] font-medium text-text transition-colors hover:bg-surface-2"
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
    <div className="mx-auto max-w-md rounded-app-lg border border-dashed border-white/10 bg-surface/50 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-app bg-surface-2">
        <svg className="h-6 w-6 text-text-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 className="mt-4 text-base font-semibold text-text">Add your first client</h2>
      <p className="mt-1 text-sm text-text-2">Add a client to start measuring AI authority.</p>
      <Link
        href="/app/clients/new"
        className="mt-6 inline-flex items-center gap-2 rounded-app border border-white/10 bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add client
      </Link>
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
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={runSnapshotHref}
              className="inline-flex h-9 items-center gap-2 rounded-app border border-white/15 bg-white/[0.07] px-3 text-sm font-medium text-text transition-colors hover:bg-white/10"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Run snapshot
            </Link>
            <Link
              href="/app/clients/new"
              className="inline-flex h-9 items-center gap-2 rounded-app border border-white/10 bg-surface px-3.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add client
            </Link>
          </div>
        }
        filters={
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-44 rounded-app border border-white/10 bg-surface px-3 text-sm text-text placeholder:text-text-3 focus:border-white/20 focus:outline-none"
          />
        }
      />

      <div className="flex-1 space-y-4 p-6">
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
          <EmptyState />
        ) : triageSortedClients.length === 0 && searchQuery ? (
          <div className="rounded-app-lg border border-white/5 bg-surface/50 py-4 text-center">
            <p className="text-xs text-text-2">No clients match &quot;{searchQuery}&quot;</p>
            <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-text hover:underline">
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
