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
  explainer: {
    fontSize: 9.25,
    lineHeight: 1.5,
    color: colors.ink2,
    fontFamily: fonts.sans,
    marginBottom: rhythm.sm + 2,
    maxWidth: CONTENT_W - 4,
  },
  implication: {
    marginTop: rhythm.md,
    paddingTop: rhythm.md + 2,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingBottom: rhythm.sm,
  },
  implicationKicker: {
    fontSize: 8,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.06,
    color: colors.ink,
    marginBottom: rhythm.sm,
  },
  implicationBody: {
    fontSize: 9.75,
    lineHeight: 1.52,
    color: colors.ink2,
    fontFamily: fonts.sans,
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
  return "Similar brand labels appear more than once in this export—compare mention counts, and merge variants in your source data when they represent the same brand.";
}

/** PAGE 2 — Competitive leaderboard + immediate risk (signals on page 1). */
export function Page02CompetitiveSnapshot({ data }: { data: ReportData }): ReactElement {
  const dupNote = duplicateBrandFootnote(data.competitors);

  return (
    <FixedInnerPage data={data} pageNum={2}>
      <PdfTraceMarker page={2} section="Fixed:P2" />
      <View style={{ flex: 1, flexDirection: "column", minHeight: 0 }}>
        <EditorialSectionHeader
          sectionLabel="Competitive position"
          title="Who you're competing with"
          purpose={competitiveLandscapePurpose()}
          intro={competitivePositionIntro(data)}
          density="table"
        />
        <Text style={styles.explainer} orphans={2} widows={2}>
          {`Bars show share of assistant mentions in this run (${data.meta.responses} responses). Numbers are mentions vs. total responses; deltas are mentions vs. your brand.`}
        </Text>
        <View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start", minHeight: 0 }}>
          <View style={{ flex: 1, minHeight: 0 }}>
            <CompetitiveRankingBlock data={data} emphasis="focal" tableFootnote={dupNote} />
          </View>
          <View style={styles.implication}>
            <Text style={styles.implicationKicker}>What this means for you</Text>
            <Text style={styles.implicationBody}>{competitivePositionImplication(data)}</Text>
          </View>
        </View>
      </View>
    </FixedInnerPage>
  );
}
