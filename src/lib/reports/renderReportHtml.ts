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

// Score tier system
function getScoreTier(score: number | null): { tier: string; label: string; color: string } {
  if (score === null) return { tier: "Unknown", label: "No data available", color: "#64748b" };
  if (score >= 90) return { tier: "Leader", label: "Dominant AI visibility", color: "#059669" };
  if (score >= 70) return { tier: "Strong", label: "Strong AI visibility", color: "#10b981" };
  if (score >= 50) return { tier: "Developing", label: "Developing visibility", color: "#f59e0b" };
  return { tier: "Weak", label: "Limited visibility", color: "#ef4444" };
}

// Calculate all metrics from responses
function calculateMetrics(data: ReportData) {
  const { client, responses, competitors } = data;
  const total = responses.length || 1;
  
  let mentioned = 0, topPosition = 0, strongRec = 0, hasCitations = 0, hasFeatures = 0;
  const competitorData = new Map<string, { mentions: number; positions: number[]; strongCount: number }>();
  
  // Initialize competitor tracking
  for (const c of competitors) {
    competitorData.set(c.name, { mentions: 0, positions: [], strongCount: 0 });
  }
  
  for (const r of responses) {
    const pj = r.parsed_json;
    if (!pj) continue;
    
    if (pj.client_mentioned) mentioned++;
    if (pj.client_position === "top") topPosition++;
    if (pj.recommendation_strength === "strong") strongRec++;
    if (pj.has_sources_or_citations) hasCitations++;
    if (pj.has_specific_features) hasFeatures++;
    
    // Track competitor data
    if (Array.isArray(pj.competitors_mentioned)) {
      for (const name of pj.competitors_mentioned) {
        const existing = competitorData.get(name) || { mentions: 0, positions: [], strongCount: 0 };
        existing.mentions++;
        // Estimate position based on client position (simplified)
        if (pj.client_position === "top") existing.positions.push(2);
        else if (pj.client_position === "middle") existing.positions.push(2);
        else existing.positions.push(1);
        competitorData.set(name, existing);
      }
    }
  }
  
  // Calculate competitor stats
  const competitorStats = Array.from(competitorData.entries())
    .map(([name, data]) => ({
      name,
      mentions: data.mentions,
      avgPosition: data.positions.length > 0 
        ? (data.positions.reduce((a, b) => a + b, 0) / data.positions.length).toFixed(1)
        : "—",
      strongCount: data.strongCount
    }))
    .filter(c => c.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions);
  
  // Calculate client's average position (1 = top, 2 = middle, 3 = bottom)
  let clientAvgPosition = 0;
  let positionCount = 0;
  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned) {
      if (pj.client_position === "top") { clientAvgPosition += 1; positionCount++; }
      else if (pj.client_position === "middle") { clientAvgPosition += 2; positionCount++; }
      else if (pj.client_position === "bottom") { clientAvgPosition += 3; positionCount++; }
    }
  }
  const avgPosition = positionCount > 0 ? (clientAvgPosition / positionCount).toFixed(1) : "—";
  
  // Count prompts where client beats competitors
  let promptsWon = 0;
  for (const r of responses) {
    const pj = r.parsed_json;
    if (pj?.client_mentioned && pj.client_position === "top") {
      promptsWon++;
    }
  }
  
  return {
    total,
    mentioned,
    mentionRate: Math.round((mentioned / total) * 100),
    topPosition,
    topPositionRate: Math.round((topPosition / total) * 100),
    strongRec,
    strongRecRate: Math.round((strongRec / total) * 100),
    hasCitations,
    citationRate: Math.round((hasCitations / total) * 100),
    hasFeatures,
    avgPosition,
    promptsWon,
    competitorStats
  };
}

