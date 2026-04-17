import { normalizeDisplayText } from "@/lib/text/normalizeDisplayText";
import type { ReportData, VulnerableExcerptParts } from "./types";

/**
 * Normalize user- and model-generated strings for reliable PDF rendering.
 * Strips invisible unicode via normalizeDisplayText, then PDF-safe typography.
 */
/** Model text sometimes glues a short word with a hyphen instead of a space. */
function repairHyphenWordGlue(s: string): string {
  return s.replace(
    /\b([A-Za-z][A-Za-z'-]{1,})-(each|effectively|then|than|that|this|there|these|those|when|where|while|with|from|into|onto|upon|over|out|up|in|on|at|as|is|are|was|were|and|or|but|not|no|to|of|for|by|vs|via|the|a|an)\b/gi,
    "$1 $2",
  );
}

/** Hyphenation / PDF breaks that glue words into nonsense ("citation-without", "average)-on"). */
function repairBrokenCompoundTokens(s: string): string {
  let t = s;
  t = t.replace(/citation-without/gi, "citation without");
  t = t.replace(/citation-without-/gi, "citation without ");
  t = t.replace(/average\)\s*-\s*on/gi, "average) on");
  t = t.replace(/\)\s*-\s*([a-z]{2,})\b/gi, ") $1");
  t = t.replace(/\b([A-Z][a-z]{2,})\s+each\s+one\s+is\b/g, "$1. Each one is");
  return t;
}

function stripCodeFencesAndBackticks(s: string): string {
  let t = s.replace(/```[\s\S]*?```/g, " ");
  t = t.replace(/`([^`\n]+)`/g, "$1");
  t = t.replace(/`/g, "");
  return t.replace(/\s+/g, " ").trim();
}

export function sanitizePdfString(raw: string): string {
  if (raw === "") return raw;
  let s = normalizeDisplayText(raw);
  s = s.replace(/[\u2018\u2019\u201A\u02BC\u02B9\u2032\u2035\u00B4]/g, "'");
  s = s.replace(/[\u201C\u201D\u201E\u2033\u2036\u00AB\u00BB]/g, '"');
  s = s.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");
  s = s.replace(/\u2026/g, "...");
  s = repairHyphenWordGlue(s);
  s = repairBrokenCompoundTokens(s);
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

function tryParseLooseJson(cleaned: string): unknown | null {
  const trimmed = cleaned.trim();
  const looksJson =
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"));
  if (looksJson) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      /* fall through */
    }
  }
  const objStart = trimmed.indexOf("{");
  if (objStart >= 0) {
    const depthSlice = trimmed.slice(objStart);
    let depth = 0;
    let end = -1;
    for (let i = 0; i < depthSlice.length; i++) {
      const ch = depthSlice[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = objStart + i + 1;
          break;
        }
      }
    }
    if (end > objStart) {
      const sub = trimmed.slice(objStart, end);
      try {
        return JSON.parse(sub) as unknown;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** JSON-like evidence snippets → plain-language lines (client PDF; no raw code blocks). */
export function formatEvidenceSnippetForPdf(raw: string): string {
  const stripped = stripCodeFencesAndBackticks(String(raw));
  const cleaned = sanitizePdfString(stripped).trim();
  if (!cleaned) return "No signal";

  const loose = tryParseLooseJson(cleaned);
  if (loose != null) {
    const v = loose;
    if (typeof v === "string") return sanitizePdfString(v);
    if (Array.isArray(v)) {
      if (v.length === 0) return "No signal";
      if (v.every((x) => typeof x === "string")) {
        return v.map((s, i) => `${i + 1}. ${sanitizePdfString(String(s))}`).join(". ");
      }
      const lines = v
        .map((item, i) => {
          const h = humanizeJsonSnippetValue(item, 0);
          return h ? `${i + 1}. ${h}` : "";
        })
        .filter(Boolean);
      return lines.length ? lines.join(". ") : "No signal";
    }
    if (v && typeof v === "object") {
      const out = humanizeJsonSnippetValue(v, 0);
      if (out) return out;
    }
  }

  if (/[{[\]}]/.test(cleaned) && /"[^"]+"\s*:/.test(cleaned)) {
    const prose = cleaned
      .replace(/\{|\}|\[|\]/g, " ")
      .replace(/"([^"]+)"\s*:\s*/g, "$1: ")
      .replace(/,\s*/g, "; ")
      .replace(/\s+/g, " ")
      .trim();
    return prose || "No signal";
  }

  return cleaned;
}

