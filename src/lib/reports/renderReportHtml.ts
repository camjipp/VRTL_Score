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

function getConfidenceLevel(responses: ReportData["responses"]): { level: string; description: string } {
  const validResponses = responses.filter(r => r.parsed_json !== null);
  const ratio = validResponses.length / Math.max(responses.length, 1);
  
  if (ratio >= 0.8 && responses.length >= 8) {
    return { level: "High", description: "Strong data coverage across prompts" };
  } else if (ratio >= 0.5 && responses.length >= 5) {
    return { level: "Medium", description: "Moderate data coverage" };
  }
  return { level: "Low", description: "Limited data — interpret with caution" };
}

function generateTakeaways(data: ReportData): string[] {
  const { client, snapshot, responses, competitors } = data;
  const takeaways: string[] = [];
  
  // Count mentions and positions
  let mentioned = 0;
  let topPosition = 0;
  let strongRec = 0;
  const competitorMentions = new Map<string, number>();
  
  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned) mentioned++;
    if (pj?.client_position === "top") topPosition++;
    if (pj?.recommendation_strength === "strong") strongRec++;
    if (Array.isArray(pj?.competitors_mentioned)) {
      for (const name of pj.competitors_mentioned) {
        competitorMentions.set(name, (competitorMentions.get(name) ?? 0) + 1);
      }
    }
  }
  
  const totalPrompts = responses.length;
  const mentionRate = totalPrompts > 0 ? Math.round((mentioned / totalPrompts) * 100) : 0;
  
  // Takeaway 1: Overall visibility
  if (mentionRate >= 70) {
    takeaways.push(`${client.name} has strong AI visibility, appearing in ${mentionRate}% of relevant queries.`);
  } else if (mentionRate >= 40) {
    takeaways.push(`${client.name} has moderate AI visibility (${mentionRate}% mention rate). There is room to improve.`);
  } else if (mentionRate > 0) {
    takeaways.push(`${client.name} has limited AI visibility (${mentionRate}% mention rate). This represents a significant growth opportunity.`);
  } else {
    takeaways.push(`${client.name} was not mentioned in any AI responses tested. Immediate action is recommended.`);
  }
  
  // Takeaway 2: Position quality
  if (topPosition > 0) {
    takeaways.push(`When mentioned, ${client.name} achieved top positioning ${topPosition} time${topPosition > 1 ? "s" : ""}, indicating strong authority signals.`);
  } else if (mentioned > 0) {
    takeaways.push(`${client.name} was mentioned but did not achieve top positioning. Content optimization may help improve placement.`);
  }
  
  // Takeaway 3: Recommendation strength
  if (strongRec > 0) {
    takeaways.push(`AI models gave ${client.name} a strong recommendation ${strongRec} time${strongRec > 1 ? "s" : ""}, suggesting positive sentiment.`);
  }
  
  // Takeaway 4: Competitive landscape
  const sortedCompetitors = Array.from(competitorMentions.entries()).sort((a, b) => b[1] - a[1]);
  if (sortedCompetitors.length > 0) {
    const topComp = sortedCompetitors[0];
    takeaways.push(`Top competitor ${topComp[0]} was mentioned ${topComp[1]} time${topComp[1] > 1 ? "s" : ""}. Monitor their AI presence closely.`);
  } else if (competitors.length > 0) {
    takeaways.push(`None of the tracked competitors appeared prominently in AI responses.`);
  }
  
  // Takeaway 5: Score context
  const score = snapshot.vrtl_score;
  if (score !== null) {
    if (score >= 70) {
      takeaways.push(`A VRTL Score of ${score} places ${client.name} in a strong competitive position for AI-driven discovery.`);
    } else if (score >= 40) {
      takeaways.push(`A VRTL Score of ${score} indicates moderate visibility with clear opportunities for improvement.`);
    } else {
      takeaways.push(`A VRTL Score of ${score} suggests ${client.name} is underrepresented in AI responses relative to market potential.`);
    }
  }
  
  return takeaways.slice(0, 5);
}