// Generate narrative interpretation
function generateNarrative(data: ReportData, metrics: ReturnType<typeof calculateMetrics>): string {
  const { client } = data;
  const score = data.snapshot.vrtl_score;
  const tier = getScoreTier(score);
  
  if (score === null) {
    return `This report establishes a baseline for ${client.name}'s AI visibility.`;
  }
  
  const parts: string[] = [];
  
  // Mention consistency
  if (metrics.mentionRate >= 80) {
    parts.push(`${client.name} is consistently recognized across AI models`);
  } else if (metrics.mentionRate >= 50) {
    parts.push(`${client.name} has moderate recognition in AI responses`);
  } else {
    parts.push(`${client.name} has limited visibility in AI responses`);
  }
  
  // Positioning
  if (metrics.topPositionRate >= 50) {
    parts.push("with strong top positioning");
  } else if (metrics.topPosition > 0) {
    parts.push("with occasional top positioning");
  }
  
  // Authority
  if (metrics.strongRecRate >= 50) {
    parts.push("and receives strong recommendations");
  }
  
  return parts.join(", ") + ".";
}

// Generate verdict, wins, and risks
function generateVerdict(data: ReportData, metrics: ReturnType<typeof calculateMetrics>) {
  const { client } = data;
  const tier = getScoreTier(data.snapshot.vrtl_score);
  
  const wins: string[] = [];
  const risks: string[] = [];
  
  if (metrics.mentionRate >= 70) wins.push("Consistent brand mentions");
  if (metrics.topPositionRate >= 50) wins.push("Strong top positioning");
  if (metrics.strongRecRate >= 50) wins.push("Frequent strong recommendations");
  if (metrics.citationRate >= 30) wins.push("Authority citations present");
  
  if (metrics.mentionRate < 50) risks.push("Low mention consistency");
  if (metrics.topPositionRate < 30) risks.push("Weak positioning vs competitors");
  if (metrics.citationRate === 0) risks.push("No citations detected — authority gap");
  if (metrics.competitorStats.length > 0 && metrics.competitorStats[0].mentions >= metrics.mentioned) {
    risks.push("Competitors appearing alongside or above");
  }
  
  if (wins.length === 0) wins.push("Baseline established for tracking");
  if (risks.length === 0) risks.push("Monitor for competitor movements");
  
  return { verdict: tier.label, wins: wins.slice(0, 3), risks: risks.slice(0, 2) };
}

