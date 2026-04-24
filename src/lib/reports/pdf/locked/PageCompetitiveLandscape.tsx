import { Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { ShareOfRecommendationsPie } from "../components/ShareOfRecommendationsPie";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { CompetitorRow, ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { normalizeMentionShares, shareDeltaCallout, type ShareSlice } from "./competitiveSharePie";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeCompetitive } from "./pageNarratives";

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

function sharePctForRow(row: CompetitorRow, slices: readonly ShareSlice[]): number {
  const m = slices.find((s) => s.row.name === row.name && s.row.rank === row.rank);
  return m?.pct ?? 0;
}

/** Proxy for recommendation presence using the row rate (0–100) from the export. */
function positionStrengthFromRate(rate: number): "Strong" | "Moderate" | "Weak" {
  if (rate >= 55) return "Strong";
  if (rate >= 35) return "Moderate";
  return "Weak";
}

function competitorStatus(row: CompetitorRow, client: CompetitorRow | undefined): string {
  if (row.isClient) return "You";
  if (!client) return "—";
  if (row.mentions === client.mentions) return "Tied";
  if (Math.abs(row.mentions - client.mentions) === 1) return "Close";
  return "Behind";
}

function tiedAtTop(competitors: readonly CompetitorRow[]): boolean {
  const client = competitors.find((c) => c.isClient);
  if (!client) return false;
  return competitors.some((c) => !c.isClient && c.mentions === client.mentions);
}

function positionsSupportLine(tied: boolean): string {
  return clipPdfText(
    tied
      ? "You are tied at the top. When multiple brands appear equally, assistants default to the one that looks most credible."
      : "When multiple brands appear equally, assistants default to the one that looks most credible.",
    520,
  );
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

export function PageCompetitiveLandscape({ data }: { data: ReportData }): ReactElement {
  const slice = narrativeCompetitive(data);
  const shareSlices = normalizeMentionShares(data.competitors);
  const deltaLine = shareDeltaCallout(shareSlices);
  const [p1, p2, p3] = buildPrimaryParagraphs(data, shareSlices);
  const client = data.competitors.find((c) => c.isClient);
  const sortedCompetitors = [...data.competitors].sort((a, b) => a.rank - b.rank);
  const tied = tiedAtTop(data.competitors);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[4]!}>
      <LockedNarrativeStack slice={slice} include={["headline", "interpretation"]} />
      <View style={lockedStyles.comp_pieRow} wrap={false}>
        <View style={lockedStyles.comp_pieColChart} wrap={false}>
          <Text style={lockedStyles.comp_pieChartTitle}>
            {clipPdfText(
              "Your share of AI recommendations is nearly identical to competitors",
              200,
            )}
          </Text>
          {shareSlices.length > 0 ? (
            <ShareOfRecommendationsPie slices={shareSlices} deltaCallout={deltaLine} />
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
        <Text style={lockedStyles.comp_positionsTitle}>{"Competitive Positions"}</Text>
        <View style={lockedStyles.comp_positionsTable} wrap={false}>
          <View style={lockedStyles.comp_positionsThRow} wrap={false}>
            <Text style={[lockedStyles.comp_positionsThText, lockedStyles.comp_positionsColBrand]}>Brand</Text>
            <Text style={[lockedStyles.comp_positionsThText, lockedStyles.comp_positionsColMentions]}>
              Mentions
            </Text>
            <Text style={[lockedStyles.comp_positionsThText, lockedStyles.comp_positionsColShare]}>Share</Text>
            <Text style={[lockedStyles.comp_positionsThText, lockedStyles.comp_positionsColStrength]}>
              Position Strength
            </Text>
            <Text style={[lockedStyles.comp_positionsThText, lockedStyles.comp_positionsColStatus]}>Status</Text>
          </View>
          {sortedCompetitors.map((r, i) => {
            const alt = i % 2 === 1;
            const rowBg = alt ? lockedStyles.comp_positionsRowBgAlt : lockedStyles.comp_positionsRowBg;
            const td = r.isClient ? lockedStyles.comp_positionsTdClient : lockedStyles.comp_positionsTd;
            const share = sharePctForRow(r, shareSlices);
            const strength = positionStrengthFromRate(Number(r.rate));
            const status = competitorStatus(r, client);
            return (
              <View key={`${r.name}-${r.rank}`} style={[lockedStyles.comp_positionsTr, rowBg]} wrap={false}>
                <Text style={[td, lockedStyles.comp_positionsColBrand]}>{clipPdfText(r.name, 36)}</Text>
                <Text style={[td, lockedStyles.comp_positionsColMentions]}>{String(r.mentions)}</Text>
                <Text style={[td, lockedStyles.comp_positionsColShare]}>{`${share}%`}</Text>
                <Text style={[td, lockedStyles.comp_positionsColStrength]}>{strength}</Text>
                <Text style={[td, lockedStyles.comp_positionsColStatus]}>{status}</Text>
              </View>
            );
          })}
        </View>
        <Text style={lockedStyles.comp_positionsSupport}>{positionsSupportLine(tied)}</Text>
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
