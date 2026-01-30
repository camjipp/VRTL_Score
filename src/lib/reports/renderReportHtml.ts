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

function getScoreLabel(score: number | null): string {
  if (score === null) return "No Data";
  if (score >= 80) return "Excellent AI Visibility";
  if (score >= 70) return "Strong AI Visibility";
  if (score >= 50) return "Moderate AI Visibility";
  if (score >= 30) return "Limited AI Visibility";
  return "Low AI Visibility";
}

function getScoreColor(score: number | null): string {
  if (score === null) return "#64748b";
  if (score >= 70) return "#059669";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

// Generate executive insights based on data
function generateInsights(data: ReportData): string[] {
  const { client, responses, competitors } = data;
  const insights: string[] = [];
  
  let mentioned = 0, topPosition = 0, strongRec = 0, hasFeatures = 0;
  const competitorMentions = new Map<string, number>();
  
  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned) mentioned++;
    if (pj?.client_position === "top") topPosition++;
    if (pj?.recommendation_strength === "strong") strongRec++;
    if (pj?.has_specific_features) hasFeatures++;
    if (Array.isArray(pj?.competitors_mentioned)) {
      for (const name of pj.competitors_mentioned) {
        competitorMentions.set(name, (competitorMentions.get(name) ?? 0) + 1);
      }
    }
  }
  
  const total = responses.length;
  const mentionRate = total > 0 ? (mentioned / total) * 100 : 0;
  const totalCompMentions = Array.from(competitorMentions.values()).reduce((a, b) => a + b, 0);
  
  // Insight 1: Brand recognition
  if (mentionRate >= 70) {
    insights.push(`${client.name} is consistently recognized by AI models across ${Math.round(mentionRate)}% of relevant queries`);
  } else if (mentionRate >= 40) {
    insights.push(`${client.name} has moderate AI recognition, appearing in ${Math.round(mentionRate)}% of tested queries`);
  } else {
    insights.push(`${client.name} has limited AI visibility, appearing in only ${Math.round(mentionRate)}% of queries — significant growth opportunity`);
  }
  
  // Insight 2: Authority positioning
  if (topPosition >= 3 || strongRec >= 3) {
    insights.push("Strong authority positioning — AI models frequently recommend this brand as a top choice");
  } else if (topPosition >= 1 || strongRec >= 1) {
    insights.push("Emerging authority — AI occasionally positions this brand favorably, with room to strengthen");
  }
  
  // Insight 3: Competitive landscape
  if (totalCompMentions === 0 && mentioned > 0) {
    insights.push("Limited competitor presence in AI responses — a strategic advantage to maintain");
  } else if (totalCompMentions > mentioned) {
    insights.push("Competitors are appearing more frequently in AI responses — content optimization recommended");
  }
  
  // Insight 4: Feature clarity
  if (hasFeatures >= total * 0.5) {
    insights.push("AI clearly understands and communicates specific product/service features");
  }
  
  return insights.slice(0, 3);
}

// Generate business impact statement
function generateImpact(data: ReportData): string {
  const score = data.snapshot.vrtl_score;
  const { client } = data;
  
  if (score === null) {
    return `This report establishes a baseline for ${client.name}'s AI visibility. As AI-powered search becomes increasingly important for discovery, tracking and optimizing this presence will be critical for maintaining market position.`;
  }
  
  if (score >= 70) {
    return `${client.name} has established strong AI visibility, meaning the brand is well-positioned to capture traffic from AI-powered search and recommendation systems. Maintaining this position requires ongoing content optimization as competitors increase their AI presence.`;
  }
  
  if (score >= 50) {
    return `${client.name} has moderate AI visibility with clear opportunities for improvement. As more consumers rely on AI for recommendations and research, optimizing content structure and authority signals will help capture this growing channel.`;
  }
  
  return `${client.name} currently has limited visibility in AI-powered search results. This represents a significant opportunity — early investment in AI-optimized content can establish authority before competitors saturate this emerging channel.`;
}