export function renderReportHtml(data: ReportData): string {
  const { agency, client, snapshot, competitors, responses } = data;
  
  const accentColor = agency.brand_accent || "#6366f1";
  const score = snapshot.vrtl_score;
  const tier = getScoreTier(score);
  const metrics = calculateMetrics(data);
  const narrative = generateNarrative(data, metrics);
  const { verdict, wins, risks } = generateVerdict(data, metrics);
  
  const models = snapshot.score_by_provider ? Object.entries(snapshot.score_by_provider).sort((a, b) => b[1] - a[1]) : [];

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    :root { --accent: ${accentColor}; --score: ${tier.color}; }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    html, body {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 10px;
      line-height: 1.5;
      color: #1e293b;
      background: #fff;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 16mm;
      page-break-after: always;
      position: relative;
    }
    .page:last-child { page-break-after: avoid; }
    .no-break { page-break-inside: avoid; break-inside: avoid; }
    
    /* ===== TYPOGRAPHY ===== */
    .h1 { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .h3 { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .label { font-size: 9px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
    .body { font-size: 11px; color: #475569; line-height: 1.6; }
    .small { font-size: 9px; color: #64748b; }
    
    /* ===== COMPONENTS ===== */
    .kpi-card {
      padding: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .kpi-value { font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1; }
    .kpi-label { font-size: 9px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
    .kpi-note { font-size: 9px; color: #94a3b8; margin-top: 4px; }
    
    .pill {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 600;
    }
    .pill-green { background: #d1fae5; color: #065f46; }
    .pill-yellow { background: #fef3c7; color: #92400e; }
    .pill-red { background: #fee2e2; color: #991b1b; }
    .pill-gray { background: #f1f5f9; color: #475569; }
    .pill-accent { background: var(--accent); color: #fff; }
    
    .divider { height: 1px; background: #e2e8f0; margin: 16px 0; }
    
    /* ===== COVER PAGE ===== */
    .cover { background: linear-gradient(180deg, #fafafa 0%, #fff 50%); }
    
    .cover-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .cover-logo img { max-height: 32px; }
    .cover-logo-text { font-size: 14px; font-weight: 700; color: #0f172a; }
    
    .cover-main { padding: 48px 0; }
    .cover-type { font-size: 11px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
    .cover-client { font-size: 36px; font-weight: 800; color: #0f172a; line-height: 1.1; }
    .cover-url { font-size: 12px; color: #64748b; margin-top: 4px; }
    
    .score-hero {
      margin-top: 32px;
      display: flex;
      align-items: flex-start;
      gap: 24px;
    }
    
    .score-ring {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: conic-gradient(var(--score) calc(${score ?? 0} * 3.6deg), #e2e8f0 0);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .score-ring-inner {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .score-number { font-size: 42px; font-weight: 800; color: #0f172a; line-height: 1; }
    .score-max { font-size: 14px; color: #94a3b8; }
    
    .score-meta { flex: 1; }
    .score-tier { font-size: 14px; font-weight: 700; color: var(--score); margin-bottom: 4px; }
    .score-narrative { font-size: 11px; color: #475569; line-height: 1.6; margin-bottom: 16px; }
    
    .scope-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .scope-item { padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
    .scope-value { font-size: 12px; font-weight: 700; color: #0f172a; }
    .scope-label { font-size: 8px; color: #64748b; margin-top: 2px; }
    
    .cover-footer {
      position: absolute;
      bottom: 16mm;
      left: 16mm;
      right: 16mm;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #94a3b8;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
    
    /* ===== PAGE HEADERS ===== */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #0f172a;
      margin-bottom: 20px;
    }
    .page-title { font-size: 10px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.06em; }
    .page-num { font-size: 9px; color: #94a3b8; }
    
    .page-footer {
      position: absolute;
      bottom: 12mm;
      left: 16mm;
      right: 16mm;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #94a3b8;
    }
    
    /* ===== EXECUTIVE SUMMARY ===== */
    .verdict-box {
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-left: 4px solid var(--accent);
      border-radius: 0 8px 8px 0;
      margin-bottom: 20px;
    }
    
    .verdict-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    
    .verdict-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    
    .verdict-section h4 { font-size: 10px; font-weight: 600; color: #64748b; margin-bottom: 8px; }
    .verdict-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #334155; padding: 4px 0; }
    .verdict-icon { font-size: 10px; }
    
    .rubric-box {
      padding: 14px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    
    .rubric-title { font-size: 10px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .rubric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .rubric-item { text-align: center; padding: 8px; border-radius: 4px; }
    .rubric-item.active { background: #f0fdf4; border: 1px solid #86efac; }
    .rubric-score { font-size: 11px; font-weight: 700; color: #0f172a; }
    .rubric-label { font-size: 8px; color: #64748b; }
    
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    
    .insight-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .insight-card { padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
    .insight-icon { font-size: 16px; margin-bottom: 8px; }
    .insight-title { font-size: 10px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
    .insight-value { font-size: 20px; font-weight: 800; color: #0f172a; }
    .insight-note { font-size: 9px; color: #64748b; margin-top: 4px; }
    
    /* ===== MODELS ===== */
    .models-section { margin-top: 20px; }
    .model-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .model-row:last-child { border-bottom: none; }
    .model-name { width: 80px; font-size: 11px; font-weight: 500; color: #334155; }
    .model-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .model-fill { height: 100%; background: var(--accent); border-radius: 4px; }
    .model-score { width: 40px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right; }
    .model-pending { color: #94a3b8; font-size: 11px; }
    
    /* ===== ACTION PLAN ===== */
    .action-box {
      padding: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-top: 20px;
    }
    .action-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .action-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .action-item { display: flex; gap: 10px; padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; }
    .action-week { font-size: 9px; font-weight: 700; color: var(--accent); min-width: 50px; }
    .action-text { font-size: 10px; color: #334155; }
    
    /* ===== EVIDENCE TABLE ===== */
    .summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    
    .evidence-table { width: 100%; border-collapse: collapse; font-size: 9px; }
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
      vertical-align: middle;
    }
    .evidence-table tr:nth-child(even) td { background: #fafafa; }
    
    .prompt-text { max-width: 180px; line-height: 1.4; }
    
    /* ===== COMPETITIVE ===== */
    .comp-header { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    
    .comp-table { width: 100%; border-collapse: collapse; font-size: 10px; }
    .comp-table th {
      text-align: left;
      padding: 10px 12px;
      background: #f1f5f9;
      font-weight: 600;
      color: #475569;
    }
    .comp-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    
    .position-bar { display: flex; align-items: center; gap: 8px; }
    .position-track { width: 60px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .position-fill { height: 100%; background: #64748b; border-radius: 3px; }
    
    /* ===== APPENDIX ===== */
    .code-box {
      padding: 12px;
      background: #1e293b;
      border-radius: 6px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .code-header { font-size: 9px; color: #94a3b8; margin-bottom: 8px; }
    .code-content {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 8px;
      color: #e2e8f0;
      white-space: pre-wrap;
      word-break: break-all;
      line-height: 1.5;
    }
    
    .method-table { width: 100%; border-collapse: collapse; font-size: 10px; }
    .method-table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .method-table td:first-child { width: 40%; color: #64748b; font-weight: 500; }
    
    .disclaimer {
      padding: 12px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      font-size: 9px;
      color: #92400e;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <!-- PAGE 1: COVER -->
  <div class="page cover">
    <div class="cover-header">
      ${agency.brand_logo_url 
        ? `<div class="cover-logo"><img src="${escapeHtml(agency.brand_logo_url)}" alt="" /></div>`
        : `<div class="cover-logo-text">${escapeHtml(agency.name)}</div>`
      }
      <div class="small">${formatDate(snapshot.created_at)}</div>
    </div>
    
    <div class="cover-main">
      <div class="cover-type">AI Visibility Report</div>
      <div class="cover-client">${escapeHtml(client.name)}</div>
      ${client.website ? `<div class="cover-url">${escapeHtml(client.website)}</div>` : ""}
      
      <div class="score-hero no-break">
        <div class="score-ring">
          <div class="score-ring-inner">
            <div class="score-number">${score ?? "—"}</div>
            <div class="score-max">/ 100</div>
          </div>
        </div>
        
        <div class="score-meta">
          <div class="score-tier">AI Visibility: ${tier.tier}</div>
          <div class="score-narrative">${escapeHtml(narrative)}</div>
          
          <div class="scope-grid">
            <div class="scope-item">
              <div class="scope-value">${models.length > 0 ? models.map(m => m[0]).join(", ") : "OpenAI"}</div>
              <div class="scope-label">Models Tested</div>
            </div>
            <div class="scope-item">
              <div class="scope-value">${competitors.length}</div>
              <div class="scope-label">Competitors</div>
            </div>
            <div class="scope-item">
              <div class="scope-value">${snapshot.prompt_pack_version || "v1_core"}</div>
              <div class="scope-label">Prompt Pack</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cover-footer">
      <span>Confidential — Prepared for ${escapeHtml(client.name)}</span>
      <span>Powered by VRTL Score • ID: ${snapshot.id.slice(0, 8)}</span>
    </div>
  </div>
  
  <!-- PAGE 2: KEY FINDINGS -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Key Findings</span>
      <span class="page-num">Page 2</span>
    </div>
    
    <!-- Verdict Box -->
    <div class="verdict-box no-break">
      <div class="verdict-title">Snapshot Verdict: ${verdict}</div>
      <div class="verdict-grid">
        <div class="verdict-section">
          <h4>✓ Wins</h4>
          ${wins.map(w => `<div class="verdict-item"><span class="verdict-icon">●</span> ${escapeHtml(w)}</div>`).join("")}
        </div>
        <div class="verdict-section">
          <h4>⚠ Risks</h4>
          ${risks.map(r => `<div class="verdict-item"><span class="verdict-icon">●</span> ${escapeHtml(r)}</div>`).join("")}
        </div>
      </div>
    </div>
    
    <!-- Score Rubric -->
    <div class="rubric-box no-break">
      <div class="rubric-title">What the VRTL Score Means</div>
      <div class="rubric-grid">
        <div class="rubric-item ${score !== null && score >= 90 ? 'active' : ''}">
          <div class="rubric-score">90–100</div>
          <div class="rubric-label">Leader</div>
        </div>
        <div class="rubric-item ${score !== null && score >= 70 && score < 90 ? 'active' : ''}">
          <div class="rubric-score">70–89</div>
          <div class="rubric-label">Strong</div>
        </div>
        <div class="rubric-item ${score !== null && score >= 50 && score < 70 ? 'active' : ''}">
          <div class="rubric-score">50–69</div>
          <div class="rubric-label">Developing</div>
        </div>
        <div class="rubric-item ${score !== null && score < 50 ? 'active' : ''}">
          <div class="rubric-score">&lt;50</div>
          <div class="rubric-label">Weak</div>
        </div>
      </div>
    </div>
    
    <!-- Key Metrics -->
    <div class="insight-cards no-break">
      <div class="insight-card">
        <div class="insight-icon">👁</div>
        <div class="insight-title">Visibility</div>
        <div class="insight-value">${metrics.mentionRate}%</div>
        <div class="insight-note">Coverage: ${metrics.mentioned}/${metrics.total} prompts</div>
      </div>
      <div class="insight-card">
        <div class="insight-icon">🎯</div>
        <div class="insight-title">Positioning</div>
        <div class="insight-value">${metrics.topPositionRate}%</div>
        <div class="insight-note">Top position: ${metrics.topPosition}/${metrics.total}</div>
      </div>
      <div class="insight-card">
        <div class="insight-icon">🏆</div>
        <div class="insight-title">Authority</div>
        <div class="insight-value">${metrics.citationRate}%</div>
        <div class="insight-note">Citations: ${metrics.hasCitations}/${metrics.total}</div>
      </div>
    </div>
    
    <!-- Score by Model -->
    <div class="models-section no-break">
      <div class="h3">Score by AI Model</div>
      ${models.length > 0 ? models.map(([name, val]) => `
        <div class="model-row">
          <div class="model-name">${escapeHtml(name)}</div>
          <div class="model-bar"><div class="model-fill" style="width: ${val}%"></div></div>
          <div class="model-score">${Math.round(val)}</div>
        </div>
      `).join("") : ""}
      <div class="model-row">
        <div class="model-name">Anthropic</div>
        <div class="model-bar"><div class="model-fill" style="width: 0%; background: #e2e8f0;"></div></div>
        <div class="model-pending">—</div>
      </div>
      <div class="model-row">
        <div class="model-name">Gemini</div>
        <div class="model-bar"><div class="model-fill" style="width: 0%; background: #e2e8f0;"></div></div>
        <div class="model-pending">—</div>
      </div>
    </div>
    
    <!-- 30-Day Action Plan -->
    <div class="action-box no-break">
      <div class="action-title">30-Day Action Plan</div>
      <div class="action-grid">
        <div class="action-item">
          <div class="action-week">Week 1</div>
          <div class="action-text">Audit content structure for AI extractability</div>
        </div>
        <div class="action-item">
          <div class="action-week">Week 2</div>
          <div class="action-text">Build authority via citations & trusted sources</div>
        </div>
        <div class="action-item">
          <div class="action-week">Week 3</div>
          <div class="action-text">Optimize competitive positioning content</div>
        </div>
        <div class="action-item">
          <div class="action-week">Week 4</div>
          <div class="action-text">Rerun snapshot to measure progress</div>
        </div>
      </div>
    </div>
    
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
    
    <div class="h2">Prompt Outcomes Summary</div>
    <div class="summary-row no-break">
      <div class="kpi-card">
        <div class="kpi-value">${metrics.topPosition}/${metrics.total}</div>
        <div class="kpi-label">Top Position</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${metrics.strongRec}/${metrics.total}</div>
        <div class="kpi-label">Strong Rec</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${metrics.hasCitations}/${metrics.total}</div>
        <div class="kpi-label">Citations</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${metrics.hasFeatures}/${metrics.total}</div>
        <div class="kpi-label">Features Extracted</div>
      </div>
    </div>
    
    <div class="h3" style="margin-top: 16px;">Detailed Results</div>
    <table class="evidence-table">
      <thead>
        <tr>
          <th>Prompt</th>
          <th>Mentioned</th>
          <th>Position</th>
          <th>Strength</th>
          <th>Competitors</th>
        </tr>
      </thead>
      <tbody>
        ${responses.slice(0, 8).map((r, idx) => {
          const pj = r.parsed_json;
          const compCount = pj?.competitors_mentioned?.length ?? 0;
          return `
            <tr>
              <td class="prompt-text">${escapeHtml(truncate(r.prompt_text || `Prompt ${idx + 1}`, 60))}</td>
              <td><span class="pill ${pj?.client_mentioned ? 'pill-green' : 'pill-red'}">${pj?.client_mentioned ? 'Yes' : 'No'}</span></td>
              <td><span class="pill ${pj?.client_position === 'top' ? 'pill-accent' : 'pill-gray'}">${pj?.client_position || '—'}</span></td>
              <td>${pj?.recommendation_strength || '—'}</td>
              <td>${compCount > 0 ? compCount : '—'}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
    ${responses.length > 8 ? `<div class="small" style="margin-top: 8px;">+ ${responses.length - 8} more prompts</div>` : ''}
    
    ${metrics.competitorStats.length > 0 ? `
    <div class="h3" style="margin-top: 24px;">Competitive Comparison</div>
    <table class="comp-table no-break">
      <thead>
        <tr>
          <th>Competitor</th>
          <th>Mentions</th>
          <th>Avg Position</th>
          <th>vs ${escapeHtml(client.name)}</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f0fdf4;">
          <td><strong>${escapeHtml(client.name)}</strong></td>
          <td><strong>${metrics.mentioned}/${metrics.total}</strong></td>
          <td><strong>${metrics.avgPosition}</strong></td>
          <td>—</td>
        </tr>
        ${metrics.competitorStats.slice(0, 4).map(c => {
          const clientWins = metrics.topPosition > c.mentions ? 'Winning' : c.mentions > metrics.mentioned ? 'Behind' : 'Tied';
          return `
            <tr>
              <td>${escapeHtml(c.name)}</td>
              <td>${c.mentions}/${metrics.total}</td>
              <td>${c.avgPosition}</td>
              <td><span class="pill ${clientWins === 'Winning' ? 'pill-green' : clientWins === 'Behind' ? 'pill-red' : 'pill-yellow'}">${clientWins}</span></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
    ` : `
    <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;" class="no-break">
      <div class="h3" style="color: #166534; margin-bottom: 4px;">No Competitors Detected in AI Responses</div>
      <div class="body" style="color: #15803d;">This is a competitive advantage. ${escapeHtml(client.name)} has clear space in AI results.</div>
    </div>
    `}
    
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
    
    <div class="h2">Extraction Samples</div>
    <div class="small" style="margin-bottom: 16px;">Structured output for auditability. Full response logs available upon request.</div>
    
    ${responses.slice(0, 2).map((r, idx) => {
      const pj = r.parsed_json;
      if (!pj) return '';
      return `
        <div class="code-box no-break">
          <div class="code-header">Prompt ${r.prompt_ordinal ?? idx + 1} — ${pj.client_mentioned ? '✓ Mentioned' : '✗ Not mentioned'}</div>
          <div class="code-content">{
  "client_mentioned": ${pj.client_mentioned},
  "client_position": "${pj.client_position}",
  "recommendation_strength": "${pj.recommendation_strength}",
  "has_sources_or_citations": ${pj.has_sources_or_citations},
  "competitors_mentioned": ${JSON.stringify(pj.competitors_mentioned || [])}
}</div>
        </div>
      `;
    }).join("")}
    
    <div class="h3" style="margin-top: 24px;">Methodology</div>
    <table class="method-table no-break">
      <tr><td>Report Generated</td><td>${formatDate(snapshot.created_at)}</td></tr>
      <tr><td>Snapshot ID</td><td>${snapshot.id}</td></tr>
      <tr><td>Models Tested</td><td>${models.length > 0 ? models.map(m => m[0]).join(", ") : "OpenAI"}</td></tr>
      <tr><td>Prompts Analyzed</td><td>${metrics.total}</td></tr>
      <tr><td>Competitors Tracked</td><td>${competitors.length}</td></tr>
      <tr><td>Prompt Pack Version</td><td>${snapshot.prompt_pack_version || "v1_core"}</td></tr>
    </table>
    
    <div class="disclaimer no-break">
      <strong>Note:</strong> LLM outputs can vary slightly between runs. This report prioritizes repeatability via fixed prompts and structured scoring. Results reflect AI model behavior at time of snapshot and may change as models are updated.
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

function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len - 1) + "…" : str;
}
