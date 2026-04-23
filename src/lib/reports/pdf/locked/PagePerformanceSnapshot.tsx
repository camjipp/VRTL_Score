import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { ScoreRing } from "../components/ScoreRing";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import { colors } from "../theme";
import type { ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LD } from "./lockedDesignTokens";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativePerformance, transparencyRunNote } from "./pageNarratives";

const METRIC_H = 78;

const local = StyleSheet.create({
  metricsRow: { flexDirection: "row", minHeight: METRIC_H },
});

const PERF_OPENING =
  "Your AI Authority Score is how often—and how strongly—assistants recommend your brand.";

function fmtScore(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return String(Math.round(n));
}

type Health = "strong" | "moderate" | "weak";

function classify(value: number, strongAt: number, moderateAt: number): Health {
  if (!Number.isFinite(value) || value <= 0) return "weak";
  if (value >= strongAt) return "strong";
  if (value >= moderateAt) return "moderate";
  return "weak";
}

function healthStyles(h: Health) {
  return {
    cell:
      h === "strong"
        ? lockedStyles.perf_metricCellStrong
        : h === "moderate"
          ? lockedStyles.perf_metricCellModerate
          : lockedStyles.perf_metricCellWeak,
    value:
      h === "strong"
        ? lockedStyles.perf_metricValueStrong
        : h === "moderate"
          ? lockedStyles.perf_metricValueModerate
          : lockedStyles.perf_metricValueWeak,
  };
}

function PctBar({ pct, fill }: { pct: number; fill?: string }): ReactElement {
  const p = Math.min(100, Math.max(0, Math.round(pct)));
  const rest = 100 - p;
  return (
    <View style={lockedStyles.perf_miniBarTrack} wrap={false}>
      <View style={[lockedStyles.perf_miniBarFill, { flex: Math.max(1, p), backgroundColor: fill ?? colors.cyan }]} />
      <View style={[lockedStyles.perf_miniBarRest, { flex: Math.max(1, rest) }]} />
    </View>
  );
}

function rankBarPct(rank: number, rankTotal: number): number {
  if (rankTotal <= 0 || !Number.isFinite(rank)) return 0;
  return Math.min(100, Math.max(0, Math.round(((rankTotal - rank + 1) / rankTotal) * 100)));
}

export function PagePerformanceSnapshot({ data }: { data: ReportData }): ReactElement {
  const slice = narrativePerformance(data);
  const score = data.overallScore;
  const tier = (data.status || "").trim() || "Moderate visibility, not dominant";
  const scoreContext =
    score == null || Number.isNaN(score)
      ? clipPdfText(`— / 100 — ${tier}`)
      : clipPdfText(`${fmtScore(score)} / 100 — ${tier}`);

  const rankPct = rankBarPct(data.rank, data.rankTotal);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[3]!}>
      <Text style={lockedStyles.perf_opening}>{clipPdfText(PERF_OPENING)}</Text>
      <Text style={lockedStyles.perf_transparency}>{transparencyRunNote(data)}</Text>
      <View style={lockedStyles.perf_heroRow} wrap={false}>
        <View style={lockedStyles.perf_heroDial} wrap={false}>
          <ScoreRing score={score} variant="hero" scoreLabel={null} zoneTrack />
          <View style={lockedStyles.perf_zoneLegend} wrap={false}>
            <View style={[lockedStyles.perf_zoneLegendSeg, { flex: 40, backgroundColor: "#EF4444" }]} />
            <View style={[lockedStyles.perf_zoneLegendSeg, { flex: 30, backgroundColor: "#F59E0B" }]} />
            <View style={[lockedStyles.perf_zoneLegendSeg, { flex: 30, backgroundColor: colors.green }]} />
          </View>
          <Text style={lockedStyles.perf_zoneLegendLabel} wrap={false}>
            0–40 at risk · 40–70 building · 70–100 strong
          </Text>
        </View>
        <View style={lockedStyles.perf_heroAside} wrap={false}>
          <Text style={lockedStyles.perf_scoreContext}>{scoreContext}</Text>
        </View>
      </View>
      <View style={lockedStyles.perf_metricsBand} wrap={false}>
        <View style={[lockedStyles.perf_metricsRow, local.metricsRow]} wrap={false}>
          {(() => {
            const mh = classify(data.mentionRate, 65, 40);
            const sMention = healthStyles(mh);
            return (
              <View style={[lockedStyles.perf_metricCellFirst, sMention.cell]}>
                <Text style={lockedStyles.perf_metricLabel}>Mention rate</Text>
                <Text style={[lockedStyles.perf_metricValue, sMention.value]}>
                  {clipPdfText(String(data.mentionRate))}%
                </Text>
                <PctBar pct={data.mentionRate} />
                <Text style={lockedStyles.perf_metricHint}>Share of answers that name you.</Text>
              </View>
            );
          })()}
          {(() => {
            const th = classify(data.topPosition, 40, 20);
            const sTop = healthStyles(th);
            return (
              <View style={[lockedStyles.perf_metricCell, sTop.cell]}>
                <Text style={lockedStyles.perf_metricLabel}>Top position</Text>
                <Text style={[lockedStyles.perf_metricValue, sTop.value]}>
                  {clipPdfText(String(data.topPosition))}%
                </Text>
                <PctBar pct={data.topPosition} />
                <Text style={lockedStyles.perf_metricHint}>First recommendation slot.</Text>
              </View>
            );
          })()}
          {(() => {
            const ah = classify(data.authorityScore, 30, 10);
            const sAuth = healthStyles(ah);
            return (
              <View style={[lockedStyles.perf_metricCell, sAuth.cell]}>
                <Text style={lockedStyles.perf_metricLabel}>Authority</Text>
                <Text style={[lockedStyles.perf_metricValue, sAuth.value]}>
                  {clipPdfText(String(data.authorityScore))}%
                </Text>
                <PctBar pct={data.authorityScore} />
                <Text style={lockedStyles.perf_metricHint}>Answers with citations or proof.</Text>
              </View>
            );
          })()}
          {(() => {
            const rank = data.rank || 0;
            const rh: Health = rank === 1 ? "strong" : rank <= 3 ? "moderate" : "weak";
            const sRank = healthStyles(rh);
            return (
              <View style={[lockedStyles.perf_metricCellLast, sRank.cell]}>
                <Text style={lockedStyles.perf_metricLabel}>Rank</Text>
                <Text style={[lockedStyles.perf_metricValue, sRank.value]}>
                  {clipPdfText(`${data.rank}/${data.rankTotal}`)}
                </Text>
                <PctBar pct={rankPct} fill={LD.color.ink} />
                <Text style={lockedStyles.perf_metricHint}>Leaderboard position (bar = relative strength).</Text>
              </View>
            );
          })()}
        </View>
      </View>
      <Text style={lockedStyles.perf_takeawayLine} wrap={false}>
        {slice.headline}
      </Text>
      <LockedNarrativeStack
        slice={slice}
        stackRole="afterPrimary"
        include={["interpretation", "implication"]}
      />
      {slice.action ? <Text style={lockedStyles.nar_action}>{slice.action}</Text> : null}
    </PdfInnerPage>
  );
}
