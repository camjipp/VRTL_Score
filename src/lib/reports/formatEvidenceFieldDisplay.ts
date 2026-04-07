import { normalizeDisplayText } from "@/lib/text/normalizeDisplayText";

/**
 * Formats API snake_case tokens for tables (e.g. not_mentioned → Not mentioned).
 * Avoids awkward line breaks on underscores and keeps labels readable.
 */
export function formatEvidenceFieldDisplay(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  const s = normalizeDisplayText(String(raw).trim());
  if (s === "—") return "—";
  if (!s.includes("_")) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return s
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Evidence log / preview pill text (aligns with Data Summary: mentioned-not-top vs opportunity). */
export function formatEvidenceLogPillLabel(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "";
  const s = normalizeDisplayText(String(raw).trim());
  if (s === "OPPORTUNITY") return "MENTIONED (NOT TOP)";
  return s;
}
