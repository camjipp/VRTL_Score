import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";

export type NarrativeSlice = {
  headline: string;
  interpretation: string;
  implication: string;
  action?: string;
  inaction?: string;
};

function client(d: ReportData): string {
  const n = d.clientName?.trim();
  return n && n.length > 0 ? n : "Your brand";
}

/** Light transparency for trust (prompt volume). */
export function transparencyRunNote(d: ReportData): string {
  const n = d.meta?.responses;
  if (typeof n === "number" && n > 0) {
    return clipPdfText(`Based on ${n} AI prompt runs across major models.`);
  }
  return clipPdfText("Based on a fixed set of AI prompt runs across major models.");
}

/** Page 3 — performance: tight copy; visuals carry the page. */
export function narrativePerformance(d: ReportData): NarrativeSlice {
  return {
    headline: clipPdfText(
      "You appear often, but you are not consistently the default recommendation.",
    ),
    interpretation: clipPdfText(
      "The score blends mentions, first position, and proof signals—recommendation power, not traffic.",
    ),
    implication: clipPdfText(
      "When you are not the default, competitors still win the decision—even if you are mentioned.",
    ),
    action: d.bottomLine?.trim()
      ? clipPdfText(d.bottomLine)
      : d.tensionNote?.trim()
        ? clipPdfText(d.tensionNote)
        : undefined,
    inaction: clipPdfText(
      "Inaction lets assistants keep a short safe list of brands; your share erodes at the margin.",
    ),
  };
}

/** Page 4 — competitive (market-share framing; pie + secondary table on page). */
export function narrativeCompetitive(_d: ReportData): NarrativeSlice {
  return {
    headline: clipPdfText("You share the decision with competitors.", 420),
    interpretation: clipPdfText(
      "Your brand appears often — but so do others. There is no clear default.",
      520,
    ),
    implication: clipPdfText(
      "Recommendation share is split—buyers see a short list, not a single owner of the category.",
      420,
    ),
  };
}

/** Page 5 — model breakdown. */
export function narrativeModel(d: ReportData): NarrativeSlice {
  const sorted = [...d.modelScores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const gap =
    best && worst && best.name !== worst.name ? Math.max(0, Math.round(best.score - worst.score)) : null;
  const headline =
    gap != null && gap >= 15
      ? clipPdfText(`${gap}-point spread across models: assistants disagree on your brand.`)
      : clipPdfText("AI systems disagree on your brand.");
  const interp =
    best && worst && best.name !== worst.name
      ? `${best.name} strongly recommends you in this export, while ${worst.name} rarely does—a ${gap}-point spread on the same 0–100 scale.`
      : "Models still diverge enough that one headline score would hide real risk in parts of the market.";
  return {
    headline,
    interpretation: clipPdfText(interp),
    implication: clipPdfText(
      "Visibility depends on which assistant shoppers use—uneven demand and real pipeline risk.",
    ),
    action: d.strategicTakeaway?.trim() ? clipPdfText(d.strategicTakeaway) : undefined,
    inaction: clipPdfText(
      "Ignoring the weak surface drags blended outcomes while steadier rivals compound.",
    ),
  };
}

/** Page 6 — AI evidence. */
export function narrativeEvidence(d: ReportData): NarrativeSlice {
  const c = client(d);
  return {
    headline: clipPdfText(`When ${c} is missing from an answer, competitors take the recommendation slot instead.`),
    interpretation: clipPdfText("When you are missing, competitors inherit the next recommendation slot."),
    implication: clipPdfText("Direct lost recommendation share on that query shape."),
    inaction: clipPdfText("Gaps repeat until another name becomes the habitual answer."),
  };
}

/** Page 7 — recommendations. */
export function narrativeRecommendations(d: ReportData): NarrativeSlice {
  const first = d.recommendations[0];
  const interpretation =
    first?.title?.trim().length
      ? `Lead with “${first.title.trim()}”—each card ties proof to a measurable outcome.`
      : "Each card ties a proof move to a measurable outcome.";
  return {
    headline: clipPdfText(
      "These are the highest-impact actions to increase AI recommendation share.",
    ),
    interpretation: clipPdfText(interpretation),
    implication: clipPdfText(
      "Without execution, rivals keep gaining in AI-driven decisions while your proof stays uneven.",
    ),
    inaction: clipPdfText(
      "Default answers harden; buyers learn a shorter list of safe brands without you.",
    ),
  };
}

/** Page 8 — data summary. */
export function narrativeDataSummary(d: ReportData): NarrativeSlice {
  const baseInterp = d.dataSummaryInterpretation?.trim();
  const syntheticInsight =
    d.mentionRate >= 45 && d.authorityScore < 35
      ? "You lead in mentions, but lack authority signals to hold the position."
      : "";
  return {
    headline: clipPdfText("This data explains why your score is where it is."),
    interpretation: clipPdfText(
      baseInterp || syntheticInsight || "Rows link mentions, authority, and gaps to the headline score.",
    ),
    implication: clipPdfText(
      "Defend strengths, fix improvable rows fast, and close gaps before rivals take share.",
    ),
  };
}

/** Page 9 — closing (headline + stacks around “Next steps”). */
export function narrativeClosing(_d: ReportData): NarrativeSlice {
  return {
    headline: clipPdfText("Make this snapshot the start of a 90-day proof plan."),
    interpretation: clipPdfText(
      "If you execute these steps, your AI Authority Score should improve within 60–90 days.",
    ),
    implication: clipPdfText(
      "Buyers will keep asking assistants the same questions; the only question is whether your evidence stack improves faster than the next best alternative.",
    ),
  };
}
