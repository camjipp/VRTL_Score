import type { ReportData } from "./types";

/** Enable verbose JSON error bodies on /api/reports/pdf and the debug route. */
export function isPdfDiagnosticsEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.PDF_DIAGNOSTICS === "1";
}

/** Log [pdf-trace] lines to stderr when probing sections (server logs). */
export function isPdfSectionLogEnabled(): boolean {
  return process.env.PDF_SECTION_LOG === "1";
}

export type PdfTraceSnapshot = {
  page: number;
  section: string;
};

let lastTrace: PdfTraceSnapshot = { page: 0, section: "(none)" };

export function resetPdfTrace(): void {
  lastTrace = { page: 0, section: "(none)" };
}

export function markPdfTrace(page: number, section: string): void {
  lastTrace = { page, section };
  if (isPdfSectionLogEnabled()) {
    console.error(`[pdf-trace] page=${page} section=${section}`);
  }
}

export function getPdfLastTrace(): PdfTraceSnapshot {
  return lastTrace;
}

/** Safe summary for API responses (no full text blobs). */
export function summarizeReportDataShape(data: ReportData): Record<string, unknown> {
  return {
    clientNameLen: data.clientName?.length ?? 0,
    domainLen: data.domain?.length ?? 0,
    dateLen: data.date?.length ?? 0,
    overallScore: data.overallScore,
    rank: data.rank,
    rankTotal: data.rankTotal,
    status: data.status,
    mentionRate: data.mentionRate,
    topPosition: data.topPosition,
    authorityScore: data.authorityScore,
    bottomLineLen: data.bottomLine?.length ?? 0,
    tensionNoteLen: data.tensionNote?.length ?? 0,
    strategicTakeawayLen: data.strategicTakeaway?.length ?? 0,
    methodologyLen: data.methodology?.length ?? 0,
    agencyLogoUrl: data.agencyLogoUrl ? "[set]" : null,
    agencyNameLen: data.agencyName?.length ?? 0,
    arrays: {
      competitors: data.competitors?.length ?? 0,
      modelScores: data.modelScores?.length ?? 0,
      recommendations: data.recommendations?.length ?? 0,
      evidencePreview: data.evidencePreview?.length ?? 0,
      executionPhases: data.executionPhases?.length ?? 0,
      signalSummary: data.signalSummary?.length ?? 0,
      competitiveTable: data.competitiveTable?.length ?? 0,
      evidenceLog: data.evidenceLog?.length ?? 0,
    },
    recommendationPriorities: (data.recommendations ?? []).map((r) => r?.priority ?? "(missing)"),
    signalStatuses: (data.signalSummary ?? []).map((s) => s?.status ?? "(missing)"),
    competitiveRowStatuses: (data.competitiveTable ?? []).map((r) => r?.status ?? "(missing)"),
    evidencePreviewLabels: (data.evidencePreview ?? []).map((e) => e?.label ?? "(missing)"),
    alerts: data.alerts
      ? {
          winTitleLen: data.alerts.win?.title?.length ?? 0,
          riskTitleLen: data.alerts.risk?.title?.length ?? 0,
          priorityTitleLen: data.alerts.priority?.title?.length ?? 0,
        }
      : null,
    meta: data.meta ?? null,
  };
}
