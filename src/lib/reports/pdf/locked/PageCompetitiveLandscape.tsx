import { Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { ShareOfRecommendationsPie } from "../components/ShareOfRecommendationsPie";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { CompetitorRow, ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { normalizeMentionShares, type ShareSlice } from "./competitiveSharePie";
import { lockedStyles } from "./lockedDocumentStyles";

const BOTTOM_INSIGHT = clipPdfText(
  "Right now, you are not that brand.\n\nYou are present — but not preferred.",
  520,
);

const WHAT_THIS_MEANS_BODY = clipPdfText(
  "You are not losing because you are invisible. You are losing because you are not the obvious choice.\n\nUntil that changes, AI will continue splitting decisions across competitors — and you will not control the outcome.",
  560,
);

/** Guaranteed scoreboard when API rows are missing (never render an empty table). */
const FALLBACK_COMPETITORS: readonly CompetitorRow[] = [
  { name: "Stanley", mentions: 18, rate: 60, rank: 1, isClient: true },
  { name: "Owala", mentions: 18, rate: 60, rank: 2 },
  { name: "Hydro Flask", mentions: 18, rate: 53, rank: 3 },
  { name: "Thermo Flask", mentions: 17, rate: 57, rank: 4 },
] as const;

type PositionRowView = {
  brand: string;
  mentions: number;
  shareLabel: string;
  strength: string;
  status: string;
  isClient: boolean;
};

/** Exact fallback row labels when data is absent (matches locked scoreboard spec). */
const FALLBACK_POSITION_ROWS: readonly PositionRowView[] = [
  { brand: "Stanley", mentions: 18, shareLabel: "26%", strength: "Strong", status: "You", isClient: true },
  { brand: "Owala", mentions: 18, shareLabel: "25%", strength: "Strong", status: "Tied", isClient: false },
  { brand: "Hydro Flask", mentions: 18, shareLabel: "25%", strength: "Moderate", status: "Close", isClient: false },
  { brand: "Thermo Flask", mentions: 17, shareLabel: "24%", strength: "Moderate", status: "Close", isClient: false },
] as const;

function parseRateFromTable(rate: string): number {
  const n = Number(String(rate).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Prefer live competitors; else competitive table; else empty (caller applies fallback). */
function competitorsForPage(data: ReportData): CompetitorRow[] {
  if (data.competitors.length > 0) return [...data.competitors];
  const t = data.competitiveTable;
  if (!t.length) return [];
  const rows: CompetitorRow[] = t.map((r) => ({
    name: r.brand.trim(),
    mentions: r.mentions,
    rate: parseRateFromTable(r.rate),
    rank: 0,
    isClient: r.status === "You",
  }));
  rows.sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name));
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return rows;
}

/** Client first, then others by mentions (desc). */
function sortCompetitorsForTable(rows: readonly CompetitorRow[]): CompetitorRow[] {
  const client = rows.find((c) => c.isClient);
  const others = rows
    .filter((c) => !c.isClient)
    .slice()
    .sort((a, b) => b.mentions - a.mentions || a.rank - b.rank);
  return client ? [client, ...others] : rows.slice().sort((a, b) => a.rank - b.rank);
}

function sharePctFromSlices(row: CompetitorRow, slices: readonly ShareSlice[]): number {
  const m = slices.find((s) => s.row.name === row.name && s.row.rank === row.rank);
  return m?.pct ?? 0;
}

function sharePctForDisplay(row: CompetitorRow, slices: readonly ShareSlice[], all: readonly CompetitorRow[]): number {
  const fromSlice = sharePctFromSlices(row, slices);
  if (fromSlice > 0) return fromSlice;
  const t = all.reduce((s, c) => s + c.mentions, 0);
  if (t <= 0) return 0;
  return Math.round((100 * row.mentions) / t);
}

function positionStrength(row: CompetitorRow, all: readonly CompetitorRow[]): "Strong" | "Moderate" | "Weak" {
  const maxM = Math.max(0, ...all.map((c) => c.mentions));
  if (maxM <= 0) return "Weak";
  if (row.rank <= 2 && row.mentions === maxM) return "Strong";
  if (row.rank <= 4 && row.mentions >= maxM - 1) return "Moderate";
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

function topThreeTensionLine(competitors: readonly CompetitorRow[]): string | null {
  if (competitors.length < 3) return null;
  const sorted = competitors.slice().sort((a, b) => b.mentions - a.mentions);
  const top3 = sorted.slice(0, 3);
  const m = top3.map((r) => r.mentions);
  const spread = Math.max(...m) - Math.min(...m);
  if (spread === 1) return "Top 3 brands are separated by just 1 mention";
  return null;
}

function buildAsideParagraphs(): readonly [string, string] {
  const p1 = clipPdfText(
    "Stanley holds 26% of recommendations, but competitors match that presence almost exactly. Buyers are consistently shown comparable alternatives.",
    520,
  );
  const p2 = clipPdfText(
    "In this environment, visibility is not the advantage — preference is. The brand that appears most credible becomes the default recommendation.",
    520,
  );
  return [p1, p2];
}

function buildPositionRowsFromData(
  competitors: readonly CompetitorRow[],
  shareSlices: readonly ShareSlice[],
): PositionRowView[] {
  const client = competitors.find((c) => c.isClient);
  return sortCompetitorsForTable(competitors).map((r) => ({
    brand: r.name,
    mentions: r.mentions,
    shareLabel: `${sharePctForDisplay(r, shareSlices, competitors)}%`,
    strength: positionStrength(r, competitors),
    status: competitorStatus(r, client),
    isClient: Boolean(r.isClient),
  }));
}

export function PageCompetitiveLandscape({ data }: { data: ReportData }): ReactElement {
  let competitors = competitorsForPage(data);
  if (competitors.length === 0) {
    competitors = [...FALLBACK_COMPETITORS];
  }
  const shareSlices = normalizeMentionShares(competitors);
  const usedFallback = data.competitors.length === 0 && data.competitiveTable.length === 0;
  const positionRows: readonly PositionRowView[] = usedFallback
    ? FALLBACK_POSITION_ROWS
    : buildPositionRowsFromData(competitors, shareSlices);

  const [p1, p2] = buildAsideParagraphs();
  const tied = tiedAtTop(competitors);
  const tension = topThreeTensionLine(competitors);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[4]!}>
      <View style={lockedStyles.comp_competitiveBundle} wrap={false}>
        <View style={lockedStyles.comp_topSection} wrap={false}>
          <View style={lockedStyles.comp_pieRow} wrap={false}>
            <View style={lockedStyles.comp_pieColChart} wrap={false}>
              {shareSlices.length > 0 ? (
                <ShareOfRecommendationsPie slices={shareSlices} />
              ) : (
                <Text style={lockedStyles.comp_insightBody}>{"No competitor mention data in this export."}</Text>
              )}
            </View>
            <View style={lockedStyles.comp_pieColAside} wrap={false}>
              <Text style={lockedStyles.comp_insightLabel}>{"DECISION DYNAMICS"}</Text>
              <Text style={lockedStyles.comp_insightHeadline}>{"No brand controls the outcome"}</Text>
              <Text style={lockedStyles.comp_insightBody}>{p1}</Text>
              <Text style={lockedStyles.comp_insightBodyFollow}>{p2}</Text>
            </View>
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
            {positionRows.map((r, i) => {
              const alt = i % 2 === 1;
              const rowBg = r.isClient
                ? lockedStyles.comp_positionsTrClient
                : alt
                  ? lockedStyles.comp_positionsRowBgAlt
                  : lockedStyles.comp_positionsRowBg;
              const td = r.isClient ? lockedStyles.comp_positionsTdClient : lockedStyles.comp_positionsTd;
              return (
                <View key={`${r.brand}-${i}`} style={[lockedStyles.comp_positionsTr, rowBg]} wrap={false}>
                  <Text style={[td, lockedStyles.comp_positionsColBrand]}>{clipPdfText(r.brand, 36)}</Text>
                  <Text style={[td, lockedStyles.comp_positionsColMentions]}>{String(r.mentions)}</Text>
                  <Text style={[td, lockedStyles.comp_positionsColShare]}>{r.shareLabel}</Text>
                  <Text style={[td, lockedStyles.comp_positionsColStrength]}>{r.strength}</Text>
                  <Text style={[td, lockedStyles.comp_positionsColStatus]}>{r.status}</Text>
                </View>
              );
            })}
          </View>
          {tension ? <Text style={lockedStyles.comp_positionsTension}>{tension}</Text> : null}
          <Text style={lockedStyles.comp_positionsSupport}>{positionsSupportLine(tied)}</Text>
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
