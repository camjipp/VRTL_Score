import type { Extraction } from "@/lib/extraction/schema";
import {
  evidencePdfChip,
  PDF_METHODOLOGY_TEXT,
  PDF_REPORT_TITLE,
  pdfScoreAccent,
  resolvePdfAccent,
} from "@/lib/reports/pdfTheme";

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
    description: "Run a snapshot to measure AI authority",
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
      title: `${worstModel[0]} Authority Gap`,
      insight: `${worstModel[0]} scores ${worstModel[1]} — ${gap} points below your average.`,
      whyItMatters: `${worstModel[0]} handles significant AI query volume. Low authority means competitive displacement risk.`,
      action: "Improve web authority and publish comparison content targeting this model's training data.",
      expectedImpact: `+10-15 points in ${worstModel[0]} within 60 days.`,
      consequence: `Every week this gap persists, competitors capture discovery opportunities you're missing.`
    });
  }
  
  // Competitor threat
  if (metrics.topCompetitor && metrics.topCompetitor.mentions >= metrics.mentioned) {
    insights.push({
      priority: "HIGH",
      title: "Competitive Authority Threat",
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
      title: "Low Authority Coverage",
      insight: `Authority signals appear in only ${metrics.mentionRate}% of AI responses.`,
      whyItMatters: "More than half of AI users asking about your category won't see your brand as an authoritative option.",
      action: "Improve brand authority through PR, backlinks, and structured data.",
      expectedImpact: "Target 70%+ authority coverage to enter the AI consideration set.",
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
      insight: "Your AI authority is competitive — maintain current strategy.",
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

function getEvidenceLabel(pj: Extraction | null): { label: EvidenceLabel; chip: ReturnType<typeof evidencePdfChip> } {
  if (!pj) return { label: "INVISIBLE", chip: evidencePdfChip("INVISIBLE") };

  if (pj.client_mentioned && pj.client_position === "top" && pj.recommendation_strength === "strong") {
    return { label: "STRENGTH", chip: evidencePdfChip("STRENGTH") };
  }
  if (pj.client_mentioned && (pj.client_position === "middle" || pj.recommendation_strength === "medium")) {
    return { label: "OPPORTUNITY", chip: evidencePdfChip("OPPORTUNITY") };
  }
  if (pj.client_mentioned && pj.competitors_mentioned && pj.competitors_mentioned.length > 0) {
    return { label: "COMPETITIVE", chip: evidencePdfChip("COMPETITIVE") };
  }
  if (!pj.client_mentioned && pj.competitors_mentioned && pj.competitors_mentioned.length > 0) {
    return { label: "VULNERABLE", chip: evidencePdfChip("VULNERABLE") };
  }
  if (!pj.client_mentioned) {
    return { label: "INVISIBLE", chip: evidencePdfChip("INVISIBLE") };
  }
  return { label: "OPPORTUNITY", chip: evidencePdfChip("OPPORTUNITY") };
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
    return `Fragile leadership: you rank first, but competitors show similar mention coverage. A focused content push could change this ranking.`;
  }
  if (metrics.isContestedMarket) {
    return `Contested landscape: no single leader in AI visibility. The first brand to differentiate is likely to capture the default recommendation.`;
  }
  if (metrics.gapToLeader > 5) {
    return `Visibility gap: ${metrics.leader?.name} leads by ${metrics.gapToLeader} mentions. Without intervention, models tend to reinforce existing patterns.`;
  }
  if (metrics.mentionRate < 50) {
    return `Discovery risk: a majority of category queries may not surface your brand; low presence compounds over time.`;
  }
  return "";
}

/* ═══════════════════════════════════════════════════════════════════════════
   HTML RENDER
═══════════════════════════════════════════════════════════════════════════ */

export function renderReportHtml(data: ReportData): string {
  const { agency, client, snapshot, competitors, responses } = data;

  const accentColor = resolvePdfAccent(agency.brand_accent);
  const score = snapshot.vrtl_score;
  const scoreAccent = pdfScoreAccent(score);
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --accent: ${accentColor};
      --score-accent: ${scoreAccent};
      --pdf-bg: #13161c;
      --pdf-surface: #1a1e28;
      --pdf-surface-raised: #222831;
      --pdf-border: rgba(255, 255, 255, 0.085);
      --pdf-border-subtle: rgba(255, 255, 255, 0.055);
      --pdf-text: #e8eaef;
      --pdf-text-secondary: #98a1b0;
      --pdf-text-muted: #6d7583;
      --pdf-success: #5cb89a;
      --pdf-success-dim: rgba(92, 184, 154, 0.14);
      --pdf-warning: #d4b06a;
      --pdf-warning-dim: rgba(212, 176, 106, 0.14);
      --pdf-danger: #c97070;
      --pdf-danger-dim: rgba(201, 112, 112, 0.14);
      --pdf-ring-track: rgba(255, 255, 255, 0.11);
      --pdf-r: 8px;
      --pdf-r-sm: 5px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10px;
      line-height: 1.45;
      color: var(--pdf-text);
      background: var(--pdf-bg);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 11mm 13mm;
      page-break-after: always;
      position: relative;
      background: var(--pdf-bg);
      color: var(--pdf-text);
    }
    .page:last-child { page-break-after: avoid; }
    .no-break { page-break-inside: avoid; break-inside: avoid; }

    .h1 { font-size: 17px; font-weight: 700; color: var(--pdf-text); letter-spacing: -0.02em; line-height: 1.15; }
    .h2 {
      font-size: 10px; font-weight: 600; color: var(--pdf-text-secondary);
      text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; margin-top: 4px;
    }
    .h3 { font-size: 9px; font-weight: 600; color: var(--pdf-text); margin-bottom: 6px; letter-spacing: 0.04em; }
    .body { font-size: 9px; color: var(--pdf-text-secondary); line-height: 1.55; }
    .small { font-size: 7.5px; color: var(--pdf-text-muted); }

    .pill {
      display: inline-block;
      padding: 3px 6px;
      border-radius: var(--pdf-r-sm);
      font-size: 6.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border: 1px solid transparent;
    }
    .pill-green { background: var(--pdf-success-dim); color: #9fd4c2; border-color: rgba(92, 184, 154, 0.28); }
    .pill-yellow { background: var(--pdf-warning-dim); color: #e8d49a; border-color: rgba(212, 176, 106, 0.28); }
    .pill-red { background: var(--pdf-danger-dim); color: #e8b4b4; border-color: rgba(201, 112, 112, 0.28); }
    .pill-blue { background: rgba(107, 158, 188, 0.14); color: #9ec5e8; border-color: rgba(107, 158, 188, 0.28); }
    .pill-gray { background: rgba(255, 255, 255, 0.05); color: var(--pdf-text-secondary); border-color: var(--pdf-border); }

    .priority-high { background: var(--pdf-danger-dim); color: #e8b4b4; border: 1px solid rgba(201, 112, 112, 0.3); }
    .priority-medium { background: var(--pdf-warning-dim); color: #e8d49a; border: 1px solid rgba(212, 176, 106, 0.3); }
    .priority-low { background: var(--pdf-success-dim); color: #9fd4c2; border: 1px solid rgba(92, 184, 154, 0.3); }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      padding-bottom: 10px;
      margin-bottom: 14px;
      border-bottom: 1px solid var(--pdf-border);
    }
    .page-header-left { flex: 1; min-width: 0; }
    .report-name {
      font-size: 9px; font-weight: 600; color: var(--pdf-text);
      letter-spacing: 0.14em; text-transform: uppercase;
    }
    .section-slug {
      font-size: 8px; color: var(--pdf-text-muted); margin-top: 3px;
      font-weight: 500; letter-spacing: 0.02em; text-transform: none;
    }
    .page-header-right { text-align: right; font-size: 8px; color: var(--pdf-text-secondary); line-height: 1.45; }
    .page-header-right .page-num { margin-top: 4px; font-size: 7px; color: var(--pdf-text-muted); letter-spacing: 0.04em; }
    .meta-quiet { color: var(--pdf-text-muted); font-size: 7.5px; }

    .page-footer {
      position: absolute;
      bottom: 7mm;
      left: 13mm;
      right: 13mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7px;
      color: var(--pdf-text-muted);
      padding-top: 8px;
      border-top: 1px solid var(--pdf-border-subtle);
    }

    /* Cover */
    .cover { padding-top: 6mm; }
    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--pdf-border);
    }
    .cover-header-left { flex: 1; }
    .cover-header-right { text-align: right; font-size: 8px; color: var(--pdf-text-secondary); line-height: 1.5; }
    .cover-logo img { max-height: 28px; opacity: 0.95; }
    .cover-logo-text { font-size: 10px; font-weight: 600; color: var(--pdf-text-secondary); }
    .cover-agency-line { font-size: 8px; color: var(--pdf-text-muted); margin-top: 4px; }

    .score-section { display: flex; gap: 18px; margin: 18px 0 16px; align-items: flex-start; }
    .score-ring {
      width: 104px; height: 104px; border-radius: 50%; flex-shrink: 0;
      background: conic-gradient(var(--score-accent) calc(${score ?? 0} * 3.6deg), var(--pdf-ring-track) 0);
      display: flex; align-items: center; justify-content: center;
    }
    .score-ring-inner {
      width: 82px; height: 82px; border-radius: 50%;
      background: var(--pdf-surface-raised);
      border: 1px solid var(--pdf-border-subtle);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .score-number { font-size: 30px; font-weight: 700; color: var(--pdf-text); line-height: 1; letter-spacing: -0.03em; }
    .score-max { font-size: 9px; color: var(--pdf-text-muted); margin-top: 2px; }

    .score-context { flex: 1; padding-top: 2px; }
    .score-tier {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--pdf-r-sm);
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--pdf-text);
      border: 1px solid var(--pdf-border);
      border-left: 2px solid var(--score-accent);
    }
    .score-rank { font-size: 9px; color: var(--pdf-text-secondary); margin-bottom: 10px; line-height: 1.4; }
    .score-rank strong { color: var(--pdf-text); font-weight: 600; }

    .context-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .context-item {
      padding: 8px 10px;
      background: var(--pdf-surface);
      border: 1px solid var(--pdf-border);
      border-radius: var(--pdf-r-sm);
    }
    .context-value { font-size: 14px; font-weight: 700; color: var(--pdf-text); letter-spacing: -0.02em; }
    .context-label { font-size: 7px; color: var(--pdf-text-muted); margin-top: 3px; text-transform: uppercase; letter-spacing: 0.08em; }

    .tension-alert {
      padding: 11px 14px;
      margin: 14px 0;
      background: var(--pdf-surface);
      border: 1px solid var(--pdf-border);
      border-left: 2px solid var(--pdf-warning);
      border-radius: var(--pdf-r-sm);
      font-size: 9px;
      color: var(--pdf-text-secondary);
      line-height: 1.55;
    }

    .bottom-line {
      padding: 12px 14px;
      margin: 14px 0;
      background: var(--pdf-surface-raised);
      border: 1px solid var(--pdf-border);
      border-radius: var(--pdf-r);
    }
    .bottom-line-title {
      font-size: 8px; font-weight: 600; color: var(--pdf-text-muted);
      margin-bottom: 6px; letter-spacing: 0.14em; text-transform: uppercase;
    }
    .bottom-line-text { font-size: 9.5px; color: var(--pdf-text-secondary); line-height: 1.55; }

    .verdict-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 14px 0; }
    .verdict-card {
      padding: 11px 12px;
      border-radius: var(--pdf-r-sm);
      background: var(--pdf-surface);
      border: 1px solid var(--pdf-border);
    }
    .verdict-card.win { border-left: 2px solid var(--pdf-success); }
    .verdict-card.risk { border-left: 2px solid var(--pdf-danger); }
    .verdict-card.priority { border-left: 2px solid var(--accent); }
    .verdict-label {
      font-size: 6.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: 5px; color: var(--pdf-text-muted);
    }
    .verdict-card.win .verdict-label { color: #9fd4c2; }
    .verdict-card.risk .verdict-label { color: #e8b4b4; }
    .verdict-card.priority .verdict-label { color: #9ec5e8; }
    .verdict-value { font-size: 9px; font-weight: 600; color: var(--pdf-text); line-height: 1.35; }
    .verdict-detail { font-size: 7.5px; color: var(--pdf-text-muted); margin-top: 4px; line-height: 1.35; }

    .ranking-section { margin: 14px 0 8px; }
    .ranking-row {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 0;
      border-bottom: 1px solid var(--pdf-border-subtle);
    }
    .ranking-row:last-child { border-bottom: none; }
    .ranking-pos { width: 22px; font-size: 8.5px; font-weight: 600; color: var(--pdf-text-muted); }
    .ranking-name { width: 90px; font-size: 9px; color: var(--pdf-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ranking-name.client { font-weight: 600; color: var(--pdf-text); }
    .ranking-bar { flex: 1; height: 5px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden; }
    .ranking-fill { height: 100%; border-radius: 3px; }
    .ranking-fill.client { background: var(--accent); }
    .ranking-fill.other { background: rgba(255, 255, 255, 0.2); }
    .ranking-score { width: 48px; font-size: 8.5px; color: var(--pdf-text-muted); text-align: right; }
    .ranking-score.client { font-weight: 600; color: var(--pdf-text); }
    .ranking-delta { width: 42px; font-size: 7.5px; text-align: right; }
    .ranking-delta.threat { color: #e8a8a8; font-weight: 600; }
    .ranking-delta.safe { color: #9fd4c2; }

    .model-grid { display: grid; grid-template-columns: repeat(${models.length > 2 ? 2 : 1}, 1fr); gap: 10px; margin: 12px 0; }
    .model-card {
      padding: 12px;
      background: var(--pdf-surface);
      border: 1px solid var(--pdf-border);
      border-radius: var(--pdf-r-sm);
      border-left: 2px solid var(--model-accent, var(--accent));
    }
    .model-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .model-name { font-size: 10px; font-weight: 600; color: var(--pdf-text); }
    .model-score { font-size: 17px; font-weight: 700; color: var(--pdf-text); letter-spacing: -0.03em; }
    .model-bar { height: 3px; background: rgba(255, 255, 255, 0.08); border-radius: 2px; margin: 8px 0; overflow: hidden; }
    .model-fill { height: 100%; border-radius: 2px; }
    .model-insight { font-size: 8px; color: var(--pdf-text-secondary); line-height: 1.45; }
    .model-delta { font-size: 7.5px; margin-top: 6px; }
    .model-delta.positive { color: #9fd4c2; }
    .model-delta.negative { color: #e8a8a8; }
    .model-aside { font-size: 7.5px; color: var(--pdf-text-muted); font-style: italic; margin-top: 4px; display: block; }

    .insight-card {
      padding: 12px 14px;
      background: var(--pdf-surface);
      border: 1px solid var(--pdf-border);
      border-radius: var(--pdf-r-sm);
      margin-bottom: 10px;
    }
    .insight-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    .insight-priority { font-size: 6.5px; font-weight: 700; padding: 3px 6px; border-radius: var(--pdf-r-sm); letter-spacing: 0.06em; }
    .insight-title { font-size: 10px; font-weight: 600; color: var(--pdf-text); }
    .insight-grid { display: grid; grid-template-columns: 72px 1fr; gap: 4px 10px; font-size: 8px; line-height: 1.45; }
    .insight-label { color: var(--pdf-text-muted); font-weight: 600; }
    .insight-value { color: var(--pdf-text-secondary); }
    .insight-consequence {
      font-size: 8px;
      color: var(--pdf-text-muted);
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--pdf-border-subtle);
      font-style: italic;
      line-height: 1.45;
    }

    .evidence-block {
      padding: 12px 14px;
      border: 1px solid var(--pdf-border);
      border-radius: var(--pdf-r-sm);
      margin-bottom: 10px;
      background: var(--pdf-surface);
      border-left: 2px solid var(--ev-border, var(--accent));
    }
    .evidence-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .evidence-chip {
      font-size: 6.5px; font-weight: 700; padding: 3px 7px; border-radius: var(--pdf-r-sm);
      letter-spacing: 0.08em; text-transform: uppercase;
      border: 1px solid;
    }
    .evidence-quote {
      font-size: 9px;
      color: var(--pdf-text-secondary);
      line-height: 1.55;
      margin-bottom: 8px;
      background: rgba(0, 0, 0, 0.2);
      padding: 10px 12px;
      border-radius: var(--pdf-r-sm);
      border: 1px solid var(--pdf-border-subtle);
    }
    .evidence-impact { font-size: 8px; color: var(--pdf-text-muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--pdf-border-subtle); line-height: 1.45; }

    .data-table { width: 100%; border-collapse: collapse; font-size: 8px; }
    .data-table th {
      text-align: left;
      padding: 8px 8px;
      background: var(--pdf-surface-raised);
      font-weight: 600;
      color: var(--pdf-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 6.5px;
      border-bottom: 1px solid var(--pdf-border);
    }
    .data-table td {
      padding: 8px;
      border-bottom: 1px solid var(--pdf-border-subtle);
      vertical-align: middle;
      color: var(--pdf-text-secondary);
    }
    .data-table tbody tr:hover td { background: transparent; }
    .data-table strong { color: var(--pdf-text); font-weight: 600; }
    .data-table tr.row-client td { background: rgba(92, 184, 154, 0.06); }

    .method-box {
      padding: 12px 14px;
      background: var(--pdf-surface);
      border: 1px solid var(--pdf-border);
      border-radius: var(--pdf-r);
      margin: 10px 0;
    }
    .method-box.insight-panel {
      background: var(--pdf-surface-raised);
      border-left: 2px solid var(--accent);
    }
    .method-title {
      font-size: 8px; font-weight: 600; color: var(--pdf-text-muted);
      margin-bottom: 8px; letter-spacing: 0.12em; text-transform: uppercase;
    }
    .method-text { font-size: 8.5px; color: var(--pdf-text-secondary); line-height: 1.55; }
    .method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
    .method-label { font-size: 7px; color: var(--pdf-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
    .method-value { font-size: 8px; color: var(--pdf-text); font-weight: 500; margin-top: 2px; }

    .plan-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
    .plan-cell {
      padding: 10px 12px;
      background: rgba(0, 0, 0, 0.15);
      border: 1px solid var(--pdf-border);
      border-radius: var(--pdf-r-sm);
    }
    .plan-phase { font-size: 7px; font-weight: 600; color: var(--pdf-text-muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 5px; }
    .plan-copy { font-size: 8px; color: var(--pdf-text-secondary); line-height: 1.45; }
  </style>
</head>
<body>
  <!-- PAGE 1 -->
  <div class="page cover">
    <div class="cover-header">
      <div class="cover-header-left">
        <div class="report-name">${PDF_REPORT_TITLE}</div>
        ${
          agency.brand_logo_url
            ? `<div class="cover-logo" style="margin-top:10px"><img src="${escapeHtml(agency.brand_logo_url)}" alt="" /></div>`
            : ""
        }
        ${
          agency.name
            ? `<div class="${agency.brand_logo_url ? "cover-agency-line" : "cover-logo-text"}" style="margin-top:${agency.brand_logo_url ? "6px" : "10px"}">${escapeHtml(agency.name)}</div>`
            : ""
        }
      </div>
      <div class="cover-header-right">
        <div style="font-weight:600;color:var(--pdf-text)">${escapeHtml(client.name)}</div>
        ${client.website ? `<div class="meta-quiet">${escapeHtml(client.website)}</div>` : ""}
        <div class="meta-quiet" style="margin-top:4px">${formatDate(snapshot.created_at)}</div>
      </div>
    </div>

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
      <div class="h3">Competitive Authority Ranking</div>
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
      <span>${agency.name ? escapeHtml(agency.name) : ""}</span>
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <div class="report-name">${PDF_REPORT_TITLE}</div>
        <div class="section-slug">Model analysis</div>
      </div>
      <div class="page-header-right">
        <div>${escapeHtml(client.name)}</div>
        ${client.website ? `<div class="meta-quiet">${escapeHtml(client.website)}</div>` : ""}
        <div class="meta-quiet">${formatDate(snapshot.created_at)}</div>
        <div class="page-num">Page 2</div>
      </div>
    </div>
    
    <div class="h2">Model-by-Model Performance</div>
    <div class="body" style="margin-bottom: 10px;">Each AI model ranks you differently. Understanding where you're strong (and weak) reveals exactly where to focus.</div>
    
    <div class="model-grid no-break">
      ${models.map(([name, val]) => {
        const modelAccent = pdfScoreAccent(val);
        const delta = val - avgModelScore;
        const isAboveAvg = delta > 0;
        const isStrong = val >= 70;
        const isWeak = val < 50;

        let modelInsight = "";
        if (isStrong) {
          modelInsight = `Your strongest model. Content strategy resonates here — replicate this approach for weaker models.`;
        } else if (isWeak) {
          modelInsight = `Critical gap. ${name} users may not surface your brand. Prioritize content this model indexes well.`;
        } else {
          modelInsight = `Moderate performance. Incremental improvement is possible with targeted optimization.`;
        }

        const modelCompContext = isStrong
          ? `Competitors will likely focus here to close the gap.`
          : isWeak
            ? `Competitors may already dominate recommendations on this model.`
            : `Room to differentiate before competitors claim this space.`;

        return `
        <div class="model-card" style="--model-accent: ${modelAccent}; border-left-color: ${modelAccent};">
          <div class="model-header">
            <div class="model-name">${escapeHtml(name)}</div>
            <div class="model-score">${Math.round(val)}</div>
          </div>
          <div class="model-bar">
            <div class="model-fill" style="width: ${val}%; background: ${modelAccent};"></div>
          </div>
          <div class="model-delta ${isAboveAvg ? "positive" : "negative"}">
            ${isAboveAvg ? "↑" : "↓"} ${Math.abs(Math.round(delta))} vs. average (${avgModelScore})
          </div>
          <div class="model-insight" style="margin-top: 6px;">
            ${modelInsight}
            <span class="model-aside">${modelCompContext}</span>
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
    <div class="method-box no-break insight-panel" style="margin-top: 12px;">
      <div class="method-title">Strategic takeaway</div>
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
    
    ${strengthExamples.length > 0 ? strengthExamples.slice(0, 1).map((r) => {
      const pj = r.parsed_json;
      const chip = evidencePdfChip("STRENGTH");
      const snippet = r.raw_text?.slice(0, 150) || pj?.evidence_snippet?.slice(0, 150) || "Response content";
      return `
      <div class="evidence-block no-break" style="--ev-border: ${chip.border}; border-left-color: ${chip.border};">
        <div class="evidence-header">
          <span class="evidence-chip" style="background:${chip.bg};color:${chip.color};border-color:${chip.border}">Strength</span>
        </div>
        <div class="evidence-quote">"${escapeHtml(snippet)}…"</div>
        <div class="evidence-impact">Positioning reads as a primary recommendation — maintain supporting authority signals.</div>
      </div>
      `;
    }).join("") : ""}

    ${vulnerableExamples.length > 0 ? vulnerableExamples.slice(0, 1).map((r) => {
      const pj = r.parsed_json;
      const chip = evidencePdfChip("VULNERABLE");
      const snippet = r.raw_text?.slice(0, 150) || "Response where competitors were mentioned but you were not.";
      const competitors = pj?.competitors_mentioned?.slice(0, 2).join(", ") || "competitors";
      return `
      <div class="evidence-block no-break" style="--ev-border: ${chip.border}; border-left-color: ${chip.border};">
        <div class="evidence-header">
          <span class="evidence-chip" style="background:${chip.bg};color:${chip.color};border-color:${chip.border}">Vulnerable</span>
        </div>
        <div class="evidence-quote">"${escapeHtml(snippet)}…"</div>
        <div class="evidence-impact">${escapeHtml(competitors)} surfaced; your brand did not — close the discovery gap with targeted authority building.</div>
      </div>
      `;
    }).join("") : ""}
    
    <div class="page-footer">
      <span>Confidential — ${escapeHtml(client.name)}</span>
      <span>${agency.name ? escapeHtml(agency.name) : ""}</span>
    </div>
  </div>

  <!-- PAGE 3 -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <div class="report-name">${PDF_REPORT_TITLE}</div>
        <div class="section-slug">Strategic recommendations</div>
      </div>
      <div class="page-header-right">
        <div>${escapeHtml(client.name)}</div>
        ${client.website ? `<div class="meta-quiet">${escapeHtml(client.website)}</div>` : ""}
        <div class="meta-quiet">${formatDate(snapshot.created_at)}</div>
        <div class="page-num">Page 3</div>
      </div>
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
      <div class="insight-consequence">If no action: ${escapeHtml(insight.consequence)}</div>
    </div>
    `).join("")}
    
    <div class="method-box no-break insight-panel" style="margin-top: 12px;">
      <div class="method-title">30-day execution plan</div>
      <div class="plan-grid">
        <div class="plan-cell">
          <div class="plan-phase">Week 1–2</div>
          <div class="plan-copy">Audit content for AI extractability. Identify authority gaps. Benchmark competitor content.</div>
        </div>
        <div class="plan-cell">
          <div class="plan-phase">Week 2–3</div>
          <div class="plan-copy">Implement priority #1 recommendation. Focus resources on the weakest model.</div>
        </div>
        <div class="plan-cell">
          <div class="plan-phase">Week 3–4</div>
          <div class="plan-copy">Build authority signals. Earn citations from trusted sources. Counter-position versus competitors.</div>
        </div>
        <div class="plan-cell">
          <div class="plan-phase">Week 4+</div>
          <div class="plan-copy">Run follow-up analysis to measure progress. Iterate on strategy based on results.</div>
        </div>
      </div>
    </div>
    
    <div class="page-footer">
      <span>Confidential — ${escapeHtml(client.name)}</span>
      <span>${agency.name ? escapeHtml(agency.name) : ""}</span>
    </div>
  </div>

  <!-- PAGE 4 -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        <div class="report-name">${PDF_REPORT_TITLE}</div>
        <div class="section-slug">Evidence & methodology</div>
      </div>
      <div class="page-header-right">
        <div>${escapeHtml(client.name)}</div>
        ${client.website ? `<div class="meta-quiet">${escapeHtml(client.website)}</div>` : ""}
        <div class="meta-quiet">${formatDate(snapshot.created_at)}</div>
        <div class="page-num">Page 4</div>
      </div>
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
        <tr class="row-client">
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
            <td style="color: ${gap > 0 ? "#e8a8a8" : gap < 0 ? "#9fd4c2" : "var(--pdf-text-muted)"}; font-weight: 600;">${gap > 0 ? "+" : ""}${gap}</td>
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
          const ch = label.chip;
          return `
          <tr>
            <td>${idx + 1}</td>
            <td><span class="pill" style="background:${ch.bg};color:${ch.color};border:1px solid ${ch.border}">${label.label}</span></td>
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
      <div class="method-text">${PDF_METHODOLOGY_TEXT}</div>
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
      <span>Confidential — ${escapeHtml(client.name)}</span>
      <span>${agency.name ? escapeHtml(agency.name) : ""}</span>
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