// Calculate visibility pillars
function calculatePillars(data: ReportData): Array<{ name: string; score: number; description: string }> {
  const { responses } = data;
  const total = responses.length || 1;
  
  let mentioned = 0, topOrMiddle = 0, strongOrMedium = 0, hasFeatures = 0, hasCitations = 0;
  
  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned) mentioned++;
    if (pj?.client_position === "top" || pj?.client_position === "middle") topOrMiddle++;
    if (pj?.recommendation_strength === "strong" || pj?.recommendation_strength === "medium") strongOrMedium++;
    if (pj?.has_specific_features) hasFeatures++;
    if (pj?.has_sources_or_citations) hasCitations++;
  }
  
  return [
    {
      name: "Presence",
      score: Math.round((mentioned / total) * 100),
      description: "How consistently the brand appears in AI responses"
    },
    {
      name: "Extractability", 
      score: Math.round((hasFeatures / Math.max(mentioned, 1)) * 100),
      description: "How well AI can describe what the brand offers"
    },
    {
      name: "Authority",
      score: Math.round(((topOrMiddle + strongOrMedium) / (Math.max(mentioned, 1) * 2)) * 100),
      description: "How AI positions the brand relative to competitors"
    }
  ];
}

// Extract best evidence snippets
function extractEvidenceSnippets(data: ReportData): string[] {
  const snippets: string[] = [];
  
  for (const r of data.responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned && pj?.evidence_snippet) {
      const snippet = pj.evidence_snippet.trim();
      if (snippet.length > 20 && snippet.length < 200) {
        snippets.push(snippet);
      }
    }
  }
  
  return snippets.slice(0, 3);
}

// Generate opportunity areas
function generateOpportunities(data: ReportData): string[] {
  const { responses, competitors } = data;
  const opportunities: string[] = [];
  
  let mentioned = 0, hasCitations = 0, hasFeatures = 0, topPosition = 0;
  const competitorMentions = new Map<string, number>();
  
  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned) mentioned++;
    if (pj?.has_sources_or_citations) hasCitations++;
    if (pj?.has_specific_features) hasFeatures++;
    if (pj?.client_position === "top") topPosition++;
    if (Array.from(pj?.competitors_mentioned ?? []).length > 0) {
      for (const name of pj?.competitors_mentioned ?? []) {
        competitorMentions.set(name, (competitorMentions.get(name) ?? 0) + 1);
      }
    }
  }
  
  const total = responses.length || 1;
  
  if (mentioned < total * 0.5) {
    opportunities.push("Increase brand mentions through AI-optimized content structure and clear value propositions");
  }
  
  if (hasCitations < mentioned * 0.3) {
    opportunities.push("Limited citations detected — building authoritative backlinks and references can improve AI trust signals");
  }
  
  if (hasFeatures < mentioned * 0.5) {
    opportunities.push("AI struggles to extract specific features — clearer product/service descriptions recommended");
  }
  
  if (topPosition < mentioned * 0.3 && mentioned > 0) {
    opportunities.push("Brand is mentioned but rarely positioned first — strengthen authority signals and competitive differentiation");
  }
  
  if (competitorMentions.size > 0) {
    opportunities.push("Competitors are gaining AI visibility — monitor and respond with targeted content improvements");
  }
  
  if (opportunities.length === 0) {
    opportunities.push("Maintain current content quality while expanding topic coverage");
    opportunities.push("Continue monitoring AI landscape for emerging competitor activity");
  }
  
  return opportunities.slice(0, 4);
}

