export type AlertBlock = {
  title: string;
  detail: string;
};

export type ModelScoreRow = {
  name: string;
  score: number;
  deltaVsAvg: number;
  insights: string[];
};

export type CompetitorRow = {
  name: string;
  mentions: number;
  rate: number;
  rank: number;
  isClient?: boolean;
};

export type RecommendationCard = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  insight: string;
  explanation: string;
  action: string;
  expectedOutcome: string;
};

export type EvidencePreview = {
  label: string;
  snippet: string;
  note?: string;
};

export type ExecutionPhase = {
  phase: string;
  text: string;
};

export type SignalRow = {
  signal: string;
  count: number;
  rate: string;
  status: "positive" | "improvable" | "gap" | "trust";
  actionNote: string;
};

export type CompetitiveTableRow = {
  brand: string;
  mentions: number;
  rate: string;
  vsYou: string;
  status: "Ahead" | "Behind" | "Tied" | "You";
};

export type EvidenceLogRow = {
  idx: number;
  label: string;
  mentioned: string;
  position: string;
  strength: string;
  competitors: string;
};

/** Drives the full multi-page AI authority briefing */
export type ReportData = {
  clientName: string;
  domain: string;
  date: string;
  overallScore: number | null;
  rank: number;
  rankTotal: number;
  status: string;
  mentionRate: number;
  topPosition: number;
  authorityScore: number;
  bottomLine: string;
  tensionNote?: string;
  competitors: CompetitorRow[];
  modelScores: ModelScoreRow[];
  alerts: {
    win: AlertBlock;
    risk: AlertBlock;
    priority: AlertBlock;
  };
  recommendations: RecommendationCard[];
  evidencePreview: EvidencePreview[];
  executionPhases: ExecutionPhase[];
  signalSummary: SignalRow[];
  competitiveTable: CompetitiveTableRow[];
  evidenceLog: EvidenceLogRow[];
  methodology: string;
  meta: {
    responses: number;
    confidence: string;
    generated: string;
  };
  strategicTakeaway: string;
  /** Plain-language read on what the data tables imply */
  dataSummaryInterpretation: string;
  /** Closing: ownership, cadence, ongoing program (no fluff) */
  recommendedNextSteps: string;
  agencyLogoUrl?: string | null;
  agencyName?: string | null;
};
