import type { ReportData } from "./types";

/** Page 1 (overview) is always included. */
export function shouldRenderModelAnalysisPage(d: ReportData): boolean {
  return d.modelScores.length > 0;
}

/** Second model-analysis page: excerpts + takeaway (only when there is follow-on content). */
export function shouldRenderModelAnalysisExamplesSubpage(d: ReportData): boolean {
  return d.evidencePreview.length > 0 || Boolean(d.strategicTakeaway?.trim());
}

export function shouldRenderRecommendationsPage(d: ReportData): boolean {
  return d.recommendations.length > 0;
}

export function shouldRenderExecutionPage(d: ReportData): boolean {
  return d.executionPhases.length > 0;
}

export function shouldRenderDataSummaryPage(d: ReportData): boolean {
  return d.signalSummary.length > 0 && d.competitiveTable.length > 0;
}

export function shouldRenderEvidenceMethodologyPage(d: ReportData): boolean {
  const closingShown =
    d.recommendedNextStepsVisible !== false && Boolean(d.recommendedNextSteps?.trim());
  return Boolean(d.methodology?.trim()) || d.evidenceLog.length > 0 || closingShown;
}
