import type { ReportData } from "../types";

/** Opening thesis — two short sentences; score block carries the rest. */
export function executiveOpeningIntro(data: ReportData): string {
  const name = data.clientName.trim() || "Your brand";
  return `${name} is winning share in this snapshot, but the position is exposed. You are #${data.rank} of ${data.rankTotal} (${String(data.status).toLowerCase()}), and the next section shows exactly where to defend and where to push.`;
}

export function competitiveLandscapePurpose(): string {
  return "Your lead is fragile: competitors are close enough to take first pick.";
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
  return "The critical numbers, fast.";
}

export function evidenceLogPurpose(): string {
  return "Structured fields per sampled answer—no raw dumps.";
}

export function closingPurpose(): string {
  return "What this diagnosis means and what happens next.";
}

export function executionPlanPurpose(): string {
  return "From audit to proof to re-measurement—closed loop, not a checklist.";
}
