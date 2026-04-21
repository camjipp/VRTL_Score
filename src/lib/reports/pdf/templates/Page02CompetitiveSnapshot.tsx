import { StyleSheet, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { space } from "../theme";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { RankingAlertsSection } from "../pages/RankingAlertsSection";

const styles = StyleSheet.create({
  block: { marginBottom: space.block },
});

/** PAGE 2 — Competitive snapshot only (fixed template). */
export function Page02CompetitiveSnapshot({ data }: { data: ReportData }): ReactElement {
  return (
    <FixedInnerPage data={data} pageNum={2}>
      <PdfTraceMarker page={2} section="Fixed:P2" />
      <View style={styles.block}>
        <ChapterTitle
          title="Competitive snapshot"
          subtitle="How you rank today and the three signals we are watching in this test set."
        />
      </View>
      <RankingAlertsSection data={data} />
    </FixedInnerPage>
  );
}
