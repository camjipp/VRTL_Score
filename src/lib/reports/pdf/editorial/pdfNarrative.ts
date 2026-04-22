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

function mentionLeaderContext(data: ReportData) {
  const rows = sortedByMentions(data);
  if (rows.length === 0) {
    return {
      rows,
      topM: 0,
      leaders: rows,
      client: undefined as (typeof rows)[number] | undefined,
      clientAtTop: false,
      tiedTop: false,
    };
  }
  const topM = rows[0]!.mentions;
  const leaders = rows.filter((r) => r.mentions === topM);
  const client = rows.find((r) => r.isClient);
  const clientAtTop = Boolean(client && client.mentions === topM);
  const tiedTop = leaders.length >= 2 && clientAtTop;
  return { rows, topM, leaders, client, clientAtTop, tiedTop };
}

/** Page 1 — dominant headline (rank + mention tightness). */
export function pageOneHeadline(data: ReportData): string {
  const ctx = mentionLeaderContext(data);
  if (ctx.rows.length === 0) {
    return data.rank === 1 ? "First in this set—add peers to stress-test." : `You are #${data.rank} of ${data.rankTotal}.`;
  }
  if (ctx.tiedTop) return "You are tied for first. The lead is fragile.";
  if (data.rank === 1 && ctx.clientAtTop) {
    const runnerUp = ctx.rows.find((r) => r.mentions < ctx.topM);
    if (runnerUp && ctx.topM - runnerUp.mentions <= 2) return "You sit first—by a hair. The lead is fragile.";
    return "You sit first. Defend it—#2 is close enough to matter.";
  }
  return `You are #${data.rank} of ${data.rankTotal}. The next moves decide who leads.`;
}

/** Page 1 — headline split on first “. ” for two-line hero layout. */
export function pageOneHeadlinePair(data: ReportData): readonly [string, string] {
  const h = pageOneHeadline(data);
  const idx = h.indexOf(". ");
  if (idx !== -1) return [h.slice(0, idx + 1).trim(), h.slice(idx + 2).trim()] as const;
  return [h, ""] as const;
}

/** Page 1 — tight line under position context (mention posture). */
export function pageOnePositionSubline(data: ReportData): string {
  const ctx = mentionLeaderContext(data);
  if (ctx.rows.length === 0) return "Add peers to see how tight this set really is.";
  if (ctx.tiedTop) return "Tied on mentions. Competitors are close.";
  if (ctx.clientAtTop) {
    const runner = ctx.rows.find((r) => !r.isClient && r.mentions < ctx.topM);
    if (runner && ctx.topM - runner.mentions <= 2) return "Leading by a thin margin. Competitors are close.";
    return "Leading on mentions. Competitors can still close the gap.";
  }
  return "Behind on mentions. Competitors hold the edge.";
}

/** Page 1 — short WIN / RISK / PRIORITY card bodies (data-driven). */
export function pageOneSignalCardBodies(data: ReportData): readonly [string, string, string] {
  const ctx = mentionLeaderContext(data);
  const models = [...data.modelScores].sort((a, b) => b.score - a.score);
  const best = models[0];
  const worst = models[models.length - 1];

  if (!best || !worst || best.name === worst.name) {
    const a = data.alerts;
    return [
      clipPdfText(`${a.win.title} ${a.win.detail}`.replace(/\s+/g, " ").trim(), 72),
      clipPdfText(`${a.risk.title} ${a.risk.detail}`.replace(/\s+/g, " ").trim(), 72),
      clipPdfText(`${a.priority.title} ${a.priority.detail}`.replace(/\s+/g, " ").trim(), 72),
    ] as const;
  }

  const win = `Strong on ${best.name} (${best.score})`;
  const fragile = ctx.tiedTop || (data.rank === 1 && ctx.clientAtTop);
  const risk = fragile
    ? "Lead is fragile — competitors are close"
    : "The short list is still open—execution shifts who wins.";
  const priority =
    worst.score < 40
      ? `Not showing on ${worst.name} (${worst.score})`
      : `Weak on ${worst.name} (${worst.score})`;

  return [win, risk, priority] as const;
}

