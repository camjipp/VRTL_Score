import { Page, StyleSheet, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, baseStyles, pdfPageRootPadding, rhythm } from "../theme";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { CompetitiveRankingBlock, WinRiskPriorityAlerts } from "./RankingAlertsSection";

const styles = StyleSheet.create({
  main: {
    flex: 1,
    flexDirection: "column",
    minHeight: 0,
  },
  balance: {
    flexGrow: 1,
    flexShrink: 0,
    minHeight: rhythm.lg,
  },
});

/** Slide 2 — competitive ranking + WIN / RISK / PRIORITY (no model matrix on this page). */
export function PageRankingAlerts({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={[baseStyles.page, pdfPageRootPadding, baseStyles.pageColumn]}>
      <View style={baseStyles.pageBodyFlex}>
        <PdfTraceMarker page={2} section="RankingAlerts:start" />
        <PdfHeader data={data} variant="inner" pageNum={2} />
        <View style={styles.main}>
          <ChapterTitle title="Competitive snapshot" subtitle="How you rank today and the three signals we are watching in this test set." />
          <CompetitiveRankingBlock data={data} />
          <View style={styles.balance} />
          <WinRiskPriorityAlerts data={data} alertRowStyle={{ marginTop: 0 }} />
        </View>
        <PdfTraceMarker page={2} section="RankingAlerts:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
