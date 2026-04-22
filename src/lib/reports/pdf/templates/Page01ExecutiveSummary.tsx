import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, BODY_MAX_W } from "../theme";
import {
  executiveOpeningIntro,
  pageOneHeadline,
  pageOneStandingBlock,
  pageOneSupportingReadLines,
  pageOneWhatMattersLines,
} from "../editorial/pdfNarrative";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { ScoreRing, SCORE_RING_COLUMN_W_HERO } from "../components/ScoreRing";

const styles = StyleSheet.create({
  p1Section: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.2,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: rhythm.xs,
  },
  p1Focal: {
    fontSize: 19.5,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    lineHeight: 1.14,
    letterSpacing: -0.03,
    marginBottom: rhythm.xs,
    maxWidth: BODY_MAX_W,
  },
  p1Intro: {
    fontSize: 9,
    lineHeight: 1.42,
    color: colors.ink2,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
    marginBottom: rhythm.sm + 4,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: rhythm.sm + 2,
    marginBottom: rhythm.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    width: "100%",
  },
  scoreCol: {
    width: SCORE_RING_COLUMN_W_HERO,
    alignItems: "center",
  },
  standingCol: {
    flex: 1,
    paddingLeft: rhythm.md + 2,
    paddingTop: 2,
    justifyContent: "flex-start",
  },
  scoreClarify: {
    fontSize: 8,
    fontFamily: fonts.sans,
    color: colors.ink2,
    lineHeight: 1.35,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 2,
    maxWidth: SCORE_RING_COLUMN_W_HERO,
    alignSelf: "center",
  },
  scoreScaleNote: {
    fontSize: 6.25,
    fontFamily: fonts.sans,
    letterSpacing: 0.04,
    textTransform: "uppercase",
    color: colors.ink4,
    textAlign: "center",
    marginTop: 0,
  },
  standingLabel: {
    fontSize: 7.75,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.1,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: 4,
  },
  standingLead: {
    fontSize: 10,
    lineHeight: 1.38,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    marginBottom: 5,
    maxWidth: BODY_MAX_W - SCORE_RING_COLUMN_W_HERO - 24,
  },
  standingMetricLine: {
    fontSize: 8,
    lineHeight: 1.4,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    maxWidth: BODY_MAX_W - SCORE_RING_COLUMN_W_HERO - 24,
    marginBottom: 2,
  },
  mattersHead: {
    fontSize: 9.5,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    letterSpacing: -0.02,
    marginBottom: rhythm.sm,
    marginTop: 2,
  },
  matterLead: {
    fontSize: 9.25,
    lineHeight: 1.38,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    marginBottom: rhythm.xs + 2,
    maxWidth: BODY_MAX_W,
  },
  matterLine: {
    fontSize: 9,
    lineHeight: 1.4,
    color: colors.ink,
    fontFamily: fonts.sans,
    marginBottom: rhythm.xs + 2,
    maxWidth: BODY_MAX_W,
  },
  diagnosisWrap: {
    marginTop: rhythm.sm + 2,
    paddingTop: rhythm.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    width: "100%",
  },
  diagLine: {
    fontSize: 7.5,
    lineHeight: 1.48,
    color: colors.ink4,
    fontFamily: fonts.sans,
    marginBottom: 3,
    maxWidth: BODY_MAX_W,
  },
});

/** PAGE 1 — Executive opening: position, signals in prose, short diagnosis (white, editorial). */
export function Page01ExecutiveSummary({ data }: { data: ReportData }): ReactElement {
  const standing = pageOneStandingBlock(data);
  const matters = pageOneWhatMattersLines(data);
  const supporting = pageOneSupportingReadLines(data);

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.pdfSlidePage}>
      <View style={baseStyles.pdfSlideContent}>
        <PdfTraceMarker page={1} section="Fixed:P1" />
        <PdfHeader data={data} variant="cover" />

        <View style={{ flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Text style={styles.p1Section}>Diagnosis</Text>
          <Text style={styles.p1Focal} orphans={2} widows={2}>
            {pageOneHeadline(data)}
          </Text>
          <Text style={styles.p1Intro} orphans={2} widows={2}>
            {executiveOpeningIntro(data)}
          </Text>

          <View style={styles.scoreRow}>
            <View style={styles.scoreCol}>
              <ScoreRing score={data.overallScore} variant="hero" />
              <Text style={[styles.scoreClarify, { width: SCORE_RING_COLUMN_W_HERO }]}>
                Composite authority across AI assistants
              </Text>
              <Text style={[styles.scoreScaleNote, { width: SCORE_RING_COLUMN_W_HERO }]}>0–100 index</Text>
            </View>
            <View style={styles.standingCol}>
              <Text style={styles.standingLabel}>Where you stand</Text>
              <Text style={styles.standingLead} orphans={2} widows={2}>
                {standing.lead}
              </Text>
              {standing.metrics.map((m, i) => (
                <Text key={`st-m-${i}`} style={styles.standingMetricLine} orphans={2} widows={2}>
                  {m}
                </Text>
              ))}
            </View>
          </View>

          <Text style={styles.mattersHead}>What matters right now</Text>
          <Text style={styles.matterLead} orphans={2} widows={2}>
            {matters[0]}
          </Text>
          <Text style={styles.matterLine} orphans={2} widows={2}>
            {matters[1]}
          </Text>
          <Text style={styles.matterLine} orphans={2} widows={2}>
            {matters[2]}
          </Text>

          <View style={styles.diagnosisWrap}>
            {supporting.map((line, i) => (
              <Text key={`sr-${i}`} style={styles.diagLine} orphans={2} widows={2}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
