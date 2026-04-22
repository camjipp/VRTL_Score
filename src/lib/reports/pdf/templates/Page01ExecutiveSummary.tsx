import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, BODY_MAX_W } from "../theme";
import { clipPdfText, executiveOpeningIntro, pageOneHeadline, pageOneStandingLines } from "../editorial/pdfNarrative";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { ScoreRing, SCORE_RING_COLUMN_W_HERO } from "../components/ScoreRing";

function splitSummaryBullets(text: string): string[] {
  const raw = text.replace(/\s+/g, " ").trim();
  if (!raw) return [];
  if (raw.includes("\n")) {
    return raw
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6)
      .map((c) => (/[.!?]$/.test(c) ? c : `${c}.`));
  }
  const parts = raw.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return [];
  return parts.slice(0, 6).map((c) => (/[.!?]$/.test(c) ? c : `${c}.`));
}

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
    marginBottom: rhythm.sm,
    maxWidth: BODY_MAX_W,
  },
  p1Intro: {
    fontSize: 9,
    lineHeight: 1.42,
    color: colors.ink2,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
    marginBottom: rhythm.md + 2,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: rhythm.md + 2,
    marginBottom: rhythm.md + 2,
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
    paddingLeft: rhythm.md + 4,
    paddingTop: 4,
    justifyContent: "flex-start",
  },
  scoreCaption: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: 4,
  },
  standingLabel: {
    fontSize: 7.5,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.08,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: 6,
  },
  standingLead: {
    fontSize: 10.25,
    lineHeight: 1.42,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    marginBottom: 6,
    maxWidth: BODY_MAX_W - SCORE_RING_COLUMN_W_HERO - 24,
  },
  standingMetrics: {
    fontSize: 7.75,
    lineHeight: 1.48,
    color: colors.ink3,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W - SCORE_RING_COLUMN_W_HERO - 24,
  },
  mattersHead: {
    fontSize: 8.5,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    letterSpacing: 0.06,
    marginBottom: rhythm.sm + 2,
  },
  matterLine: {
    fontSize: 8.75,
    lineHeight: 1.42,
    color: colors.ink,
    fontFamily: fonts.sans,
    marginBottom: rhythm.sm,
    maxWidth: BODY_MAX_W,
  },
  matterPrefix: {
    fontFamily: fonts.sansBold,
    color: colors.ink,
  },
  diagnosisWrap: {
    marginTop: rhythm.md,
    paddingTop: rhythm.md + 2,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    width: "100%",
  },
  diagLine: {
    fontSize: 8.25,
    lineHeight: 1.5,
    color: colors.ink3,
    fontFamily: fonts.sans,
    marginBottom: 5,
    maxWidth: BODY_MAX_W,
  },
});

/** PAGE 1 — Executive opening: position, signals in prose, short diagnosis (white, editorial). */
export function Page01ExecutiveSummary({ data }: { data: ReportData }): ReactElement {
  const bottomBullets = splitSummaryBullets(data.bottomLine);
  const bottomLines = (
    bottomBullets.length ? bottomBullets : [data.bottomLine.trim() || "No executive summary was provided for this report."]
  ).slice(0, 3);

  const [standL1, standL2] = pageOneStandingLines(data);

  function terseMatter(title: string, detail: string, max: number): string {
    const t = `${title} ${detail}`.replace(/\s+/g, " ").trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max - 1).replace(/[\s,;:.!]+$/, "")}…`;
  }

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
              <Text style={[styles.scoreCaption, { textAlign: "center", width: SCORE_RING_COLUMN_W_HERO }]}>
                Composite · 0–100
              </Text>
              <ScoreRing score={data.overallScore} variant="hero" />
            </View>
            <View style={styles.standingCol}>
              <Text style={styles.standingLabel}>Where you stand</Text>
              <Text style={styles.standingLead} orphans={2} widows={2}>
                {standL1}
              </Text>
              <Text style={styles.standingMetrics} orphans={2} widows={2}>
                {standL2}
              </Text>
            </View>
          </View>

          <Text style={styles.mattersHead}>Early signals</Text>
          <Text style={styles.matterLine} orphans={2} widows={2}>
            <Text style={styles.matterPrefix}>Win — </Text>
            {terseMatter(data.alerts.win.title, data.alerts.win.detail, 118)}
          </Text>
          <Text style={styles.matterLine} orphans={2} widows={2}>
            <Text style={styles.matterPrefix}>Risk — </Text>
            {terseMatter(data.alerts.risk.title, data.alerts.risk.detail, 118)}
          </Text>
          <Text style={styles.matterLine} orphans={2} widows={2}>
            <Text style={styles.matterPrefix}>Priority — </Text>
            {terseMatter(data.alerts.priority.title, data.alerts.priority.detail, 118)}
          </Text>

          <View style={styles.diagnosisWrap}>
            {bottomLines.map((line, i) => (
              <Text key={`bl-${i}`} style={styles.diagLine} orphans={2} widows={2}>
                {clipPdfText(line, 150)}
              </Text>
            ))}
          </View>
        </View>

        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
