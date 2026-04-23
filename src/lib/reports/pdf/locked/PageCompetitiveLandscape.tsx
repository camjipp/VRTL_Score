import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { CompetitorRow, ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeCompetitive } from "./pageNarratives";

const ROW_H = 24;
const TABLE_ROWS = 6;

const local = StyleSheet.create({
  thH: { height: ROW_H },
  trH: { height: ROW_H },
});

function formatCompetitorRate(rate: number | string): string {
  const s = String(rate);
  return s.includes("%") ? clipPdfText(s, 12) : clipPdfText(`${s}%`, 12);
}

function padRows<T>(rows: readonly T[], n: number): (T | null)[] {
  const out: (T | null)[] = [...rows.slice(0, n)];
  while (out.length < n) out.push(null);
  return out;
}

function alertBody(title: string, detail: string): string {
  const t = title.replace(/\s+/g, " ").trim();
  const d = detail.replace(/\s+/g, " ").trim();
  if (!t) return clipPdfText(d);
  if (!d) return clipPdfText(t);
  return clipPdfText(`${t} — ${d}`);
}

function maxMentions(rows: readonly (CompetitorRow | null)[]): number {
  let m = 1;
  for (const r of rows) {
    if (r && r.mentions > m) m = r.mentions;
  }
  return m;
}

function mentionTieKicker(d: ReportData): string {
  const you = d.competitors.find((c) => c.isClient);
  if (!you) {
    return clipPdfText("Compare mention counts to see who dominates volume for this sample.", 140);
  }
  const tiedWithYou = d.competitors.some((c) => !c.isClient && c.mentions === you.mentions);
  if (tiedWithYou) {
    return "You are tied on mentions with competitors.";
  }
  return clipPdfText(
    "You are not tied on raw mentions in this sample—rank and rate still shape who sounds like the default.",
    160,
  );
}

