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
  if (score >= 70) return { label: "Strong", color: "#059669", bg: "#ecfdf5" };
  if (score >= 40) return { label: "Moderate", color: "#d97706", bg: "#fffbeb" };
  return { label: "Needs Work", color: "#dc2626", bg: "#fef2f2" };
}

function getConfidence(responses: ReportData["responses"]): { level: string; color: string; description: string } {
  const valid = responses.filter(r => r.parsed_json !== null).length;
  const ratio = valid / Math.max(responses.length, 1);
  
  if (ratio >= 0.8 && responses.length >= 8) {
    return { level: "High", color: "#059669", description: "Strong data coverage" };
  } else if (ratio >= 0.5 && responses.length >= 5) {
    return { level: "Medium", color: "#d97706", description: "Moderate coverage" };
  }
  return { level: "Low", color: "#dc2626", description: "Limited data" };
}

function generateFindings(data: ReportData): Array<{ title: string; value: string; status: "good" | "warning" | "bad"; detail: string }> {
  const { client, responses } = data;
  const findings: Array<{ title: string; value: string; status: "good" | "warning" | "bad"; detail: string }> = [];
  
  let mentioned = 0;
  let topPosition = 0;
  let strongRec = 0;
  
  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned) mentioned++;
    if (pj?.client_position === "top") topPosition++;
    if (pj?.recommendation_strength === "strong") strongRec++;
  }
  
  const total = responses.length;
  const mentionRate = total > 0 ? Math.round((mentioned / total) * 100) : 0;
  const topRate = mentioned > 0 ? Math.round((topPosition / mentioned) * 100) : 0;
  
  // Finding 1: Mention Rate
  findings.push({
    title: "AI Mention Rate",
    value: `${mentionRate}%`,
    status: mentionRate >= 60 ? "good" : mentionRate >= 30 ? "warning" : "bad",
    detail: `${client.name} was mentioned in ${mentioned} of ${total} AI responses tested.`
  });
  
  // Finding 2: Top Position Rate
  if (mentioned > 0) {
    findings.push({
      title: "Top Position Rate",
      value: `${topRate}%`,
      status: topRate >= 50 ? "good" : topRate >= 20 ? "warning" : "bad",
      detail: `When mentioned, ${client.name} achieved top positioning ${topPosition} time${topPosition !== 1 ? "s" : ""}.`
    });
  }
  
  // Finding 3: Strong Recommendations
  findings.push({
    title: "Strong Recommendations",
    value: `${strongRec}`,
    status: strongRec >= 3 ? "good" : strongRec >= 1 ? "warning" : "bad",
    detail: strongRec > 0 
      ? `AI models gave ${client.name} a strong recommendation ${strongRec} time${strongRec !== 1 ? "s" : ""}.`
      : `No strong recommendations received. Focus on demonstrating clear value propositions.`
  });
  
  return findings;
}

function generateActions(data: ReportData): Array<{ action: string; why: string }> {
  const score = data.snapshot.vrtl_score;
  const actions: Array<{ action: string; why: string }> = [];
  
  if (score === null || score < 40) {
    actions.push({
      action: "Audit existing content for AI-friendly structure",
      why: "AI models favor well-structured, authoritative content with clear headings and factual claims."
    });
    actions.push({
      action: "Build topic authority with comprehensive guides",
      why: "Creating in-depth content on your core topics signals expertise to AI models."
    });
  } else if (score < 70) {
    actions.push({
      action: "Expand content coverage to related topics",
      why: "Broadening your content footprint increases chances of AI mentions across more queries."
    });
    actions.push({
      action: "Add structured data and clear product/service descriptions",
      why: "Explicit, machine-readable information helps AI models accurately represent your offerings."
    });
  } else {
    actions.push({
      action: "Maintain content freshness with regular updates",
      why: "AI models often prefer recently updated content. Keep your key pages current."
    });
    actions.push({
      action: "Monitor competitor movements monthly",
      why: "Strong positions can erode if competitors improve their AI visibility."
    });
  }
  
  actions.push({
    action: "Run follow-up snapshots in 30 days",
    why: "Track progress and identify trends over time to refine your strategy."
  });
  
  return actions;
}

