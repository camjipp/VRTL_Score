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
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, v]) => `<div class="pill">${escapeHtml(k)}: ${v}</div>`)
        .join("")
    : "—";

  const providerTable = snapshot.score_by_provider
    ? `<table class="table">
        <thead><tr><th>Provider</th><th>Score</th></tr></thead>
        <tbody>
          ${Object.entries(snapshot.score_by_provider)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${v}</td></tr>`)
            .join("")}
        </tbody>
      </table>`
    : `<div class="muted">—</div>`;

  const competitorMentionsTable = `<table class="table">
    <thead><tr><th>Competitor</th><th>Mentions</th></tr></thead>
    <tbody>
      ${
        topCompetitors.length
          ? topCompetitors
              .map(([name, count]) => `<tr><td>${escapeHtml(name)}</td><td>${count}</td></tr>`)
              .join("")
          : "<tr><td class='muted' colspan='2'>None</td></tr>"
      }
    </tbody>
  </table>`;

  const score = snapshot.vrtl_score ?? null;
  const actions: Array<{ title: string; detail: string }> = [];
  if (competitorCount < 3) {
    actions.push({
      title: "Add 3+ competitors",
      detail: "This improves competitive comparisons and makes the score more reliable."
    });
  }
  if (score !== null && score < 50) {
    actions.push({
      title: "Improve positioning in AI recommendations",
      detail: "Aim for more ‘top’ placements and stronger recommendations across prompts."
    });
  } else {
    actions.push({
      title: "Maintain coverage & credibility",
      detail: "Keep sources/citations and concrete feature evidence present in responses."
    });
  }
  actions.push({
    title: "Re-run after key changes",
    detail: "Re-run snapshots after changing messaging, website content, or competitor set."
  });
  const actionsHtml = `<div class="row">
    ${actions.slice(0, 3).map((a) => `<div class="card">
      <div class="cardTitle">${escapeHtml(a.title)}</div>
      <div class="text-sm muted">${escapeHtml(a.detail)}</div>
    </div>`).join("")}
  </div>`;

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
    .cover { border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 18px; }
    .coverTitle { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
    .coverSub { margin-top: 8px; }
    .scoreBlock { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: #ffffff; }
    .scoreLabel { font-size: 12px; color: #64748b; }
    .scoreValue { font-size: 34px; font-weight: 800; color: var(--accent); }
    .table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .table th, .table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
    .table th { background: #f8fafc; }
    .cardTitle { font-weight: 700; margin-bottom: 6px; }
    .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="cover">
    <div class="header">
      <div>
        <div class="muted text-sm">${formatDate(snapshot.created_at)}</div>
        <div class="coverTitle">VRTL Score Report</div>
        <div class="coverSub">
          <div><strong>${escapeHtml(client.name)}</strong></div>
          <div class="muted">${escapeHtml(agency.name)}${client.website ? ` · ${escapeHtml(client.website)}` : ""}</div>
        </div>
      </div>
      ${agency.brand_logo_url ? `<img src="${escapeHtml(agency.brand_logo_url)}" alt="logo" style="max-height:54px;">` : ""}
    </div>
  </div>

  <div class="section">
    <div class="row">
      <div class="col scoreBlock">
        <div class="scoreLabel">VRTL Score</div>
        <div class="scoreValue">${snapshot.vrtl_score ?? "—"}</div>
        <div class="muted text-sm">Confidence: ${confidence.label}</div>
      </div>
      <div class="col scoreBlock">
        <div class="scoreLabel">Providers</div>
        <div>${providerScores}</div>
        <div class="muted text-sm">Prompt pack: ${escapeHtml(snapshot.prompt_pack_version ?? "—")}</div>
        <div class="muted text-sm">Status: ${escapeHtml(snapshot.status)}</div>
      </div>
      <div class="col scoreBlock">
        <div class="scoreLabel">Coverage</div>
        <div class="text-sm">Client mentioned in <strong>${clientMentioned}</strong> response(s)</div>
        <div class="muted text-sm">Competitors in set: ${competitorCount}</div>
      </div>
    </div>
    ${
      confidence.message
        ? `<div class="warn"><strong>Score confidence: ${confidence.label}</strong> — ${confidence.message}</div>`
        : ""
    }
  </div>

  <div class="section">
    <h2>Provider comparison</h2>
    ${providerTable}
  </div>

  <div class="section">
    <h2>Competitor mentions</h2>
    <div class="muted text-sm">Top competitors mentioned across prompts</div>
    ${competitorMentionsTable}
  </div>

  <div class="section">
    <h2>3 actions</h2>
    ${actionsHtml}
  </div>

  <div class="section">
    <h2>Evidence by prompt</h2>
    ${responseBlocks || "<div class='muted'>No responses.</div>"}
  </div>

  <div class="footer">
    Prepared by ${escapeHtml(agency.name)}
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


