import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";

export type NarrativeSlice = {
  headline: string;
  interpretation: string;
  implication: string;
  action?: string;
};

function client(d: ReportData): string {
  const n = d.clientName?.trim();
  return n && n.length > 0 ? n : "Your brand";
}

/** Page 1 — cover: argument promise (no new data fields). */
export function narrativeCover(d: ReportData): NarrativeSlice {
  const c = client(d);
  const headline =
    d.rank === 1
      ? `${c} is in the conversation—this report shows where it holds and where it slips.`
      : `${c} is visible in this set, but leadership is still contested.`;
  return {
    headline: clipPdfText(headline, 110),
    interpretation: clipPdfText(
      "We connect scores, model splits, and assistant excerpts so you see the same story buyers hear from AI.",
      150,
    ),
    implication: clipPdfText(
      "The payoff is simple: fewer surprises in search and shopping assistants, and clearer priorities for proof and positioning.",
      150,
    ),
  };
}

/** Page 2 — TOC: how to read (static spine). */
export function narrativeToc(_d: ReportData): NarrativeSlice {
  return {
    headline: clipPdfText("Read this like a memo, not a dashboard.", 72),
    interpretation: clipPdfText(
      "Each section answers one pressure question in order—from posture to proof to what to do Monday.",
      140,
    ),
    implication: clipPdfText(
      "If you only skim two spreads, hit Performance and Next steps—they carry the decision weight.",
      140,
    ),
  };
}

/** Page 3 — performance. */
export function narrativePerformance(d: ReportData): NarrativeSlice {
  const c = client(d);
  const r = d.rank;
  const t = d.rankTotal;
  const headline =
    r === 1
      ? `${c} shows up—now the work is defending the lead where it is thin.`
      : `${c} is visible, but not dominant in this assistant snapshot.`;
  return {
    headline: clipPdfText(headline, 88),
    interpretation: clipPdfText(
      `Mention rate ${String(d.mentionRate)} is how often assistants surface ${c} alongside alternatives—not share of voice on its own.`,
      155,
    ),
    implication: clipPdfText(
      "When exposure is uneven, comparisons quietly drift toward whoever already looks “safe” in the answer.",
      155,
    ),
    action: d.bottomLine?.trim()
      ? clipPdfText(d.bottomLine, 140)
      : d.tensionNote?.trim()
        ? clipPdfText(d.tensionNote, 140)
        : undefined,
  };
}

/** Page 4 — competitive. */
export function narrativeCompetitive(d: ReportData): NarrativeSlice {
  const c = client(d);
  const headline =
    d.rank === 1
      ? `${c} sits at the front of the pack—pressure moves to the runners-up.`
      : `${c} is trading mentions in a tight field where small gaps reorder outcomes.`;
  return {
    headline: clipPdfText(headline, 88),
    interpretation: clipPdfText(
      `${clipPdfText(d.alerts.win.title, 40)} versus ${clipPdfText(d.alerts.risk.title, 40)} is the tension line in this table: who assistants normalize as the default answer.`,
      165,
    ),
    implication: clipPdfText(
      "If your row does not read like the obvious choice, assistants will keep routing shoppers to a name they already trust.",
      155,
    ),
  };
}

/** Page 5 — model breakdown. */
export function narrativeModel(d: ReportData): NarrativeSlice {
  const c = client(d);
  const sorted = [...d.modelScores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const gap =
    best && worst && best.name !== worst.name ? Math.max(0, Math.round(best.score - worst.score)) : null;
  const headline = clipPdfText(`${c} does not look the same to every assistant model.`, 82);
  const interp =
    gap != null && best && worst && best.name !== worst.name
      ? `The spread is ${gap} points between the strongest read (${clipPdfText(best.name, 18)}) and the weakest (${clipPdfText(worst.name, 18)}).`
      : "Models still diverge enough that a single score would hide the fracture.";
  return {
    headline,
    interpretation: clipPdfText(interp, 160),
    implication: clipPdfText(
      "Fragmented visibility means some shoppers never see the same version of your story—proof has to repeat where each model hesitates.",
      160,
    ),
    action: d.strategicTakeaway?.trim() ? clipPdfText(d.strategicTakeaway, 130) : undefined,
  };
}

/** Page 6 — AI evidence. */
export function narrativeEvidence(d: ReportData): NarrativeSlice {
  const c = client(d);
  const headline = clipPdfText(
    `When assistants hedge, ${c} is often the name that disappears first from the recommendation.`,
    88,
  );
  return {
    headline,
    interpretation: clipPdfText(
      "Dominance shows up as who gets named without prompting—when you are absent, competitors inherit the slot by default.",
      155,
    ),
    implication: clipPdfText(
      "That quietly taxes recommendation share: the assistant answers, but the buyer never hears your proof.",
      145,
    ),
  };
}

/** Page 7 — recommendations. */
export function narrativeRecommendations(d: ReportData): NarrativeSlice {
  const n = Math.min(3, d.recommendations.length);
  return {
    headline: clipPdfText("These are the highest-impact moves in this export—do them before you optimize anything else.", 92),
    interpretation: clipPdfText(
      n > 0
        ? `We capped this page at ${n} actions so priorities stay honest—everything here is sized to move the scoreboard.`
        : "No actions shipped in this export—backfill recommendations to turn this page into a plan.",
      155,
    ),
    implication: clipPdfText(
      "Treat each item as a contract: owner, deadline, and proof you can show legal and marketing without translation.",
      150,
    ),
  };
}

/** Page 8 — data summary. */
export function narrativeDataSummary(d: ReportData): NarrativeSlice {
  const c = client(d);
  const headline =
    d.rank === 1
      ? `${c} reads strong in the tables—now stress-test where the set is still narrow.`
      : `${c} sits mid-pack in the tables; stability is mixed with a few sharp risks.`;
  const baseInterp = d.dataSummaryInterpretation?.trim();
  return {
    headline: clipPdfText(headline, 88),
    interpretation: clipPdfText(
      baseInterp ||
        "Signals show where assistants reward you versus where they keep you invisible next to peers.",
      155,
    ),
    implication: clipPdfText(
      "Stability buys time; the red flags in rate and status columns are where share quietly leaks first.",
      155,
    ),
  };
}

/** Page 9 — closing (headline frames next steps; primary remains next steps copy). */
export function narrativeClosing(d: ReportData): NarrativeSlice {
  return {
    headline: clipPdfText("Treat the next thirty days as the window where this read either compounds or decays.", 92),
    interpretation: clipPdfText(
      "Buyers will keep asking assistants the same questions—your proof stack either hardens or gets outpaced by whoever ships faster.",
      155,
    ),
    implication: clipPdfText(
      "That matters because assistant defaults ossify quickly: the name that looks inevitable today becomes the baseline citation tomorrow.",
      155,
    ),
  };
}
