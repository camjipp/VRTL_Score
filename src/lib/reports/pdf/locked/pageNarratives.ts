import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";

export type NarrativeSlice = {
  headline: string;
  interpretation: string;
  implication: string;
  action?: string;
  /** Plain “if you do nothing” stakes (performance, etc.). */
  inaction?: string;
};

function client(d: ReportData): string {
  const n = d.clientName?.trim();
  return n && n.length > 0 ? n : "Your brand";
}

/** Page 2 — single framing line under TOC title (no memo block). */
export const narrativeTocFraming = clipPdfText(
  "This report shows how AI recommends your brand versus competitors.",
  95,
);

/** Page 3 — performance: post-metric headline insight. */
export function narrativePerformance(d: ReportData): NarrativeSlice {
  const c = client(d);
  const headline =
    d.rank === 1
      ? `${c} appears often, but assistants do not always treat you as the default pick.`
      : `${c} shows up in answers, yet stronger brands still win the first recommendation.`;
  return {
    headline: clipPdfText(headline, 100),
    interpretation: clipPdfText(
      "Across this snapshot, your pattern is visibility without guaranteed priority: buyers see your name, but the assistant can still steer them elsewhere.",
      175,
    ),
    implication: clipPdfText(
      "When you are not the default, competitors capture decisions even when you are mentioned—especially on high-intent shopping and comparison questions.",
      175,
    ),
    action: d.bottomLine?.trim()
      ? clipPdfText(d.bottomLine, 150)
      : d.tensionNote?.trim()
        ? clipPdfText(d.tensionNote, 150)
        : undefined,
    inaction: clipPdfText(
      "If you do nothing, small gaps in mention quality and authority tend to widen as assistants keep reinforcing whoever already looks like the safe answer.",
      175,
    ),
  };
}

/** Page 4 — competitive: headline + table read + takeaway (data-aware). */
export function narrativeCompetitive(d: ReportData): NarrativeSlice {
  const c = client(d);
  const you = d.competitors.find((row) => row.isClient);
  const others = d.competitors.filter((row) => !row.isClient);
  const headline =
    d.rank === 1
      ? `${c} is leading this set, but the gap behind you is still thin enough to flip quickly.`
      : `${c} is in the pack—whoever looks like the obvious answer on each query still wins the click.`;
  const takeaway = competitiveTakeawayLine(d, you, others);
  return {
    headline: clipPdfText(headline, 95),
    interpretation: clipPdfText(takeaway, 175),
    implication: clipPdfText(
      "Alerts above flag where you are winning narrative and where a competitor could quietly become the assistant’s habit—use them as the story spine, not side notes.",
      175,
    ),
  };
}

function competitiveTakeawayLine(
  d: ReportData,
  you: ReportData["competitors"][number] | undefined,
  others: ReportData["competitors"],
): string {
  if (!you || others.length === 0) {
    return clipPdfText("Compare mentions and rank to see who AI treats as the default beside your brand.", 120);
  }
  const tie = others.find((r) => r.mentions === you.mentions);
  if (tie) {
    const nm = clipPdfText(tie.name, 22);
    return clipPdfText(
      `${nm} is tied with you on mentions, which means you are not a clear default choice when both names appear.`,
      140,
    );
  }
  const ahead = others.filter((r) => r.rank < you.rank).sort((a, b) => b.mentions - a.mentions)[0];
  if (ahead) {
    const nm = clipPdfText(ahead.name, 22);
    return clipPdfText(
      `${nm} ranks ahead of you here; closing that gap is how you stop losing recommendation share on the same questions.`,
      145,
    );
  }
  const nm = clipPdfText(client(d), 22);
  return clipPdfText(
    `${nm}: watch for any rival gaining mentions while holding a better rank—that combination signals a shifting default.`,
    155,
  );
}

