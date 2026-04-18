import { Page, StyleSheet, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, baseStyles, pdfPageRootPadding, rhythm } from "../theme";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { RankingAlertsSection } from "./RankingAlertsSection";

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  footSpacer: { flexGrow: 1, minHeight: rhythm.md },
});

/** Slide 2 — competitive ranking + WIN / RISK / PRIORITY (no model matrix on this page). */
export function PageRankingAlerts({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={[baseStyles.page, pdfPageRootPadding]}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={2} section="RankingAlerts:start" />
        <PdfHeader data={data} variant="inner" pageNum={2} />
        <View style={styles.fill}>
          <ChapterTitle title="Competitive snapshot" subtitle="How you rank today and the three signals we are watching in this test set." />
          <RankingAlertsSection data={data} />
          <View style={styles.footSpacer} />
        </View>
        <PdfTraceMarker page={2} section="RankingAlerts:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
