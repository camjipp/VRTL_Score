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

/** Page 2 — single framing line under TOC title (no memo block). */
export const narrativeTocFraming = clipPdfText(
  "This report shows how AI recommends your brand versus competitors.",
);

/** Page 3 — performance: interpretation + stakes after the metric band. */
export function narrativePerformance(d: ReportData): NarrativeSlice {
  return {
    headline: clipPdfText(
      "You appear often, but you are not consistently the default recommendation.",
    ),
    interpretation: clipPdfText(
      "This score blends how often assistants name you, how often you are first, and how often they support you with proof-like signals—so it tracks recommendation power, not vanity traffic.",
    ),
    implication: clipPdfText(
      "When you are not the default, competitors capture buyer decisions even when you are mentioned.",
    ),
    action: d.bottomLine?.trim()
      ? clipPdfText(d.bottomLine)
      : d.tensionNote?.trim()
        ? clipPdfText(d.tensionNote)
        : undefined,
    inaction: clipPdfText(
      "If you do nothing, assistants keep rehearsing the same short list of safe brands and your share of new decisions erodes at the margin.",
    ),
  };
}

/** Page 4 — competitive. */
export function narrativeCompetitive(d: ReportData): NarrativeSlice {
  const you = d.competitors.find((row) => row.isClient);
  const others = d.competitors.filter((row) => !row.isClient);
  const headline =
    d.rank === 1
      ? clipPdfText("You are leading, but the gap is thin.")
      : clipPdfText("You are in the pack—whoever looks like the obvious answer still wins the recommendation.");
  const takeaway = competitiveTakeawayLine(d, you, others);
  return {
    headline,
    interpretation: clipPdfText(takeaway),
    implication: clipPdfText(
      "Use the Win, Risk, and Priority strips above as guardrails: they tell you where the table is most likely to move next if you pause execution.",
    ),
  };
}

function competitiveTakeawayLine(
  d: ReportData,
  you: ReportData["competitors"][number] | undefined,
  others: ReportData["competitors"],
): string {
  if (!you || others.length === 0) {
    return clipPdfText(
      "Compare mentions and rank together: whoever pairs volume with a better rank is the default shoppers hear most.",
    );
  }
  const tie = others.find((r) => r.mentions === you.mentions);
  if (tie) {
    return clipPdfText(
      `${tie.name} is tied with you on mentions, meaning you are not a clear default choice when both names appear.`,
    );
  }
  const ahead = others.filter((r) => r.rank < you.rank).sort((a, b) => b.mentions - a.mentions)[0];
  if (ahead) {
    return clipPdfText(
      `${ahead.name} ranks ahead of you here; closing that gap is how you stop losing recommendation share on the same questions.`,
    );
  }
  return clipPdfText(
    `${client(d)}: watch for any rival gaining mentions while holding a better rank—that combination signals a shifting default.`,
  );
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
      "That inconsistency means your visibility depends on where customers search, which creates uneven demand. Different models are also used by different audiences, so the fracture shows up in real pipeline, not just dashboards.",
    ),
    action: d.strategicTakeaway?.trim() ? clipPdfText(d.strategicTakeaway) : undefined,
    inaction: clipPdfText(
      "If you do nothing, the weakest model view keeps dragging down blended outcomes while steadier competitors compound their advantage.",
    ),
  };
}

/** Page 6 — AI evidence. */
export function narrativeEvidence(d: ReportData): NarrativeSlice {
  const c = client(d);
  return {
    headline: clipPdfText(`When ${c} is missing from an answer, competitors take the recommendation slot instead.`),
    interpretation: clipPdfText(
      "When your brand is missing, competitors inherit the recommendation the shopper would have seen next.",
    ),
    implication: clipPdfText("This represents direct lost recommendation share on that query shape."),
    inaction: clipPdfText(
      "If you do nothing, those gaps repeat across similar prompts until another name becomes the habitual answer.",
    ),
  };
}

/** Page 7 — recommendations. */
export function narrativeRecommendations(d: ReportData): NarrativeSlice {
  const first = d.recommendations[0];
  const interpretation =
    first?.title?.trim().length
      ? `Start with “${first.title.trim()}” and the cards below—each ties a proof move to a measurable outcome.`
      : "Each recommendation pairs a proof move with an outcome so execution stays tied to revenue risk, not busywork.";
  return {
    headline: clipPdfText(
      "These are the highest-impact actions to increase AI recommendation share.",
    ),
    interpretation: clipPdfText(interpretation),
    implication: clipPdfText(
      "If not addressed, competitors will continue gaining ground in AI-driven decisions while your proof stays uneven across models.",
    ),
    inaction: clipPdfText(
      "If you do nothing, default answers harden and buyers learn a shorter list of safe brands without you on it.",
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
      baseInterp || syntheticInsight || "The rows below connect mention posture, authority, and gaps to the headline score you saw up front.",
    ),
    implication: clipPdfText(
      "Treat strengths as proof to defend, improvable rows as near-term leaks, and gap rows as places where competitors can take share if you pause investment.",
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
