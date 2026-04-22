import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { colors, fonts, rhythm, CONTENT_W, space } from "../theme";
import {
  competitiveLandscapePurpose,
  competitivePositionImplication,
  competitivePositionIntro,
} from "../editorial/pdfNarrative";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { CompetitiveRankingBlock } from "../pages/RankingAlertsSection";

const styles = StyleSheet.create({
  implication: {
    marginTop: rhythm.sm + 4,
    paddingVertical: space.cardPad - 2,
    paddingHorizontal: space.cardPad,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: colors.rule,
    borderLeftColor: colors.orange,
    backgroundColor: colors.orangeLight,
  },
  implicationKicker: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: rhythm.sm,
  },
  implicationBody: {
    fontSize: 9,
    lineHeight: 1.58,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: CONTENT_W - 8,
  },
});

/** PAGE 2 — Competitive leaderboard + immediate risk (signals on page 1). */
export function Page02CompetitiveSnapshot({ data }: { data: ReportData }): ReactElement {
  return (
    <FixedInnerPage data={data} pageNum={2}>
      <PdfTraceMarker page={2} section="Fixed:P2" />
      <View style={{ flex: 1, flexDirection: "column", minHeight: 0 }}>
        <EditorialSectionHeader
          sectionLabel="Competitive position"
          title="Your lead is fragile"
          purpose={competitiveLandscapePurpose()}
          intro={competitivePositionIntro(data)}
        />
        <Text style={{ fontSize: 7, fontFamily: fonts.sansBold, letterSpacing: 0.1, color: colors.ink4, marginBottom: rhythm.sm, textTransform: "uppercase" }}>
          Evidence — mention share by brand
        </Text>
        <View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start", minHeight: 0 }}>
          <CompetitiveRankingBlock data={data} emphasis="focal" />
          <View style={styles.implication} wrap={false}>
            <Text style={styles.implicationKicker}>Implication — immediate risk</Text>
            <Text style={styles.implicationBody}>{competitivePositionImplication(data)}</Text>
          </View>
        </View>
      </View>
    </FixedInnerPage>
  );
}
