import type { ReportData } from "../types";

/** Opening thesis — framing only; rank and metrics sit in the standing line on page 1. */
export function executiveOpeningIntro(data: ReportData): string {
  const name = data.clientName.trim() || "Your brand";
  return `${name} leads assistant visibility in this snapshot, but the set is tight—who gets recommended first can still move with proof and coverage.`;
}

export function competitiveLandscapePurpose(): string {
  return "Mention share in this sample: how close each rival is, and where the bar moves next.";
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
    ? "Same story across families—consistency is the lever."
    : "Different families surface different short lists—win where you lead, fix where you vanish.";
}

export function exampleAnswersPurpose(): string {
  return "What strong answers look like next to exposure—and what that costs you in share.";
}

export function dataSummaryPurpose(): string {
  return "Signals and competitive rows that back the narrative above—read as evidence.";
}

export function evidenceLogPurpose(): string {
  return "Structured fields per sampled answer—supporting detail, not a raw dump.";
}

export function closingPurpose(): string {
  return "What this diagnosis means and what happens next.";
}

export function executionPlanPurpose(): string {
  return "From audit to proof to re-measurement—closed loop, not a checklist.";
}