export function renderReportHtml(data: ReportData): string {
  const { agency, client, snapshot, competitors, responses } = data;
  
  const score = snapshot.vrtl_score;
  const confidence = getConfidenceLevel(responses);
  const takeaways = generateTakeaways(data);
  
  // Get models tested
  const modelsTestedSet = new Set<string>();
  if (snapshot.score_by_provider) {
    Object.keys(snapshot.score_by_provider).forEach(k => modelsTestedSet.add(k));
  }
  const modelsTested = Array.from(modelsTestedSet);
  
  // Get top competitors mentioned
  const competitorMentions = new Map<string, number>();
  for (const r of responses) {
    const pj = r.parsed_json;
    if (Array.isArray(pj?.competitors_mentioned)) {
      for (const name of pj.competitors_mentioned) {
        competitorMentions.set(name, (competitorMentions.get(name) ?? 0) + 1);
      }
    }
  }
  const topCompetitors = Array.from(competitorMentions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Evidence rows
  const evidenceRows = responses.map((r, idx) => {
    const pj = r.parsed_json;
    return {
      prompt: r.prompt_text || `Prompt ${r.prompt_ordinal ?? idx + 1}`,
      mentioned: pj?.client_mentioned ? "Yes" : "No",
      position: pj?.client_position || "—",
      strength: pj?.recommendation_strength || "—",
    };
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    html, body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10px;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
    }
    
    /* Page Setup */
    .page {
      padding: 48px;
      min-height: 100vh;
      page-break-after: always;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 48px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .header-left {
      flex: 1;
    }
    
    .report-title {
      font-size: 11px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 4px;
    }
    
    .client-name {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.02em;
    }
    
    .client-website {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }
    
    .header-right {
      text-align: right;
    }
    
    .agency-name {
      font-size: 11px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .report-date {
      font-size: 10px;
      color: #666;
      margin-top: 2px;
    }
    
    /* Page 1: Snapshot */
    .snapshot-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      margin-bottom: 48px;
    }
    
    .score-section {
      text-align: center;
      padding: 40px;
      background: #fafafa;
      border: 1px solid #e5e5e5;
    }
    
    .score-label {
      font-size: 11px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 16px;
    }
    
    .score-value {
      font-size: 96px;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    
    .score-max {
      font-size: 14px;
      color: #999;
      margin-top: 8px;
    }
    
    .metadata-section {
      padding: 40px;
      background: #fafafa;
      border: 1px solid #e5e5e5;
    }
    
    .metadata-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .metadata-row:last-child {
      border-bottom: none;
    }
    
    .metadata-label {
      font-size: 11px;
      color: #666;
    }
    
    .metadata-value {
      font-size: 11px;
      font-weight: 600;
      color: #1a1a1a;
      text-align: right;
    }
    
    .confidence-high { color: #059669; }
    .confidence-medium { color: #d97706; }
    .confidence-low { color: #dc2626; }
    
    /* Provider Scores */
    .providers-section {
      margin-top: 48px;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .provider-row {
      display: grid;
      grid-template-columns: 100px 1fr 50px;
      align-items: center;
      gap: 16px;
      padding: 10px 0;
    }
    
    .provider-name {
      font-size: 11px;
      font-weight: 500;
      color: #1a1a1a;
    }
    
    .provider-bar {
      height: 8px;
      background: #e5e5e5;
    }
    
    .provider-bar-fill {
      height: 100%;
      background: #1a1a1a;
    }
    
    .provider-score {
      font-size: 11px;
      font-weight: 600;
      color: #1a1a1a;
      text-align: right;
    }
    
    /* Competitors */
    .competitors-section {
      margin-top: 32px;
    }
    
    .competitor-list {
      list-style: none;
    }
    
    .competitor-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 11px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .competitor-name {
      color: #1a1a1a;
    }
    
    .competitor-mentions {
      color: #666;
    }
    
    /* Page 2: Takeaways */
    .takeaways-section {
      margin-top: 24px;
    }
    
    .takeaway-list {
      list-style: none;
      counter-reset: takeaway;
    }
    
    .takeaway-item {
      position: relative;
      padding: 20px 0 20px 40px;
      border-bottom: 1px solid #e5e5e5;
      font-size: 12px;
      line-height: 1.7;
      color: #333;
    }
    
    .takeaway-item:last-child {
      border-bottom: none;
    }
    
    .takeaway-item::before {
      counter-increment: takeaway;
      content: counter(takeaway);
      position: absolute;
      left: 0;
      top: 20px;
      width: 24px;
      height: 24px;
      background: #1a1a1a;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Page 3+: Evidence */
    .evidence-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    
    .evidence-table th {
      text-align: left;
      padding: 12px 8px;
      background: #fafafa;
      font-size: 9px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .evidence-table td {
      padding: 12px 8px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: top;
    }
    
    .evidence-table tr:last-child td {
      border-bottom: none;
    }
    
    .prompt-cell {
      max-width: 250px;
      color: #333;
    }
    
    .status-yes {
      color: #059669;
      font-weight: 600;
    }
    
    .status-no {
      color: #999;
    }
    
    /* Raw Outputs */
    .raw-section {
      margin-top: 32px;
    }
    
    .raw-output {
      margin-bottom: 24px;
      padding: 16px;
      background: #fafafa;
      border: 1px solid #e5e5e5;
    }
    
    .raw-label {
      font-size: 10px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    
    .raw-text {
      font-size: 10px;
      color: #333;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    /* Footer */
    .page-footer {
      margin-top: auto;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #999;
    }
    
    .page-number {
      font-weight: 500;
    }
    
    /* Utilities */
    .muted { color: #999; }
    .small { font-size: 9px; }
  </style>
</head>
<body>
  <!-- Page 1: Snapshot -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        <div class="report-title">AI Visibility Report</div>
        <div class="client-name">${escapeHtml(client.name)}</div>
        ${client.website ? `<div class="client-website">${escapeHtml(client.website)}</div>` : ""}
      </div>
      <div class="header-right">
        <div class="agency-name">${escapeHtml(agency.name)}</div>
        <div class="report-date">${formatDate(snapshot.created_at)}</div>
      </div>
    </div>
    
    <div class="snapshot-grid">
      <div class="score-section">
        <div class="score-label">VRTL Score</div>
        <div class="score-value">${score ?? "—"}</div>
        <div class="score-max">out of 100</div>
      </div>
      
      <div class="metadata-section">
        <div class="metadata-row">
          <span class="metadata-label">Confidence</span>
          <span class="metadata-value confidence-${confidence.level.toLowerCase()}">${confidence.level}</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Prompts Analyzed</span>
          <span class="metadata-value">${responses.length}</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Models Tested</span>
          <span class="metadata-value">${modelsTested.length > 0 ? modelsTested.join(", ") : "—"}</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Competitors Tracked</span>
          <span class="metadata-value">${competitors.length}</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Snapshot ID</span>
          <span class="metadata-value muted small">${snapshot.id.slice(0, 8)}</span>
        </div>
      </div>
    </div>
    
    ${snapshot.score_by_provider && Object.keys(snapshot.score_by_provider).length > 0 ? `
    <div class="providers-section">
      <div class="section-title">Score by Model</div>
      ${Object.entries(snapshot.score_by_provider)
        .sort((a, b) => b[1] - a[1])
        .map(([provider, provScore]) => {
          const pct = Math.max(0, Math.min(100, Number.isFinite(provScore) ? provScore : 0));
          return `
            <div class="provider-row">
              <div class="provider-name">${escapeHtml(provider)}</div>
              <div class="provider-bar">
                <div class="provider-bar-fill" style="width: ${pct}%"></div>
              </div>
              <div class="provider-score">${pct}</div>
            </div>
          `;
        }).join("")}
    </div>
    ` : ""}
    
    ${topCompetitors.length > 0 ? `
    <div class="competitors-section">
      <div class="section-title">Top Competitors Mentioned</div>
      <ul class="competitor-list">
        ${topCompetitors.map(([name, count]) => `
          <li class="competitor-item">
            <span class="competitor-name">${escapeHtml(name)}</span>
            <span class="competitor-mentions">${count} mention${count > 1 ? "s" : ""}</span>
          </li>
        `).join("")}
      </ul>
    </div>
    ` : ""}
    
    <div class="page-footer">
      <div>Confidential — ${escapeHtml(client.name)}</div>
      <div class="page-number">Page 1</div>
    </div>
  </div>
  
  <!-- Page 2: What This Means -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        <div class="report-title">AI Visibility Report</div>
        <div class="client-name">${escapeHtml(client.name)}</div>
      </div>
      <div class="header-right">
        <div class="agency-name">${escapeHtml(agency.name)}</div>
        <div class="report-date">${formatDate(snapshot.created_at)}</div>
      </div>
    </div>
    
    <div class="section-title">What This Means</div>
    
    <div class="takeaways-section">
      <ol class="takeaway-list">
        ${takeaways.map(takeaway => `
          <li class="takeaway-item">${escapeHtml(takeaway)}</li>
        `).join("")}
      </ol>
    </div>
    
    <div class="page-footer">
      <div>Confidential — ${escapeHtml(client.name)}</div>
      <div class="page-number">Page 2</div>
    </div>
  </div>
  
  <!-- Page 3: Evidence -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        <div class="report-title">AI Visibility Report</div>
        <div class="client-name">${escapeHtml(client.name)}</div>
      </div>
      <div class="header-right">
        <div class="agency-name">${escapeHtml(agency.name)}</div>
        <div class="report-date">${formatDate(snapshot.created_at)}</div>
      </div>
    </div>
    
    <div class="section-title">Evidence</div>
    
    <table class="evidence-table">
      <thead>
        <tr>
          <th>Prompt</th>
          <th>Mentioned</th>
          <th>Position</th>
          <th>Strength</th>
        </tr>
      </thead>
      <tbody>
        ${evidenceRows.map(row => `
          <tr>
            <td class="prompt-cell">${escapeHtml(truncate(row.prompt, 100))}</td>
            <td class="${row.mentioned === "Yes" ? "status-yes" : "status-no"}">${row.mentioned}</td>
            <td>${escapeHtml(row.position)}</td>
            <td>${escapeHtml(row.strength)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    
    <div class="page-footer">
      <div>Confidential — ${escapeHtml(client.name)}</div>
      <div class="page-number">Page 3</div>
    </div>
  </div>
  
  <!-- Page 4: Raw Outputs (for transparency) -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        <div class="report-title">AI Visibility Report</div>
        <div class="client-name">${escapeHtml(client.name)}</div>
      </div>
      <div class="header-right">
        <div class="agency-name">${escapeHtml(agency.name)}</div>
        <div class="report-date">${formatDate(snapshot.created_at)}</div>
      </div>
    </div>
    
    <div class="section-title">Raw AI Outputs</div>
    <p class="muted small" style="margin-bottom: 24px;">For transparency. Responses are truncated for brevity.</p>
    
    <div class="raw-section">
      ${responses.slice(0, 5).map((r, idx) => `
        <div class="raw-output">
          <div class="raw-label">Prompt ${r.prompt_ordinal ?? idx + 1}</div>
          <div class="raw-text">${escapeHtml(truncate(r.raw_text || "No response captured", 500))}</div>
        </div>
      `).join("")}
      
      ${responses.length > 5 ? `
        <p class="muted small" style="margin-top: 16px;">+ ${responses.length - 5} additional responses not shown. Full data available upon request.</p>
      ` : ""}
    </div>
    
    <div class="page-footer">
      <div>Confidential — ${escapeHtml(client.name)}</div>
      <div class="page-number">Page 4</div>
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

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}
