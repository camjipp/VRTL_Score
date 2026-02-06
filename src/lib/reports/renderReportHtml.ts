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
  consequence: string;
};

function getScoreTier(score: number | null): ScoreTier {
  if (score === null) return { 
    tier: "Unknown", 
    label: "No data", 
    color: "#64748b",
    description: "Run a snapshot to measure visibility",
    implication: "Baseline measurement needed",
    consequence: "Without measurement, you can't improve what you can't see."
  };
  if (score >= 90) return { 
    tier: "Dominant", 
    label: "90-100", 
    color: "#059669",
    description: "You're the default recommendation in AI responses",
    implication: "Defend your position — competitors will target you",
    consequence: "Complacency here means competitors will study and replicate your strategy."
  };
  if (score >= 80) return { 
    tier: "Strong", 
    label: "80-89", 
    color: "#10b981",
    description: "Consistently mentioned first or second",
    implication: "Maintain momentum — the gap to #1 is closable",
    consequence: "At this level, a 10-point drop moves you from 'recommended' to 'also mentioned.'"
  };
  if (score >= 70) return { 
    tier: "Moderate", 
    label: "70-79", 
    color: "#f59e0b",
    description: "Mentioned but not prominently positioned",
    implication: "Close the gap — you're in consideration but not first choice",
    consequence: "Buyers using AI for research will see competitors first. Every day this continues, you lose discovery opportunities."
  };
  if (score >= 50) return { 
    tier: "Contested", 
    label: "50-69", 
    color: "#f97316",
    description: "Sometimes mentioned, often behind competitors",
    implication: "Differentiation needed — multiple players competing",
    consequence: "In a contested market, the first to break away captures the default position. Inaction means falling further behind."
  };
  return { 
    tier: "Weak", 
    label: "<50", 
    color: "#ef4444",
    description: "Rarely surfaced in AI responses",
    implication: "Foundational work required — significant gap to leaders",
    consequence: "AI-assisted buying is growing 40%+ annually. Invisibility now means compounding losses in discovery."
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
  
  // Check for fragile leadership (competitors tied or very close)
  const competitorsWithinRange = allEntities.filter(e => !e.isClient && Math.abs(e.mentions - mentioned) <= 2);
  const isFragileLeadership = clientRank === 1 && competitorsWithinRange.length >= 1;
  const isContestedMarket = allEntities.length >= 3 && 
    Math.max(...allEntities.map(e => e.mentions)) - Math.min(...allEntities.map(e => e.mentions)) <= 3;
  
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
    topCompetitor,
    isFragileLeadership,
    isContestedMarket,
    competitorsWithinRange
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
  consequence: string;
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
      expectedImpact: `+10-15 points in ${worstModel[0]} within 60 days.`,
      consequence: `Every week this gap persists, competitors capture discovery opportunities you're missing.`
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
      expectedImpact: "Regain competitive parity within 90 days.",
      consequence: `Failure to act increases the likelihood ${metrics.topCompetitor.name} becomes the default recommendation.`
    });
  }
  
  // Fragile leadership
  if (metrics.isFragileLeadership) {
    insights.push({
      priority: "HIGH",
      title: "Fragile Leadership Position",
      insight: `You're #1, but ${metrics.competitorsWithinRange.length} competitor${metrics.competitorsWithinRange.length > 1 ? 's are' : ' is'} within striking distance.`,
      whyItMatters: "Leadership with thin margins can flip with a single algorithm update or competitor content push.",
      action: "Accelerate content velocity to extend your lead before competitors catch up.",
      expectedImpact: "Create 5+ mention gap to secure defensible leadership.",
      consequence: `At current parity, any competitor content initiative could overtake you within 30 days.`
    });
  }
  
  // Contested market
  if (metrics.isContestedMarket && !metrics.isFragileLeadership) {
    insights.push({
      priority: "MEDIUM",
      title: "Contested Market — No Clear Leader",
      insight: `All ${metrics.allEntities.length} tracked entities are within 3 mentions of each other.`,
      whyItMatters: "This is both risk and opportunity — any player could break away with focused effort.",
      action: "Aggressive content strategy for 90 days. First to differentiate captures the default position.",
      expectedImpact: "Become the clear #1 with 10+ point lead.",
      consequence: `In contested markets, the first mover advantage is decisive. Hesitation means someone else wins.`
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
      expectedImpact: "Target 70%+ mention rate to enter consideration set.",
      consequence: `Low visibility compounds — AI models learn from each other, and being absent now means being absent longer.`
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
      expectedImpact: "Move from 'also mentioned' to 'first choice' positioning.",
      consequence: `Buyers trust first recommendations more. Second place in AI means second place in consideration.`
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
      expectedImpact: "Higher citation rate correlates with +5-10 score points.",
      consequence: `Without authority signals, AI models will increasingly favor competitors with stronger citation profiles.`
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
      expectedImpact: "Lift weaker models by applying successful patterns.",
      consequence: `This is a proven playbook — not replicating it to other models is leaving points on the table.`
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
      expectedImpact: "Sustain top-tier visibility.",
      consequence: `Even strong positions erode without maintenance. Competitors are always working to overtake you.`
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
  
  // Competitive context with tension
  if (metrics.isFragileLeadership) {
    parts.push(`Despite ranking #1, competitors are within striking distance — leadership is fragile`);
  } else if (metrics.isContestedMarket) {
    parts.push(`The market is contested with no clear leader — first to break away wins`);
  } else if (metrics.leader && !metrics.leader.isClient && metrics.gapToLeader > 0) {
    parts.push(`${metrics.leader.name} leads by ${metrics.gapToLeader} mentions — the gap is ${metrics.gapToLeader <= 3 ? 'closable' : 'significant'}`);
  } else if (metrics.clientRank === 1 && metrics.allEntities.length > 1) {
    const lead = metrics.mentioned - (metrics.allEntities[1]?.mentions ?? 0);
    parts.push(`You lead by ${lead} mention${lead !== 1 ? 's' : ''} — ${lead <= 2 ? 'a thin margin to defend' : 'a defensible position'}`);
  }
  
  return parts.join(". ") + ".";
}

function generateTensionStatement(metrics: ReturnType<typeof calculateMetrics>): string {
  if (metrics.isFragileLeadership) {
    return `⚠ FRAGILE LEADERSHIP: You're #1, but all competitors achieve similar mention coverage. Any content push by a competitor could flip this ranking.`;
  }
  if (metrics.isContestedMarket) {
    return `⚠ CONTESTED MARKET: No clear AI visibility leader exists. This is a land-grab opportunity — the first to differentiate captures the default position.`;
  }
  if (metrics.gapToLeader > 5) {
    return `⚠ VISIBILITY GAP: ${metrics.leader?.name} has a ${metrics.gapToLeader}-mention lead. Without action, this gap will widen as AI models reinforce existing patterns.`;
  }
  if (metrics.mentionRate < 50) {
    return `⚠ DISCOVERY RISK: More than half of AI-assisted buyers in your category won't discover you. This compounds daily.`;
  }
  return "";
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
  const tensionStatement = generateTensionStatement(metrics);
  
  const models = snapshot.score_by_provider ? Object.entries(snapshot.score_by_provider).sort((a, b) => b[1] - a[1]) : [];
  const avgModelScore = models.length > 0 ? Math.round(models.reduce((sum, [, s]) => sum + s, 0) / models.length) : 0;
  
  // Get best/worst evidence examples
  const labeledResponses = responses.map((r, idx) => ({
    ...r,
    index: idx,
    label: getEvidenceLabel(r.parsed_json)
  }));
  
  const strengthExamples = labeledResponses.filter(r => r.label.label === "STRENGTH").slice(0, 2);
  const vulnerableExamples = labeledResponses.filter(r => r.label.label === "VULNERABLE").slice(0, 2);

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
      line-height: 1.4;
      color: #1e293b;
      background: #fff;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 12mm 14mm;
      page-break-after: always;
      position: relative;
    }
    .page:last-child { page-break-after: avoid; }
    .no-break { page-break-inside: avoid; break-inside: avoid; }
    
    /* Typography - tighter */
    .h1 { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.1; }
    .h2 { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .h3 { font-size: 10px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .body { font-size: 9px; color: #475569; line-height: 1.5; }
    .small { font-size: 8px; color: #64748b; }
    
    /* Pills/Badges */
    .pill {
      display: inline-block;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 7px;
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
    
    /* Page Header/Footer - tighter */
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 6px; border-bottom: 2px solid #0f172a; margin-bottom: 12px;
    }
    .page-title { font-size: 8px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.08em; }
    .page-num { font-size: 7px; color: #94a3b8; }
    .page-footer {
      position: absolute; bottom: 8mm; left: 14mm; right: 14mm;
      display: flex; justify-content: space-between; font-size: 7px; color: #94a3b8;
      padding-top: 6px; border-top: 1px solid #e2e8f0;
    }
    
    /* Cover Page */
    .cover { padding-top: 16mm; }
    .cover-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .cover-logo img { max-height: 24px; }
    .cover-logo-text { font-size: 11px; font-weight: 700; color: #0f172a; }
    .cover-type { font-size: 9px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .cover-client { font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.1; }
    .cover-url { font-size: 10px; color: #64748b; margin-top: 2px; }
    
    /* Score Hero - compact */
    .score-section { display: flex; gap: 16px; margin: 16px 0; }
    .score-ring {
      width: 100px; height: 100px; border-radius: 50%; flex-shrink: 0;
      background: conic-gradient(var(--score-color) calc(${score ?? 0} * 3.6deg), #e2e8f0 0);
      display: flex; align-items: center; justify-content: center;
    }
    .score-ring-inner {
      width: 80px; height: 80px; border-radius: 50%; background: #fff;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .score-number { font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1; }
    .score-max { font-size: 10px; color: #94a3b8; }
    
    .score-context { flex: 1; }
    .score-tier { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 9px; font-weight: 700; background: var(--score-color); color: #fff; margin-bottom: 6px; }
    .score-rank { font-size: 9px; color: #475569; margin-bottom: 8px; }
    .score-rank strong { color: #0f172a; }
    
    .context-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .context-item { padding: 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 3px; }
    .context-value { font-size: 12px; font-weight: 700; color: #0f172a; }
    .context-label { font-size: 7px; color: #64748b; margin-top: 1px; }
    
    /* Tension Alert */
    .tension-alert {
      padding: 10px 12px; background: #fef2f2; border: 1px solid #fecaca; border-left: 3px solid #dc2626;
      margin: 12px 0; border-radius: 0 4px 4px 0; font-size: 9px; color: #991b1b; line-height: 1.5;
    }
    
    /* Bottom Line Box - compact */
    .bottom-line {
      padding: 10px 12px; background: #f8fafc; border-left: 3px solid var(--accent);
      margin: 12px 0; border-radius: 0 4px 4px 0;
    }
    .bottom-line-title { font-size: 9px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .bottom-line-text { font-size: 9px; color: #334155; line-height: 1.5; }
    
    /* Win/Risk/Priority Strip - compact */
    .verdict-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0; }
    .verdict-card { padding: 10px; border-radius: 4px; }
    .verdict-card.win { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .verdict-card.risk { background: #fef2f2; border: 1px solid #fecaca; }
    .verdict-card.priority { background: #eff6ff; border: 1px solid #bfdbfe; }
    .verdict-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px; }
    .verdict-card.win .verdict-label { color: #166534; }
    .verdict-card.risk .verdict-label { color: #991b1b; }
    .verdict-card.priority .verdict-label { color: #1e40af; }
    .verdict-value { font-size: 9px; font-weight: 600; color: #0f172a; }
    .verdict-detail { font-size: 8px; color: #475569; margin-top: 2px; }
    
    /* Competitive Ranking - compact */
    .ranking-section { margin: 12px 0; }
    .ranking-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
    .ranking-row:last-child { border-bottom: none; }
    .ranking-pos { width: 20px; font-size: 9px; font-weight: 700; color: #64748b; }
    .ranking-name { width: 90px; font-size: 9px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ranking-name.client { font-weight: 700; color: #0f172a; }
    .ranking-bar { flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .ranking-fill { height: 100%; border-radius: 3px; }
    .ranking-fill.client { background: var(--accent); }
    .ranking-fill.other { background: #94a3b8; }
    .ranking-score { width: 45px; font-size: 9px; color: #64748b; text-align: right; }
    .ranking-score.client { font-weight: 700; color: #0f172a; }
    .ranking-delta { width: 40px; font-size: 8px; text-align: right; }
    .ranking-delta.threat { color: #dc2626; font-weight: 600; }
    .ranking-delta.safe { color: #16a34a; }
    
    /* Model Breakdown - compact with delta */
    .model-grid { display: grid; grid-template-columns: repeat(${models.length > 2 ? 2 : 1}, 1fr); gap: 8px; margin: 10px 0; }
    .model-card { padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; border-left: 3px solid; }
    .model-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .model-name { font-size: 10px; font-weight: 700; color: #0f172a; }
    .model-score { font-size: 16px; font-weight: 800; color: #0f172a; }
    .model-bar { height: 4px; background: #e2e8f0; border-radius: 2px; margin: 6px 0; overflow: hidden; }
    .model-fill { height: 100%; border-radius: 2px; }
    .model-insight { font-size: 8px; color: #475569; line-height: 1.4; }
    .model-delta { font-size: 8px; margin-top: 4px; }
    .model-delta.positive { color: #16a34a; }
    .model-delta.negative { color: #dc2626; }
    
    /* Insight Cards - compact */
    .insight-card { padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 8px; }
    .insight-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .insight-priority { font-size: 7px; font-weight: 700; padding: 2px 5px; border-radius: 2px; }
    .insight-title { font-size: 10px; font-weight: 700; color: #0f172a; }
    .insight-grid { display: grid; grid-template-columns: 70px 1fr; gap: 3px; font-size: 8px; }
    .insight-label { color: #64748b; font-weight: 600; }
    .insight-value { color: #334155; }
    .insight-consequence { font-size: 8px; color: #991b1b; margin-top: 6px; padding-top: 6px; border-top: 1px solid #fee2e2; font-style: italic; }
    
    /* Evidence Blocks - compact */
    .evidence-block { padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 8px; border-left: 3px solid; }
    .evidence-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .evidence-label { font-size: 7px; font-weight: 700; padding: 2px 5px; border-radius: 2px; }
    .evidence-meta { font-size: 7px; color: #94a3b8; }
    .evidence-quote { font-size: 9px; color: #334155; line-height: 1.5; margin-bottom: 6px; background: #f8fafc; padding: 6px; border-radius: 3px; }
    .evidence-stats { display: flex; gap: 10px; font-size: 8px; color: #64748b; }
    .evidence-stats strong { color: #0f172a; }
    .evidence-impact { font-size: 8px; color: #475569; margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; }
    
    /* Tables - compact */
    .data-table { width: 100%; border-collapse: collapse; font-size: 8px; }
    .data-table th { text-align: left; padding: 6px; background: #f1f5f9; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 6px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-table tr:nth-child(even) td { background: #fafafa; }
    
    /* Methodology - compact */
    .method-box { padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; margin: 8px 0; }
    .method-title { font-size: 9px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .method-text { font-size: 8px; color: #475569; line-height: 1.5; }
    .method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
    .method-item { }
    .method-label { font-size: 7px; color: #94a3b8; }
    .method-value { font-size: 8px; color: #0f172a; font-weight: 500; }
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
          ${metrics.gapToLeader > 0 ? ` · <strong>${metrics.gapToLeader}</strong> behind leader` : metrics.clientRank === 1 ? " · Leading" : ""}
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
            <div class="context-label">Authority</div>
          </div>
        </div>
      </div>
    </div>
    
    ${tensionStatement ? `<div class="tension-alert no-break">${tensionStatement}</div>` : ""}
    
    <div class="bottom-line no-break">
      <div class="bottom-line-title">THE BOTTOM LINE</div>
      <div class="bottom-line-text">${escapeHtml(bottomLine)}</div>
    </div>
    
    <div class="verdict-strip no-break">
      <div class="verdict-card win">
        <div class="verdict-label">Win</div>
        <div class="verdict-value">${models.length > 0 ? `Strong in ${models[0][0]}` : "Baseline established"}</div>
        <div class="verdict-detail">${models.length > 0 ? `Score: ${Math.round(models[0][1])}` : "First snapshot"}</div>
      </div>
      <div class="verdict-card risk">
        <div class="verdict-label">Risk</div>
        <div class="verdict-value">${metrics.isFragileLeadership ? "Fragile lead" : models.length > 1 && models[models.length - 1][1] < 60 ? `Weak in ${models[models.length - 1][0]}` : metrics.topCompetitor ? `${metrics.topCompetitor.name} closing` : "Monitor changes"}</div>
        <div class="verdict-detail">${metrics.isFragileLeadership ? "Competitors tied" : models.length > 1 && models[models.length - 1][1] < 60 ? `Score: ${Math.round(models[models.length - 1][1])}` : metrics.topCompetitor ? `${metrics.topCompetitor.mentions} mentions` : "Track weekly"}</div>
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
        const gap = entity.mentions - metrics.mentioned;
        const gapText = isClient ? "" : gap > 0 ? `+${gap}` : gap < 0 ? `${gap}` : "Tied";
        const isThreat = !isClient && gap >= 0;
        return `
        <div class="ranking-row">
          <div class="ranking-pos">#${idx + 1}</div>
          <div class="ranking-name ${isClient ? 'client' : ''}">${escapeHtml(entity.name)}</div>
          <div class="ranking-bar">
            <div class="ranking-fill ${isClient ? 'client' : 'other'}" style="width: ${entity.rate}%"></div>
          </div>
          <div class="ranking-score ${isClient ? 'client' : ''}">${entity.mentions}/${metrics.total}</div>
          <div class="ranking-delta ${isThreat ? 'threat' : 'safe'}">${gapText}</div>
        </div>
        `;
      }).join("")}
    </div>
    
    <div class="page-footer">
      <span>Confidential — ${escapeHtml(client.name)}</span>
      <span>VRTL Score</span>
    </div>
  </div>
  
  <!-- PAGE 2: AI MODEL BREAKDOWN (with deltas and insights) -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">AI Model Analysis</span>
      <span class="page-num">Page 2</span>
    </div>
    
    <div class="h2">Model-by-Model Performance</div>
    <div class="body" style="margin-bottom: 10px;">Each AI model ranks you differently. Understanding where you're strong (and weak) reveals exactly where to focus.</div>
    
    <div class="model-grid no-break">
      ${models.map(([name, val]) => {
        const modelTier = getScoreTier(val);
        const delta = val - avgModelScore;
        const isAboveAvg = delta > 0;
        const isStrong = val >= 70;
        const isWeak = val < 50;
        
        // Generate model-specific insight
        let modelInsight = "";
        if (isStrong) {
          modelInsight = `Your strongest model. Content strategy resonates here — replicate this approach for weaker models.`;
        } else if (isWeak) {
          modelInsight = `Critical gap. ${name} users won't find you. Prioritize content that this model indexes well.`;
        } else {
          modelInsight = `Moderate performance. Incremental improvement possible with targeted optimization.`;
        }
        
        // Competitive context for model
        const modelCompContext = isStrong ? 
          `This is likely where competitors will focus to catch up.` :
          isWeak ? 
          `Competitors may already dominate this model's recommendations.` :
          `Room to differentiate before competitors claim this space.`;
        
        return `
        <div class="model-card" style="border-left-color: ${modelTier.color};">
          <div class="model-header">
            <div class="model-name">${escapeHtml(name)}</div>
            <div class="model-score">${Math.round(val)}</div>
          </div>
          <div class="model-bar">
            <div class="model-fill" style="width: ${val}%; background: ${modelTier.color};"></div>
          </div>
          <div class="model-delta ${isAboveAvg ? 'positive' : 'negative'}">
            ${isAboveAvg ? '↑' : '↓'} ${Math.abs(Math.round(delta))} vs your avg (${avgModelScore})
          </div>
          <div class="model-insight" style="margin-top: 6px;">
            ${modelInsight}<br/>
            <span style="color: #64748b; font-style: italic;">${modelCompContext}</span>
          </div>
        </div>
        `;
      }).join("")}
    </div>
    
    ${models.length === 0 ? `
    <div class="method-box">
      <div class="method-text">No per-model data available. Run a snapshot to see model-by-model breakdown.</div>
    </div>
    ` : ""}
    
    ${models.length > 0 ? `
    <div class="method-box no-break" style="margin-top: 12px;">
      <div class="method-title">What This Means for Your Strategy</div>
      <div class="method-text">
        ${models[0][1] >= 70 && models[models.length - 1][1] < 50 ? 
          `You have a ${Math.round(models[0][1] - models[models.length - 1][1])}-point spread between your best and worst models. This inconsistency means your content strategy works for some AI systems but not others. Closing this gap is your highest-leverage opportunity.` :
          models.every(([, s]) => s >= 70) ?
          `Consistent strong performance across models indicates robust content authority. Focus shifts to maintaining this position and monitoring for competitive threats.` :
          models.every(([, s]) => s < 50) ?
          `Weak performance across all models signals foundational content authority issues. This requires systematic improvement, not model-specific tactics.` :
          `Mixed performance suggests opportunity for targeted optimization. Focus on lifting your weakest model while maintaining strength in others.`
        }
      </div>
    </div>
    ` : ""}
    
    <!-- Evidence Preview on Page 2 to fill space -->
    <div class="h2" style="margin-top: 16px;">Evidence Preview</div>
    <div class="body" style="margin-bottom: 8px;">A sample of what AI models are actually saying about ${escapeHtml(client.name)}.</div>
    
    ${strengthExamples.length > 0 ? strengthExamples.slice(0, 1).map(r => {
      const pj = r.parsed_json;
      const snippet = r.raw_text?.slice(0, 150) || pj?.evidence_snippet?.slice(0, 150) || "Response content";
      return `
      <div class="evidence-block no-break" style="border-left-color: #059669;">
        <div class="evidence-header">
          <span class="evidence-label" style="background: #d1fae5; color: #065f46;">STRENGTH</span>
        </div>
        <div class="evidence-quote">"${escapeHtml(snippet)}..."</div>
        <div class="evidence-impact">✓ This is working. You're positioned as a top recommendation.</div>
      </div>
      `;
    }).join("") : ""}
    
    ${vulnerableExamples.length > 0 ? vulnerableExamples.slice(0, 1).map(r => {
      const pj = r.parsed_json;
      const snippet = r.raw_text?.slice(0, 150) || "Response where competitors were mentioned but you were not.";
      const competitors = pj?.competitors_mentioned?.slice(0, 2).join(", ") || "competitors";
      return `
      <div class="evidence-block no-break" style="border-left-color: #dc2626;">
        <div class="evidence-header">
          <span class="evidence-label" style="background: #fee2e2; color: #991b1b;">VULNERABLE</span>
        </div>
        <div class="evidence-quote">"${escapeHtml(snippet)}..."</div>
        <div class="evidence-impact">⚠ ${competitors} mentioned, you were not. This is a discovery gap.</div>
      </div>
      `;
    }).join("") : ""}
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 3: STRATEGIC RECOMMENDATIONS (with consequences) -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Strategic Recommendations</span>
      <span class="page-num">Page 3</span>
    </div>
    
    <div class="h2">Prioritized Actions</div>
    <div class="body" style="margin-bottom: 10px;">Based on your snapshot, these are the highest-impact improvements — ranked by urgency and potential impact.</div>
    
    ${insights.map((insight, idx) => `
    <div class="insight-card no-break">
      <div class="insight-header">
        <span class="insight-priority priority-${insight.priority.toLowerCase()}">${insight.priority}</span>
        <span class="insight-title">#${idx + 1} ${escapeHtml(insight.title)}</span>
      </div>
      <div class="insight-grid">
        <div class="insight-label">Insight:</div>
        <div class="insight-value">${escapeHtml(insight.insight)}</div>
        <div class="insight-label">Why it matters:</div>
        <div class="insight-value">${escapeHtml(insight.whyItMatters)}</div>
        <div class="insight-label">Action:</div>
        <div class="insight-value">${escapeHtml(insight.action)}</div>
        <div class="insight-label">Expected:</div>
        <div class="insight-value">${escapeHtml(insight.expectedImpact)}</div>
      </div>
      <div class="insight-consequence">⚠ If no action: ${escapeHtml(insight.consequence)}</div>
    </div>
    `).join("")}
    
    <div class="method-box no-break" style="margin-top: 12px; border-left: 3px solid var(--accent);">
      <div class="method-title">30-Day Execution Plan</div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 8px;">
        <div style="padding: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 3px;">
          <div style="font-size: 8px; font-weight: 700; color: var(--accent);">Week 1-2</div>
          <div style="font-size: 8px; color: #334155; margin-top: 3px;">Audit content for AI extractability. Identify authority gaps. Benchmark competitor content.</div>
        </div>
        <div style="padding: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 3px;">
          <div style="font-size: 8px; font-weight: 700; color: var(--accent);">Week 2-3</div>
          <div style="font-size: 8px; color: #334155; margin-top: 3px;">Implement priority #1 recommendation. Focus resources on weakest model.</div>
        </div>
        <div style="padding: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 3px;">
          <div style="font-size: 8px; font-weight: 700; color: var(--accent);">Week 3-4</div>
          <div style="font-size: 8px; color: #334155; margin-top: 3px;">Build authority signals. Earn citations from trusted sources. Counter-position vs competitors.</div>
        </div>
        <div style="padding: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 3px;">
          <div style="font-size: 8px; font-weight: 700; color: var(--accent);">Week 4+</div>
          <div style="font-size: 8px; color: #334155; margin-top: 3px;">Run follow-up snapshot to measure progress. Iterate on strategy based on results.</div>
        </div>
      </div>
    </div>
    
    <div class="page-footer">
      <span>${escapeHtml(client.name)} — AI Visibility Report</span>
      <span>${escapeHtml(agency.name)}</span>
    </div>
  </div>
  
  <!-- PAGE 4: EVIDENCE & APPENDIX (combined for density) -->
  <div class="page">
    <div class="page-header">
      <span class="page-title">Evidence & Methodology</span>
      <span class="page-num">Page 4</span>
    </div>
    
    <div class="h2">Signal Summary</div>
    <table class="data-table no-break">
      <thead>
        <tr>
          <th>Signal Type</th>
          <th>Count</th>
          <th>Rate</th>
          <th>Impact</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Strength</strong> (Top position, strong rec)</td>
          <td>${metrics.topPosition}</td>
          <td>${metrics.topPositionRate}%</td>
          <td><span class="pill pill-green">Positive</span></td>
          <td style="font-size: 7px;">Maintain & defend</td>
        </tr>
        <tr>
          <td><strong>Opportunity</strong> (Mentioned, not top)</td>
          <td>${metrics.mentioned - metrics.topPosition}</td>
          <td>${Math.round(((metrics.mentioned - metrics.topPosition) / metrics.total) * 100)}%</td>
          <td><span class="pill pill-blue">Improvable</span></td>
          <td style="font-size: 7px;">Strengthen positioning</td>
        </tr>
        <tr>
          <td><strong>Vulnerable</strong> (Not mentioned)</td>
          <td>${metrics.total - metrics.mentioned}</td>
          <td>${100 - metrics.mentionRate}%</td>
          <td><span class="pill pill-red">Gap</span></td>
          <td style="font-size: 7px;">Build presence</td>
        </tr>
        <tr>
          <td><strong>Authority</strong> (With citations)</td>
          <td>${metrics.hasCitations}</td>
          <td>${metrics.citationRate}%</td>
          <td><span class="pill ${metrics.citationRate >= 30 ? 'pill-green' : 'pill-yellow'}">Trust signal</span></td>
          <td style="font-size: 7px;">Earn citations</td>
        </tr>
      </tbody>
    </table>
    
    ${metrics.competitorStats.length > 0 ? `
    <div class="h2" style="margin-top: 12px;">Competitive Comparison</div>
    <table class="data-table no-break">
      <thead>
        <tr>
          <th>Brand</th>
          <th>Mentions</th>
          <th>Rate</th>
          <th>vs You</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f0fdf4;">
          <td><strong>${escapeHtml(client.name)}</strong></td>
          <td><strong>${metrics.mentioned}</strong></td>
          <td><strong>${metrics.mentionRate}%</strong></td>
          <td>—</td>
          <td><span class="pill pill-green">#${metrics.clientRank}</span></td>
        </tr>
        ${metrics.competitorStats.slice(0, 4).map(c => {
          const gap = c.mentions - metrics.mentioned;
          const status = gap > 0 ? 'Ahead' : gap < 0 ? 'Behind' : 'Tied';
          return `
          <tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${c.mentions}</td>
            <td>${c.rate}%</td>
            <td style="color: ${gap > 0 ? '#dc2626' : gap < 0 ? '#16a34a' : '#64748b'}; font-weight: 600;">${gap > 0 ? '+' : ''}${gap}</td>
            <td><span class="pill ${status === 'Ahead' ? 'pill-red' : status === 'Behind' ? 'pill-green' : 'pill-yellow'}">${status}</span></td>
          </tr>
          `;
        }).join("")}
      </tbody>
    </table>
    ` : ""}
    
    <div class="h2" style="margin-top: 12px;">Full Evidence Table</div>
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
    
    <div class="method-box no-break" style="margin-top: 12px;">
      <div class="method-title">Methodology</div>
      <div class="method-text">
        VRTL Score analyzes AI responses across standardized discovery scenarios. The score combines <strong>Presence</strong> (mention consistency), <strong>Positioning</strong> (ranking vs alternatives), and <strong>Authority</strong> (citation signals).
      </div>
      <div class="method-grid">
        <div class="method-item">
          <div class="method-label">Generated</div>
          <div class="method-value">${formatDate(snapshot.created_at)}</div>
        </div>
        <div class="method-item">
          <div class="method-label">AI Responses</div>
          <div class="method-value">${metrics.total} analyzed</div>
        </div>
        <div class="method-item">
          <div class="method-label">Confidence</div>
          <div class="method-value">${competitors.length >= 3 ? "High" : competitors.length > 0 ? "Medium" : "Low"}</div>
        </div>
      </div>
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
