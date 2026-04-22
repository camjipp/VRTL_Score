import type { ReportData } from "../types";

/** Opening thesis — two short sentences; score block carries the rest. */
export function executiveOpeningIntro(data: ReportData): string {
  const name = data.clientName.trim() || "Your brand";
  return `This report scores how often assistants recommend ${name}, how you rank versus alternatives, and whether answers cite independent proof. You are #${data.rank} of ${data.rankTotal} today (${String(data.status).toLowerCase()}): the takeaway below is the headline.`;
}

export function competitiveLandscapePurpose(): string {
  return "Full leaderboard: who earns the same mentions and how narrow the race is.";
}

/** Page 2 narrative: position security + risk (no duplicate table). */
export function competitivePositionIntro(data: ReportData): string {
  const rivals = data.competitors.filter((c) => !c.isClient);
  const names = rivals.map((r) => r.name).join(", ");
  const lead =
    data.rank === 1
      ? "You lead this set"
      : `You rank #${data.rank} of ${data.rankTotal}`;
  const peerSet = rivals.length ? `against ${names}` : "in this set";
  return `${lead} ${peerSet}. Tight clusters mean one rival proof sprint can reshuffle who gets recommended first.`;
}

export function competitivePositionImplication(data: ReportData): string {
  return `${data.alerts.risk.title}: ${data.alerts.risk.detail}`;
}

export function modelAnalysisPurpose(spread: number): string {
  return spread === 0
    ? "Even performance across families—consistency is the story."
    : "Sharp gaps by assistant family—buyers see different short lists.";
}

export function exampleAnswersPurpose(): string {
  return "Side-by-side proof: strength versus exposure, and why it costs share.";
}

export function dataSummaryPurpose(): string {
  return "Numbers that back the narrative above—scan after you read the story.";
}

export function evidenceLogPurpose(): string {
  return "Structured fields per sampled answer—no raw dumps.";
}

export function closingPurpose(): string {
  return "Method, confidence, and what we do next.";
}

export function executionPlanPurpose(): string {
  return "From audit to proof to re-measurement—closed loop, not a checklist.";
}
