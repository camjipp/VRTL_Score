import { normalizeDisplayText } from "@/lib/text/normalizeDisplayText";
import type { ReportData } from "./types";

/**
 * Normalize user- and model-generated strings for reliable PDF rendering.
 * Strips invisible unicode via normalizeDisplayText, then PDF-safe typography.
 */
export function sanitizePdfString(raw: string): string {
  if (raw === "") return raw;
  let s = normalizeDisplayText(raw);
  s = s.replace(/[\u2018\u2019\u201A\u02BC\u02B9\u2032\u2035\u00B4]/g, "'");
  s = s.replace(/[\u201C\u201D\u201E\u2033\u2036\u00AB\u00BB]/g, '"');
  s = s.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");
  s = s.replace(/\u2026/g, "...");
  return normalizeDisplayText(s);
}

function humanizeJsonSnippetValue(val: unknown, depth: number): string {
  if (depth > 4) return "";
  if (val == null) return "";
  if (typeof val === "string") return sanitizePdfString(val);
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) {
    return val
      .map((x) => humanizeJsonSnippetValue(x, depth + 1))
      .filter(Boolean)
      .join("; ");
  }
  if (typeof val === "object") {
    return Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => {
        const key = sanitizePdfString(String(k).replace(/_/g, " "));
        const inner = humanizeJsonSnippetValue(v, depth + 1);
        return inner ? `${key}: ${inner}` : "";
      })
      .filter(Boolean)
      .join(". ");
  }
  return "";
}

/** JSON-like evidence snippets → plain-language lines (client PDF; no raw code blocks). */
export function formatEvidenceSnippetForPdf(raw: string): string {
  const cleaned = sanitizePdfString(String(raw)).trim();
  if (!cleaned) return "—";
  const looksJson =
    (cleaned.startsWith("{") && cleaned.endsWith("}")) ||
    (cleaned.startsWith("[") && cleaned.endsWith("]"));
  if (!looksJson) return cleaned;
  try {
    const v = JSON.parse(cleaned) as unknown;
    if (typeof v === "string") return sanitizePdfString(v);
    if (Array.isArray(v)) {
      if (v.length === 0) return "—";
      if (v.every((x) => typeof x === "string")) {
        return v.map((s, i) => `${i + 1}. ${sanitizePdfString(String(s))}`).join("\n");
      }
      const lines = v
        .map((item, i) => {
          const h = humanizeJsonSnippetValue(item, 0);
          return h ? `${i + 1}. ${h}` : "";
        })
        .filter(Boolean);
      return lines.length ? lines.join("\n\n") : "—";
    }
    if (v && typeof v === "object") {
      const out = humanizeJsonSnippetValue(v, 0);
      return out || "—";
    }
  } catch {
    return cleaned;
  }
  return cleaned;
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
    dataSummaryInterpretation: sanitizePdfString(data.dataSummaryInterpretation),
    recommendedNextSteps: sanitizePdfString(data.recommendedNextSteps),
    recommendedNextStepsVisible: data.recommendedNextStepsVisible,
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
      snippet: formatEvidenceSnippetForPdf(e.snippet),
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
