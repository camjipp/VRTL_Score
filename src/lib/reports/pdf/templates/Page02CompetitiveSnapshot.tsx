import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { colors, fonts, rhythm, CONTENT_W } from "../theme";
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
    marginTop: rhythm.md - 2,
    paddingTop: rhythm.md,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingBottom: rhythm.sm,
  },
  implicationKicker: {
    fontSize: 9,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.04,
    color: colors.ink,
    marginBottom: rhythm.sm - 4,
  },
  implicationBody: {
    fontSize: 10.5,
    lineHeight: 1.42,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    maxWidth: CONTENT_W - 4,
  },
});

function duplicateBrandFootnote(competitors: ReportData["competitors"]): string | null {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const counts = new Map<string, number>();
  for (const c of competitors) {
    const k = norm(c.name);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const hasDup = [...counts.values()].some((n) => n > 1);
  if (!hasDup) return null;
  return "Note: similar brand labels appear more than once in this export. Treat counts as directional until variants are merged in source data.";
}

/** PAGE 2 — Competitive leaderboard + immediate risk (signals on page 1). */
export function Page02CompetitiveSnapshot({ data }: { data: ReportData }): ReactElement {
  const dupNote = duplicateBrandFootnote(data.competitors);

  return (
    <FixedInnerPage data={data} pageNum={2}>
      <PdfTraceMarker page={2} section="Fixed:P2" />
      <View style={{ flexDirection: "column" }}>
        <EditorialSectionHeader
          sectionLabel="Threat"
          title="Who can take your spot"
          purpose={competitiveLandscapePurpose()}
          intro={competitivePositionIntro(data)}
          density="table"
        />
        <CompetitiveRankingBlock data={data} emphasis="focal" tableFootnote={dupNote} />
        <View style={styles.implication}>
          <Text style={styles.implicationKicker}>Bottom line</Text>
          <Text style={styles.implicationBody}>{competitivePositionImplication(data)}</Text>
        </View>
      </View>
    </FixedInnerPage>
  );
}
