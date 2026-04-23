import { normalizeDisplayText } from "@/lib/text/normalizeDisplayText";
import { clipPdfText } from "./editorial/pdfNarrative";
import type { CompetitiveTableRow, CompetitorRow, ReportData, VulnerableExcerptParts } from "./types";

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
function titleCaseWords(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Merge case-variant brand rows (e.g. “hydro flask” + “Hydro Flask”) for consistent PDF tables.
 *
 * Rate is recomputed from `mentions / totalResponses` where `totalResponses` is recovered
 * from the client row (pre-merge `mentions / rate`). This guarantees Page 4 and Page 8 agree
 * on the same brand's mention rate, independent of which variant was listed first.
 */
function mergeCompetitorRows(rows: readonly CompetitorRow[]): CompetitorRow[] {
  const m = new Map<
    string,
    { mentions: number; isClient: boolean; display: string }
  >();
  for (const r of rows) {
    const key = r.name.trim().toLowerCase();
    if (!key) continue;
    const display = titleCaseWords(r.name.trim());
    const cur = m.get(key);
    if (!cur) {
      m.set(key, {
        mentions: r.mentions,
        isClient: Boolean(r.isClient),
        display,
      });
    } else {
      m.set(key, {
        mentions: cur.mentions + r.mentions,
        isClient: cur.isClient || Boolean(r.isClient),
        display: cur.display.length >= display.length ? cur.display : display,
      });
    }
  }
  const client = rows.find((r) => r.isClient);
  const totalResponses =
    client && client.rate > 0 && client.mentions > 0
      ? Math.round((client.mentions / client.rate) * 100)
      : 0;
  return [...m.values()]
    .map((v) => ({
      name: v.display,
      mentions: v.mentions,
      rate:
        totalResponses > 0
          ? Math.round((v.mentions / totalResponses) * 100)
          : v.mentions > 0
            ? 0
            : 0,
      rank: 0,
      isClient: v.isClient,
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

/** Parse a percentage-shaped string ("43%", "43") into a number; returns NaN on failure. */
function parseRateString(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(n) ? n : Number.NaN;
}

/**
 * Merge case-variant competitive-table rows and recompute rates so they agree
 * with the competitor panel on page 4. Rate is derived from mentions / total,
 * where `total` comes from the client ("You") row's own mentions ÷ rate.
 */
function mergeCompetitiveTableRows(rows: readonly CompetitiveTableRow[]): CompetitiveTableRow[] {
  const you = rows.find((r) => r.status === "You");
  const others = rows.filter((r) => r.status !== "You");
  const m = new Map<string, { mentions: number; brand: string }>();
  for (const r of others) {
    const key = r.brand.trim().toLowerCase();
    if (!key) continue;
    const brand = titleCaseWords(r.brand.trim());
    const ex = m.get(key);
    if (!ex) m.set(key, { mentions: r.mentions, brand });
    else m.set(key, { mentions: ex.mentions + r.mentions, brand: ex.brand });
  }
  const clientM = you?.mentions ?? 0;
  const clientRate = you ? parseRateString(you.rate) : Number.NaN;
  const totalResponses =
    Number.isFinite(clientRate) && clientRate > 0 && clientM > 0
      ? Math.round((clientM / clientRate) * 100)
      : 0;
  const formatRate = (mentions: number): string => {
    if (totalResponses <= 0) return "—";
    return `${Math.round((mentions / totalResponses) * 100)}%`;
  };
  const mergedOthers = [...m.values()]
    .map((v) => {
      const gap = v.mentions - clientM;
      const status: CompetitiveTableRow["status"] =
        gap > 0 ? "Ahead" : gap < 0 ? "Behind" : "Tied";
      return {
        brand: v.brand,
        mentions: v.mentions,
        rate: formatRate(v.mentions),
        vsYou: gap > 0 ? `+${gap}` : String(gap),
        status,
      } satisfies CompetitiveTableRow;
    })
    .sort((a, b) => b.mentions - a.mentions);
  if (you) {
    return [
      {
        ...you,
        brand: titleCaseWords(you.brand),
        rate: totalResponses > 0 ? formatRate(you.mentions) : you.rate,
        vsYou: "—",
        status: "You" as const,
      },
      ...mergedOthers,
    ];
  }
  return mergedOthers;
}

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

/** Raw JSON / API-shaped vulnerable blobs — strip entirely in PDF. */
export function vulnerableExcerptBlobUnsafe(vuln: VulnerableExcerptParts, rawSnippet: string): boolean {
  const blob = `${vuln.summary}\n${vuln.competitorsLine}\n${vuln.implication}\n${rawSnippet}`;
  const text = blob.trim();
  if (!text) return true;
  if (text.includes("client_mentioned")) return true;
  if (text.includes('"not_mentioned"')) return true;
  if (text.toLowerCase().startsWith("json")) return true;
  return false;
}

/**
 * Client-facing vulnerable row: never show JSON, backticks, or code-shaped payloads.
 * Uses structured fields when parseable; otherwise derives short lines from snippet + note.
 */
export function buildVulnerableExcerptForPdf(
  snippet: string,
  note: string | undefined,
  competitorNames: readonly string[],
  clientBrand: string,
): VulnerableExcerptParts {
  const n = note != null ? sanitizePdfString(note).trim() : "";
  const base = formatEvidenceSnippetForPdf(snippet);
  const loose = tryParseLooseJson(stripCodeFencesAndBackticks(String(snippet)).trim());
  if (loose && typeof loose === "object" && !Array.isArray(loose)) {
    const o = loose as Record<string, unknown>;
    const clientMentioned = o.client_mentioned;
    if (clientMentioned === false || clientMentioned === "false" || clientMentioned === 0) {
      const cm = o.competitors_mentioned;
      const names: string[] = [];
      if (Array.isArray(cm)) {
        const seen = new Set<string>();
        for (const x of cm) {
          const w = titleCaseWords(sanitizePdfString(String(x)));
          const k = w.toLowerCase();
          if (k && !seen.has(k)) {
            seen.add(k);
            names.push(w);
          }
        }
      }
      const competitorsLine =
        names.length > 0
          ? names.join(", ")
          : competitorNames.length > 0
            ? competitorNames.slice(0, 8).join(", ")
            : "Other brands received the recommendation instead.";
      return {
        summary: `${sanitizePdfString(clientBrand || "Your brand")} was not mentioned in this response.`,
        competitorsLine,
        implication: "This is direct lost recommendation share.",
      };
    }
    const summary =
      [o.summary, o.message, o.headline, o.description]
        .map((x) => (typeof x === "string" ? sanitizePdfString(x).trim() : ""))
        .find(Boolean) || base.split(". ")[0] || base;
    const compsRaw = o.competitors ?? o.competitor_names ?? o.brands;
    let competitorsLine = "";
    if (Array.isArray(compsRaw)) {
      const seen = new Set<string>();
      const parts: string[] = [];
      for (const x of compsRaw) {
        const w = titleCaseWords(sanitizePdfString(String(x)));
        const k = w.toLowerCase();
        if (k && !seen.has(k)) {
          seen.add(k);
          parts.push(w);
        }
      }
      competitorsLine = parts.join(", ");
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

  const summary = base || "Exposure in this signal is elevated.";
  const competitorsLine = competitorNames.length
    ? competitorNames.slice(0, 6).join(", ")
    : "See competitive table for named alternatives.";
  const implication = n || "Prioritize proof and structured answers for the query shapes where you are weakest.";
  return {
    summary: clipPdfText(summary),
    competitorsLine: clipPdfText(competitorsLine),
    implication: clipPdfText(implication),
  };
}

/** Deep-copy ReportData with every string field sanitized for PDF output. */
export function sanitizeReportDataForPdf(data: ReportData): ReportData {
  const competitorsMerged = mergeCompetitorRows(data.competitors).map((c) => ({
    ...c,
    name: sanitizePdfString(c.name),
  }));
  const competitiveTableMerged = mergeCompetitiveTableRows(data.competitiveTable).map((r) => ({
    ...r,
    brand: sanitizePdfString(r.brand),
    rate: sanitizePdfString(r.rate),
    vsYou: sanitizePdfString(r.vsYou),
  }));
  const clientBrand = sanitizePdfString(data.clientName);

  return {
    ...data,
    clientName: clientBrand,
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
    integrityNote: undefined,
    meta: {
      responses: data.meta.responses,
      confidence: sanitizePdfString(data.meta.confidence),
      generated: sanitizePdfString(data.meta.generated),
    },
    competitors: competitorsMerged,
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
      const competitorNames = competitorsMerged.map((c) => c.name);
      let vulnerableExcerpt: VulnerableExcerptParts | undefined =
        label.toUpperCase().includes("VULNERABLE") || label.toUpperCase().includes("INVISIBLE")
          ? buildVulnerableExcerptForPdf(rawSnip, e.note, competitorNames, clientBrand)
          : undefined;
      if (vulnerableExcerpt && vulnerableExcerptBlobUnsafe(vulnerableExcerpt, rawSnip)) {
        vulnerableExcerpt = undefined;
      }
      return {
        ...e,
        label,
        snippet,
        note: e.note != null ? sanitizePdfString(e.note) : e.note,
        prompt: e.prompt != null ? sanitizePdfString(e.prompt) : e.prompt,
        model: e.model != null ? sanitizePdfString(e.model) : e.model,
        responseExcerpt:
          e.responseExcerpt != null ? sanitizePdfString(e.responseExcerpt) : e.responseExcerpt,
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
    competitiveTable: competitiveTableMerged,
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
