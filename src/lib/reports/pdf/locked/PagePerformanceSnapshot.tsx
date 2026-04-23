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
import { narrativePerformance } from "./pageNarratives";

const METRIC_H = 68;

const local = StyleSheet.create({
  metricsRow: { flexDirection: "row", height: METRIC_H },
});

function fmtScore(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return String(Math.round(n));
}

const PERF_OPENING =
  "Your AI Authority Score measures how often and how strongly AI systems recommend your brand on a 0–100 scale.";

export function PagePerformanceSnapshot({ data }: { data: ReportData }): ReactElement {
  const slice = narrativePerformance(data);
  const score = data.overallScore;

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[3]!}>
      <Text style={lockedStyles.perf_opening}>{clipPdfText(PERF_OPENING, 200)}</Text>
      <View style={lockedStyles.perf_heroRow} wrap={false}>
        <View style={lockedStyles.perf_heroDial} wrap={false}>
          <ScoreRing score={score} scoreLabel={null} ringStroke={colors.cyan} />
        </View>
        <View style={lockedStyles.perf_heroAside} wrap={false}>
          <Text style={lockedStyles.perf_tierLine}>{clipPdfText(data.status || "Visibility snapshot", 160)}</Text>
        </View>
      </View>
      <View style={lockedStyles.perf_metricsBand} wrap={false}>
        <View style={[lockedStyles.perf_metricsRow, local.metricsRow]} wrap={false}>
          <View style={lockedStyles.perf_metricCellFirst}>
            <Text style={lockedStyles.perf_metricLabel}>Mention rate</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(String(data.mentionRate), 24)}</Text>
            <Text style={lockedStyles.perf_metricHint}>How often your brand appears in AI answers in this run.</Text>
          </View>
          <View style={lockedStyles.perf_metricCell}>
            <Text style={lockedStyles.perf_metricLabel}>Top position</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(String(data.topPosition), 24)}</Text>
            <Text style={lockedStyles.perf_metricHint}>How often you are the first brand named or recommended.</Text>
          </View>
          <View style={lockedStyles.perf_metricCell}>
            <Text style={lockedStyles.perf_metricLabel}>Authority</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(String(data.authorityScore), 24)}</Text>
            <Text style={lockedStyles.perf_metricHint}>How often AI backs your brand with proof-like support, not just a name drop.</Text>
          </View>
          <View style={lockedStyles.perf_metricCellLast}>
            <Text style={lockedStyles.perf_metricLabel}>Rank</Text>
            <Text style={lockedStyles.perf_metricValue}>
              {clipPdfText(`${data.rank}/${data.rankTotal}`, 24)}
            </Text>
            <Text style={lockedStyles.perf_metricHint}>Where you place versus the competitor set overall.</Text>
          </View>
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
