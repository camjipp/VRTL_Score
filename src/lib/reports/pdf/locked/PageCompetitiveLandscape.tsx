import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { ShareOfRecommendationsPie } from "../components/ShareOfRecommendationsPie";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { CompetitorRow, ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { normalizeMentionShares, type ShareSlice } from "./competitiveSharePie";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeCompetitive } from "./pageNarratives";

const ROW_H = 22;
const TABLE_ROWS = 6;

const SECONDARY_EXPLANATION = clipPdfText(
  "When AI models generate answers, they rarely present a single option. Instead, they offer a short list of brands.\n\nIn that environment, being included is not enough — the brand that appears most credible becomes the default recommendation.",
  520,
);

const BOTTOM_INSIGHT = clipPdfText(
  "Right now, you are not that brand.\n\nYou are present — but not preferred.",
  520,
);

const WHAT_THIS_MEANS_BODY = clipPdfText(
  "You are not losing because you are invisible.\n\nYou are losing because you are not the obvious choice.\n\nUntil that changes, AI will continue splitting decisions across competitors — and you will not control the outcome.",
  560,
);

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

function maxMentions(rows: readonly (CompetitorRow | null)[]): number {
  let m = 1;
  for (const r of rows) {
    if (r && r.mentions > m) m = r.mentions;
  }
  return m;
}

function timesPhraseForRemainder(remainder: number): string {
  if (remainder >= 72 && remainder <= 78) return "nearly three out of four times";
  if (remainder >= 64 && remainder <= 69) return "nearly two out of three times";
  if (remainder >= 47 && remainder <= 53) return "roughly half the time";
  return `about ${remainder}% of the time`;
}

function buildPrimaryParagraphs(
  data: ReportData,
  slices: readonly ShareSlice[],
): readonly [string, string, string] {
  const clientDisplay =
    data.competitors.find((c) => c.isClient)?.name?.trim() ||
    data.clientName?.trim() ||
    "Your brand";
  const clientSlice = slices.find((s) => s.row.isClient);
  const pct = clientSlice?.pct ?? 0;
  const remainder = Math.max(0, Math.min(100, 100 - pct));
  const p1 = clipPdfText(
    `${clientDisplay} accounts for roughly ${pct}% of AI recommendations in this category.`,
    520,
  );
  const p2 = clipPdfText(
    `That means ${timesPhraseForRemainder(remainder)}, buyers are shown a competitor alongside you — or instead of you.`,
    520,
  );
  const p3 = clipPdfText(
    "There is no dominant brand in this set. Decisions are being split across multiple options.",
    520,
  );
  return [p1, p2, p3];
}

function NeutralMentionBar({
  mentions,
  max,
}: {
  mentions: number;
  max: number;
}): ReactElement {
  const pct = Math.min(100, Math.round((mentions / Math.max(1, max)) * 100));
  const rest = 100 - pct;
  return (
    <View style={lockedStyles.comp_mentionBarTrack} wrap={false}>
      <View style={[lockedStyles.comp_mentionBarNeutralFill, { flex: Math.max(1, pct) }]} />
      <View style={[lockedStyles.comp_mentionBarRest, { flex: Math.max(1, rest) }]} />
    </View>
  );
}

export function PageCompetitiveLandscape({ data }: { data: ReportData }): ReactElement {
  const slice = narrativeCompetitive(data);
  const shareSlices = normalizeMentionShares(data.competitors);
  const [p1, p2, p3] = buildPrimaryParagraphs(data, shareSlices);
  const tableRows = padRows(data.competitors, TABLE_ROWS);
  const mMax = maxMentions(tableRows);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[4]!}>
      <LockedNarrativeStack slice={slice} include={["headline", "interpretation"]} />
      <View style={lockedStyles.comp_pieRow} wrap={false}>
        <View style={lockedStyles.comp_pieColChart} wrap={false}>
          <Text style={lockedStyles.comp_pieChartTitle}>{"How AI divides buyer decisions"}</Text>
          {shareSlices.length > 0 ? (
            <ShareOfRecommendationsPie slices={shareSlices} />
          ) : (
            <Text style={lockedStyles.comp_pieAside}>{"No competitor mention data in this export."}</Text>
          )}
        </View>
        <View style={lockedStyles.comp_pieColAside} wrap={false}>
          <Text style={lockedStyles.comp_pieAside}>{p1}</Text>
          <Text style={lockedStyles.comp_pieAsideFollow}>{p2}</Text>
          <Text style={lockedStyles.comp_pieAsideFollow}>{p3}</Text>
          <Text style={lockedStyles.comp_pieSecondaryAside}>{SECONDARY_EXPLANATION}</Text>
        </View>
      </View>
      <View style={lockedStyles.comp_secondaryBlock} wrap={false}>
        <Text style={lockedStyles.comp_secondaryLabel}>{"Mention detail"}</Text>
        <View wrap={false}>
          <View style={[lockedStyles.comp_tableThMuted, local.thH]}>
            <Text style={[lockedStyles.comp_thTextMuted, lockedStyles.comp_cellName]}>Name</Text>
            <Text style={[lockedStyles.comp_thTextMuted, lockedStyles.comp_cellBar]}>Volume</Text>
            <Text style={[lockedStyles.comp_thTextMuted, lockedStyles.comp_cellRate]}>Rate</Text>
            <Text style={[lockedStyles.comp_thTextMuted, lockedStyles.comp_cellRank]}>Rank</Text>
            <Text style={[lockedStyles.comp_thTextMuted, lockedStyles.comp_cellFlag]}>You</Text>
          </View>
          {tableRows.map((r, i) => (
            <View key={i} style={[lockedStyles.comp_tableTrSecondary, local.trH]} wrap={false}>
              <Text style={[lockedStyles.comp_tdOther, lockedStyles.comp_cellName]}>
                {r ? clipPdfText(r.name) : " "}
              </Text>
              <View style={lockedStyles.comp_cellBar}>
                {r ? <NeutralMentionBar mentions={r.mentions} max={mMax} /> : null}
              </View>
              <Text style={[lockedStyles.comp_tdOther, lockedStyles.comp_cellRate]}>
                {r ? formatCompetitorRate(r.rate) : " "}
              </Text>
              <Text style={[lockedStyles.comp_tdOther, lockedStyles.comp_cellRank]}>
                {r ? String(r.rank) : " "}
              </Text>
              <Text style={[lockedStyles.comp_tdOther, lockedStyles.comp_cellFlag]}>
                {r?.isClient ? "You" : r ? "—" : " "}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={lockedStyles.comp_bottomInsightBand} wrap={false}>
        <Text style={lockedStyles.comp_bottomInsightParaLast}>{BOTTOM_INSIGHT}</Text>
      </View>
      <View style={lockedStyles.comp_stakesBlock} wrap={false}>
        <Text style={lockedStyles.comp_stakesTitle}>{"WHAT THIS MEANS"}</Text>
        <Text style={lockedStyles.comp_stakesBody}>{WHAT_THIS_MEANS_BODY}</Text>
      </View>
    </PdfInnerPage>
  );
}
