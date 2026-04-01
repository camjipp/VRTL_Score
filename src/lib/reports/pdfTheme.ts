/**
 * White-label executive PDF design tokens.
 * Used only by renderReportHtml — dark, restrained, agency-deliverable.
 *
 * Typography scale (reference — mirrored in renderReportHtml :root + classes):
 * - Report title: ~12px caps (cover + running header)
 * - Page section (.h2): ~12px caps
 * - Component / card titles: ~11–12px
 * - Hero metric (score): ~40–44px
 * - Large metrics: ~17–22px
 * - Body / summaries: ~10–11px, line-height ~1.62
 * - Secondary body: ~9.5px
 * - Meta / footer / table dense: ~7.5–8px
 */

export const PDF_REPORT_TITLE = "Competitive AI Presence Report";

/** Neutral methodology copy (no product branding). */
export const PDF_METHODOLOGY_TEXT =
  "This briefing analyzes AI-assisted discovery responses under standardized scenarios. The composite signal reflects presence (mention consistency), positioning (relative rank among alternatives), and authority (citation and source signals).";

const ACCENT_FALLBACK = "#6b9ebc";

/** Agency accent on dark: ignore near-black defaults; keep a cool restrained default. */
export function resolvePdfAccent(raw: string | null | undefined): string {
  if (!raw) return ACCENT_FALLBACK;
  const t = raw.trim().toLowerCase();
  if (t === "#0f172a" || t === "#000000" || t === "#000") return ACCENT_FALLBACK;
  return raw;
}

/** Muted score ring / tier accent (single semantic hue per band). */
export function pdfScoreAccent(score: number | null): string {
  if (score === null) return "#6b7280";
  if (score >= 90) return "#4d9d7f";
  if (score >= 80) return "#56a584";
  if (score >= 70) return "#c9a85c";
  if (score >= 50) return "#c4915a";
  return "#c45c5c";
}

export type EvidencePdfChip = { color: string; bg: string; border: string };

const EVIDENCE_CHIPS: Record<string, EvidencePdfChip> = {
  STRENGTH: {
    color: "#9fd4c2",
    bg: "rgba(77, 157, 127, 0.14)",
    border: "rgba(77, 157, 127, 0.32)",
  },
  OPPORTUNITY: {
    color: "#9ec5e8",
    bg: "rgba(107, 158, 188, 0.14)",
    border: "rgba(107, 158, 188, 0.32)",
  },
  COMPETITIVE: {
    color: "#e8d49a",
    bg: "rgba(201, 161, 90, 0.14)",
    border: "rgba(201, 161, 90, 0.32)",
  },
  VULNERABLE: {
    color: "#e8a8a8",
    bg: "rgba(196, 92, 92, 0.14)",
    border: "rgba(196, 92, 92, 0.32)",
  },
  INVISIBLE: {
    color: "#9aa3b2",
    bg: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)",
  },
};

export function evidencePdfChip(label: string): EvidencePdfChip {
  return EVIDENCE_CHIPS[label] ?? EVIDENCE_CHIPS.INVISIBLE;
}
