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
          <View style={lockedStyles.perf_metricCellFirst}>
            <Text style={lockedStyles.perf_metricLabel}>Mention rate</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(String(data.mentionRate))}</Text>
            <Text style={lockedStyles.perf_metricHint}>How often your brand appears in AI answers.</Text>
          </View>
          <View style={lockedStyles.perf_metricCell}>
            <Text style={lockedStyles.perf_metricLabel}>Top position</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(String(data.topPosition))}</Text>
            <Text style={lockedStyles.perf_metricHint}>How often you are the first recommendation.</Text>
          </View>
          <View style={lockedStyles.perf_metricCell}>
            <Text style={lockedStyles.perf_metricLabel}>Authority</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(String(data.authorityScore))}</Text>
            <Text style={lockedStyles.perf_metricHint}>How often AI supports your brand with citations or proof.</Text>
          </View>
          <View style={lockedStyles.perf_metricCellLast}>
            <Text style={lockedStyles.perf_metricLabel}>Rank</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(`${data.rank}/${data.rankTotal}`)}</Text>
            <Text style={lockedStyles.perf_metricHint}>Your position compared to competitors.</Text>
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
