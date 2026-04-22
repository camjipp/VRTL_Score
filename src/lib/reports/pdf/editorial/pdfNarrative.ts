import type { ModelScoreRow, ReportData } from "../types";

/** Page 1 — opening line under the focal headline (decisive, client-facing). */
export function executiveOpeningIntro(data: ReportData): string {
  const name = data.clientName.trim() || "Your brand";
  if (data.rank === 1) {
    return `${name} is first in this sample—but the cluster is tight. One competitor proof sprint can reshuffle who gets recommended first.`;
  }
  return `${name} ranks #${data.rank} of ${data.rankTotal} in this sample. The set is tight enough that execution, not noise, will decide who owns the default recommendation.`;
}

/** Page 2 — purpose line (single idea: threat to position). */
export function competitiveLandscapePurpose(): string {
  return "Who sits closest to you—and who can take your slot on the next assistant answer.";
}

/** Page 2 — framing under the title (ties to table). */
export function competitivePositionIntro(data: ReportData): string {
  const rivals = data.competitors.filter((c) => !c.isClient);
  const lead =
    data.rank === 1
      ? "You lead this set on mentions"
      : `You are #${data.rank} of ${data.rankTotal} on mentions`;
  const density =
    rivals.length >= 3
      ? "Several brands sit within a few mentions."
      : rivals.length > 0
        ? "The peer set is small—every mention swing matters."
        : "Benchmark peers in your source data to tighten this read.";
  return `${lead}. ${density} That is the threat surface behind first recommendation share.`;
}

/** Page 2 — closing band under the ranking (must read as consequence of the table). */
export function competitivePositionImplication(data: ReportData): string {
  return `${data.alerts.risk.title}: ${data.alerts.risk.detail}`;
}

/** Page 3 — one-line purpose under the title. */
export function modelAnalysisPurpose(spread: number): string {
  if (spread === 0) {
    return "Same story across assistant families—consistency is the lever, not one lucky model.";
  }
  return "Different assistants return different short lists—so you do not have one “AI position,” you have several.";
}

/** Page 3 — intro under purpose (declarative; names injected by caller). */
export function modelAnalysisIntro(best: ModelScoreRow, worst: ModelScoreRow): string {
  return `You lead in ${best.name}. You are exposed in ${worst.name}. The gap between them is the mechanism behind fragile share.`;
}

/** Page 4 — purpose (proof, not theory). */
export function exampleAnswersPurpose(): string {
  return "Language straight from the run—what “good” looks like versus where you go quiet.";
}

/** Page 4 — intro under purpose. */
export function exampleAnswersIntro(): string {
  return "Read the columns as contrast, not decoration: one pattern to protect, one pattern to close.";
}

/** Page 8 — purpose. */
export function dataSummaryPurpose(): string {
  return "The numbers behind the narrative—signals first, then the competitive row set from the same run.";
}

/** Page 8 — replaces filler; keep one thesis sentence before interpretation. */
export function dataSummaryIntro(): string {
  return "If the story above is the argument, this is the exhibit.";
}

/** Page 9 — purpose. */
export function evidenceLogPurpose(): string {
  return "Line-item answers behind the conclusions—inspectable, structured, not a raw dump.";
}

/** Page 9 — intro under purpose. */
export function evidenceLogIntro(): string {
  return "Each row is one sampled answer in this export. Use it to verify how we labeled mention, position, and strength.";
}

/** Page 10 — purpose. */
export function closingPurpose(): string {
  return "How we measured this, how strong the sample is, and what happens the week after delivery.";
}

/** Page 7 — purpose. */
export function executionPlanPurpose(): string {
  return "Audit the foundation, rebuild the weakest surface, earn authority, then re-measure—one closed loop.";
}

/** Page 7 — intro under purpose. */
export function executionPlanIntro(): string {
  return "This is the delivery rhythm behind the priorities on the prior pages—not four disconnected tasks.";
}
