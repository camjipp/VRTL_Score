import type { EvidencePreview, VulnerableExcerptParts } from "../types";
import { vulnerableExcerptBlobUnsafe } from "../sanitizeReportData";

export function findStrengthPreview(ev: readonly EvidencePreview[]): EvidencePreview | undefined {
  const byLabel = ev.find((e) => /strength/i.test(e.label));
  return byLabel ?? ev[0];
}

export function findVulnerablePreview(ev: readonly EvidencePreview[]): EvidencePreview | undefined {
  return (
    ev.find((e) => /vulnerable|invisible/i.test(e.label)) ?? ev.find((e) => Boolean(e.vulnerableExcerpt))
  );
}

function lineField(x: unknown): string {
  if (x == null) return "";
  if (typeof x === "string") return x.trim();
  if (typeof x === "number" || typeof x === "boolean") return String(x).trim();
  return "";
}

export function normalizeVulnerableExcerptParts(v: EvidencePreview | undefined): VulnerableExcerptParts | null {
  const raw = v?.vulnerableExcerpt;
  if (raw == null || typeof raw !== "object") return null;

  const summary = lineField((raw as { summary?: unknown }).summary);
  const competitorsLine = lineField((raw as { competitorsLine?: unknown }).competitorsLine);
  const implication = lineField((raw as { implication?: unknown }).implication);

  const parts: VulnerableExcerptParts = {
    summary: summary || "Exposure detail unavailable for this row.",
    competitorsLine:
      competitorsLine || "See the competitive table and evidence log for named alternatives.",
    implication: implication || "Prioritize proof and retrievable comparisons where this signal repeats.",
  };

  const snippet = String(v?.snippet ?? "");
  try {
    if (vulnerableExcerptBlobUnsafe(parts, snippet)) return null;
  } catch {
    return null;
  }

  const hasAnyOriginal = Boolean(summary || competitorsLine || implication);
  if (!hasAnyOriginal) return null;

  return parts;
}