export type PageOneStandingBlock = {
  readonly lead: string;
  readonly metrics: readonly [string, string, string];
};

/** Page 1 — “Where you stand” lead + metric lines (scannable). */
export function pageOneStandingBlock(data: ReportData): PageOneStandingBlock {
  const ctx = mentionLeaderContext(data);
  const n = data.rankTotal;

  let lead: string;
  if (ctx.rows.length === 0) {
    lead =
      data.rank === 1
        ? `You are #1 in this sample across ${n} tracked slots—add peers for a fuller read.`
        : `You are #${data.rank} of ${n} in this sample.`;
  } else if (ctx.tiedTop) {
    lead = `You are tied for first across ${n} competitors.`;
  } else if (data.rank === 1 && ctx.clientAtTop) {
    lead = `You lead across ${n} competitors.`;
  } else {
    lead = `You are #${data.rank} of ${n} across this competitive set.`;
  }

  const auth = data.authorityScore === 0 ? "0%" : `${data.authorityScore}%`;
  const metrics: readonly [string, string, string] = [
    `Mention rate: ${data.mentionRate}%`,
    `Top position: ${data.topPosition}%`,
    `Citations: ${auth}`,
  ];

  return { lead, metrics };
}

/** Page 1 — three insight lines (replaces label-style “signals”). */
export function pageOneWhatMattersLines(data: ReportData): readonly [string, string, string] {
  const ctx = mentionLeaderContext(data);
  const models = [...data.modelScores].sort((a, b) => b.score - a.score);
  const best = models[0];
  const worst = models[models.length - 1];

  if (!best || !worst || best.name === worst.name) {
    return [
      clipPdfText(`${data.alerts.win.title} ${data.alerts.win.detail}`.replace(/\s+/g, " ").trim(), 130),
      clipPdfText(`${data.alerts.risk.title} ${data.alerts.risk.detail}`.replace(/\s+/g, " ").trim(), 130),
      clipPdfText(`${data.alerts.priority.title} ${data.alerts.priority.detail}`.replace(/\s+/g, " ").trim(), 130),
    ] as const;
  }

  const leadingNow = data.rank === 1 || ctx.tiedTop;

  const line1 = leadingNow
    ? `You win on ${best.name} (${best.score}), which drives your current lead.`
    : `You are strongest on ${best.name} (${best.score})—it is where you still earn share.`;

  let line2: string;
  if (ctx.tiedTop) {
    line2 = "You are tied on mentions — competitors can overtake quickly.";
  } else if (ctx.clientAtTop) {
    line2 = "You lead on mentions — competitors can overtake quickly.";
  } else {
    line2 = "You are behind on mentions — competitors can widen the gap quickly.";
  }

  const line3 =
    worst.score < 40
      ? `You are not showing on ${worst.name} (${worst.score}), which creates direct exposure risk.`
      : `You lag on ${worst.name} (${worst.score}), which creates exposure when buyers use that path.`;

  return [clipPdfText(line1, 130), clipPdfText(line2, 130), clipPdfText(line3, 130)] as const;
}

/** Page 1 — short closing read under insights (mention/absence framing). */
export function pageOneSupportingReadLines(data: ReportData): readonly [string, string, string] {
  const absent = Math.max(0, Math.min(100, 100 - data.mentionRate));
  return [
    `You appear in ${data.mentionRate}% of answers.`,
    `${absent}% of the time, you are not recommended.`,
    `That is lost recommendation share.`,
  ] as const;
}

/** Page 1 — one line under headline. */
export function executiveOpeningIntro(data: ReportData): string {
  const ctx = mentionLeaderContext(data);
  if (data.rank === 1 || ctx.tiedTop) {
    return "You lead now, but small shifts can flip who gets recommended first.";
  }
  return "You are not leading this set yet—execution still decides who moves up the short list.";
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
