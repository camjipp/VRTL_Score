import type { ReportData } from "../types";

/** Opening thesis: who the report is for, what we measure, current stance. */
export function executiveOpeningIntro(data: ReportData): string {
  const name = data.clientName.trim() || "Your brand";
  const stance = String(data.status);
  return [
    `This AI Authority Report is about ${name}: how often assistants recommend you, how strongly you are positioned when you appear, and whether answers cite independent proof.`,
    `We score those signals across major assistant surfaces so you can see where recommendation share is solid, where it is fragile, and what to fix first.`,
    `Today you are ${stance.toLowerCase()} — ranked #${data.rank} of ${data.rankTotal} in this test set — so the story below is about defending and extending that position, not assuming it.`,
  ].join("\n\n");
}

export function competitiveLandscapePurpose(): string {
  return "The full leaderboard for this test set: who competes for the same mentions, and how fragile the lead is.";
}

/** Page 2 narrative: position security + risk (no duplicate table). */
export function competitivePositionIntro(data: ReportData): string {
  const rivals = data.competitors.filter((c) => !c.isClient);
  const names = rivals.map((r) => r.name).join(", ");
  const lead =
    data.rank === 1
      ? "You sit at the top of this leaderboard"
      : `You are ranked #${data.rank} of ${data.rankTotal}`;
  const peerSet = rivals.length ? `among ${names}` : "in this competitor set";
  return `${lead} ${peerSet}. The ranking below shows mention volume on the same prompts—tight clusters mean a small proof sprint from a rival can change who gets recommended first.`;
}

export function competitivePositionImplication(data: ReportData): string {
  return `${data.alerts.risk.title}: ${data.alerts.risk.detail}`;
}

export function modelAnalysisPurpose(spread: number): string {
  return spread === 0
    ? "Performance is even across assistant families in this snapshot—consistency is the story."
    : "Performance varies sharply by assistant family—buyers do not get one universal short list.";
}

export function exampleAnswersPurpose(): string {
  return "Real assistant language that shows what “good” looks like versus where you are exposed—and why that matters commercially.";
}

export function dataSummaryPurpose(): string {
  return "Quantified signals behind the narrative: what the numbers prove before you scan the rows.";
}

export function evidenceLogPurpose(): string {
  return "Structured proof behind the analysis—one row per sampled answer, not raw model dumps.";
}

export function closingPurpose(): string {
  return "How this was measured, how confident we are in the sample, and what happens in the next sprint.";
}

export function executionPlanPurpose(): string {
  return "From diagnosis to proof to re-measurement: how we execute fixes and close the loop on performance.";
}