/** Page 5 — model breakdown. */
export function narrativeModel(d: ReportData): NarrativeSlice {
  const c = client(d);
  const sorted = [...d.modelScores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const gap =
    best && worst && best.name !== worst.name ? Math.max(0, Math.round(best.score - worst.score)) : null;
  const headline = clipPdfText("Different AI systems can tell completely different stories about your brand.", 92);
  const interp =
    best && worst && best.name !== worst.name
      ? `${clipPdfText(best.name, 20)} recommends you most strongly in this export, while ${clipPdfText(worst.name, 20)} shows the weakest read—a ${gap}-point spread on the same 0–100 scale.`
      : "Even with a narrower spread, models still disagree enough that one headline score would hide real risk in parts of the market.";
  return {
    headline,
    interpretation: clipPdfText(interp, 175),
    implication: clipPdfText(
      "That inconsistency means demand depends on where people ask questions: some shoppers never see the version of you that your best model shows.",
      170,
    ),
    action: d.strategicTakeaway?.trim() ? clipPdfText(d.strategicTakeaway, 130) : undefined,
    inaction: clipPdfText(
      "If you do nothing, the weakest model view keeps dragging down blended outcomes while competitors look steadier everywhere.",
      160,
    ),
  };
}

/** Page 6 — AI evidence. */
export function narrativeEvidence(d: ReportData): NarrativeSlice {
  const c = client(d);
  const headline = clipPdfText(
    `When ${c} is missing from an answer, competitors inherit the recommendation slot the buyer would have seen instead.`,
    95,
  );
  return {
    headline,
    interpretation: clipPdfText(
      "This is what lost recommendation share looks like in plain language: the assistant still answers, but your proof never enters the thread.",
      165,
    ),
    implication: clipPdfText(
      "For revenue teams, that maps to fewer qualified clicks and weaker attribution—because the decision happened without your brand in the story.",
      165,
    ),
    inaction: clipPdfText(
      "If you do nothing, those gaps repeat across thousands of similar prompts until another name becomes the habitual answer.",
      155,
    ),
  };
}

/** Page 7 — recommendations. */
export function narrativeRecommendations(d: ReportData): NarrativeSlice {
  const n = Math.min(3, d.recommendations.length);
  return {
    headline: clipPdfText("These are the fastest ways to increase AI recommendation share from this baseline.", 95),
    interpretation: clipPdfText(
      n > 0
        ? `Each item is sized to move the scoreboard: we keep this page to ${n} priorities so execution stays realistic.`
        : "No actions were included in this export—ask your analyst to attach recommendations so this page becomes a concrete plan.",
      165,
    ),
    implication: clipPdfText(
      "If not addressed, competitors keep compounding small wins in AI-driven answers while your proof stays uneven across models.",
      165,
    ),
    inaction: clipPdfText(
      "If you do nothing, the current default answers harden—buyers learn a shorter list of “safe” brands and stop hearing yours on the margin.",
      165,
    ),
  };
}

/** Page 8 — data summary. */
export function narrativeDataSummary(d: ReportData): NarrativeSlice {
  const baseInterp = d.dataSummaryInterpretation?.trim();
  return {
    headline: clipPdfText("This data explains why your AI Authority Score sits where it does.", 92),
    interpretation: clipPdfText(
      baseInterp ||
        "Signals below show where assistants reward you versus where weak authority or gaps make your position unstable next to peers.",
      175,
    ),
    implication: clipPdfText(
      "Read it as a checklist: strengths explain current wins; improvable or gap rows are where share leaks if you pause investment. If you do nothing, those gap rows usually worsen first while competitors keep shipping proof.",
      220,
    ),
  };
}

/** Page 9 — closing (headline + stacks around “Next steps”). */
export function narrativeClosing(_d: ReportData): NarrativeSlice {
  return {
    headline: clipPdfText(
      "The next thirty days decide whether this read becomes momentum—or slowly decays while competitors keep shipping proof.",
      100,
    ),
    interpretation: clipPdfText(
      "If you execute the steps on this page with owners and deadlines, your AI Authority Score should move meaningfully within 60–90 days.",
      175,
    ),
    implication: clipPdfText(
      "Buyers will keep asking assistants the same questions; the only question is whether your evidence stack improves faster than the next best alternative.",
      175,
    ),
  };
}
