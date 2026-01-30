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

function getScoreStatus(score: number | null): { label: string; color: string; bg: string } {
  if (score === null) return { label: "No Data", color: "#64748b", bg: "#f1f5f9" };
  if (score >= 70) return { label: "Strong", color: "#059669", bg: "#d1fae5" };
  if (score >= 40) return { label: "Moderate", color: "#d97706", bg: "#fef3c7" };
  return { label: "Needs Work", color: "#dc2626", bg: "#fee2e2" };
}

function getConfidence(responses: ReportData["responses"]): { level: string; color: string } {
  const valid = responses.filter(r => r.parsed_json !== null).length;
  const ratio = valid / Math.max(responses.length, 1);
  
  if (ratio >= 0.8 && responses.length >= 8) return { level: "High", color: "#059669" };
  if (ratio >= 0.5 && responses.length >= 5) return { level: "Medium", color: "#d97706" };
  return { level: "Low", color: "#dc2626" };
}

export function renderReportHtml(data: ReportData): string {
  const { agency, client, snapshot, competitors, responses } = data;
  
  const accentColor = agency.brand_accent || "#4f46e5";
  const score = snapshot.vrtl_score;
  const scoreStatus = getScoreStatus(score);
  const confidence = getConfidence(responses);
  
  // Calculate metrics
  let mentioned = 0, topPosition = 0, strongRec = 0;
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
  
  const total = responses.length;
  const mentionRate = total > 0 ? Math.round((mentioned / total) * 100) : 0;
  const models = snapshot.score_by_provider ? Object.keys(snapshot.score_by_provider) : [];
  const topCompetitors = Array.from(competitorMentions.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    html, body {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 10px;
      line-height: 1.5;
      color: #1e293b;
      background: #fff;
    }
    
    /* Fixed page sizing for A4 */
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 20mm 25mm 20mm;
      page-break-after: always;
      position: relative;
    }
    
    .page:last-child { page-break-after: avoid; }
    
    /* Prevent breaking inside elements */
    .no-break { page-break-inside: avoid; break-inside: avoid; }
    
    /* === PAGE 1: COVER === */
    .cover { background: #f8fafc; }
    
    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    
    .logo { font-size: 13px; font-weight: 700; color: #0f172a; }
    .logo img { max-height: 32px; }
    
    .date { font-size: 9px; color: #64748b; text-align: right; }
    
    .cover-body { margin-top: 32px; }
    
    .report-type {
      font-size: 10px;
      font-weight: 600;
      color: ${accentColor};
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    
    .client-name {
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    
    .client-url { font-size: 11px; color: #64748b; }
    
    /* Score display */
    .score-box {
      margin-top: 32px;
      padding: 24px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: inline-block;
    }
    
    .score-number {
      font-size: 64px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1;
    }
    
    .score-label {
      font-size: 10px;
      color: #64748b;
      margin-top: 4px;
    }
    
    .score-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    
    /* Key stats grid */
    .stats-row {
      display: flex;
      gap: 16px;
      margin-top: 24px;
    }
    
    .stat-box {
      flex: 1;
      padding: 16px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    
    .stat-value { font-size: 20px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 9px; color: #64748b; margin-top: 2px; }
    
    /* Cover footer */
    .cover-footer {
      position: absolute;
      bottom: 20mm;
      left: 20mm;
      right: 20mm;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #94a3b8;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
    
    /* === CONTENT PAGES === */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 20px;
    }
    
    .page-title { font-size: 9px; font-weight: 600; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.06em; }
    .page-num { font-size: 9px; color: #94a3b8; }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    
    .section-desc {
      font-size: 10px;
      color: #64748b;
      margin-bottom: 16px;
    }
    
    /* Findings cards - 2 column */
    .findings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .finding {
      padding: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    
    .finding-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .finding-label { font-size: 9px; color: #64748b; }
    
    .finding-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .dot-good { background: #10b981; }
    .dot-warn { background: #f59e0b; }
    .dot-bad { background: #ef4444; }
    
    .finding-value { font-size: 24px; font-weight: 700; color: #0f172a; }
    .finding-detail { font-size: 9px; color: #64748b; margin-top: 4px; line-height: 1.4; }
    
    /* Actions list */
    .actions-box {
      padding: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      border-left: 3px solid ${accentColor};
      margin-bottom: 20px;
    }
    
    .actions-title {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    
    .action {
      display: flex;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .action:last-child { border-bottom: none; }
    
    .action-num {
      width: 20px;
      height: 20px;
      background: ${accentColor};
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .action-text { font-size: 10px; color: #1e293b; line-height: 1.4; }
    .action-why { font-size: 9px; color: #64748b; margin-top: 2px; }
    
    /* Model scores */
    .models-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .model-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    
    .model-score { font-size: 18px; font-weight: 700; color: #0f172a; min-width: 32px; }
    .model-name { font-size: 10px; color: #475569; }
    
    .model-bar {
      flex: 1;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .model-fill { height: 100%; background: ${accentColor}; border-radius: 2px; }
    
    /* Evidence table */
    .evidence-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
    }
    
    .evidence-table th {
      text-align: left;
      padding: 10px 8px;
      background: #f1f5f9;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .evidence-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    
    .evidence-table tr:nth-child(even) td { background: #fafafa; }
    
    .prompt-text { max-width: 200px; line-height: 1.4; }
    
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 600;
    }
    
    .badge-yes { background: #d1fae5; color: #065f46; }
    .badge-no { background: #fee2e2; color: #991b1b; }
    
    /* Competitors */
    .comp-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-top: 16px;
    }
    
    .comp-table th {
      text-align: left;
      padding: 8px;
      background: #f1f5f9;
      font-weight: 600;
      color: #475569;
    }
    
    .comp-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
    
    .comp-bar {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .comp-track {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .comp-fill { height: 100%; background: #64748b; border-radius: 3px; }
    .comp-count { font-weight: 600; min-width: 20px; }
    
    /* Appendix */
    .raw-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    
    .raw-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .raw-label { font-size: 9px; font-weight: 600; color: #475569; }
    .raw-status { font-size: 8px; color: #64748b; }
    
    .raw-text {
      font-size: 9px;
      color: #475569;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    /* Methodology */
    .method-box {
      padding: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-top: 20px;
    }
    
    .method-title {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    
    .method-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .method-item {}
    .method-label { font-size: 8px; color: #94a3b8; margin-bottom: 2px; }
    .method-value { font-size: 10px; color: #1e293b; }
    
    /* Page footer */
    .page-footer {
      position: absolute;
      bottom: 15mm;
      left: 20mm;
      right: 20mm;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <!-- PAGE 1: COVER -->
  <div class="page cover">
    <div class="cover-header">
      ${agency.brand_logo_url 
        ? `<div class="logo"><img src="${escapeHtml(agency.brand_logo_url)}" alt="" /></div>`
        : `<div class="logo">${escapeHtml(agency.name)}</div>`
      }
      <div class="date">
        ${formatDate(snapshot.created_at)}<br/>
        ID: ${snapshot.id.slice(0, 8)}
      </div>
    </div>
    
    <div class="cover-body">
      <div class="report-type">AI Visibility Report</div>
      <div class="client-name">${escapeHtml(client.name)}</div>
      ${client.website ? `<div class="client-url">${escapeHtml(client.website)}</div>` : ""}
      
      <div class="score-box">
        <div class="score-number">${score ?? "—"}</div>
        <div class="score-label">VRTL Score</div>
        <div class="score-badge" style="background: ${scoreStatus.bg}; color: ${scoreStatus.color};">
          ${scoreStatus.label}
        </div>
      </div>
      
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-value" style="color: ${confidence.color}">${confidence.level}</div>
          <div class="stat-label">Confidence</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${mentionRate}%</div>
          <div class="stat-label">Mention Rate</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${total}</div>
          <div class="stat-label">Prompts Tested</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${models.length}</div>
          <div class="stat-label">AI Models</div>
        </div>
      </div>
    </div>
    
    <div class="cover-footer">
      <span>Confidential — Prepared for ${escapeHtml(client.name)}</span>
      <span>Powered by VRTL Score</span>
    </div>
  </div>
  
  <!-- PAGE 2: KEY FINDINGS -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Key Findings</span>
      <span class="page-num">Page 2</span>
    </div>
    
    <div class="section-title">Performance Summary</div>
    <div class="section-desc">How ${escapeHtml(client.name)} performs across AI answer engines</div>
    
    <div class="findings-grid no-break">
      <div class="finding">
        <div class="finding-top">
          <span class="finding-label">AI Mention Rate</span>
          <span class="finding-dot ${mentionRate >= 60 ? "dot-good" : mentionRate >= 30 ? "dot-warn" : "dot-bad"}"></span>
        </div>
        <div class="finding-value">${mentionRate}%</div>
        <div class="finding-detail">Mentioned in ${mentioned} of ${total} AI responses</div>
      </div>
      
      <div class="finding">
        <div class="finding-top">
          <span class="finding-label">Top Positioning</span>
          <span class="finding-dot ${topPosition >= 3 ? "dot-good" : topPosition >= 1 ? "dot-warn" : "dot-bad"}"></span>
        </div>
        <div class="finding-value">${topPosition}</div>
        <div class="finding-detail">Times ranked first when mentioned</div>
      </div>
      
      <div class="finding">
        <div class="finding-top">
          <span class="finding-label">Strong Recommendations</span>
          <span class="finding-dot ${strongRec >= 3 ? "dot-good" : strongRec >= 1 ? "dot-warn" : "dot-bad"}"></span>
        </div>
        <div class="finding-value">${strongRec}</div>
        <div class="finding-detail">Strong endorsements from AI models</div>
      </div>
      
      <div class="finding">
        <div class="finding-top">
          <span class="finding-label">Competitors Tracked</span>
          <span class="finding-dot dot-good"></span>
        </div>
        <div class="finding-value">${competitors.length}</div>
        <div class="finding-detail">Competitors monitored in this analysis</div>
      </div>
    </div>
    
    <div class="actions-box no-break">
      <div class="actions-title">What To Do Next</div>
      ${score === null || score < 40 ? `
        <div class="action">
          <span class="action-num">1</span>
          <div>
            <div class="action-text">Audit content for AI-friendly structure</div>
            <div class="action-why">AI models favor well-structured content with clear headings and factual claims.</div>
          </div>
        </div>
        <div class="action">
          <span class="action-num">2</span>
          <div>
            <div class="action-text">Build topic authority with comprehensive guides</div>
            <div class="action-why">In-depth content on core topics signals expertise to AI models.</div>
          </div>
        </div>
      ` : score < 70 ? `
        <div class="action">
          <span class="action-num">1</span>
          <div>
            <div class="action-text">Expand content coverage to related topics</div>
            <div class="action-why">Broader content footprint increases AI mentions across more queries.</div>
          </div>
        </div>
        <div class="action">
          <span class="action-num">2</span>
          <div>
            <div class="action-text">Add structured data and clear descriptions</div>
            <div class="action-why">Machine-readable info helps AI accurately represent your offerings.</div>
          </div>
        </div>
      ` : `
        <div class="action">
          <span class="action-num">1</span>
          <div>
            <div class="action-text">Maintain content freshness with regular updates</div>
            <div class="action-why">AI models prefer recently updated content. Keep key pages current.</div>
          </div>
        </div>
        <div class="action">
          <span class="action-num">2</span>
          <div>
            <div class="action-text">Monitor competitor movements monthly</div>
            <div class="action-why">Strong positions can erode if competitors improve their AI visibility.</div>
          </div>
        </div>
      `}
      <div class="action">
        <span class="action-num">3</span>
        <div>
          <div class="action-text">Run follow-up snapshot in 30 days</div>
          <div class="action-why">Track progress and identify trends over time.</div>
        </div>
      </div>
    </div>
    
    ${models.length > 0 ? `
    <div class="section-title" style="font-size: 12px; margin-top: 20px; margin-bottom: 12px;">Score by AI Model</div>
    <div class="models-grid no-break">
      ${Object.entries(snapshot.score_by_provider || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([provider, provScore]) => {
          const pct = Math.max(0, Math.min(100, Number.isFinite(provScore) ? provScore : 0));
          return `
            <div class="model-item">
              <div class="model-score">${pct}</div>
              <div style="flex: 1;">
                <div class="model-name">${escapeHtml(provider)}</div>
                <div class="model-bar"><div class="model-fill" style="width: ${pct}%"></div></div>
              </div>
            </div>
          `;
        }).join("")}
    </div>
    ` : ""}
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 3: EVIDENCE -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Evidence</span>
      <span class="page-num">Page 3</span>
    </div>
    
    <div class="section-title">Detailed Results</div>
    <div class="section-desc">Individual prompt analysis showing mention status and positioning</div>
    
    <table class="evidence-table">
      <thead>
        <tr>
          <th style="width: 45%">Prompt</th>
          <th>Mentioned</th>
          <th>Position</th>
          <th>Strength</th>
        </tr>
      </thead>
      <tbody>
        ${responses.slice(0, 10).map((r, idx) => {
          const pj = r.parsed_json;
          const isMentioned = pj?.client_mentioned;
          return `
            <tr>
              <td class="prompt-text">${escapeHtml(truncate(r.prompt_text || `Prompt ${r.prompt_ordinal ?? idx + 1}`, 80))}</td>
              <td><span class="badge ${isMentioned ? "badge-yes" : "badge-no"}">${isMentioned ? "Yes" : "No"}</span></td>
              <td>${escapeHtml(pj?.client_position || "—")}</td>
              <td>${escapeHtml(pj?.recommendation_strength || "—")}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
    ${responses.length > 10 ? `<div style="font-size: 8px; color: #94a3b8; margin-top: 8px;">+ ${responses.length - 10} more prompts not shown</div>` : ""}
    
    ${topCompetitors.length > 0 ? `
    <div class="section-title" style="font-size: 12px; margin-top: 24px; margin-bottom: 8px;">Top Competitors Mentioned</div>
    <table class="comp-table">
      <thead><tr><th style="width: 40%">Competitor</th><th>AI Mentions</th></tr></thead>
      <tbody>
        ${topCompetitors.map(([name, count]) => {
          const max = topCompetitors[0][1];
          const pct = Math.round((count / max) * 100);
          return `
            <tr>
              <td>${escapeHtml(name)}</td>
              <td>
                <div class="comp-bar">
                  <div class="comp-track"><div class="comp-fill" style="width: ${pct}%"></div></div>
                  <span class="comp-count">${count}</span>
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
    ` : ""}
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 4: APPENDIX -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Appendix</span>
      <span class="page-num">Page 4</span>
    </div>
    
    <div class="section-title">Sample AI Outputs</div>
    <div class="section-desc">Raw responses for transparency. Full data available upon request.</div>
    
    ${responses.slice(0, 2).map((r, idx) => `
      <div class="raw-item no-break">
        <div class="raw-header">
          <span class="raw-label">Prompt ${r.prompt_ordinal ?? idx + 1}</span>
          <span class="raw-status">${r.parsed_json?.client_mentioned ? "✓ Mentioned" : "✗ Not mentioned"}</span>
        </div>
        <div class="raw-text">${escapeHtml(truncate(r.raw_text || "No response captured", 350))}</div>
      </div>
    `).join("")}
    
    <div class="method-box no-break">
      <div class="method-title">Methodology</div>
      <div class="method-grid">
        <div class="method-item">
          <div class="method-label">Report Generated</div>
          <div class="method-value">${formatDate(snapshot.created_at)}</div>
        </div>
        <div class="method-item">
          <div class="method-label">Snapshot ID</div>
          <div class="method-value">${snapshot.id.slice(0, 16)}...</div>
        </div>
        <div class="method-item">
          <div class="method-label">Models Tested</div>
          <div class="method-value">${models.length > 0 ? models.join(", ") : "—"}</div>
        </div>
        <div class="method-item">
          <div class="method-label">Prompts Analyzed</div>
          <div class="method-value">${total}</div>
        </div>
        <div class="method-item">
          <div class="method-label">Competitors Tracked</div>
          <div class="method-value">${competitors.length}</div>
        </div>
        <div class="method-item">
          <div class="method-label">Confidence Level</div>
          <div class="method-value">${confidence.level}</div>
        </div>
      </div>
    </div>
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
</body>
</html>`;
}

function formatDate(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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