function competitiveWinLine(d: ReportData): string {
  const sorted = [...d.modelScores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  if (best) {
    return clipPdfText(`You perform strongest on ${best.name} (Score ${best.score}).`, 200);
  }
  return alertBody(d.alerts.win.title, d.alerts.win.detail);
}

function competitiveRiskLine(): string {
  return "Your lead is not defended — competitors can replace you quickly.";
}

function competitivePriorityLine(d: ReportData): string {
  const sorted = [...d.modelScores].sort((a, b) => a.score - b.score);
  const worst = sorted[0];
  if (worst) {
    return clipPdfText(`You are underexposed on ${worst.name} — this is where you lose decisions.`, 200);
  }
  return alertBody(d.alerts.priority.title, d.alerts.priority.detail);
}

function bottomInsightParas(d: ReportData): { first: string; second: string } {
  const you = d.competitors.find((c) => c.isClient);
  const tied = you && d.competitors.some((c) => !c.isClient && c.mentions === you.mentions);
  const first = tied
    ? "You are tied on mentions. When assistants choose between equal options, they default to the brand with stronger authority signals."
    : "Mention share splits across rivals—when assistants hedge, they still default to whoever reads as most credible, not whoever appears most often.";
  const second =
    d.authorityScore === 0
      ? "Right now, you have none."
      : `Right now, your citation-backed authority is at ${String(d.authorityScore)}% in this sample—still easy for rivals to sound more credible.`;
  return { first: clipPdfText(first, 520), second: clipPdfText(second, 320) };
}

type BarVariant = "client" | "tied" | "other";

function MentionShareBar({
  mentions,
  max,
  variant,
}: {
  mentions: number;
  max: number;
  variant: BarVariant;
}): ReactElement {
  const pct = Math.min(100, Math.round((mentions / Math.max(1, max)) * 100));
  const rest = 100 - pct;
  const fill =
    variant === "client"
      ? lockedStyles.comp_mentionBarFillClient
      : variant === "tied"
        ? lockedStyles.comp_mentionBarFillTied
        : lockedStyles.comp_mentionBarFill;
  return (
    <View style={lockedStyles.comp_mentionBarTrack} wrap={false}>
      <View style={[fill, { flex: Math.max(1, pct) }]} />
      <View style={[lockedStyles.comp_mentionBarRest, { flex: Math.max(1, rest) }]} />
    </View>
  );
}

export function PageCompetitiveLandscape({ data }: { data: ReportData }): ReactElement {
  const tableRows = padRows(data.competitors, TABLE_ROWS);
  const slice = narrativeCompetitive(data);
  const mMax = maxMentions(tableRows);
  const tableKicker = mentionTieKicker(data);
  const you = data.competitors.find((c) => c.isClient);
  const bottom = bottomInsightParas(data);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[4]!}>
      <LockedNarrativeStack slice={slice} include={["headline"]} />
      <Text style={lockedStyles.comp_tableIntro}>
        {clipPdfText("Mention volume vs. you—bars make the pack scannable at a glance.")}
      </Text>
      {data.integrityNote ? <Text style={lockedStyles.comp_integrityNote}>{data.integrityNote}</Text> : null}
      <View style={lockedStyles.comp_stripList} wrap={false}>
        <View style={[lockedStyles.comp_stripRow, lockedStyles.comp_stripWin]} wrap={false}>
          <Text style={lockedStyles.comp_stripLabel}>Win</Text>
          <Text style={lockedStyles.comp_stripBody}>{competitiveWinLine(data)}</Text>
        </View>
        <View style={[lockedStyles.comp_stripRow, lockedStyles.comp_stripRisk]} wrap={false}>
          <Text style={lockedStyles.comp_stripLabel}>Risk</Text>
          <Text style={lockedStyles.comp_stripBody}>{competitiveRiskLine()}</Text>
        </View>
        <View style={[lockedStyles.comp_stripRowLast, lockedStyles.comp_stripPriority]} wrap={false}>
          <Text style={lockedStyles.comp_stripLabel}>Priority</Text>
          <Text style={lockedStyles.comp_stripBody}>{competitivePriorityLine(data)}</Text>
        </View>
      </View>
      <Text style={lockedStyles.comp_tableKicker}>{tableKicker}</Text>
      <View wrap={false}>
        <View style={[lockedStyles.comp_tableTh, local.thH]}>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellName]}>Name</Text>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellBar]}>Volume</Text>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellRate]}>Rate</Text>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellRank]}>Rank</Text>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellFlag]}>You</Text>
        </View>
        {tableRows.map((r, i) => {
          const tiedToYou = Boolean(
            r && you && !r.isClient && r.mentions === you.mentions,
          );
          const barVariant: BarVariant = r?.isClient ? "client" : tiedToYou ? "tied" : "other";
          const rowStyle = r?.isClient ? lockedStyles.comp_tableTrClient : lockedStyles.comp_tableTr;
          const nameStyle = r?.isClient
            ? lockedStyles.comp_tdClient
            : tiedToYou
              ? lockedStyles.comp_tdTied
              : lockedStyles.comp_td;
          return (
            <View key={i} style={[rowStyle, local.trH]} wrap={false}>
              <Text style={[nameStyle, lockedStyles.comp_cellName]}>{r ? clipPdfText(r.name) : " "}</Text>
              <View style={lockedStyles.comp_cellBar}>
                {r ? <MentionShareBar mentions={r.mentions} max={mMax} variant={barVariant} /> : null}
              </View>
              <Text style={[lockedStyles.comp_td, lockedStyles.comp_cellRate]}>
                {r ? formatCompetitorRate(r.rate) : " "}
              </Text>
              <Text style={[lockedStyles.comp_td, lockedStyles.comp_cellRank]}>{r ? String(r.rank) : " "}</Text>
              <Text style={[lockedStyles.comp_tdMuted, lockedStyles.comp_cellFlag]}>
                {r?.isClient ? "You" : r ? "—" : " "}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={lockedStyles.comp_bottomInsightBand} wrap={false}>
        <Text style={lockedStyles.comp_bottomInsightPara}>{bottom.first}</Text>
        <Text style={lockedStyles.comp_bottomInsightParaLast}>{bottom.second}</Text>
      </View>
      <View style={lockedStyles.comp_stakesBlock} wrap={false}>
        <Text style={lockedStyles.comp_stakesTitle}>{"IF NOTHING CHANGES"}</Text>
        <Text style={lockedStyles.comp_stakesBody}>
          Assistants will begin defaulting to competitors even when you are present in the answer.
        </Text>
      </View>
    </PdfInnerPage>
  );
}
