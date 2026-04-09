import type { ReportData as SnapshotReportInput } from "@/lib/reports/renderReportHtml";
import {
  buildDataSummaryInterpretation,
  buildRecommendedNextSteps,
  buildSnapshotReportDerived,
  clientEvidenceCallout,
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
    text: "We audit structured content, schema, entity consistency, and citation gaps; benchmark competitor proof so priorities are explicit.",
  },
  {
    phase: "Week 2 to 3",
    text: "We rebuild the weakest model surface first—shipped pages, FAQs, and schema aligned to how that assistant retrieves answers.",
  },
  {
    phase: "Week 3–4",
    text: "We expand authority through cited comparison assets, reviews, trade press, and trusted third-party mentions assistants can cite.",
  },
  {
    phase: "Week 4+",
    text: "We re-measure with the next snapshot, read deltas by model, and lock the following 30-day sprint.",
  },
];

function buildModelInsights(name: string, val: number, _avg: number): string[] {
  void _avg;
  const isStrong = val >= 70;
  const isWeak = val < 50;
  if (isStrong) {
    return [
      "Strongest surface—this is the pattern to copy onto weaker models before rivals narrow the gap.",
      "Expect competitors to push here; refresh proof and cited facts proactively.",
    ];
  }
  if (isWeak) {
    const first =
      name === "Anthropic"
        ? "On Anthropic-powered answers, the brand is often absent from the recommendation set—effectively invisible in many category decisions this assistant influences."
        : `${name} returns answers where you are frequently missing from the short list buyers see—recommendation share on this path is going to others.`;
    return [first, "Ship 3–5 cited comparison pages plus direct-answer FAQ blocks for the query shapes this model returns."];
  }
  return [
    "Room to move with targeted comparison content, FAQs, and citations before a competitor locks the default answer here.",
    "Differentiate now—mediocre scores become hard losses once a rival owns the narrative.",
  ];
}

function buildStrategicTakeaway(models: [string, number][], _avg: number): string {
  void _avg;
  if (models.length === 0) {
    return "No per-model scores yet—once populated, we sequence spend against the widest spread first.";
  }
  const hi = models[0][1];
  const lo = models[models.length - 1][1];
  if (hi >= 70 && lo < 50) {
    return `${Math.round(hi - lo)} points separate your best and worst assistant surface—buyers get different short lists depending on which AI they use. Rebuild the weak surface with cited comparisons and FAQs before a competitor locks the default recommendation there.`;
  }
  if (models.every(([, s]) => s >= 70)) {
    return "Strong across engines—treat this as defense: monitor rivals, refresh proof monthly, and protect first-position answers.";
  }
  if (models.every(([, s]) => s < 50)) {
    return "Weak across the board—fix entity clarity, citations, and category coverage before fine-tuning model-by-model.";
  }
  return "Mixed board—we lift the weakest model first while holding the surfaces that already win recommendation share.";
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
    const { quote, impact } = clientEvidenceCallout(
      strengthExamples[0].raw_text,
      pj ?? null,
      client.name,
      "strength",
      "",
    );
    evidencePreview.push({
      label: "STRENGTH",
      snippet: quote,
      note: impact,
    });
  }
  if (vulnerableExamples[0]) {
    const pj = vulnerableExamples[0].parsed_json;
    const comps = pj?.competitors_mentioned?.slice(0, 3).join(", ") || "Competitors";
    const { quote, impact } = clientEvidenceCallout(
      vulnerableExamples[0].raw_text,
      pj ?? null,
      client.name,
      "vulnerable",
      comps,
    );
    evidencePreview.push({
      label: "VULNERABLE",
      snippet: quote,
      note: impact,
    });
  }
  if (evidencePreview.length === 0 && responses[0]) {
    const r0 = responses[0];
    const pj0 = r0.parsed_json ?? null;
    const lab = getSnapshotEvidenceLabel(pj0);
    const kind: "strength" | "vulnerable" = lab === "STRENGTH" ? "strength" : "vulnerable";
    const comps0 = pj0?.competitors_mentioned?.slice(0, 3).join(", ") || "Competitors";
    const { quote, impact } = clientEvidenceCallout(r0.raw_text, pj0, client.name, kind, comps0);
    evidencePreview.push({
      label: lab,
      snippet: quote,
      note: impact,
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
    dataSummaryInterpretation: buildDataSummaryInterpretation(metrics, client.name),
    recommendedNextSteps: buildRecommendedNextSteps(client.name),
    agencyLogoUrl: agency.brand_logo_url ?? null,
    agencyName: agency.name,
  };
}
