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
import { PDF_METHODOLOGY_TEXT } from "@/lib/reports/pdfTheme";

function formatLongDate(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const DEFAULT_EXECUTION: ExecutionPhase[] = [
  {
    phase: "Week 1–2",
    text: "Audit content for AI extractability. Identify authority gaps. Benchmark competitor content.",
  },
  {
    phase: "Week 2–3",
    text: "Implement priority #1 recommendation. Focus resources on the weakest model.",
  },
  {
    phase: "Week 3–4",
    text: "Build authority signals. Earn citations from trusted sources. Counter-position versus competitors.",
  },
  {
    phase: "Week 4+",
    text: "Run follow-up analysis to measure progress. Iterate on strategy based on results.",
  },
];

function buildModelInsights(name: string, val: number, avg: number): string[] {
  const isStrong = val >= 70;
  const isWeak = val < 50;
  if (isStrong) {
    return [
      "Your strongest model surface — replicate what works here across weaker models.",
      "Competitors may target this channel to close the gap; defend with fresh authority signals.",
    ];
  }
  if (isWeak) {
    return [
      `Critical gap: users of ${name} may not reliably see your brand in category answers.`,
      "Prioritize factual, citation-friendly pages this model tends to summarize.",
    ];
  }
  return [
    "Moderate performance — incremental gains available with targeted page updates.",
    "Differentiate before competitors claim default recommendations on this model.",
  ];
}

function buildStrategicTakeaway(models: [string, number][], avg: number): string {
  if (models.length === 0) {
    return "No per-model scores yet. Run snapshots that populate provider-level scores to prioritize where to invest.";
  }
  const hi = models[0][1];
  const lo = models[models.length - 1][1];
  if (hi >= 70 && lo < 50) {
    return `You have a ${Math.round(hi - lo)}-point spread between your best and worst models. This inconsistency means your content works for some AI systems but not others. Closing this gap is your highest-leverage opportunity.`;
  }
  if (models.every(([, s]) => s >= 70)) {
    return "Consistent strong performance across models indicates robust content authority. Focus shifts to maintaining position and monitoring competitive threats.";
  }
  if (models.every(([, s]) => s < 50)) {
    return "Weak performance across all models signals foundational authority issues. Plan for systematic improvement rather than model-only tactics.";
  }
  return "Mixed performance suggests targeted optimization: lift your weakest model while preserving strength elsewhere.";
}

function evidenceSnippet(raw: string | null, parsedSnippet: string | undefined, max = 240): string {
  const src = raw?.trim() || parsedSnippet?.trim() || "";
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

  const modelScores: ModelScoreRow[] = models.map(([name, val]) => ({
    name,
    score: Math.round(val),
    deltaVsAvg: Math.round(val) - avgModelScore,
    insights: buildModelInsights(name, val, avgModelScore),
  }));

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
      note: "Primary recommendation positioning — maintain supporting authority.",
    });
  }
  if (vulnerableExamples[0]) {
    const pj = vulnerableExamples[0].parsed_json;
    const comps = pj?.competitors_mentioned?.slice(0, 2).join(", ") || "Competitors";
    evidencePreview.push({
      label: "VULNERABLE",
      snippet: evidenceSnippet(vulnerableExamples[0].raw_text, pj?.evidence_snippet),
      note: `${comps} surfaced; your brand did not — close the discovery gap.`,
    });
  }
  if (evidencePreview.length === 0 && responses[0]) {
    evidencePreview.push({
      label: getSnapshotEvidenceLabel(responses[0].parsed_json),
      snippet: evidenceSnippet(responses[0].raw_text, responses[0].parsed_json?.evidence_snippet),
    });
  }

  const recommendations: RecommendationCard[] = insights.map((ins) => ({
    priority: ins.priority,
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
      signal: "Strength (top position, strong rec.)",
      count: metrics.topPosition,
      rate: `${metrics.topPositionRate}%`,
      status: "positive",
      actionNote: "Maintain & defend",
    },
    {
      signal: "Opportunity (mentioned, not top)",
      count: oppCount,
      rate: `${oppRate}%`,
      status: "improvable",
      actionNote: "Strengthen positioning",
    },
    {
      signal: "Vulnerable (not mentioned)",
      count: metrics.total - metrics.mentioned,
      rate: `${100 - metrics.mentionRate}%`,
      status: "gap",
      actionNote: "Build presence",
    },
    {
      signal: "Authority (with citations)",
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

  const winTitle = models.length > 0 ? `Strong in ${models[0][0]}` : "Baseline established";
  const winDetail =
    models.length > 0 ? `Score ${Math.round(models[0][1])}` : "Complete snapshots to compare models";

  const riskTitle = metrics.isFragileLeadership
    ? "Fragile lead"
    : models.length > 1 && models[models.length - 1][1] < 60
      ? `Weak in ${models[models.length - 1][0]}`
      : metrics.topCompetitor
        ? `${metrics.topCompetitor.name} pressure`
        : "Monitor changes";
  const riskDetail = metrics.isFragileLeadership
    ? "Competitors within striking distance"
    : models.length > 1 && models[models.length - 1][1] < 60
      ? `Score ${Math.round(models[models.length - 1][1])}`
      : metrics.topCompetitor
        ? `${metrics.topCompetitor.mentions} mentions`
        : "Track weekly";

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
