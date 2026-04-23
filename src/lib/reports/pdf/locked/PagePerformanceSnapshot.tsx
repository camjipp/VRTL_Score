import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { lockedStyles } from "./lockedDocumentStyles";

const HERO_H = 124;
const METRIC_H = 64;

const local = StyleSheet.create({
  hero: { height: HERO_H },
  metricsRow: { flexDirection: "row", height: METRIC_H },
});

function fmtScore(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return String(Math.round(n));
}

export function PagePerformanceSnapshot({ data }: { data: ReportData }): ReactElement {
  const line = clipPdfText(data.bottomLine || data.tensionNote || " ", 200);
  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[3]!}>
      <View style={[lockedStyles.perf_hero, local.hero]} wrap={false}>
        <Text style={lockedStyles.perf_score}>{fmtScore(data.overallScore)}</Text>
        <Text style={lockedStyles.perf_status}>{clipPdfText(data.status, 120)}</Text>
        <View style={lockedStyles.perf_scoreMark} />
      </View>
      <View style={lockedStyles.perf_metricsBand} wrap={false}>
        <View style={[lockedStyles.perf_metricsRow, local.metricsRow]} wrap={false}>
          <View style={lockedStyles.perf_metricCellFirst}>
            <Text style={lockedStyles.perf_metricLabel}>Mention rate</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(String(data.mentionRate), 24)}</Text>
          </View>
          <View style={lockedStyles.perf_metricCell}>
            <Text style={lockedStyles.perf_metricLabel}>Top position</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(String(data.topPosition), 24)}</Text>
          </View>
          <View style={lockedStyles.perf_metricCell}>
            <Text style={lockedStyles.perf_metricLabel}>Authority</Text>
            <Text style={lockedStyles.perf_metricValue}>{clipPdfText(String(data.authorityScore), 24)}</Text>
          </View>
          <View style={lockedStyles.perf_metricCellLast}>
            <Text style={lockedStyles.perf_metricLabel}>Rank</Text>
            <Text style={lockedStyles.perf_metricValue}>
              {clipPdfText(`${data.rank}/${data.rankTotal}`, 24)}
            </Text>
          </View>
        </View>
      </View>
      <Text style={lockedStyles.perf_support}>{line}</Text>
    </PdfInnerPage>
  );
}
