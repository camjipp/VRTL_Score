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

const SIGNAL_LABELS = ["WIN", "RISK", "PRIORITY"] as const;

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
    marginBottom: rhythm.sm + 2,
  },
  /** Single hero: score dial + standing context read as one band */
  heroBlock: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    paddingVertical: rhythm.sm + 2,
    paddingHorizontal: rhythm.sm,
    marginBottom: rhythm.sm + 2,
  },
  heroScore: {
    width: SCORE_RING_COLUMN_W_HERO,
    alignItems: "center",
    flexShrink: 0,
  },
  heroContext: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: rhythm.md + 4,
    minWidth: 0,
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
    marginBottom: 3,
  },
  standingLead: {
    fontSize: 10,
    lineHeight: 1.38,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    marginBottom: 4,
    width: "100%",
  },
  standingMetricLine: {
    fontSize: 8,
    lineHeight: 1.4,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    width: "100%",
    marginBottom: 2,
  },
  mattersHead: {
    fontSize: 9.5,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    letterSpacing: -0.02,
    marginBottom: rhythm.sm,
    marginTop: 0,
  },
  cardsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    marginBottom: rhythm.sm + 2,
  },
  signalCard: {
    flex: 1,
    flexBasis: 0,
    minHeight: 86,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.rule,
    marginRight: rhythm.sm,
  },
  signalCardLast: {
    marginRight: 0,
  },
  signalLabel: {
    fontSize: 6.75,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: 6,
  },
  signalBody: {
    fontSize: 8.35,
    lineHeight: 1.38,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  supportingWrap: {
    marginTop: 0,
    paddingTop: 0,
    width: "100%",
  },
  supportingLine: {
    fontSize: 7.5,
    lineHeight: 1.48,
    color: colors.ink4,
    fontFamily: fonts.sans,
    marginBottom: 2,
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
        <PdfHeader data={data} variant="cover" bottomRule={false} />

        <View style={{ flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Text style={styles.p1Section}>Diagnosis</Text>
          <Text style={styles.p1Focal} orphans={2} widows={2}>
            {pageOneHeadline(data)}
          </Text>
          <Text style={styles.p1Intro} orphans={2} widows={2}>
            {executiveOpeningIntro(data)}
          </Text>

          <View style={styles.heroBlock}>
            <View style={styles.heroScore}>
              <ScoreRing score={data.overallScore} variant="hero" />
              <Text style={[styles.scoreClarify, { width: SCORE_RING_COLUMN_W_HERO }]}>
                Composite authority across AI assistants
              </Text>
              <Text style={[styles.scoreScaleNote, { width: SCORE_RING_COLUMN_W_HERO }]}>0–100 index</Text>
            </View>
            <View style={styles.heroContext}>
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
          <View style={styles.cardsRow}>
            {SIGNAL_LABELS.map((label, i) => (
              <View
                key={label}
                wrap={false}
                style={i === SIGNAL_LABELS.length - 1 ? [styles.signalCard, styles.signalCardLast] : styles.signalCard}
              >
                <Text style={styles.signalLabel}>{label}</Text>
                <Text style={styles.signalBody} orphans={2} widows={2}>
                  {matters[i]}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.supportingWrap}>
            {supporting.map((line, i) => (
              <Text key={`sr-${i}`} style={styles.supportingLine} orphans={2} widows={2}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        <PdfFooter data={data} topRule={false} />
      </View>
    </Page>
  );
}
