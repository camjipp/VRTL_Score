import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { ScoreRing } from "../components/ScoreRing";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import { colors } from "../theme";
import type { ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativePerformance, transparencyRunNote } from "./pageNarratives";

const METRIC_H = 72;

const local = StyleSheet.create({
  metricsRow: { flexDirection: "row", height: METRIC_H },
});

const PERF_OPENING =
  "Your AI Authority Score measures how often and how strongly AI systems recommend your brand.";

function fmtScore(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return String(Math.round(n));
}

type Health = "strong" | "moderate" | "weak";

/**
 * Classify a 0–100 signal into a health band. Zero/near-zero gets its own “weak”
 * styling so the page can visually differentiate an absent signal (Authority=0)
 * from a present-but-moderate one (Mention Rate=60).
 */
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

export function PagePerformanceSnapshot({ data }: { data: ReportData }): ReactElement {
  const slice = narrativePerformance(data);
  const score = data.overallScore;
  const tier = (data.status || "").trim() || "Moderate visibility, not dominant";
  const scoreContext =
    score == null || Number.isNaN(score) ? clipPdfText(`— / 100 — ${tier}`) : clipPdfText(`${fmtScore(score)} / 100 — ${tier}`);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[3]!}>
      <Text style={lockedStyles.perf_opening}>{clipPdfText(PERF_OPENING)}</Text>
      <Text style={lockedStyles.perf_transparency}>{transparencyRunNote(data)}</Text>
      <View style={lockedStyles.perf_heroRow} wrap={false}>
        <View style={lockedStyles.perf_heroDial} wrap={false}>
          <ScoreRing score={score} scoreLabel={null} ringStroke={colors.cyan} />
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
                  {clipPdfText(String(data.mentionRate))}
                </Text>
                <Text style={lockedStyles.perf_metricHint}>How often your brand appears in AI answers.</Text>
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
                  {clipPdfText(String(data.topPosition))}
                </Text>
                <Text style={lockedStyles.perf_metricHint}>How often you are the first recommendation.</Text>
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
                  {clipPdfText(String(data.authorityScore))}
                </Text>
                <Text style={lockedStyles.perf_metricHint}>
                  How often AI supports your brand with citations or proof.
                </Text>
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
                <Text style={lockedStyles.perf_metricHint}>Your position compared to competitors.</Text>
              </View>
            );
          })()}
        </View>
      </View>
      <LockedNarrativeStack
        slice={slice}
        stackRole="afterPrimary"
        include={["headline", "interpretation", "implication", "action", "inaction"]}
      />
    </PdfInnerPage>
  );
}
