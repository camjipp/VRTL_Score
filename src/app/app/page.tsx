"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

// Model color dot (ChatGPT=emerald, Gemini=amber, Claude=rose)
function ModelDot({ model }: { model: string | null }) {
  if (!model) return null;
  const p = (model || "").toLowerCase();
  const color = p.includes("openai") || p.includes("chatgpt") ? "bg-emerald-500"
    : p.includes("gemini") || p.includes("google") ? "bg-amber-500"
    : p.includes("anthropic") || p.includes("claude") ? "bg-rose-500"
    : "bg-zinc-400";
  return <span className={cn("mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full", color)} aria-hidden />;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function getAuthorityStateTone(state: AuthorityState): string {
  if (state === "Dominant") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (state === "Watchlist") return "bg-amber-50 text-amber-700 border-amber-200";
  if (state === "Losing Ground") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-zinc-100 text-zinc-700 border-zinc-200";
}


function StatusPill({ state }: { state: AuthorityState }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold", getAuthorityStateTone(state))}>
      {state}
    </span>
  );
}

function ModelPill({ model }: { model: string | null }) {
  if (!model) {
    return <span className="text-xs text-zinc-400">—</span>;
  }
  return (
    <span className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs font-semibold text-zinc-800">
      <ModelDot model={model} />
      {displayModelName(model)}
    </span>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-zinc-400">—</span>;
  if (value === 0) return <span className="text-zinc-500 tabular-nums">0</span>;
  return (
    <span className={cn("font-semibold tabular-nums", value > 0 ? "text-emerald-600" : "text-rose-600")}>
      {value > 0 ? "+" : "−"}{Math.abs(value)}
    </span>
  );
}

function stateDot(state: AuthorityState): string {
  if (state === "Dominant") return "bg-emerald-500";
  if (state === "Watchlist") return "bg-amber-500";
  if (state === "Losing Ground") return "bg-rose-500";
  return "bg-zinc-400";
}

function AuthorityBrief({ stats, clients }: { stats: PortfolioStats; clients: ClientWithStats[] }) {
  const rankedRisk = [...clients]
    .filter((c) => getAuthorityState(c) === "Losing Ground")
    .sort((a, b) => (b.authorityGap ?? 0) - (a.authorityGap ?? 0));
  const topRisk = rankedRisk[0] ?? null;

  const dominant = clients.filter((c) => getAuthorityState(c) === "Dominant").length;
  const stable = clients.filter((c) => getAuthorityState(c) === "Stable").length;
  const watchlist = clients.filter((c) => getAuthorityState(c) === "Watchlist").length;
  const losing = clients.filter((c) => getAuthorityState(c) === "Losing Ground").length;

  const lastSnapshotAt = clients
    .map((c) => c.lastSnapshotAt)
    .filter((d): d is string => !!d)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

  return (
    <section className="border-b border-zinc-200/60">
      <div className="grid gap-6 py-8 lg:grid-cols-12">
        {/* Left: key risk / alert narrative */}
        <div className="lg:col-span-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500">AI Authority Brief</div>
              <div className="mt-2 text-sm font-medium text-zinc-600">
                Competitive position across ChatGPT, Gemini, Claude
              </div>
            </div>
          </div>

          <div className="mt-6">
            {topRisk ? (
              <div className="rounded-xl border border-rose-200/70 bg-rose-50/40 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-rose-900">
                      {losing} Account{losing === 1 ? "" : "s"} Losing Ground
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-zinc-800">
                      <span className="font-semibold text-zinc-900">{topRisk.name}</span>
                      <span className="text-zinc-400">—</span>
                      <span className="inline-flex items-center font-semibold text-zinc-800">
                        <ModelDot model={topRisk.worstModel} />
                        {topRisk.worstModel ? displayModelName(topRisk.worstModel) : "—"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-1.5 text-sm text-zinc-700">
                      <div>
                        <span className="text-zinc-500">Primary Displacer:</span>{" "}
                        <span className="font-semibold text-zinc-900">{topRisk.primaryDisplacer ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Authority Gap:</span>{" "}
                        <span className="font-semibold text-zinc-900">
                          {topRisk.authorityGap != null ? `−${topRisk.authorityGap}` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/app/clients/${topRisk.id}#cross-model`}
                    className="inline-flex shrink-0 items-center rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
                  >
                    View competitive breakdown →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-5">
                <div className="text-sm font-bold text-zinc-900">No authority loss detected</div>
                <div className="mt-2 text-sm text-zinc-600">Review accounts for early Watchlist signals.</div>
                <a
                  href="#accounts"
                  className="mt-3 inline-flex items-center text-sm font-semibold text-zinc-900 hover:text-zinc-700"
                >
                  Review accounts →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right: portfolio totals stack */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Portfolio AI Authority</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900">{stats.avgScore}</div>
              <div className="text-xs font-semibold text-zinc-500">AAI</div>
            </div>

            <div className="mt-4 flex flex-nowrap items-center gap-x-1.5 overflow-x-auto text-xs text-zinc-600">
              <span className="whitespace-nowrap"><span className="font-semibold text-emerald-700">{dominant}</span> Dominant</span>
              <span className="text-zinc-300 shrink-0">·</span>
              <span className="whitespace-nowrap"><span className="font-semibold text-zinc-800">{stable}</span> Stable</span>
              <span className="text-zinc-300 shrink-0">·</span>
              <span className="whitespace-nowrap"><span className="font-semibold text-amber-700">{watchlist}</span> Watchlist</span>
              <span className="text-zinc-300 shrink-0">·</span>
              <span className="whitespace-nowrap"><span className="font-semibold text-rose-700">{losing}</span> Losing</span>
            </div>

            {lastSnapshotAt ? (
              <div className="mt-4 text-xs text-zinc-500">
                Last snapshot <span className="font-medium text-zinc-700">{timeAgo(lastSnapshotAt)}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthorityShifts({ clients }: { clients: ClientWithStats[] }) {
  const rows = useMemo(() => {
    const severity = (s: AuthorityState) =>
      s === "Losing Ground" ? 0 : s === "Watchlist" ? 1 : s === "Stable" ? 2 : 3;

    return clients
      .map((c) => {
        const state = getAuthorityState(c);
        const delta = c.latestScore !== null && c.previousScore !== null ? c.latestScore - c.previousScore : null;
        return { client: c, state, delta };
      })
      .filter((r) => {
        if (r.state === "Losing Ground") return true;
        if (r.state === "Watchlist" && (r.delta === null || r.delta <= 0)) return true;
        return r.delta !== null && r.delta < 0;
      })
      .sort((a, b) => {
        const s = severity(a.state) - severity(b.state);
        if (s !== 0) return s;
        const d = (a.delta ?? 0) - (b.delta ?? 0); // more negative first
        if (d !== 0) return d;
        return (b.client.authorityGap ?? 0) - (a.client.authorityGap ?? 0);
      })
      .slice(0, 8);
  }, [clients]);

  return (
    <section className="border-b border-zinc-200/60 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500">Authority Shifts</div>
          <div className="mt-1 text-sm font-semibold text-zinc-700">Where authority is shifting</div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200/80 bg-white">
        <div className="divide-y divide-zinc-200/60">
          {rows.length === 0 ? (
            <div className="px-4 py-5 text-sm text-zinc-600">
              No meaningful shifts in the latest snapshot.
            </div>
          ) : (
            rows.map(({ client, state, delta }) => (
              <Link
                key={client.id}
                href={`/app/clients/${client.id}#cross-model`}
                className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-zinc-50/70"
              >
                <div className="col-span-3 flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", stateDot(state))} aria-hidden />
                  <StatusPill state={state} />
                </div>
                <div className="col-span-3 min-w-0 font-semibold text-zinc-900 truncate">{client.name}</div>
                <div className="col-span-2">
                  <ModelPill model={client.worstModel} />
                </div>
                <div className="col-span-1 text-right">
                  <Delta value={delta} />
                </div>
                <div className="col-span-3 min-w-0 text-zinc-600 truncate">
                  <span className="text-zinc-500">Displacer:</span>{" "}
                  <span className="font-medium text-zinc-700">{client.primaryDisplacer ?? "—"}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function AuthorityLeaders({ clients }: { clients: ClientWithStats[] }) {
  const overallLeader = useMemo(() => {
    return [...clients]
      .filter((c) => typeof c.latestScore === "number")
      .sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0))[0] ?? null;
  }, [clients]);

  const leaders = useMemo(() => {
    const families: ModelFamily[] = ["chatgpt", "gemini", "claude"];
    return families.map((family) => {
      const ranked = [...clients]
        .map((c) => ({ client: c, score: c.providerFamilyScores?.[family] ?? null }))
        .filter((x) => typeof x.score === "number")
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

      if (ranked.length > 0) {
        return { family, leader: ranked[0].client, score: ranked[0].score as number, proxy: false as const };
      }

      if (overallLeader && overallLeader.latestScore !== null) {
        return { family, leader: overallLeader, score: overallLeader.latestScore, proxy: true as const };
      }

      return { family, leader: null, score: null, proxy: true as const };
    });
  }, [clients, overallLeader]);

  return (
    <section className="border-b border-zinc-200/60 py-8">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500">Authority Leaders</div>
        <div className="mt-1 text-sm font-semibold text-zinc-700">Authority Leaders by Model</div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {leaders.map(({ family, leader, score, proxy }) => {
          const leaderState = leader ? getAuthorityState(leader) : null;
          return (
            <div key={family} className="rounded-xl border border-zinc-200/80 bg-white p-5">
              <div className="text-sm font-bold text-zinc-900">{modelFamilyLabel(family)}</div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-zinc-900 truncate">{leader?.name ?? "—"}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <div className="text-2xl font-bold tabular-nums text-zinc-900">{score ?? "—"}</div>
                  <div className="text-xs font-semibold text-zinc-500">AAI</div>
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  {proxy ? "Leader (proxy)" : leaderState === "Dominant" ? "Dominant" : "Leader"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Status indicator
function StatusDot({ score, status }: { score: number | null; status: string }) {
  if (status === "running") {
    return <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />;
  }
  if (score === null) return <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />;
  if (score >= 70) return <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />;
  if (score >= 40) return <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />;
  return <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />;
}

function ClientTable({ clients }: { clients: ClientWithStats[] }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/80">
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Account</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">AI Authority</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Index</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Trend</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Primary Displacer</th>
            <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Weakest Model</th>
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
                  "group border-b border-zinc-100 last:border-b-0 transition-colors",
                  hasNoData ? "bg-amber-50/40 hover:bg-amber-50/60" : "cursor-pointer hover:bg-zinc-50/80"
                )}
              >
                {hasNoData ? (
                  <td colSpan={6} className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <StatusDot score={client.latestScore} status={client.status} />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-zinc-900">{client.name}</span>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <span className="text-[12px] font-medium text-zinc-600">Analyze AI authority across major models</span>
                          <Link
                            href={`/app/clients/${client.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 hover:border-zinc-400"
                          >
                            Run snapshot
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <StatusDot score={client.latestScore} status={client.status} />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-zinc-900">{client.name}</span>
                          {client.website ? (
                            <div className="text-[11px] font-medium text-zinc-500">{displayUrl(client.website)}</div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill state={state} />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-bold tabular-nums text-zinc-900">{client.latestScore ?? "—"}</span>
                    </td>
                    <td className="px-3 py-2">
                      <Delta value={delta} />
                    </td>
                    <td className="px-3 py-2 text-[12px] text-zinc-700">
                      {client.primaryDisplacer ? (
                        <span className="font-medium">
                          {client.primaryDisplacer}
                          {client.authorityGap != null ? ` · Gap ${client.authorityGap} pts` : ""}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[12px] font-medium text-zinc-700">
                      {client.worstModel ? (
                        <Link
                          href={`/app/clients/${client.id}#cross-model`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center text-zinc-800 hover:text-zinc-900 hover:underline no-underline font-semibold"
                        >
                          <ModelPill model={client.worstModel} />
                        </Link>
                      ) : (
                        "—"
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

// Empty state — intentional design with dashed border + CTA
function EmptyState() {
  return (
    <div className="empty-state-card mx-auto max-w-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
        <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">Add your first client</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Track how AI models like ChatGPT, Claude, and Gemini talk about your clients.
      </p>
      <Link
        href="/app/clients/new"
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
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
  const [sortBy, setSortBy] = useState<"name" | "score" | "updated">("updated");
  const [filterHealth, setFilterHealth] = useState<"all" | "dominant" | "stable" | "watchlist" | "losing">("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Filter and sort
  const filteredClients = useMemo(() => {
    let result = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.website && c.website.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filterHealth !== "all") {
      result = result.filter(c => {
        const state = getAuthorityState(c);
        if (filterHealth === "dominant") return state === "Dominant";
        if (filterHealth === "stable") return state === "Stable";
        if (filterHealth === "watchlist") return state === "Watchlist";
        if (filterHealth === "losing") return state === "Losing Ground";
        return true;
      });
    }

    if (sortBy === "score") {
      result.sort((a, b) => {
        if (a.latestScore === null && b.latestScore === null) return 0;
        if (a.latestScore === null) return 1;
        if (b.latestScore === null) return -1;
        return b.latestScore - a.latestScore;
      });
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => {
        if (!a.lastSnapshotAt && !b.lastSnapshotAt) return 0;
        if (!a.lastSnapshotAt) return 1;
        if (!b.lastSnapshotAt) return -1;
        return new Date(b.lastSnapshotAt).getTime() - new Date(a.lastSnapshotAt).getTime();
      });
    }

    return result;
  }, [clients, searchQuery, filterHealth, sortBy]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
          <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-zinc-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-medium text-zinc-700 hover:text-zinc-900">
          Try again
        </button>
      </div>
    );
  }

  if (clients.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-10">
      {portfolioStats ? (
        <div className="rounded-2xl border border-zinc-200/80 bg-white px-6">
          {/* 1) AUTHORITY BRIEF */}
          <AuthorityBrief stats={portfolioStats} clients={clients} />

          <div className="grid gap-10 lg:grid-cols-12">
            {/* 2) AUTHORITY SHIFTS */}
            <div className="lg:col-span-7">
              <AuthorityShifts clients={clients} />
            </div>

            {/* 3) AUTHORITY LEADERS */}
            <div className="lg:col-span-5">
              <AuthorityLeaders clients={clients} />
            </div>
          </div>
        </div>
      ) : null}

      {/* 4) ACCOUNTS TABLE */}
      <section id="accounts" className="space-y-4 pt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500">Accounts</div>
            <div className="mt-1 text-sm font-semibold text-zinc-700">
              {filteredClients.length} of {clients.length} account{clients.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value as "all" | "dominant" | "stable" | "watchlist" | "losing")}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
            >
              <option value="all">All states</option>
              <option value="dominant">Dominant</option>
              <option value="stable">Stable</option>
              <option value="watchlist">Watchlist</option>
              <option value="losing">Losing ground</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "score" | "updated")}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
            >
              <option value="updated">Last updated</option>
              <option value="score">Index</option>
              <option value="name">Name</option>
            </select>

            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-48 rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
              />
            </div>

            <Link
              href="/app/clients/new"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/70 px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100/80 hover:border-zinc-300 hover:text-zinc-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">Add account</span>
            </Link>
          </div>
        </div>

        {filteredClients.length === 0 && searchQuery ? (
          <div className="empty-state-card py-12">
            <p className="text-sm font-medium text-zinc-700">No accounts match &quot;{searchQuery}&quot;</p>
            <button onClick={() => setSearchQuery("")} className="mt-3 text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Clear search
            </button>
          </div>
        ) : filteredClients.length === 0 && filterHealth !== "all" ? (
          <div className="empty-state-card py-12">
            <p className="text-sm font-medium text-zinc-700">No {filterHealth} accounts found</p>
            <button onClick={() => setFilterHealth("all")} className="mt-3 text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Clear filter
            </button>
          </div>
        ) : (
          <ClientTable clients={filteredClients} />
        )}
      </section>
    </div>
  );
}
