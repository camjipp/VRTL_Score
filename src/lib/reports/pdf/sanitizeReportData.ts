import type { ReportData } from "./types";

/**
 * Invisible / layout control characters that PDFKit + embedded fonts mishandle
 * (e.g. word joiner breaking "distance", ZWSP splitting tokens).
 */
const INVISIBLE_AND_SOFT_HYPHEN = /[\u200B-\u200D\uFEFF\u2060\u180E\u034F\u00AD\uFFF9-\uFFFB]/g;

/**
 * Normalize user- and model-generated strings for reliable PDF rendering.
 * Smart quotes, primes, and exotic spaces → ASCII-safe equivalents.
 */
export function sanitizePdfString(raw: string): string {
  if (raw === "") return raw;
  let s = raw.replace(INVISIBLE_AND_SOFT_HYPHEN, "");
  try {
    s = s.normalize("NFC");
  } catch {
    /* ignore */
  }

  s = s.replace(/[\u2018\u2019\u201A\u02BC\u02B9\u2032\u2035\u00B4]/g, "'");
  s = s.replace(/[\u201C\u201D\u201E\u2033\u2036\u00AB\u00BB]/g, '"');
  s = s.replace(/[\u2013\u2014\u2015\u2212]/g, " - ");
  s = s.replace(/\u2026/g, "...");
  s = s.replace(/\u00A0|\u202F|\u2007|\uFEFF/g, " ");
  s = s.replace(/[\u2028\u2029]/g, "\n");

  return s;
}

/** Deep-copy ReportData with every string field sanitized for PDF output. */
export function sanitizeReportDataForPdf(data: ReportData): ReportData {
  return {
    ...data,
    clientName: sanitizePdfString(data.clientName),
    domain: sanitizePdfString(data.domain),
    date: sanitizePdfString(data.date),
    status: sanitizePdfString(data.status),
    bottomLine: sanitizePdfString(data.bottomLine),
    tensionNote: data.tensionNote != null ? sanitizePdfString(data.tensionNote) : data.tensionNote,
    methodology: sanitizePdfString(data.methodology),
    strategicTakeaway: sanitizePdfString(data.strategicTakeaway),
    agencyLogoUrl: data.agencyLogoUrl,
    agencyName: data.agencyName == null ? data.agencyName : sanitizePdfString(data.agencyName),
    meta: {
      responses: data.meta.responses,
      confidence: sanitizePdfString(data.meta.confidence),
      generated: sanitizePdfString(data.meta.generated),
    },
    competitors: data.competitors.map((c) => ({
      ...c,
      name: sanitizePdfString(c.name),
    })),
    modelScores: data.modelScores.map((m) => ({
      ...m,
      name: sanitizePdfString(m.name),
      insights: m.insights.map(sanitizePdfString),
    })),
    alerts: {
      win: {
        title: sanitizePdfString(data.alerts.win.title),
        detail: sanitizePdfString(data.alerts.win.detail),
      },
      risk: {
        title: sanitizePdfString(data.alerts.risk.title),
        detail: sanitizePdfString(data.alerts.risk.detail),
      },
      priority: {
        title: sanitizePdfString(data.alerts.priority.title),
        detail: sanitizePdfString(data.alerts.priority.detail),
      },
    },
    recommendations: data.recommendations.map((r) => ({
      ...r,
      title: sanitizePdfString(r.title),
      insight: sanitizePdfString(r.insight),
      explanation: sanitizePdfString(r.explanation),
      action: sanitizePdfString(r.action),
      expectedOutcome: sanitizePdfString(r.expectedOutcome),
    })),
    evidencePreview: data.evidencePreview.map((e) => ({
      ...e,
      label: sanitizePdfString(e.label),
      snippet: sanitizePdfString(e.snippet),
      note: e.note != null ? sanitizePdfString(e.note) : e.note,
    })),
    executionPhases: data.executionPhases.map((p) => ({
      ...p,
      phase: sanitizePdfString(p.phase),
      text: sanitizePdfString(p.text),
    })),
    signalSummary: data.signalSummary.map((s) => ({
      ...s,
      signal: sanitizePdfString(s.signal),
      rate: sanitizePdfString(s.rate),
      actionNote: sanitizePdfString(s.actionNote),
    })),
    competitiveTable: data.competitiveTable.map((r) => ({
      ...r,
      brand: sanitizePdfString(r.brand),
      rate: sanitizePdfString(r.rate),
      vsYou: sanitizePdfString(r.vsYou),
    })),
    evidenceLog: data.evidenceLog.map((r) => ({
      ...r,
      label: sanitizePdfString(r.label),
      mentioned: sanitizePdfString(r.mentioned),
      position: sanitizePdfString(r.position),
      strength: sanitizePdfString(r.strength),
      competitors: sanitizePdfString(r.competitors),
    })),
  };
}
