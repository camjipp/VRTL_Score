import type { ReportData as SnapshotReportInput } from "@/lib/reports/renderReportHtml";
import {
  buildSnapshotReportDerived,
  getSnapshotEvidenceLabel,
} from "@/lib/reports/renderReportHtml";
import type {
  CompetitiveTableRow,
  EvidenceLogRow,
  EvidencePreview,
  ExecutionPhase,
  ModelScoreRow,
  RecommendationCard,
  ReportData as ReactPdfReportData,
  SignalRow,
} from "@/lib/reports/pdf/types";
import { formatProviderDisplayName } from "@/lib/reports/formatProviderDisplayName";
import { normalizeDisplayText } from "@/lib/text/normalizeDisplayText";
import { PDF_METHODOLOGY_TEXT } from "@/lib/reports/pdfTheme";

function normalizeRecommendationPriority(p: string | undefined): RecommendationCard["priority"] {
  if (p === "HIGH" || p === "MEDIUM" || p === "LOW") return p;
  return "LOW";
}

function formatLongDate(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const DEFAULT_EXECUTION: ExecutionPhase[] = [
  {
    phase: "Week 1 to 2",
    text: "Audit structured content, schema, and citation gaps. Benchmark competitor proof and entity consistency.",
  },
  {
    phase: "Week 2 to 3",
    text: "Execute the top recommendation. Focus the weakest model until the score moves.",
  },
  {
    phase: "Week 3–4",
    text: "Add authority: reviews, press, authoritative backlinks. Counter competitors where they lead the narrative.",
  },
  {
    phase: "Week 4+",
    text: "Re-run the snapshot. Read deltas by model and intent cluster. Lock the next 30-day plan.",
  },
];

function buildModelInsights(name: string, val: number, _avg: number): string[] {
  void _avg;
  const isStrong = val >= 70;
  const isWeak = val < 50;
  if (isStrong) {
    return [
      "Strongest surface. Copy what works here onto the weak models.",
      "Rivals will push here; refresh proof and citations before they do.",
    ];
  }
  if (isWeak) {
    const first =
      name === "Anthropic"
        ? "Anthropic visibility is weak. Your brand is frequently absent from category answers."
        : `${name} visibility is low. Your brand is frequently absent from category answers.`;
    return [first, "Prioritize factual, citation-dense pages this model pulls from."];
  }
  return [
    "Room to move. Targeted page updates should shift the score.",
    "Differentiate before a competitor locks the default answer here.",
  ];
}

function buildStrategicTakeaway(models: [string, number][], _avg: number): string {
  void _avg;
  if (models.length === 0) {
    return "No per-model scores yet. Populate provider scores to prioritize spend.";
  }
  const hi = models[0][1];
  const lo = models[models.length - 1][1];
  if (hi >= 70 && lo < 50) {
    return `${Math.round(hi - lo)} points separate your best and worst model. Assistants recommend different winners. Close the gap before a competitor owns the default answer.`;
  }
  if (models.every(([, s]) => s >= 70)) {
    return "Strong across the board. Shift to defense: watch competitors and refresh proof.";
  }
  if (models.every(([, s]) => s < 50)) {
    return "Weak everywhere. Fix authority and citations before model-by-model tactics.";
  }
  return "Mixed board. Lift the weakest model first; protect what already works.";
}

function evidenceSnippet(raw: string | null, parsedSnippet: string | undefined, max = 240): string {
  const src = normalizeDisplayText(raw?.trim() || parsedSnippet?.trim() || "");
  if (!src) return "—";
  const t = src.slice(0, max);
  return src.length > max ? `${t}…` : t;
}

/**
 * Maps Supabase snapshot payload (same shape as legacy HTML report) into React-PDF `ReportData`.
 */
export function mapSnapshotToReactPdfData(
  input: SnapshotReportInput,
  agency: { name: string; brand_logo_url?: string | null }
): ReactPdfReportData {
  const { client, snapshot, competitors, responses } = input;
  const derived = buildSnapshotReportDerived(input);
  const { metrics, insights, bottomLine, tensionNote, tier, models, avgModelScore } = derived;

  const competitorRows = metrics.allEntities.map((e, i) => ({
    name: e.name,
    mentions: e.mentions,
    rate: e.rate,
    rank: i + 1,
    isClient: e.isClient,
  }));

  const modelScores: ModelScoreRow[] = models.map(([name, val]) => {
    const displayName = formatProviderDisplayName(name);
    return {
      name: displayName,
      score: Math.round(val),
      deltaVsAvg: Math.round(val) - avgModelScore,
      insights: buildModelInsights(displayName, val, avgModelScore),
    };
  });

  const labeled = responses.map((r) => ({
    ...r,
    label: getSnapshotEvidenceLabel(r.parsed_json),
  }));
  const strengthExamples = labeled.filter((r) => r.label === "STRENGTH").slice(0, 2);
  const vulnerableExamples = labeled.filter((r) => r.label === "VULNERABLE").slice(0, 2);

  const evidencePreview: EvidencePreview[] = [];
  if (strengthExamples[0]) {
    const pj = strengthExamples[0].parsed_json;
    evidencePreview.push({
      label: "STRENGTH",
      snippet: evidenceSnippet(strengthExamples[0].raw_text, pj?.evidence_snippet),
      note: "Maintain top position with consistent proof and updated citations.",
    });
  }
  if (vulnerableExamples[0]) {
    const pj = vulnerableExamples[0].parsed_json;
    const comps = pj?.competitors_mentioned?.slice(0, 2).join(", ") || "Competitors";
    evidencePreview.push({
      label: "VULNERABLE",
      snippet: evidenceSnippet(vulnerableExamples[0].raw_text, pj?.evidence_snippet),
      note: `${comps} surfaced without you. Close the gap.`,
    });
  }
  if (evidencePreview.length === 0 && responses[0]) {
    evidencePreview.push({
      label: getSnapshotEvidenceLabel(responses[0].parsed_json),
      snippet: evidenceSnippet(responses[0].raw_text, responses[0].parsed_json?.evidence_snippet),
    });
  }

  const recommendations: RecommendationCard[] = insights.map((ins) => ({
    priority: normalizeRecommendationPriority(ins.priority),
    title: ins.title,
    insight: ins.insight,
    explanation: ins.whyItMatters,
    action: ins.action,
    expectedOutcome: ins.expectedImpact,
  }));

  const oppCount = metrics.mentioned - metrics.topPosition;
  const oppRate =
    metrics.total > 0 ? Math.round((oppCount / metrics.total) * 100) : 0;
  const authorityStatus: SignalRow["status"] =
    metrics.citationRate >= 30 ? "positive" : "improvable";

  const signalSummary: SignalRow[] = [
    {
      signal: "Strength (top + strong rec.)",
      count: metrics.topPosition,
      rate: `${metrics.topPositionRate}%`,
      status: "positive",
      actionNote: "Hold position",
    },
    {
      signal: "Mentioned (not top)",
      count: oppCount,
      rate: `${oppRate}%`,
      status: "improvable",
      actionNote: "Win top slot",
    },
    {
      signal: "Vulnerable (not mentioned)",
      count: metrics.total - metrics.mentioned,
      rate: `${100 - metrics.mentionRate}%`,
      status: "gap",
      actionNote: "Build presence",
    },
    {
      signal: "Authority (citations)",
      count: metrics.hasCitations,
      rate: `${metrics.citationRate}%`,
      status: authorityStatus,
      actionNote: "Earn citations",
    },
  ];

  const competitiveTable: CompetitiveTableRow[] = [
    {
      brand: client.name,
      mentions: metrics.mentioned,
      rate: `${metrics.mentionRate}%`,
      vsYou: "—",
      status: "You",
    },
    ...metrics.competitorStats.slice(0, 4).map((c) => {
      const gap = c.mentions - metrics.mentioned;
      const status: CompetitiveTableRow["status"] =
        gap > 0 ? "Ahead" : gap < 0 ? "Behind" : "Tied";
      return {
        brand: c.name,
        mentions: c.mentions,
        rate: `${c.rate}%`,
        vsYou: gap > 0 ? `+${gap}` : String(gap),
        status,
      };
    }),
  ];

  const evidenceLog: EvidenceLogRow[] = responses.slice(0, 10).map((r, idx) => {
    const pj = r.parsed_json;
    const compCount = pj?.competitors_mentioned?.length ?? 0;
    return {
      idx: idx + 1,
      label: getSnapshotEvidenceLabel(pj),
      mentioned: pj?.client_mentioned ? "Yes" : "No",
      position: pj?.client_position || "—",
      strength: pj?.recommendation_strength || "—",
      competitors: compCount > 0 ? String(compCount) : "—",
    };
  });

  const winTitle =
    models.length > 0 ? `Strong in ${formatProviderDisplayName(models[0][0])}` : "Establish baseline";
  const winDetail =
    models.length > 0 ? `Score ${Math.round(models[0][1])}` : "Run snapshots to compare models";

  const riskTitle = metrics.isFragileLeadership
    ? "Fragile lead"
    : models.length > 1 && models[models.length - 1][1] < 60
      ? `Weak in ${formatProviderDisplayName(models[models.length - 1][0])}`
      : metrics.topCompetitor
        ? `${metrics.topCompetitor.name} pressure`
        : "Monitor changes";
  const riskDetail = metrics.isFragileLeadership
    ? "Competitors inside striking distance"
    : models.length > 1 && models[models.length - 1][1] < 60
      ? `Score ${Math.round(models[models.length - 1][1])}`
      : metrics.topCompetitor
        ? `${metrics.topCompetitor.mentions} mentions`
        : "Watch weekly";

  return {
    clientName: client.name,
    domain: client.website?.replace(/^https?:\/\//i, "") || "—",
    date: formatLongDate(snapshot.created_at),
    overallScore: snapshot.vrtl_score,
    rank: metrics.clientRank,
    rankTotal: metrics.allEntities.length || 1,
    status: tier.tier,
    mentionRate: metrics.mentionRate,
    topPosition: metrics.topPositionRate,
    authorityScore: metrics.citationRate,
    bottomLine,
    tensionNote,
    competitors: competitorRows,
    modelScores,
    alerts: {
      win: { title: winTitle, detail: winDetail },
      risk: { title: riskTitle, detail: riskDetail },
      priority: {
        title: insights[0]?.title ?? "Schedule follow-up",
        detail: insights[0]?.priority ?? "Next 30 days",
      },
    },
    recommendations,
    evidencePreview,
    executionPhases: DEFAULT_EXECUTION,
    signalSummary,
    competitiveTable,
    evidenceLog,
    methodology: PDF_METHODOLOGY_TEXT,
    meta: {
      responses: metrics.total,
      confidence: competitors.length >= 3 ? "High" : competitors.length > 0 ? "Medium" : "Low",
      generated: formatLongDate(snapshot.created_at),
    },
    strategicTakeaway: buildStrategicTakeaway(models, avgModelScore),
    agencyLogoUrl: agency.brand_logo_url ?? null,
    agencyName: agency.name,
  };
}