export function renderReportHtml(data: ReportData): string {
  const { agency, client, snapshot, competitors, responses } = data;
  
  const accentColor = agency.brand_accent || "#6366f1";
  const score = snapshot.vrtl_score;
  const scoreStatus = getScoreStatus(score);
  const confidence = getConfidence(responses);
  const findings = generateFindings(data);
  const actions = generateActions(data);
  
  // Models tested
  const models = snapshot.score_by_provider ? Object.keys(snapshot.score_by_provider) : [];
  
  // Competitor mentions
  const competitorMentions = new Map<string, number>();
  for (const r of responses) {
    if (Array.isArray(r.parsed_json?.competitors_mentioned)) {
      for (const name of r.parsed_json.competitors_mentioned) {
        competitorMentions.set(name, (competitorMentions.get(name) ?? 0) + 1);
      }
    }
  }
  const topCompetitors = Array.from(competitorMentions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    :root {
      --accent: ${accentColor};
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --border: #e2e8f0;
      --bg-subtle: #f8fafc;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    html, body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: var(--text-primary);
      background: #fff;
    }
    
    .page {
      padding: 56px 64px;
      min-height: 100vh;
      page-break-after: always;
      position: relative;
    }
    
    .page:last-child { page-break-after: avoid; }
    
    /* Cover Page */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(180deg, var(--bg-subtle) 0%, #fff 100%);
    }
    
    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .cover-logo img {
      max-height: 40px;
      max-width: 160px;
    }
    
    .cover-logo-text {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .cover-meta {
      text-align: right;
      font-size: 10px;
      color: var(--text-muted);
    }
    
    .cover-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px 0;
    }
    
    .cover-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 16px;
    }
    
    .cover-title {
      font-size: 42px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 12px;
    }
    
    .cover-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
    }
    
    .cover-score-section {
      margin-top: 48px;
      display: flex;
      align-items: flex-end;
      gap: 48px;
    }
    
    .cover-score {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px 48px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    
    .cover-score-value {
      font-size: 72px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      line-height: 1;
    }
    
    .cover-score-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 8px;
    }
    
    .cover-score-status {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    
    .cover-meta-item {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    
    .cover-meta-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .cover-meta-label {
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    
    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      font-size: 10px;
      color: var(--text-muted);
    }
    
    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }
    
    .page-header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .page-section {
      font-size: 10px;
      font-weight: 600;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .page-client {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .page-number {
      font-size: 10px;
      color: var(--text-muted);
    }
    
    /* Section Title */
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .section-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 32px;
    }
    
    /* Findings Cards */
    .findings-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 48px;
    }
    
    .finding-card {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
    }
    
    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .finding-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    
    .finding-status {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    
    .finding-status.good { background: #059669; }
    .finding-status.warning { background: #d97706; }
    .finding-status.bad { background: #dc2626; }
    
    .finding-value {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    
    .finding-detail {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    
    /* Actions */
    .actions-section {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 32px;
    }
    
    .actions-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .actions-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: var(--accent);
      border-radius: 2px;
    }
    
    .action-item {
      display: grid;
      grid-template-columns: 32px 1fr;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
    }
    
    .action-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .action-number {
      width: 32px;
      height: 32px;
      background: var(--accent);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .action-content {}
    
    .action-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    
    .action-why {
      font-size: 11px;
      color: var(--text-secondary);
    }
    
    /* Provider Scores */
    .providers-section {
      margin-top: 48px;
    }
    
    .providers-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .provider-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 10px;
    }
    
    .provider-score {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      min-width: 48px;
    }
    
    .provider-info {
      flex: 1;
    }
    
    .provider-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .provider-bar {
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      margin-top: 6px;
      overflow: hidden;
    }
    
    .provider-bar-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 3px;
    }
    
    /* Evidence Table */
    .evidence-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .evidence-table th {
      text-align: left;
      padding: 14px 16px;
      background: var(--bg-subtle);
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
    }
    
    .evidence-table td {
      padding: 16px;
      font-size: 11px;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    
    .evidence-table tr:nth-child(even) td {
      background: var(--bg-subtle);
    }
    
    .evidence-table tr:last-child td {
      border-bottom: none;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 600;
    }
    
    .status-badge.yes {
      background: #ecfdf5;
      color: #059669;
    }
    
    .status-badge.no {
      background: #fef2f2;
      color: #dc2626;
    }
    
    .status-badge::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .prompt-cell {
      max-width: 280px;
      line-height: 1.5;
    }
    
    /* Competitors */
    .competitors-section {
      margin-top: 48px;
    }
    
    .competitors-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .competitors-table th {
      text-align: left;
      padding: 12px 16px;
      background: var(--bg-subtle);
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .competitors-table td {
      padding: 14px 16px;
      font-size: 11px;
      border-bottom: 1px solid var(--border);
    }
    
    .competitor-bar {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .competitor-bar-track {
      flex: 1;
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .competitor-bar-fill {
      height: 100%;
      background: var(--text-secondary);
      border-radius: 4px;
    }
    
    .competitor-count {
      font-weight: 600;
      min-width: 24px;
    }
    
    /* Raw Data */
    .raw-section {
      margin-top: 32px;
    }
    
    .raw-item {
      margin-bottom: 24px;
      padding: 20px;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 10px;
    }
    
    .raw-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .raw-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .raw-meta {
      font-size: 10px;
      color: var(--text-muted);
    }
    
    .raw-text {
      font-size: 10px;
      color: var(--text-secondary);
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    /* Methodology */
    .methodology-section {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 32px;
      margin-top: 48px;
    }
    
    .methodology-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    
    .methodology-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    
    .methodology-item {
      font-size: 11px;
    }
    
    .methodology-label {
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    
    .methodology-value {
      color: var(--text-primary);
      font-weight: 500;
    }
    
    /* Page Footer */
    .page-footer {
      position: absolute;
      bottom: 56px;
      left: 64px;
      right: 64px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: var(--text-muted);
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
  </style>
</head>
<body>
  <!-- Page 1: Cover -->
  <div class="page cover">
    <div class="cover-header">
      ${agency.brand_logo_url 
        ? `<div class="cover-logo"><img src="${escapeHtml(agency.brand_logo_url)}" alt="${escapeHtml(agency.name)}" /></div>`
        : `<div class="cover-logo-text">${escapeHtml(agency.name)}</div>`
      }
      <div class="cover-meta">
        <div>${formatDate(snapshot.created_at)}</div>
        <div>Snapshot ${snapshot.id.slice(0, 8)}</div>
      </div>
    </div>
    
    <div class="cover-main">
      <div class="cover-label">AI Visibility Report</div>
      <div class="cover-title">${escapeHtml(client.name)}</div>
      ${client.website ? `<div class="cover-subtitle">${escapeHtml(client.website)}</div>` : ""}
      
      <div class="cover-score-section">
        <div class="cover-score">
          <div class="cover-score-value">${score ?? "—"}</div>
          <div class="cover-score-label">VRTL Score</div>
          <div class="cover-score-status" style="background: ${scoreStatus.bg}; color: ${scoreStatus.color};">
            ${scoreStatus.label}
          </div>
        </div>
        
        <div class="cover-meta-grid">
          <div class="cover-meta-item">
            <div class="cover-meta-value" style="color: ${confidence.color}">${confidence.level}</div>
            <div class="cover-meta-label">Confidence Level</div>
          </div>
          <div class="cover-meta-item">
            <div class="cover-meta-value">${responses.length}</div>
            <div class="cover-meta-label">Prompts Tested</div>
          </div>
          <div class="cover-meta-item">
            <div class="cover-meta-value">${models.length}</div>
            <div class="cover-meta-label">AI Models</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cover-footer">
      <div>Confidential — Prepared for ${escapeHtml(client.name)}</div>
      <div>Powered by VRTL Score</div>
    </div>
  </div>
  
  <!-- Page 2: Key Findings -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <span class="page-section">Key Findings</span>
        <span class="page-client">${escapeHtml(client.name)}</span>
      </div>
      <div class="page-number">Page 2</div>
    </div>
    
    <div class="section-title">Performance Summary</div>
    <div class="section-subtitle">How ${escapeHtml(client.name)} performs across AI answer engines</div>
    
    <div class="findings-grid">
      ${findings.map(f => `
        <div class="finding-card">
          <div class="finding-header">
            <div class="finding-title">${escapeHtml(f.title)}</div>
            <div class="finding-status ${f.status}"></div>
          </div>
          <div class="finding-value">${escapeHtml(f.value)}</div>
          <div class="finding-detail">${escapeHtml(f.detail)}</div>
        </div>
      `).join("")}
    </div>
    
    <div class="actions-section">
      <div class="actions-title">Recommended Actions</div>
      ${actions.map((a, i) => `
        <div class="action-item">
          <div class="action-number">${i + 1}</div>
          <div class="action-content">
            <div class="action-text">${escapeHtml(a.action)}</div>
            <div class="action-why">${escapeHtml(a.why)}</div>
          </div>
        </div>
      `).join("")}
    </div>
    
    ${snapshot.score_by_provider && Object.keys(snapshot.score_by_provider).length > 0 ? `
    <div class="providers-section">
      <div class="section-title" style="font-size: 14px; margin-bottom: 16px;">Score by AI Model</div>
      <div class="providers-grid">
        ${Object.entries(snapshot.score_by_provider)
          .sort((a, b) => b[1] - a[1])
          .map(([provider, provScore]) => {
            const pct = Math.max(0, Math.min(100, Number.isFinite(provScore) ? provScore : 0));
            return `
              <div class="provider-card">
                <div class="provider-score">${pct}</div>
                <div class="provider-info">
                  <div class="provider-name">${escapeHtml(provider)}</div>
                  <div class="provider-bar">
                    <div class="provider-bar-fill" style="width: ${pct}%"></div>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
      </div>
    </div>
    ` : ""}
    
    <div class="page-footer">
      <div>Confidential — ${escapeHtml(client.name)}</div>
      <div>${escapeHtml(agency.name)}</div>
    </div>
  </div>
  
  <!-- Page 3: Evidence -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <span class="page-section">Evidence</span>
        <span class="page-client">${escapeHtml(client.name)}</span>
      </div>
      <div class="page-number">Page 3</div>
    </div>
    
    <div class="section-title">Detailed Results</div>
    <div class="section-subtitle">Individual prompt analysis showing mention status and positioning</div>
    
    <table class="evidence-table">
      <thead>
        <tr>
          <th style="width: 50%">Prompt</th>
          <th>Mentioned</th>
          <th>Position</th>
          <th>Strength</th>
        </tr>
      </thead>
      <tbody>
        ${responses.map((r, idx) => {
          const pj = r.parsed_json;
          const mentioned = pj?.client_mentioned ? "Yes" : "No";
          const position = pj?.client_position || "—";
          const strength = pj?.recommendation_strength || "—";
          return `
            <tr>
              <td class="prompt-cell">${escapeHtml(truncate(r.prompt_text || `Prompt ${r.prompt_ordinal ?? idx + 1}`, 120))}</td>
              <td><span class="status-badge ${mentioned === "Yes" ? "yes" : "no"}">${mentioned}</span></td>
              <td>${escapeHtml(position)}</td>
              <td>${escapeHtml(strength)}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
    
    ${topCompetitors.length > 0 ? `
    <div class="competitors-section">
      <div class="section-title" style="font-size: 14px; margin-bottom: 16px;">Top Competitors Mentioned</div>
      <table class="competitors-table">
        <thead>
          <tr>
            <th style="width: 40%">Competitor</th>
            <th>Mentions</th>
          </tr>
        </thead>
        <tbody>
          ${topCompetitors.map(([name, count]) => {
            const maxCount = topCompetitors[0][1];
            const pct = Math.round((count / maxCount) * 100);
            return `
              <tr>
                <td>${escapeHtml(name)}</td>
                <td>
                  <div class="competitor-bar">
                    <div class="competitor-bar-track">
                      <div class="competitor-bar-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="competitor-count">${count}</span>
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
      <div>Confidential — ${escapeHtml(client.name)}</div>
      <div>${escapeHtml(agency.name)}</div>
    </div>
  </div>
  
  <!-- Page 4: Raw Data & Methodology -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <span class="page-section">Appendix</span>
        <span class="page-client">${escapeHtml(client.name)}</span>
      </div>
      <div class="page-number">Page 4</div>
    </div>
    
    <div class="section-title">Raw AI Outputs</div>
    <div class="section-subtitle">Sample responses for transparency. Full data available upon request.</div>
    
    <div class="raw-section">
      ${responses.slice(0, 3).map((r, idx) => `
        <div class="raw-item">
          <div class="raw-header">
            <div class="raw-label">Prompt ${r.prompt_ordinal ?? idx + 1}</div>
            <div class="raw-meta">${r.parsed_json?.client_mentioned ? "✓ Mentioned" : "✗ Not mentioned"}</div>
          </div>
          <div class="raw-text">${escapeHtml(truncate(r.raw_text || "No response captured", 400))}</div>
        </div>
      `).join("")}
      
      ${responses.length > 3 ? `
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 16px;">
          + ${responses.length - 3} additional responses not shown
        </div>
      ` : ""}
    </div>
    
    <div class="methodology-section">
      <div class="methodology-title">Methodology</div>
      <div class="methodology-grid">
        <div class="methodology-item">
          <div class="methodology-label">Data Collection</div>
          <div class="methodology-value">${formatDate(snapshot.created_at)}</div>
        </div>
        <div class="methodology-item">
          <div class="methodology-label">Snapshot ID</div>
          <div class="methodology-value">${snapshot.id}</div>
        </div>
        <div class="methodology-item">
          <div class="methodology-label">Models Tested</div>
          <div class="methodology-value">${models.length > 0 ? models.join(", ") : "—"}</div>
        </div>
        <div class="methodology-item">
          <div class="methodology-label">Competitors Tracked</div>
          <div class="methodology-value">${competitors.length}</div>
        </div>
        <div class="methodology-item">
          <div class="methodology-label">Prompt Pack</div>
          <div class="methodology-value">${snapshot.prompt_pack_version || "Standard"}</div>
        </div>
        <div class="methodology-item">
          <div class="methodology-label">Confidence</div>
          <div class="methodology-value">${confidence.level} — ${confidence.description}</div>
        </div>
      </div>
    </div>
    
    <div class="page-footer">
      <div>Confidential — ${escapeHtml(client.name)}</div>
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

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}
