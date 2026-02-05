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

/* ═══════════════════════════════════════════════════════════════════════════
   SCORE CONTEXT SYSTEM
═══════════════════════════════════════════════════════════════════════════ */

type ScoreTier = {
  tier: string;
  label: string;
  color: string;
  description: string;
  implication: string;
};

function getScoreTier(score: number | null): ScoreTier {
  if (score === null) return { 
    tier: "Unknown", 
    label: "No data", 
    color: "#64748b",
    description: "Run a snapshot to measure visibility",
    implication: "Baseline measurement needed"
  };
  if (score >= 90) return { 
    tier: "Dominant", 
    label: "90-100", 
    color: "#059669",
    description: "You're the default recommendation in AI responses",
    implication: "Defend your position — competitors will target you"
  };
  if (score >= 80) return { 
    tier: "Strong", 
    label: "80-89", 
    color: "#10b981",
    description: "Consistently mentioned first or second",
    implication: "Maintain momentum — the gap to #1 is closable"
  };
  if (score >= 70) return { 
    tier: "Moderate", 
    label: "70-79", 
    color: "#f59e0b",
    description: "Mentioned but not prominently positioned",
    implication: "Close the gap — you're in consideration but not first choice"
  };
  if (score >= 50) return { 
    tier: "Contested", 
    label: "50-69", 
    color: "#f97316",
    description: "Sometimes mentioned, often behind competitors",
    implication: "Differentiation needed — multiple players competing"
  };
  return { 
    tier: "Weak", 
    label: "<50", 
    color: "#ef4444",
    description: "Rarely surfaced in AI responses",
    implication: "Foundational work required — significant gap to leaders"
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   METRICS CALCULATION
═══════════════════════════════════════════════════════════════════════════ */

function calculateMetrics(data: ReportData) {
  const { responses, competitors, client } = data;
  const total = responses.length || 1;
  
  let mentioned = 0, topPosition = 0, middlePosition = 0, bottomPosition = 0;
  let strongRec = 0, moderateRec = 0, weakRec = 0;
  let hasCitations = 0, hasFeatures = 0;
  const competitorData = new Map<string, { mentions: number; topCount: number }>();
  
  for (const c of competitors) {
    competitorData.set(c.name, { mentions: 0, topCount: 0 });
  }

  for (const r of responses) {
    const pj = r.parsed_json;
    if (!pj) continue;
    
    if (pj.client_mentioned) {
      mentioned++;
      if (pj.client_position === "top") topPosition++;
      else if (pj.client_position === "middle") middlePosition++;
      else if (pj.client_position === "bottom") bottomPosition++;
    }
    
    if (pj.recommendation_strength === "strong") strongRec++;
    else if (pj.recommendation_strength === "medium") moderateRec++;
    else if (pj.recommendation_strength === "weak") weakRec++;
    
    if (pj.has_sources_or_citations) hasCitations++;
    if (pj.has_specific_features) hasFeatures++;
    
    if (Array.isArray(pj.competitors_mentioned)) {
      for (const name of pj.competitors_mentioned) {
        const existing = competitorData.get(name) || { mentions: 0, topCount: 0 };
        existing.mentions++;
        competitorData.set(name, existing);
      }
    }
  }

  // Build competitive rankings
  const competitorStats = Array.from(competitorData.entries())
    .map(([name, stats]) => ({ name, mentions: stats.mentions, rate: Math.round((stats.mentions / total) * 100) }))
    .filter(c => c.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions);
  
  // Add client to rankings
  const clientRate = Math.round((mentioned / total) * 100);
  const allEntities = [
    { name: client.name, mentions: mentioned, rate: clientRate, isClient: true },
    ...competitorStats.map(c => ({ ...c, isClient: false }))
  ].sort((a, b) => b.mentions - a.mentions);
  
  const clientRank = allEntities.findIndex(e => e.isClient) + 1;
  const leader = allEntities[0];
  const gapToLeader = leader && !leader.isClient ? leader.mentions - mentioned : 0;
  
  // Find fastest riser (competitor with most mentions)
  const topCompetitor = competitorStats[0];
  
  return {
    total,
    mentioned,
    mentionRate: Math.round((mentioned / total) * 100),
    topPosition,
    topPositionRate: Math.round((topPosition / total) * 100),
    middlePosition,
    bottomPosition,
    strongRec,
    strongRecRate: Math.round((strongRec / total) * 100),
    moderateRec,
    weakRec,
    hasCitations,
    citationRate: Math.round((hasCitations / total) * 100),
    hasFeatures,
    competitorStats,
    allEntities,
    clientRank,
    gapToLeader,
    leader,
    topCompetitor
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   STRATEGIC INSIGHTS GENERATION
═══════════════════════════════════════════════════════════════════════════ */

type Insight = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  insight: string;
  whyItMatters: string;
  action: string;
  expectedImpact: string;
};

function generateInsights(data: ReportData, metrics: ReturnType<typeof calculateMetrics>): Insight[] {
  const insights: Insight[] = [];
  const models = data.snapshot.score_by_provider ? Object.entries(data.snapshot.score_by_provider).sort((a, b) => b[1] - a[1]) : [];
  const score = data.snapshot.vrtl_score;
  
  // Check for weak models
  const weakModels = models.filter(([, s]) => s < 50);
  const strongModels = models.filter(([, s]) => s >= 80);
  const avgScore = models.length > 0 ? Math.round(models.reduce((sum, [, s]) => sum + s, 0) / models.length) : score ?? 0;
  
  if (weakModels.length > 0) {
    const worstModel = weakModels[weakModels.length - 1];
    const gap = avgScore - worstModel[1];
    insights.push({
      priority: "HIGH",
      title: `${worstModel[0]} Visibility Gap`,
      insight: `${worstModel[0]} scores ${worstModel[1]} — ${gap} points below your average.`,
      whyItMatters: `${worstModel[0]} handles significant AI query volume. Low visibility means missed discovery.`,
      action: "Improve web authority and publish comparison content targeting this model's training data.",
      expectedImpact: `+10-15 points in ${worstModel[0]} within 60 days.`
    });
  }
  
  // Competitor threat
  if (metrics.topCompetitor && metrics.topCompetitor.mentions >= metrics.mentioned) {
    insights.push({
      priority: "HIGH",
      title: "Competitor Visibility Threat",
      insight: `${metrics.topCompetitor.name} is mentioned ${metrics.topCompetitor.mentions} times vs your ${metrics.mentioned}.`,
      whyItMatters: "AI models are positioning a competitor ahead of you in recommendations.",
      action: "Audit their content strategy. Counter-position with differentiated messaging.",
      expectedImpact: "Regain competitive parity within 90 days."
    });
  }
  
  // Low mention rate
  if (metrics.mentionRate < 50) {
    insights.push({
      priority: "HIGH",
      title: "Low Visibility Rate",
      insight: `Mentioned in only ${metrics.mentionRate}% of AI responses.`,
      whyItMatters: "More than half of AI users asking about your category won't discover you.",
      action: "Improve brand authority through PR, backlinks, and structured data.",
      expectedImpact: "Target 70%+ mention rate to enter consideration set."
    });
  }
  
  // Low positioning
  if (metrics.topPositionRate < 30 && metrics.mentionRate >= 50) {
    insights.push({
      priority: "MEDIUM",
      title: "Positioning Weakness",
      insight: `Mentioned but only in top position ${metrics.topPositionRate}% of the time.`,
      whyItMatters: "You're in the conversation but not the first recommendation.",
      action: "Strengthen unique value proposition messaging.",
      expectedImpact: "Move from 'also mentioned' to 'first choice' positioning."
    });
  }
  
  // Low citations
  if (metrics.citationRate < 20) {
    insights.push({
      priority: "MEDIUM",
      title: "Authority Gap",
      insight: `Only ${metrics.citationRate}% of mentions include citations.`,
      whyItMatters: "AI models don't view your brand as an authoritative source.",
      action: "Earn citations from industry publications, reviews, and trusted sources.",
      expectedImpact: "Higher citation rate correlates with +5-10 score points."
    });
  }
  
  // Strong model to replicate
  if (strongModels.length > 0 && strongModels.length < models.length) {
    insights.push({
      priority: "LOW",
      title: `${strongModels[0][0]} Strength (Replicate)`,
      insight: `${strongModels[0][0]} scores you ${strongModels[0][1]} — your highest.`,
      whyItMatters: "Shows your content strategy works for this model.",
      action: "Analyze what content resonates with this model and replicate for others.",
      expectedImpact: "Lift weaker models by applying successful patterns."
    });
  }
  
  // Good score - maintain
  if ((score ?? 0) >= 70 && insights.length === 0) {
    insights.push({
      priority: "LOW",
      title: "Strong Position (Maintain)",
      insight: "Your visibility is competitive — maintain current strategy.",
      whyItMatters: "Complacency allows competitors to catch up.",
      action: "Continue content velocity and monitor competitor activity.",
      expectedImpact: "Sustain top-tier visibility."
    });
  }
  
  return insights.slice(0, 4); // Max 4 insights
}

/* ═══════════════════════════════════════════════════════════════════════════
   EVIDENCE LABELING
═══════════════════════════════════════════════════════════════════════════ */

type EvidenceLabel = "STRENGTH" | "OPPORTUNITY" | "COMPETITIVE" | "VULNERABLE" | "INVISIBLE";

function getEvidenceLabel(pj: Extraction | null): { label: EvidenceLabel; color: string; bgColor: string } {
  if (!pj) return { label: "INVISIBLE", color: "#64748b", bgColor: "#f1f5f9" };
  
  if (pj.client_mentioned && pj.client_position === "top" && pj.recommendation_strength === "strong") {
    return { label: "STRENGTH", color: "#059669", bgColor: "#d1fae5" };
  }
  if (pj.client_mentioned && (pj.client_position === "middle" || pj.recommendation_strength === "medium")) {
    return { label: "OPPORTUNITY", color: "#2563eb", bgColor: "#dbeafe" };
  }
  if (pj.client_mentioned && pj.competitors_mentioned && pj.competitors_mentioned.length > 0) {
    return { label: "COMPETITIVE", color: "#d97706", bgColor: "#fef3c7" };
  }
  if (!pj.client_mentioned && pj.competitors_mentioned && pj.competitors_mentioned.length > 0) {
    return { label: "VULNERABLE", color: "#dc2626", bgColor: "#fee2e2" };
  }
  if (!pj.client_mentioned) {
    return { label: "INVISIBLE", color: "#64748b", bgColor: "#f1f5f9" };
  }
  return { label: "OPPORTUNITY", color: "#2563eb", bgColor: "#dbeafe" };
}

/* ═══════════════════════════════════════════════════════════════════════════
   NARRATIVE GENERATION
═══════════════════════════════════════════════════════════════════════════ */

function generateBottomLine(data: ReportData, metrics: ReturnType<typeof calculateMetrics>): string {
  const { client } = data;
  const score = data.snapshot.vrtl_score;
  const tier = getScoreTier(score);
  
  const parts: string[] = [];
  
  // Mention rate statement
  if (metrics.mentionRate >= 70) {
    parts.push(`${client.name} is mentioned in ${metrics.mentionRate}% of AI responses`);
  } else if (metrics.mentionRate >= 40) {
    parts.push(`${client.name} appears in ${metrics.mentionRate}% of AI responses`);
  } else {
    parts.push(`${client.name} is only mentioned in ${metrics.mentionRate}% of AI responses`);
  }
  
  // Positioning statement
  if (metrics.topPositionRate >= 50) {
    parts.push(`with strong first-position placement`);
  } else if (metrics.topPositionRate > 0) {
    parts.push(`but rarely as the first recommendation`);
  }
  
  // Competitive context
  if (metrics.leader && !metrics.leader.isClient && metrics.gapToLeader > 0) {
    parts.push(`${metrics.leader.name} leads by ${metrics.gapToLeader} mentions`);
  } else if (metrics.clientRank === 1) {
    parts.push(`You lead the competitive set`);
  }
  
  // Implication
  parts.push(tier.implication);
  
  return parts.join(". ") + ".";
}

/* ═══════════════════════════════════════════════════════════════════════════
   HTML RENDER
═══════════════════════════════════════════════════════════════════════════ */

export function renderReportHtml(data: ReportData): string {
  const { agency, client, snapshot, competitors, responses } = data;
  
  const accentColor = agency.brand_accent || "#0f172a";
  const score = snapshot.vrtl_score;
  const tier = getScoreTier(score);
  const metrics = calculateMetrics(data);
  const insights = generateInsights(data, metrics);
  const bottomLine = generateBottomLine(data, metrics);
  
  const models = snapshot.score_by_provider ? Object.entries(snapshot.score_by_provider).sort((a, b) => b[1] - a[1]) : [];
  
  // Get best/worst evidence examples
  const labeledResponses = responses.map((r, idx) => ({
    ...r,
    index: idx,
    label: getEvidenceLabel(r.parsed_json)
  }));
  
  const strengthExamples = labeledResponses.filter(r => r.label.label === "STRENGTH").slice(0, 2);
  const vulnerableExamples = labeledResponses.filter(r => r.label.label === "VULNERABLE").slice(0, 2);
  const opportunityExamples = labeledResponses.filter(r => r.label.label === "OPPORTUNITY").slice(0, 2);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    :root { 
      --accent: ${accentColor}; 
      --score-color: ${tier.color}; 
    }
    
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
      padding: 14mm 16mm;
      page-break-after: always;
      position: relative;
    }
    .page:last-child { page-break-after: avoid; }
    .no-break { page-break-inside: avoid; break-inside: avoid; }
    
    /* Typography */
    .h1 { font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.2; }
    .h2 { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
    .h3 { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .body { font-size: 10px; color: #475569; line-height: 1.6; }
    .small { font-size: 9px; color: #64748b; }
    .tiny { font-size: 8px; color: #94a3b8; }
    
    /* Pills/Badges */
    .pill {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .pill-green { background: #d1fae5; color: #065f46; }
    .pill-yellow { background: #fef3c7; color: #92400e; }
    .pill-red { background: #fee2e2; color: #991b1b; }
    .pill-blue { background: #dbeafe; color: #1e40af; }
    .pill-gray { background: #f1f5f9; color: #475569; }
    
    .priority-high { background: #fee2e2; color: #991b1b; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-low { background: #d1fae5; color: #065f46; }
    
    /* Page Header/Footer */
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 8px; border-bottom: 2px solid #0f172a; margin-bottom: 16px;
    }
    .page-title { font-size: 9px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.08em; }
    .page-num { font-size: 8px; color: #94a3b8; }
    .page-footer {
      position: absolute; bottom: 10mm; left: 16mm; right: 16mm;
      display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8;
      padding-top: 8px; border-top: 1px solid #e2e8f0;
    }
    
    /* Cover Page */
    .cover { padding-top: 20mm; }
    .cover-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .cover-logo img { max-height: 28px; }
    .cover-logo-text { font-size: 12px; font-weight: 700; color: #0f172a; }
    .cover-type { font-size: 10px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
    .cover-client { font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.1; }
    .cover-url { font-size: 11px; color: #64748b; margin-top: 4px; }
    
    /* Score Hero */
    .score-section { display: flex; gap: 20px; margin: 24px 0; }
    .score-ring {
      width: 120px; height: 120px; border-radius: 50%; flex-shrink: 0;
      background: conic-gradient(var(--score-color) calc(${score ?? 0} * 3.6deg), #e2e8f0 0);
      display: flex; align-items: center; justify-content: center;
    }
    .score-ring-inner {
      width: 96px; height: 96px; border-radius: 50%; background: #fff;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .score-number { font-size: 36px; font-weight: 800; color: #0f172a; line-height: 1; }
    .score-max { font-size: 12px; color: #94a3b8; }
    
    .score-context { flex: 1; }
    .score-tier { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; background: var(--score-color); color: #fff; margin-bottom: 8px; }
    .score-rank { font-size: 11px; color: #475569; margin-bottom: 12px; }
    .score-rank strong { color: #0f172a; }
    
    .context-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .context-item { padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
    .context-value { font-size: 14px; font-weight: 700; color: #0f172a; }
    .context-label { font-size: 8px; color: #64748b; margin-top: 2px; }
    
    /* Bottom Line Box */
    .bottom-line {
      padding: 14px 16px; background: #f8fafc; border-left: 3px solid var(--accent);
      margin: 16px 0; border-radius: 0 6px 6px 0;
    }
    .bottom-line-title { font-size: 10px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .bottom-line-text { font-size: 10px; color: #334155; line-height: 1.6; }
    
    /* Win/Risk/Priority Strip */
    .verdict-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 16px 0; }
    .verdict-card { padding: 12px; border-radius: 6px; }
    .verdict-card.win { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .verdict-card.risk { background: #fef2f2; border: 1px solid #fecaca; }
    .verdict-card.priority { background: #eff6ff; border: 1px solid #bfdbfe; }
    .verdict-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .verdict-card.win .verdict-label { color: #166534; }
    .verdict-card.risk .verdict-label { color: #991b1b; }
    .verdict-card.priority .verdict-label { color: #1e40af; }
    .verdict-value { font-size: 11px; font-weight: 600; color: #0f172a; }
    .verdict-detail { font-size: 9px; color: #475569; margin-top: 2px; }
    
    /* Competitive Ranking */
    .ranking-section { margin: 20px 0; }
    .ranking-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .ranking-row:last-child { border-bottom: none; }
    .ranking-pos { width: 24px; font-size: 11px; font-weight: 700; color: #64748b; }
    .ranking-name { width: 100px; font-size: 10px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ranking-name.client { font-weight: 700; color: #0f172a; }
    .ranking-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .ranking-fill { height: 100%; border-radius: 4px; }
    .ranking-fill.client { background: var(--accent); }
    .ranking-fill.other { background: #94a3b8; }
    .ranking-score { width: 50px; font-size: 10px; color: #64748b; text-align: right; }
    .ranking-score.client { font-weight: 700; color: #0f172a; }
    .ranking-delta { width: 50px; font-size: 9px; text-align: right; }
    .ranking-delta.threat { color: #dc2626; }
    .ranking-delta.safe { color: #16a34a; }
    
    /* Model Breakdown */
    .model-section { margin: 16px 0; }
    .model-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px; }
    .model-icon { width: 28px; height: 28px; border-radius: 6px; background: #0f172a; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; }
    .model-info { flex: 1; }
    .model-name { font-size: 11px; font-weight: 600; color: #0f172a; }
    .model-bar { height: 6px; background: #e2e8f0; border-radius: 3px; margin-top: 4px; overflow: hidden; }
    .model-fill { height: 100%; border-radius: 3px; }
    .model-score { font-size: 18px; font-weight: 800; color: #0f172a; }
    .model-label { font-size: 8px; color: #64748b; }
    
    /* Insight Cards */
    .insight-section { margin: 16px 0; }
    .insight-card { padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 10px; }
    .insight-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .insight-priority { font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
    .insight-title { font-size: 11px; font-weight: 700; color: #0f172a; }
    .insight-row { display: grid; grid-template-columns: 80px 1fr; gap: 4px; font-size: 9px; margin-bottom: 4px; }
    .insight-label { color: #64748b; font-weight: 600; }
    .insight-value { color: #334155; }
    
    /* Evidence Blocks */
    .evidence-section { margin: 16px 0; }
    .evidence-block { padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid; }
    .evidence-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .evidence-label { font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
    .evidence-meta { font-size: 8px; color: #94a3b8; }
    .evidence-prompt { font-size: 9px; color: #64748b; font-style: italic; margin-bottom: 8px; padding: 8px; background: #f8fafc; border-radius: 4px; }
    .evidence-quote { font-size: 10px; color: #334155; line-height: 1.6; margin-bottom: 8px; }
    .evidence-quote strong { color: #0f172a; background: #fef3c7; padding: 0 2px; }
    .evidence-stats { display: flex; gap: 12px; }
    .evidence-stat { font-size: 8px; color: #64748b; }
    .evidence-stat strong { color: #0f172a; }
    .evidence-impact { font-size: 9px; color: #475569; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
    
    /* Tables */
    .data-table { width: 100%; border-collapse: collapse; font-size: 9px; }
    .data-table th { text-align: left; padding: 8px; background: #f1f5f9; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-table tr:nth-child(even) td { background: #fafafa; }
    
    /* Methodology */
    .method-box { padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 12px 0; }
    .method-title { font-size: 10px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .method-text { font-size: 9px; color: #475569; line-height: 1.6; }
    .method-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
    .method-item { }
    .method-label { font-size: 8px; color: #94a3b8; }
    .method-value { font-size: 9px; color: #0f172a; font-weight: 500; }
  </style>
</head>
<body>
  <!-- PAGE 1: THE VERDICT -->
  <div class="page cover">
    <div class="cover-header">
      ${agency.brand_logo_url 
        ? `<div class="cover-logo"><img src="${escapeHtml(agency.brand_logo_url)}" alt="" /></div>`
        : `<div class="cover-logo-text">${escapeHtml(agency.name)}</div>`
      }
      <div class="small">${formatDate(snapshot.created_at)}</div>
    </div>
    
    <div class="cover-type">AI Visibility Audit</div>
    <div class="cover-client">${escapeHtml(client.name)}</div>
    ${client.website ? `<div class="cover-url">${escapeHtml(client.website)}</div>` : ""}
    
    <div class="score-section no-break">
      <div class="score-ring">
        <div class="score-ring-inner">
          <div class="score-number">${score ?? "—"}</div>
          <div class="score-max">/ 100</div>
        </div>
      </div>
      
      <div class="score-context">
        <div class="score-tier">${tier.tier}</div>
        <div class="score-rank">
          Rank <strong>#${metrics.clientRank}</strong> of ${metrics.allEntities.length} tracked
          ${metrics.gapToLeader > 0 ? ` · <strong>${metrics.gapToLeader}</strong> mentions behind leader` : metrics.clientRank === 1 ? " · Leading" : ""}
        </div>
        <div class="context-grid">
          <div class="context-item">
            <div class="context-value">${metrics.mentionRate}%</div>
            <div class="context-label">Mention Rate</div>
          </div>
          <div class="context-item">
            <div class="context-value">${metrics.topPositionRate}%</div>
            <div class="context-label">Top Position</div>
          </div>
          <div class="context-item">
            <div class="context-value">${metrics.citationRate}%</div>
            <div class="context-label">Citation Rate</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bottom-line no-break">
      <div class="bottom-line-title">THE BOTTOM LINE</div>
      <div class="bottom-line-text">${escapeHtml(bottomLine)}</div>
    </div>
    
    <div class="verdict-strip no-break">
      <div class="verdict-card win">
        <div class="verdict-label">Win</div>
        <div class="verdict-value">${models.length > 0 ? `Strong in ${models[0][0]}` : "Baseline established"}</div>
        <div class="verdict-detail">${models.length > 0 ? `Score: ${Math.round(models[0][1])}` : "First snapshot complete"}</div>
      </div>
      <div class="verdict-card risk">
        <div class="verdict-label">Risk</div>
        <div class="verdict-value">${models.length > 1 && models[models.length - 1][1] < 60 ? `Weak in ${models[models.length - 1][0]}` : metrics.topCompetitor ? `${metrics.topCompetitor.name} gaining` : "Monitor competitors"}</div>
        <div class="verdict-detail">${models.length > 1 && models[models.length - 1][1] < 60 ? `Score: ${Math.round(models[models.length - 1][1])}` : metrics.topCompetitor ? `${metrics.topCompetitor.mentions} mentions` : "Track changes"}</div>
      </div>
      <div class="verdict-card priority">
        <div class="verdict-label">Priority</div>
        <div class="verdict-value">${insights[0]?.title || "Run next snapshot"}</div>
        <div class="verdict-detail">${insights[0]?.priority || "30 days"}</div>
      </div>
    </div>
    
    <div class="ranking-section no-break">
      <div class="h3">Competitive Visibility Ranking</div>
      ${metrics.allEntities.slice(0, 5).map((entity, idx) => {
        const isClient = entity.isClient;
        const gapText = isClient ? "" : entity.mentions > metrics.mentioned ? `+${entity.mentions - metrics.mentioned}` : entity.mentions < metrics.mentioned ? `${entity.mentions - metrics.mentioned}` : "Tied";
        return `
        <div class="ranking-row">
          <div class="ranking-pos">#${idx + 1}</div>
          <div class="ranking-name ${isClient ? 'client' : ''}">${escapeHtml(entity.name)}</div>
          <div class="ranking-bar">
            <div class="ranking-fill ${isClient ? 'client' : 'other'}" style="width: ${entity.rate}%"></div>
          </div>
          <div class="ranking-score ${isClient ? 'client' : ''}">${entity.mentions}/${metrics.total}</div>
          <div class="ranking-delta ${!isClient && entity.mentions > metrics.mentioned ? 'threat' : 'safe'}">${gapText}</div>
        </div>
        `;
      }).join("")}
    </div>
    
    <div class="page-footer">
      <span>Confidential — ${escapeHtml(client.name)}</span>
      <span>Powered by VRTL Score</span>
    </div>
  </div>
  
  <!-- PAGE 2: AI MODEL BREAKDOWN -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">AI Model Breakdown</span>
      <span class="page-num">Page 2</span>
    </div>
    
    <div class="h2">How Each AI Model Perceives ${escapeHtml(client.name)}</div>
    <div class="body" style="margin-bottom: 16px;">Different AI models have different training data and ranking algorithms. Understanding per-model performance reveals optimization opportunities.</div>
    
    <div class="model-section no-break">
      ${models.map(([name, val]) => {
        const modelTier = getScoreTier(val);
        const icon = name.toLowerCase().includes("openai") || name.toLowerCase().includes("chatgpt") ? "GPT" 
          : name.toLowerCase().includes("claude") || name.toLowerCase().includes("anthropic") ? "CL"
          : name.toLowerCase().includes("gemini") || name.toLowerCase().includes("google") ? "GEM"
          : name.charAt(0).toUpperCase();
        return `
        <div class="model-row">
          <div class="model-icon">${icon}</div>
          <div class="model-info">
            <div class="model-name">${escapeHtml(name)}</div>
            <div class="model-bar">
              <div class="model-fill" style="width: ${val}%; background: ${modelTier.color};"></div>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="model-score">${Math.round(val)}</div>
            <div class="model-label">${modelTier.tier}</div>
          </div>
        </div>
        `;
      }).join("")}
      ${models.length === 0 ? `
      <div class="model-row">
        <div class="model-icon">?</div>
        <div class="model-info">
          <div class="model-name">No model data available</div>
        </div>
        <div style="text-align: right;">
          <div class="model-score">—</div>
        </div>
      </div>
      ` : ""}
    </div>
    
    ${models.length > 0 ? `
    <div class="h3" style="margin-top: 20px;">Model-by-Model Analysis</div>
    ${models.map(([name, val]) => {
      const modelTier = getScoreTier(val);
      const isStrong = val >= 70;
      const isWeak = val < 50;
      return `
      <div class="method-box no-break" style="border-left: 3px solid ${modelTier.color};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="method-title">${escapeHtml(name)} (${Math.round(val)})</div>
          <span class="pill" style="background: ${modelTier.color}; color: #fff;">${modelTier.tier}</span>
        </div>
        <div class="method-text">
          ${isStrong ? `✓ Strong visibility in this model. Your content strategy resonates with ${name}'s training data and ranking signals.` : 
            isWeak ? `⚠ Weak visibility in this model. Priority improvement area — focus on content that ${name} indexes well.` :
            `→ Moderate visibility. Room for improvement through targeted content optimization.`}
        </div>
      </div>
      `;
    }).join("")}
    ` : ""}
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 3: EVIDENCE & PROOF -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Evidence & Proof</span>
      <span class="page-num">Page 3</span>
    </div>
    
    <div class="h2">What AI Models Are Saying</div>
    <div class="body" style="margin-bottom: 16px;">Raw AI responses that determined your score. Each response is labeled by its impact on visibility.</div>
    
    <div class="evidence-section">
      ${strengthExamples.length > 0 ? strengthExamples.map(r => {
        const pj = r.parsed_json;
        const snippet = r.raw_text?.slice(0, 200) || pj?.evidence_snippet || "Response content not available";
        return `
        <div class="evidence-block no-break" style="border-left-color: #059669;">
          <div class="evidence-header">
            <span class="evidence-label" style="background: #d1fae5; color: #065f46;">STRENGTH</span>
            <span class="evidence-meta">Prompt ${r.index + 1}</span>
          </div>
          ${r.prompt_text ? `<div class="evidence-prompt">"${escapeHtml(r.prompt_text.slice(0, 100))}..."</div>` : ""}
          <div class="evidence-quote">"${escapeHtml(snippet)}..."</div>
          <div class="evidence-stats">
            <div class="evidence-stat">Position: <strong>${pj?.client_position || "—"}</strong></div>
            <div class="evidence-stat">Strength: <strong>${pj?.recommendation_strength || "—"}</strong></div>
            <div class="evidence-stat">Cited: <strong>${pj?.has_sources_or_citations ? "Yes" : "No"}</strong></div>
          </div>
          <div class="evidence-impact">✓ This response positively contributes to your score — you're positioned as a top recommendation.</div>
        </div>
        `;
      }).join("") : ""}
      
      ${vulnerableExamples.length > 0 ? vulnerableExamples.map(r => {
        const pj = r.parsed_json;
        const snippet = r.raw_text?.slice(0, 200) || "Response content not available";
        const competitors = pj?.competitors_mentioned?.slice(0, 3).join(", ") || "Unknown";
        return `
        <div class="evidence-block no-break" style="border-left-color: #dc2626;">
          <div class="evidence-header">
            <span class="evidence-label" style="background: #fee2e2; color: #991b1b;">VULNERABLE</span>
            <span class="evidence-meta">Prompt ${r.index + 1}</span>
          </div>
          ${r.prompt_text ? `<div class="evidence-prompt">"${escapeHtml(r.prompt_text.slice(0, 100))}..."</div>` : ""}
          <div class="evidence-quote">"${escapeHtml(snippet)}..."</div>
          <div class="evidence-stats">
            <div class="evidence-stat">Mentioned: <strong>No</strong></div>
            <div class="evidence-stat">Competitors shown: <strong>${competitors}</strong></div>
          </div>
          <div class="evidence-impact">⚠ You're missing from this response while competitors are mentioned. This is a discovery gap.</div>
        </div>
        `;
      }).join("") : ""}
      
      ${opportunityExamples.length > 0 ? opportunityExamples.slice(0, 1).map(r => {
        const pj = r.parsed_json;
        const snippet = r.raw_text?.slice(0, 200) || pj?.evidence_snippet || "Response content not available";
        return `
        <div class="evidence-block no-break" style="border-left-color: #2563eb;">
          <div class="evidence-header">
            <span class="evidence-label" style="background: #dbeafe; color: #1e40af;">OPPORTUNITY</span>
            <span class="evidence-meta">Prompt ${r.index + 1}</span>
          </div>
          ${r.prompt_text ? `<div class="evidence-prompt">"${escapeHtml(r.prompt_text.slice(0, 100))}..."</div>` : ""}
          <div class="evidence-quote">"${escapeHtml(snippet)}..."</div>
          <div class="evidence-stats">
            <div class="evidence-stat">Position: <strong>${pj?.client_position || "—"}</strong></div>
            <div class="evidence-stat">Strength: <strong>${pj?.recommendation_strength || "—"}</strong></div>
          </div>
          <div class="evidence-impact">→ You're mentioned but not prominently positioned. Improvement here could lift your score significantly.</div>
        </div>
        `;
      }).join("") : ""}
    </div>
    
    <div class="h3" style="margin-top: 16px;">Signal Summary</div>
    <table class="data-table no-break">
      <thead>
        <tr>
          <th>Signal Type</th>
          <th>Count</th>
          <th>Rate</th>
          <th>Impact</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Strength (Top + Strong)</td>
          <td>${metrics.topPosition}</td>
          <td>${metrics.topPositionRate}%</td>
          <td><span class="pill pill-green">Positive</span></td>
        </tr>
        <tr>
          <td>Opportunity (Mentioned, not top)</td>
          <td>${metrics.mentioned - metrics.topPosition}</td>
          <td>${Math.round(((metrics.mentioned - metrics.topPosition) / metrics.total) * 100)}%</td>
          <td><span class="pill pill-blue">Improvable</span></td>
        </tr>
        <tr>
          <td>Vulnerable (Not mentioned)</td>
          <td>${metrics.total - metrics.mentioned}</td>
          <td>${100 - metrics.mentionRate}%</td>
          <td><span class="pill pill-red">Gap</span></td>
        </tr>
      </tbody>
    </table>
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 4: STRATEGIC RECOMMENDATIONS -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Strategic Recommendations</span>
      <span class="page-num">Page 4</span>
    </div>
    
    <div class="h2">Prioritized Actions</div>
    <div class="body" style="margin-bottom: 16px;">Based on your snapshot data, these are the highest-impact improvements for ${escapeHtml(client.name)}.</div>
    
    <div class="insight-section">
      ${insights.map((insight, idx) => `
      <div class="insight-card no-break">
        <div class="insight-header">
          <span class="insight-priority priority-${insight.priority.toLowerCase()}">${insight.priority}</span>
          <span class="insight-title">#${idx + 1} ${escapeHtml(insight.title)}</span>
        </div>
        <div class="insight-row">
          <div class="insight-label">Insight:</div>
          <div class="insight-value">${escapeHtml(insight.insight)}</div>
        </div>
        <div class="insight-row">
          <div class="insight-label">Why it matters:</div>
          <div class="insight-value">${escapeHtml(insight.whyItMatters)}</div>
        </div>
        <div class="insight-row">
          <div class="insight-label">Action:</div>
          <div class="insight-value">${escapeHtml(insight.action)}</div>
        </div>
        <div class="insight-row">
          <div class="insight-label">Expected:</div>
          <div class="insight-value">${escapeHtml(insight.expectedImpact)}</div>
        </div>
      </div>
      `).join("")}
    </div>
    
    <div class="method-box no-break" style="margin-top: 20px;">
      <div class="method-title">30-Day Action Plan</div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
        <div style="padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 4px;">
          <div style="font-size: 9px; font-weight: 700; color: var(--accent);">Week 1-2</div>
          <div style="font-size: 9px; color: #334155; margin-top: 4px;">Audit content structure for AI extractability. Identify gaps in authority signals.</div>
        </div>
        <div style="padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 4px;">
          <div style="font-size: 9px; font-weight: 700; color: var(--accent);">Week 2-3</div>
          <div style="font-size: 9px; color: #334155; margin-top: 4px;">Implement priority recommendations. Focus on weakest AI model first.</div>
        </div>
        <div style="padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 4px;">
          <div style="font-size: 9px; font-weight: 700; color: var(--accent);">Week 3-4</div>
          <div style="font-size: 9px; color: #334155; margin-top: 4px;">Build authority via citations and trusted source mentions. Competitive positioning content.</div>
        </div>
        <div style="padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 4px;">
          <div style="font-size: 9px; font-weight: 700; color: var(--accent);">Week 4+</div>
          <div style="font-size: 9px; color: #334155; margin-top: 4px;">Run follow-up snapshot to measure progress. Iterate on strategy.</div>
        </div>
      </div>
    </div>
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 5: APPENDIX -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Appendix</span>
      <span class="page-num">Page 5</span>
    </div>
    
    <div class="h2">Full Evidence Table</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Label</th>
          <th>Mentioned</th>
          <th>Position</th>
          <th>Strength</th>
          <th>Competitors</th>
        </tr>
      </thead>
      <tbody>
        ${responses.slice(0, 10).map((r, idx) => {
          const pj = r.parsed_json;
          const label = getEvidenceLabel(pj);
          const compCount = pj?.competitors_mentioned?.length ?? 0;
          return `
          <tr>
            <td>${idx + 1}</td>
            <td><span class="pill" style="background: ${label.bgColor}; color: ${label.color};">${label.label}</span></td>
            <td>${pj?.client_mentioned ? "✓" : "✗"}</td>
            <td>${pj?.client_position || "—"}</td>
            <td>${pj?.recommendation_strength || "—"}</td>
            <td>${compCount > 0 ? compCount : "—"}</td>
          </tr>
          `;
        }).join("")}
      </tbody>
    </table>
    
    <div class="method-box no-break" style="margin-top: 20px;">
      <div class="method-title">Methodology</div>
      <div class="method-text">
        VRTL Score analyzes AI responses across standardized discovery scenarios. The score combines three signals: <strong>Presence</strong> (mention consistency), <strong>Positioning</strong> (ranking vs alternatives), and <strong>Authority</strong> (citation signals).
      </div>
      <div class="method-grid">
        <div class="method-item">
          <div class="method-label">Report Generated</div>
          <div class="method-value">${formatDate(snapshot.created_at)}</div>
        </div>
        <div class="method-item">
          <div class="method-label">Snapshot ID</div>
          <div class="method-value">${snapshot.id.slice(0, 12)}...</div>
        </div>
        <div class="method-item">
          <div class="method-label">Scenarios Analyzed</div>
          <div class="method-value">${metrics.total}</div>
        </div>
        <div class="method-item">
          <div class="method-label">AI Models</div>
          <div class="method-value">${models.length > 0 ? models.map(m => m[0]).join(", ") : "OpenAI"}</div>
        </div>
        <div class="method-item">
          <div class="method-label">Competitors Tracked</div>
          <div class="method-value">${competitors.length}</div>
        </div>
        <div class="method-item">
          <div class="method-label">Confidence Level</div>
          <div class="method-value">${competitors.length >= 3 ? "High" : competitors.length > 0 ? "Medium" : "Low"}</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 24px; text-align: center;">
      <div class="small">Questions about this report?</div>
      <div style="font-size: 11px; font-weight: 600; color: #0f172a; margin-top: 4px;">Contact ${escapeHtml(agency.name)}</div>
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
