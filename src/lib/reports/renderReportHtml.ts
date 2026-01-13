import type { Extraction } from "@/lib/extraction/schema";

type ProviderScores = Record<string, number>;

export type ReportData = {
  agency: {
    name: string;
    brand_logo_url?: string | null;
    brand_accent?: string | null;
  };
  client: {
    name: string;
    website?: string | null;
  };
  snapshot: {
    id: string;
    status: string;
    vrtl_score: number | null;
    score_by_provider: ProviderScores | null;
    created_at: string;
    completed_at: string | null;
    prompt_pack_version: string | null;
  };
  competitors: Array<{ name: string; website?: string | null }>;
  responses: Array<{
    prompt_ordinal: number | null;
    prompt_text: string | null;
    parsed_json: Extraction | null;
    raw_text: string | null;
  }>;
};

export function renderReportHtml(data: ReportData): string {
  const {
    agency,
    client,
    snapshot,
    competitors,
    responses
  } = data;

  const competitorCount = competitors.length;
  const confidence =
    competitorCount === 0
      ? { label: "Low", message: "Competitive analysis disabled — add 3+ competitors for full comparison." }
      : competitorCount < 3
      ? { label: "Medium", message: "Competitive analysis limited — add 1–2 more competitors for best results." }
      : { label: "High", message: null };

  let clientMentioned = 0;
  const competitorMentionCounts = new Map<string, number>();

  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned) clientMentioned += 1;
    if (Array.isArray(pj?.competitors_mentioned)) {
      for (const name of pj.competitors_mentioned) {
        competitorMentionCounts.set(name, (competitorMentionCounts.get(name) ?? 0) + 1);
      }
    }
  }

  const topCompetitors = Array.from(competitorMentionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const providerScores = snapshot.score_by_provider
    ? Object.entries(snapshot.score_by_provider)
        .map(([k, v]) => `<div class="pill">${k}: ${v}</div>`)
        .join("")
    : "—";

  const responseBlocks = responses
    .map((r, idx) => {
      const pj = r.parsed_json;
      const snippet =
        pj?.evidence_snippet ??
        (r.raw_text ? truncate(r.raw_text, 180) : "No evidence available");
      return `<div class="card">
        <div class="muted text-xs">Prompt #${r.prompt_ordinal ?? idx + 1}</div>
        <div class="text-sm"><strong>${escapeHtml(r.prompt_text ?? "Prompt")}</strong></div>
        <div class="text-sm">
          client_mentioned: ${pj?.client_mentioned ? "true" : "false"} · position: ${pj?.client_position ?? "—"} · strength: ${pj?.recommendation_strength ?? "—"}
        </div>
        <div class="text-sm">competitors: ${
          pj?.competitors_mentioned && pj.competitors_mentioned.length
            ? pj.competitors_mentioned.map(escapeHtml).join(", ")
            : "—"
        }</div>
        <div class="text-sm">evidence: ${escapeHtml(snippet)}</div>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    :root { --accent: ${agency.brand_accent || "#0f172a"}; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 24px; color: #0f172a; }
    h1,h2,h3 { margin: 0 0 8px; }
    .muted { color: #64748b; }
    .pill { display: inline-block; padding: 4px 8px; margin: 2px 4px 2px 0; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 8px 0; }
    .section { margin: 20px 0; page-break-inside: avoid; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .score { font-size: 28px; font-weight: 700; color: var(--accent); }
    .warn { background: #fef9c3; border: 1px solid #fcd34d; padding: 10px; border-radius: 6px; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; }
    .col { flex: 1 1 220px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="muted text-sm">${formatDate(snapshot.created_at)}</div>
      <h1>${escapeHtml(agency.name)} — ${escapeHtml(client.name)}</h1>
      <div class="muted">${client.website ? escapeHtml(client.website) : ""}</div>
    </div>
    ${agency.brand_logo_url ? `<img src="${escapeHtml(agency.brand_logo_url)}" alt="logo" style="max-height:48px;">` : ""}
  </div>

  <div class="section">
    <div class="score">VRTL Score: ${snapshot.vrtl_score ?? "—"}</div>
    <div class="row">
      <div class="col">
        <div class="muted">Status</div>
        <div>${escapeHtml(snapshot.status)}</div>
      </div>
      <div class="col">
        <div class="muted">Providers</div>
        <div>${providerScores}</div>
      </div>
      <div class="col">
        <div class="muted">Prompt pack</div>
        <div>${escapeHtml(snapshot.prompt_pack_version ?? "—")}</div>
      </div>
    </div>
    ${
      confidence.message
        ? `<div class="warn"><strong>Score confidence: ${confidence.label}</strong> — ${confidence.message}</div>`
        : ""
    }
  </div>

  <div class="section">
    <h2>Competitive summary</h2>
    <div>Client mentioned in ${clientMentioned} response(s)</div>
    <div>Competitor set: ${competitorCount} (${confidence.label} confidence)</div>
    <div class="muted">Top competitor mentions:</div>
    <ul>
      ${
        topCompetitors.length
          ? topCompetitors.map(([name, count]) => `<li>${escapeHtml(name)}: ${count}</li>`).join("")
          : "<li>None</li>"
      }
    </ul>
  </div>

  <div class="section">
    <h2>Evidence by prompt</h2>
    ${responseBlocks || "<div class='muted'>No responses.</div>"}
  </div>
</body>
</html>`;
}

function formatDate(d: string) {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleString();
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return ch;
    }
  });
}

function truncate(str: string, len: number) {
  if (str.length <= len) return str;
  return `${str.slice(0, len)}…`;
}


