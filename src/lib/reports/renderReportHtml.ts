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

function getScoreColor(score: number | null): string {
  if (score === null) return "#64748b";
  if (score >= 70) return "#059669";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

function getScoreLabel(score: number | null): string {
  if (score === null) return "No data";
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "Needs work";
}

export function renderReportHtml(data: ReportData): string {
  const { agency, client, snapshot, competitors, responses } = data;

  const accentColor = agency.brand_accent || "#6366f1";
  const score = snapshot.vrtl_score;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const competitorCount = competitors.length;

  // Calculate stats
  let clientMentioned = 0;
  let topPosition = 0;
  let strongRec = 0;
  const competitorMentionCounts = new Map<string, number>();

  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned) clientMentioned++;
    if (pj?.client_position === "top") topPosition++;
    if (pj?.recommendation_strength === "strong") strongRec++;
    if (Array.isArray(pj?.competitors_mentioned)) {
      for (const name of pj.competitors_mentioned) {
        competitorMentionCounts.set(name, (competitorMentionCounts.get(name) ?? 0) + 1);
      }
    }
  }

  const topCompetitors = Array.from(competitorMentionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Provider bars
  const providerBarsHtml = snapshot.score_by_provider
    ? Object.entries(snapshot.score_by_provider)
        .sort((a, b) => b[1] - a[1])
        .map(([provider, provScore]) => {
          const pct = Math.max(0, Math.min(100, Number.isFinite(provScore) ? provScore : 0));
          const barColor = getScoreColor(pct);
          return `
            <div class="provider-row">
              <div class="provider-name">${escapeHtml(provider)}</div>
              <div class="provider-bar-track">
                <div class="provider-bar-fill" style="width: ${pct}%; background: ${barColor};"></div>
              </div>
              <div class="provider-score" style="color: ${barColor};">${pct}</div>
            </div>
          `;
        }).join("")
    : '<div class="muted">No provider data available</div>';

  // Key insights
  const insights: string[] = [];
  if (clientMentioned > 0) {
    insights.push(`${client.name} was mentioned in ${clientMentioned} of ${responses.length} AI responses`);
  }
  if (topPosition > 0) {
    insights.push(`Achieved top positioning in ${topPosition} response${topPosition > 1 ? "s" : ""}`);
  }
  if (strongRec > 0) {
    insights.push(`Received strong recommendations ${strongRec} time${strongRec > 1 ? "s" : ""}`);
  }
  if (topCompetitors.length > 0) {
    insights.push(`Top competitor mentioned: ${topCompetitors[0][0]} (${topCompetitors[0][1]}x)`);
  }

  // Actions
  const actions = [
    score !== null && score < 50 
      ? { title: "Improve AI positioning", desc: "Focus on content that clearly demonstrates your client's unique value proposition" }
      : { title: "Maintain strong visibility", desc: "Continue creating high-quality, authoritative content" },
    { title: "Monitor competitor activity", desc: "Track how competitors are being recommended and adjust strategy" },
    { title: "Regular snapshots", desc: "Run weekly snapshots to track progress and identify trends" }
  ];

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    :root {
      --accent: ${accentColor};
      --score-color: ${scoreColor};
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    html, body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1e293b;
      background: #fff;
    }
    
    /* Cover Page */
    .cover {
      min-height: 100vh;
      padding: 48px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      color: white;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }
    
    .cover::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 80%;
      height: 200%;
      background: radial-gradient(ellipse, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
    }
    
    .cover-content {
      position: relative;
      z-index: 1;
    }
    
    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 80px;
    }
    
    .cover-logo img {
      max-height: 48px;
      max-width: 180px;
    }
    
    .cover-date {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .cover-title {
      font-size: 14px;
      font-weight: 500;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 16px;
    }
    
    .cover-client {
      font-size: 48px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 24px;
    }
    
    .cover-subtitle {
      font-size: 16px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 60px;
    }
    
    .cover-score-section {
      display: flex;
      align-items: flex-end;
      gap: 40px;
    }
    
    .cover-score {
      text-align: center;
    }
    
    .cover-score-value {
      font-size: 120px;
      font-weight: 900;
      letter-spacing: -0.05em;
      line-height: 1;
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .cover-score-label {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.6);
      margin-top: 8px;
    }
    
    .cover-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      flex: 1;
    }
    
    .cover-stat {
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
    }
    
    .cover-stat-value {
      font-size: 28px;
      font-weight: 700;
    }
    
    .cover-stat-label {
      font-size: 11px;
      color: rgba(255,255,255,0.6);
      margin-top: 4px;
    }
    
    .cover-footer {
      position: absolute;
      bottom: 48px;
      left: 48px;
      right: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .cover-agency {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
    }
    
    .cover-powered {
      font-size: 10px;
      color: rgba(255,255,255,0.4);
    }
    
    /* Content Pages */
    .page {
      padding: 40px 48px;
      page-break-after: always;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f1f5f9;
    }
    
    .page-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
    
    .page-subtitle {
      font-size: 11px;
      color: #64748b;
    }
    
    /* Score Overview */
    .score-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .score-main {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
    }
    
    .score-main-value {
      font-size: 72px;
      font-weight: 900;
      color: var(--score-color);
      letter-spacing: -0.03em;
      line-height: 1;
    }
    
    .score-main-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--score-color);
      margin-top: 8px;
    }
    
    .score-main-sublabel {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    
    .providers-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
    }
    
    .providers-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
    }
    
    .provider-row {
      display: grid;
      grid-template-columns: 80px 1fr 40px;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .provider-name {
      font-size: 11px;
      font-weight: 500;
      color: #475569;
    }
    
    .provider-bar-track {
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .provider-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .provider-score {
      font-size: 12px;
      font-weight: 700;
      text-align: right;
    }
    
    /* Key Insights */
    .insights-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .insight-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
    }
    
    .insight-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--accent), #818cf8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .insight-icon svg {
      width: 16px;
      height: 16px;
      fill: white;
    }
    
    .insight-text {
      font-size: 11px;
      color: #334155;
      line-height: 1.5;
    }
    
    /* Actions */
    .actions-section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .action-card {
      padding: 20px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }
    
    .action-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: var(--accent);
      color: white;
      font-size: 11px;
      font-weight: 700;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    
    .action-title {
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 6px;
    }
    
    .action-desc {
      font-size: 10px;
      color: #64748b;
      line-height: 1.5;
    }
    
    /* Competitor Table */
    .table-section {
      margin-bottom: 32px;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .data-table th {
      text-align: left;
      padding: 12px 16px;
      background: #f8fafc;
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .data-table td {
      padding: 14px 16px;
      font-size: 11px;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .data-table tr:last-child td {
      border-bottom: none;
    }
    
    .mention-bar {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .mention-bar-track {
      flex: 1;
      height: 6px;
      background: #f1f5f9;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .mention-bar-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 3px;
    }
    
    /* Footer */
    .page-footer {
      margin-top: auto;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #94a3b8;
    }
    
    .muted {
      color: #94a3b8;
    }
    
    /* Utilities */
    .text-center { text-align: center; }
    .mb-4 { margin-bottom: 16px; }
    .mb-8 { margin-bottom: 32px; }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <div class="cover-content">
      <div class="cover-header">
        ${agency.brand_logo_url 
          ? `<div class="cover-logo"><img src="${escapeHtml(agency.brand_logo_url)}" alt="${escapeHtml(agency.name)}" /></div>`
          : `<div class="cover-logo" style="font-size: 18px; font-weight: 700;">${escapeHtml(agency.name)}</div>`
        }
        <div class="cover-date">${formatDate(snapshot.created_at)}</div>
      </div>
      
      <div class="cover-title">AI Visibility Report</div>
      <div class="cover-client">${escapeHtml(client.name)}</div>
      <div class="cover-subtitle">${client.website ? escapeHtml(client.website) : "AI visibility analysis and recommendations"}</div>
      
      <div class="cover-score-section">
        <div class="cover-score">
          <div class="cover-score-value">${score ?? "—"}</div>
          <div class="cover-score-label">VRTL Score</div>
        </div>
        
        <div class="cover-stats">
          <div class="cover-stat">
            <div class="cover-stat-value">${responses.length}</div>
            <div class="cover-stat-label">AI Signals Analyzed</div>
          </div>
          <div class="cover-stat">
            <div class="cover-stat-value">${clientMentioned}</div>
            <div class="cover-stat-label">Times Mentioned</div>
          </div>
          <div class="cover-stat">
            <div class="cover-stat-value">${competitorCount}</div>
            <div class="cover-stat-label">Competitors Tracked</div>
          </div>
        </div>
      </div>
      
      <div class="cover-footer">
        <div class="cover-agency">Prepared by ${escapeHtml(agency.name)}</div>
        <div class="cover-powered">Powered by VRTL Score</div>
      </div>
    </div>
  </div>
  
  <!-- Score Overview Page -->
  <div class="page">
    <div class="page-header">
      <div>
        <div class="page-title">Score Overview</div>
        <div class="page-subtitle">How ${escapeHtml(client.name)} performs across AI models</div>
      </div>
    </div>
    
    <div class="score-grid">
      <div class="score-main">
        <div class="score-main-value">${score ?? "—"}</div>
        <div class="score-main-label">${scoreLabel}</div>
        <div class="score-main-sublabel">Overall VRTL Score</div>
      </div>
      
      <div class="providers-card">
        <div class="providers-title">Performance by AI Provider</div>
        ${providerBarsHtml}
      </div>
    </div>
    
    ${insights.length > 0 ? `
    <div class="section-title">Key Insights</div>
    <div class="insights-grid">
      ${insights.map(insight => `
        <div class="insight-card">
          <div class="insight-icon">
            <svg viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
          </div>
          <div class="insight-text">${escapeHtml(insight)}</div>
        </div>
      `).join("")}
    </div>
    ` : ""}
    
    <div class="actions-section">
      <div class="section-title">Recommended Actions</div>
      <div class="actions-grid">
        ${actions.map((action, idx) => `
          <div class="action-card">
            <div class="action-number">${idx + 1}</div>
            <div class="action-title">${escapeHtml(action.title)}</div>
            <div class="action-desc">${escapeHtml(action.desc)}</div>
          </div>
        `).join("")}
      </div>
    </div>
    
    ${topCompetitors.length > 0 ? `
    <div class="table-section">
      <div class="section-title">Competitor Landscape</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Competitor</th>
            <th>AI Mentions</th>
            <th style="width: 40%">Visibility</th>
          </tr>
        </thead>
        <tbody>
          ${topCompetitors.map(([name, count]) => {
            const maxCount = topCompetitors[0][1];
            const pct = Math.round((count / maxCount) * 100);
            return `
              <tr>
                <td>${escapeHtml(name)}</td>
                <td>${count}</td>
                <td>
                  <div class="mention-bar">
                    <div class="mention-bar-track">
                      <div class="mention-bar-fill" style="width: ${pct}%"></div>
                    </div>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
    ` : ""}
    
    <div class="page-footer">
      <div>${escapeHtml(client.name)} · AI Visibility Report</div>
      <div>${escapeHtml(agency.name)}</div>
    </div>
  </div>
</body>
</html>`;
}

function formatDate(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return ch;
    }
  });
}