/**
 * Client-facing vulnerable row: never show JSON, backticks, or code-shaped payloads.
 * Uses structured fields when parseable; otherwise derives short lines from snippet + note.
 */
export function buildVulnerableExcerptForPdf(
  snippet: string,
  note: string | undefined,
  competitorNames: readonly string[],
): VulnerableExcerptParts {
  const n = note != null ? sanitizePdfString(note).trim() : "";
  const base = formatEvidenceSnippetForPdf(snippet);
  const loose = tryParseLooseJson(stripCodeFencesAndBackticks(String(snippet)).trim());
  if (loose && typeof loose === "object" && !Array.isArray(loose)) {
    const o = loose as Record<string, unknown>;
    const summary =
      [o.summary, o.message, o.headline, o.description]
        .map((x) => (typeof x === "string" ? sanitizePdfString(x).trim() : ""))
        .find(Boolean) || base.split(". ")[0] || base;
    const compsRaw = o.competitors ?? o.competitor_names ?? o.brands;
    let competitorsLine = "";
    if (Array.isArray(compsRaw)) {
      competitorsLine = compsRaw.map((x) => sanitizePdfString(String(x))).filter(Boolean).join(", ");
    } else if (typeof compsRaw === "string") {
      competitorsLine = sanitizePdfString(compsRaw);
    } else if (typeof o.competitor === "string") {
      competitorsLine = sanitizePdfString(o.competitor);
    }
    if (!competitorsLine && competitorNames.length) {
      competitorsLine = competitorNames.slice(0, 6).join(", ");
    }
    const implication =
      [o.implication, o.implications, o.risk, o.note, n]
        .map((x) => (typeof x === "string" ? sanitizePdfString(x).trim() : ""))
        .find(Boolean) || n;
    return {
      summary: summary || "Exposure in this signal is elevated.",
      competitorsLine: competitorsLine || (competitorNames.length ? competitorNames.slice(0, 6).join(", ") : "Competitive set varies by assistant."),
      implication: implication || "Close the gap with cited comparisons and retrievable proof.",
    };
  }

  const summary =
    base.length > 220 ? `${base.slice(0, 217).trim()}…` : base || "Exposure in this signal is elevated.";
  const competitorsLine = competitorNames.length
    ? competitorNames.slice(0, 6).join(", ")
    : "See competitive table for named alternatives.";
  const implication = n || "Prioritize proof and structured answers for the query shapes where you are weakest.";
  return { summary, competitorsLine, implication };
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
    evidencePreview: data.evidencePreview.map((e) => {
      const label = sanitizePdfString(e.label);
      const rawSnip = String(e.snippet);
      const snippet = formatEvidenceSnippetForPdf(rawSnip);
      const competitorNames = data.competitors.map((c) => sanitizePdfString(c.name));
      const vulnerableExcerpt =
        label.toUpperCase().includes("VULNERABLE") || label.toUpperCase().includes("INVISIBLE")
          ? buildVulnerableExcerptForPdf(rawSnip, e.note, competitorNames)
          : undefined;
      return {
        ...e,
        label,
        snippet,
        note: e.note != null ? sanitizePdfString(e.note) : e.note,
        vulnerableExcerpt,
      };
    }),
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
      note: r.note != null ? sanitizePdfString(r.note) : r.note,
    })),
  };
}
