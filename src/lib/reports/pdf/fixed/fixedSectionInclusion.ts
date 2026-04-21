import type { ReportData } from "../types";

/** Whether a fixed template should render (skip empty surfaces). Page 1 is always included when the report runs. */
export function includeExecutiveSummary(): boolean {
  return true;
}

export function includeCompetitiveSnapshot(d: ReportData): boolean {
  return d.competitors.length > 0;
}

export function includeModelAnalysis(d: ReportData): boolean {
  return d.modelScores.length > 0;
}

export function includeExampleAnswers(d: ReportData): boolean {
  return d.evidencePreview.length > 0 || Boolean(d.strategicTakeaway?.trim());
}

export function includeRecommendationsPage5(d: ReportData): boolean {
  return d.recommendations.length > 0;
}

export function includeRecommendationsContinuation(d: ReportData): boolean {
  return d.recommendations.length > 2;
}

export function includeExecutionPlan(d: ReportData): boolean {
  return d.executionPhases.length > 0;
}

export function includeDataSummary(d: ReportData): boolean {
  return d.signalSummary.length > 0 && d.competitiveTable.length > 0;
}

export function includeEvidenceLog(d: ReportData): boolean {
  return d.evidenceLog.length > 0;
}

export function includeMethodologyClosing(): boolean {
  return true;
}