export function renderReportHtml(data: ReportData): string {
  const { agency, client, snapshot, competitors, responses } = data;
  
  const accentColor = agency.brand_accent || "#4f46e5";
  const score = snapshot.vrtl_score;
  const scoreLabel = getScoreLabel(score);
  const scoreColor = getScoreColor(score);
  
  // Calculate all data
  const insights = generateInsights(data);
  const impact = generateImpact(data);
  const pillars = calculatePillars(data);
  const evidenceSnippets = extractEvidenceSnippets(data);
  const opportunities = generateOpportunities(data);
  
  // Competitor data
  const competitorMentions = new Map<string, number>();
  let clientMentions = 0;
  
  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned) clientMentions++;
    if (Array.isArray(pj?.competitors_mentioned)) {
      for (const name of pj.competitors_mentioned) {
        competitorMentions.set(name, (competitorMentions.get(name) ?? 0) + 1);
      }
    }
  }
  
  const topCompetitors = Array.from(competitorMentions.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const models = snapshot.score_by_provider ? Object.entries(snapshot.score_by_provider).sort((a, b) => b[1] - a[1]) : [];

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    :root {
      --accent: ${accentColor};
      --score-color: ${scoreColor};
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    html, body {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1e293b;
      background: #fff;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 18mm;
      page-break-after: always;
      position: relative;
    }
    
    .page:last-child { page-break-after: avoid; }
    .no-break { page-break-inside: avoid; break-inside: avoid; }
    
    /* ========== COVER PAGE ========== */
    .cover {
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, #fafafa 0%, #fff 40%);
    }
    
    .cover-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .agency-logo { max-height: 36px; }
    .agency-name { font-size: 14px; font-weight: 700; color: #0f172a; }
    
    .cover-date {
      font-size: 10px;
      color: #64748b;
      text-align: right;
    }
    
    .cover-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 0;
    }
    
    .cover-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 12px;
    }
    
    .cover-client {
      font-size: 38px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    
    .cover-subtitle {
      font-size: 14px;
      color: #64748b;
      margin-top: 8px;
    }
    
    .cover-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    
    .powered-by {
      font-size: 9px;
      color: #94a3b8;
    }
    
    .powered-by span {
      font-weight: 600;
      color: #64748b;
    }
    
    /* ========== EXECUTIVE SUMMARY ========== */
    .exec-score-section {
      text-align: center;
      padding: 32px 0;
      margin-bottom: 24px;
    }
    
    .exec-score {
      font-size: 80px;
      font-weight: 800;
      color: var(--score-color);
      line-height: 1;
      letter-spacing: -0.03em;
    }
    
    .exec-score-max {
      font-size: 24px;
      color: #94a3b8;
      font-weight: 600;
    }
    
    .exec-score-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--score-color);
      margin-top: 8px;
    }
    
    .insights-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 24px;
    }
    
    .insights-title {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    
    .insight-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 0;
    }
    
    .insight-bullet {
      width: 6px;
      height: 6px;
      background: var(--accent);
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }
    
    .insight-text {
      font-size: 12px;
      color: #334155;
      line-height: 1.5;
    }
    
    .impact-box {
      border-left: 3px solid var(--accent);
      padding-left: 16px;
    }
    
    .impact-title {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    
    .impact-text {
      font-size: 11px;
      color: #475569;
      line-height: 1.7;
    }
    
    /* ========== SECTION HEADERS ========== */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #0f172a;
      margin-bottom: 24px;
    }
    
    .page-title {
      font-size: 10px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    
    .page-num {
      font-size: 10px;
      color: #94a3b8;
    }
    
    .section-header {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    
    /* ========== PROVIDER TABLE ========== */
    .provider-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    
    .provider-table th {
      text-align: left;
      padding: 12px 16px;
      background: #f1f5f9;
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .provider-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    
    .provider-table .score-cell {
      font-weight: 700;
      font-size: 16px;
    }
    
    .provider-table .pending {
      color: #94a3b8;
      font-style: italic;
    }
    
    /* ========== PILLARS ========== */
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .pillar {
      padding: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      text-align: center;
    }
    
    .pillar-score {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }
    
    .pillar-name {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 8px;
    }
    
    .pillar-desc {
      font-size: 9px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.4;
    }
    
    /* ========== COMPETITIVE LANDSCAPE ========== */
    .comp-summary {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .comp-stat {
      flex: 1;
      padding: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      text-align: center;
    }
    
    .comp-stat-value {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
    }
    
    .comp-stat-label {
      font-size: 10px;
      color: #64748b;
      margin-top: 4px;
    }
    
    .comp-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .comp-table th {
      text-align: left;
      padding: 10px 12px;
      background: #f1f5f9;
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    
    .comp-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
    }
    
    .comp-bar {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .comp-bar-track {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .comp-bar-fill {
      height: 100%;
      background: #64748b;
      border-radius: 4px;
    }
    
    .comp-count {
      font-weight: 700;
      min-width: 24px;
      text-align: right;
    }
    
    /* ========== EVIDENCE ========== */
    .evidence-list {
      margin-bottom: 24px;
    }
    
    .evidence-item {
      padding: 16px 20px;
      background: #f8fafc;
      border-left: 3px solid var(--accent);
      margin-bottom: 12px;
      border-radius: 0 6px 6px 0;
    }
    
    .evidence-quote {
      font-size: 12px;
      color: #334155;
      font-style: italic;
      line-height: 1.6;
    }
    
    .evidence-note {
      font-size: 10px;
      color: #64748b;
      margin-top: 20px;
      padding: 12px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    
    /* ========== OPPORTUNITIES ========== */
    .opps-list {
      margin-bottom: 32px;
    }
    
    .opp-item {
      display: flex;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .opp-item:last-child { border-bottom: none; }
    
    .opp-icon {
      width: 24px;
      height: 24px;
      background: #fef3c7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      flex-shrink: 0;
    }
    
    .opp-text {
      font-size: 11px;
      color: #334155;
      line-height: 1.5;
    }
    
    /* ========== NEXT STEPS ========== */
    .next-steps-box {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
    }
    
    .next-steps-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    
    .step-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .step-item:last-child { border-bottom: none; }
    
    .step-num {
      width: 24px;
      height: 24px;
      background: var(--accent);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .step-content {}
    .step-title { font-size: 12px; font-weight: 600; color: #0f172a; }
    .step-desc { font-size: 10px; color: #64748b; margin-top: 2px; }
    
    /* ========== FOOTER ========== */
    .page-footer {
      position: absolute;
      bottom: 15mm;
      left: 18mm;
      right: 18mm;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #94a3b8;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <!-- PAGE 1: COVER -->
  <div class="page cover">
    <div class="cover-top">
      ${agency.brand_logo_url 
        ? `<img class="agency-logo" src="${escapeHtml(agency.brand_logo_url)}" alt="" />`
        : `<div class="agency-name">${escapeHtml(agency.name)}</div>`
      }
      <div class="cover-date">${formatDate(snapshot.created_at)}</div>
    </div>
    
    <div class="cover-main">
      <div class="cover-label">AI Visibility Report</div>
      <div class="cover-client">${escapeHtml(client.name)}</div>
      ${client.website ? `<div class="cover-subtitle">${escapeHtml(client.website)}</div>` : ""}
    </div>
    
    <div class="cover-bottom">
      <div class="powered-by">Powered by <span>VRTL Score</span></div>
      <div class="cover-date">Snapshot ID: ${snapshot.id.slice(0, 8)}</div>
    </div>
  </div>
  
  <!-- PAGE 2: EXECUTIVE SUMMARY -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Executive Summary</span>
      <span class="page-num">Page 2</span>
    </div>
    
    <div class="exec-score-section no-break">
      <div>
        <span class="exec-score">${score ?? "—"}</span>
        <span class="exec-score-max">/ 100</span>
      </div>
      <div class="exec-score-label">${scoreLabel}</div>
    </div>
    
    <div class="insights-box no-break">
      <div class="insights-title">Key Insights</div>
      ${insights.map(text => `
        <div class="insight-item">
          <div class="insight-bullet"></div>
          <div class="insight-text">${escapeHtml(text)}</div>
        </div>
      `).join("")}
    </div>
    
    <div class="impact-box no-break">
      <div class="impact-title">What This Means</div>
      <div class="impact-text">${escapeHtml(impact)}</div>
    </div>
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 3: PROVIDER BREAKDOWN + VISIBILITY PILLARS -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Score Breakdown</span>
      <span class="page-num">Page 3</span>
    </div>
    
    <div class="section-header">Performance by AI Model</div>
    
    <table class="provider-table no-break">
      <thead>
        <tr>
          <th>AI Model</th>
          <th>Score</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${models.length > 0 ? models.map(([provider, provScore]) => `
          <tr>
            <td>${escapeHtml(provider)}</td>
            <td class="score-cell" style="color: ${getScoreColor(provScore)}">${Math.round(provScore)}</td>
            <td>${getScoreLabel(provScore)}</td>
          </tr>
        `).join("") : `
          <tr><td>OpenAI</td><td class="pending">—</td><td class="pending">Pending</td></tr>
          <tr><td>Anthropic</td><td class="pending">—</td><td class="pending">Pending</td></tr>
          <tr><td>Gemini</td><td class="pending">—</td><td class="pending">Pending</td></tr>
        `}
      </tbody>
    </table>
    
    <div class="section-header" style="margin-top: 32px;">Visibility Breakdown</div>
    
    <div class="pillars-grid no-break">
      ${pillars.map(p => `
        <div class="pillar">
          <div class="pillar-score">${p.score}</div>
          <div class="pillar-name">${escapeHtml(p.name)}</div>
          <div class="pillar-desc">${escapeHtml(p.description)}</div>
        </div>
      `).join("")}
    </div>
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 4: COMPETITIVE LANDSCAPE -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Competitive Landscape</span>
      <span class="page-num">Page 4</span>
    </div>
    
    <div class="section-header">AI Mention Comparison</div>
    
    <div class="comp-summary no-break">
      <div class="comp-stat">
        <div class="comp-stat-value">${clientMentions}/${responses.length}</div>
        <div class="comp-stat-label">${escapeHtml(client.name)} Mentions</div>
      </div>
      <div class="comp-stat">
        <div class="comp-stat-value">${topCompetitors.length}</div>
        <div class="comp-stat-label">Competitors Detected</div>
      </div>
    </div>
    
    ${topCompetitors.length > 0 ? `
      <div class="section-header" style="font-size: 14px; margin-top: 24px;">Top Competitors in AI Results</div>
      <table class="comp-table no-break">
        <thead>
          <tr>
            <th style="width: 50%">Competitor</th>
            <th>AI Mentions</th>
          </tr>
        </thead>
        <tbody>
          ${topCompetitors.map(([name, count]) => {
            const max = topCompetitors[0][1];
            const pct = Math.round((count / max) * 100);
            return `
              <tr>
                <td>${escapeHtml(name)}</td>
                <td>
                  <div class="comp-bar">
                    <div class="comp-bar-track">
                      <div class="comp-bar-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="comp-count">${count}</span>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    ` : `
      <div style="padding: 24px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center;">
        <div style="font-size: 14px; font-weight: 600; color: #166534; margin-bottom: 4px;">No Competitor Mentions Detected</div>
        <div style="font-size: 11px; color: #15803d;">This is a strategic advantage — ${escapeHtml(client.name)} has clear space in AI responses.</div>
      </div>
    `}
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 5: KEY AI INSIGHTS + OPPORTUNITIES -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">AI Insights & Opportunities</span>
      <span class="page-num">Page 5</span>
    </div>
    
    ${evidenceSnippets.length > 0 ? `
      <div class="section-header">How AI Describes ${escapeHtml(client.name)}</div>
      <div class="evidence-list no-break">
        ${evidenceSnippets.map(snippet => `
          <div class="evidence-item">
            <div class="evidence-quote">"${escapeHtml(snippet)}"</div>
          </div>
        `).join("")}
      </div>
    ` : `
      <div class="evidence-note">
        No specific brand descriptions were extracted from AI responses. This may indicate an opportunity to strengthen brand messaging clarity.
      </div>
    `}
    
    <div class="section-header" style="margin-top: 32px;">Opportunity Areas</div>
    <div class="opps-list no-break">
      ${opportunities.map(opp => `
        <div class="opp-item">
          <div class="opp-icon">⚡</div>
          <div class="opp-text">${escapeHtml(opp)}</div>
        </div>
      `).join("")}
    </div>
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 6: NEXT STEPS -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Recommended Actions</span>
      <span class="page-num">Page 6</span>
    </div>
    
    <div class="section-header">Next Steps to Improve AI Visibility</div>
    
    <div class="next-steps-box no-break">
      <div class="next-steps-title">Recommended Actions</div>
      
      <div class="step-item">
        <div class="step-num">1</div>
        <div class="step-content">
          <div class="step-title">Content Restructuring for AI Extractability</div>
          <div class="step-desc">Optimize content structure with clear headings, factual claims, and machine-readable formats that AI models can easily parse and cite.</div>
        </div>
      </div>
      
      <div class="step-item">
        <div class="step-num">2</div>
        <div class="step-content">
          <div class="step-title">Authority Building Across High-Trust Sources</div>
          <div class="step-desc">Develop authoritative content and secure citations from trusted sources that AI models reference when forming responses.</div>
        </div>
      </div>
      
      <div class="step-item">
        <div class="step-num">3</div>
        <div class="step-content">
          <div class="step-title">Competitive Positioning Optimization</div>
          <div class="step-desc">Analyze competitor AI presence and create differentiated content that positions your brand favorably in comparison queries.</div>
        </div>
      </div>
      
      <div class="step-item">
        <div class="step-num">4</div>
        <div class="step-content">
          <div class="step-title">Monthly Visibility Monitoring</div>
          <div class="step-desc">Schedule recurring snapshots to track progress, identify trends, and respond quickly to changes in AI landscape.</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 32px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;" class="no-break">
      <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Ready to improve your AI visibility?</div>
      <div style="font-size: 14px; font-weight: 700; color: #0f172a;">Contact ${escapeHtml(agency.name)} to discuss your optimization strategy.</div>
    </div>
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>Powered by VRTL Score</span>
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
