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

  const providerBars = snapshot.score_by_provider
    ? `<div class="bars">
        ${Object.entries(snapshot.score_by_provider)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([k, v]) => {
            const pct = Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
            return `<div class="barRow">
              <div class="barLabel">${escapeHtml(k)}</div>
              <div class="barTrack"><div class="barFill" style="width:${pct}%"></div></div>
              <div class="barValue">${pct}</div>
            </div>`;
          })
          .join("")}
      </div>`
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
        <div class="cardTop">
          <div class="muted text-xs">Prompt #${r.prompt_ordinal ?? idx + 1}</div>
          <div class="pill small">${pj?.client_position ?? "—"}</div>
          <div class="pill small">${pj?.recommendation_strength ?? "—"}</div>
          <div class="pill small">${pj?.client_mentioned ? "mentioned" : "not mentioned"}</div>
        </div>
        <div class="promptTitle">${escapeHtml(r.prompt_text ?? "Prompt")}</div>
        <div class="text-sm muted">Competitors mentioned: ${
          pj?.competitors_mentioned && pj.competitors_mentioned.length
            ? pj.competitors_mentioned.map(escapeHtml).join(", ")
            : "—"
        }</div>
        <div class="evidence">
          <div class="evidenceLabel">Evidence</div>
          <div class="evidenceText">${escapeHtml(snippet)}</div>
        </div>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    :root { --accent: ${agency.brand_accent || "#0f172a"}; }
    html, body { margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; font-size: 13px; line-height: 1.35; }
    h1,h2,h3 { margin: 0 0 10px; letter-spacing: -0.01em; }
    h2 { font-size: 16px; }
    .muted { color: #64748b; }
    .pill { display: inline-block; padding: 4px 8px; margin: 2px 6px 2px 0; border: 1px solid #e2e8f0; border-radius: 999px; font-size: 12px; background: #fff; }
    .pill.small { font-size: 11px; padding: 3px 8px; }
    .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin: 10px 0; background: #fff; }
    .section { margin: 18px 0; page-break-inside: avoid; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .warn { background: #fef9c3; border: 1px solid #fcd34d; padding: 10px; border-radius: 6px; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; }
    .col { flex: 1 1 220px; }
    .cover { border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; margin: 0 0 18px; background: linear-gradient(180deg, rgba(15,23,42,0.02), rgba(15,23,42,0.00)); page-break-after: always; }
    .coverTitle { font-size: 30px; font-weight: 900; letter-spacing: -0.03em; }
    .coverSub { margin-top: 10px; }
    .coverMeta { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; }
    .metaItem { border-top: 1px solid #e2e8f0; padding-top: 8px; }
    .scoreGrid { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 12px; }
    .scoreBlock { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; background: #ffffff; }
    .scoreLabel { font-size: 12px; color: #64748b; }
    .scoreValue { font-size: 38px; font-weight: 900; color: var(--accent); letter-spacing: -0.02em; }
    .table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .table th, .table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
    .table th { background: #f8fafc; }
    .cardTitle { font-weight: 700; margin-bottom: 6px; }
    .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
    .promptTitle { font-weight: 800; margin: 6px 0 8px; }
    .cardTop { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .evidence { margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; background: rgba(15,23,42,0.02); }
    .evidenceLabel { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .evidenceText { font-size: 13px; }
    .bars { margin-top: 10px; display: grid; gap: 8px; }
    .barRow { display: grid; grid-template-columns: 120px 1fr 34px; align-items: center; gap: 10px; }
    .barLabel { font-size: 12px; color: #0f172a; }
    .barTrack { height: 10px; border: 1px solid #e2e8f0; background: #fff; border-radius: 999px; overflow: hidden; }
    .barFill { height: 100%; background: linear-gradient(90deg, var(--accent), rgba(15,23,42,0.30)); }
    .barValue { text-align: right; font-size: 12px; color: #0f172a; font-variant-numeric: tabular-nums; }
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
        <div class="coverMeta">
          <div class="metaItem">
            <div class="muted text-xs">Snapshot</div>
            <div class="text-sm">${escapeHtml(snapshot.id)}</div>
          </div>
          <div class="metaItem">
            <div class="muted text-xs">Prompt pack</div>
            <div class="text-sm">${escapeHtml(snapshot.prompt_pack_version ?? "—")}</div>
          </div>
          <div class="metaItem">
            <div class="muted text-xs">Status</div>
            <div class="text-sm">${escapeHtml(snapshot.status)}</div>
          </div>
          <div class="metaItem">
            <div class="muted text-xs">Completed</div>
            <div class="text-sm">${snapshot.completed_at ? formatDate(snapshot.completed_at) : "—"}</div>
          </div>
        </div>
      </div>
      ${agency.brand_logo_url ? `<img src="${escapeHtml(agency.brand_logo_url)}" alt="logo" style="max-height:54px;">` : ""}
    </div>
  </div>

  <div class="section">
    <div class="scoreGrid">
      <div class="scoreBlock">
        <div class="scoreLabel">VRTL Score</div>
        <div class="scoreValue">${snapshot.vrtl_score ?? "—"}</div>
        <div class="muted text-sm">Confidence: ${confidence.label}</div>
      </div>
      <div class="scoreBlock">
        <div class="scoreLabel">Provider comparison</div>
        ${providerBars}
      </div>
      <div class="scoreBlock">
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
    <h2>Provider details</h2>
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


