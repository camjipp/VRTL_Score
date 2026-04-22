import type { ModelScoreRow, ReportData } from "../types";

/** Hard cap for PDF prose blocks (react-pdf layout). */
export function clipPdfText(s: string, max: number): string {
  const t = String(s).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/[\s,;:.!]+$/, "")}…`;
}

function sortedByMentions(data: ReportData) {
  return [...data.competitors].sort((a, b) => b.mentions - a.mentions);
}

/** Page 1 — dominant headline (rank + mention tightness). */
export function pageOneHeadline(data: ReportData): string {
  const rows = sortedByMentions(data);
  if (rows.length === 0) {
    return data.rank === 1 ? "First in this set—add peers to stress-test." : `You are #${data.rank} of ${data.rankTotal}.`;
  }
  const topM = rows[0]!.mentions;
  const leaders = rows.filter((r) => r.mentions === topM);
  const client = rows.find((r) => r.isClient);
  const clientAtTop = Boolean(client && client.mentions === topM);
  if (leaders.length >= 2 && clientAtTop) return "You are tied for first. The lead is fragile.";
  if (data.rank === 1 && clientAtTop) {
    const runnerUp = rows.find((r) => r.mentions < topM);
    if (runnerUp && topM - runnerUp.mentions <= 2) return "You sit first—by a hair. The lead is fragile.";
    return "You sit first. Defend it—#2 is close enough to matter.";
  }
  return `You are #${data.rank} of ${data.rankTotal}. The next moves decide who leads.`;
}

/** Page 1 — two short lines under “Where you stand” (scannable). */
export function pageOneStandingLines(data: ReportData): readonly [string, string] {
  const status = String(data.status).trim() || "—";
  const auth =
    data.authorityScore === 0 ? "Citations not observed" : `Citations ${data.authorityScore}%`;
  const line1 = `Status: ${status} · Rank #${data.rank} of ${data.rankTotal}`;
  const line2 = `Mentions ${data.mentionRate}% · Top position ${data.topPosition}% · ${auth}`;
  return [line1, line2];
}

/** Page 1 — one line under headline. */
export function executiveOpeningIntro(data: ReportData): string {
  const name = data.clientName.trim() || "Your brand";
  return data.rank === 1
    ? `${name} is at the top of this sample—small shifts still flip recommendations.`
    : `${name} is #${data.rank} of ${data.rankTotal}—tight enough that execution changes outcomes.`;
}

/** Page 2 — purpose (one beat). */
export function competitiveLandscapePurpose(): string {
  return "Who sits closest—and who can take your slot.";
}

/** Page 2 — one line under title. */
export function competitivePositionIntro(data: ReportData): string {
  const rows = sortedByMentions(data);
  if (rows.length < 2) return "Track more peers to see who can overtake you.";
  const topM = rows[0]!.mentions;
  const client = rows.find((r) => r.isClient);
  const tiedTop = rows.filter((r) => r.mentions === topM).length >= 2;
  if (tiedTop && client?.mentions === topM) return "Tied at the top on mentions—first pick still moves.";
  if (client && client.mentions === topM) {
    const next = rows.find((r) => r.mentions < topM);
    if (next && topM - next.mentions <= 2) return "First by a razor margin—#2 can flip this on one sprint.";
  }
  return "Mention gaps this small swing who gets recommended first.";
}

export function competitivePositionImplication(data: ReportData): string {
  return clipPdfText(`${data.alerts.risk.title}: ${data.alerts.risk.detail}`, 220);
}

export function modelAnalysisPurpose(spread: number): string {
  return spread === 0
    ? "Same story in every assistant—consistency is the lever."
    : "Different assistants, different short lists—that is the whole risk.";
}

export function modelAnalysisIntro(best: ModelScoreRow, worst: ModelScoreRow): string {
  return `${best.name} wins you share. ${worst.name} costs you share.`;
}

export function exampleAnswersPurpose(): string {
  return "Proof from the run—not theory.";
}

export function dataSummaryPurpose(): string {
  return "Signals and rows—the exhibit behind the story above.";
}

export function evidenceLogPurpose(): string {
  return "Every row: one sampled answer, structured for audit.";
}

export function evidenceLogIntro(): string {
  return "Verify mention, position, and strength labels here.";
}

export function closingPurpose(): string {
  return "Sample strength, method, and what we do next week.";
}

export function executionPlanPurpose(): string {
  return "Audit → rebuild the weak surface → earn proof → re-measure.";
}

export function executionPlanIntro(): string {
  return "One loop. Four beats. Same priorities as the prior pages.";
}
