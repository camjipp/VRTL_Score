import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, BODY_MAX_W } from "../theme";
import { executiveOpeningIntro } from "../editorial/pdfNarrative";
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
    fontSize: 17,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    lineHeight: 1.18,
    letterSpacing: -0.02,
    marginBottom: rhythm.sm + 2,
    maxWidth: BODY_MAX_W,
  },
  p1Intro: {
    fontSize: 9.5,
    lineHeight: 1.48,
    color: colors.ink2,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
    marginBottom: rhythm.md + 4,
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
  standingLabel: {
    fontSize: 7.5,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.08,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: 6,
  },
  standingBody: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: colors.ink2,
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
    fontSize: 9.25,
    lineHeight: 1.48,
    color: colors.ink,
    fontFamily: fonts.sans,
    marginBottom: rhythm.sm + 2,
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
  diagnosisLabel: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: rhythm.sm,
  },
  diagLine: {
    fontSize: 9,
    lineHeight: 1.48,
    color: colors.ink2,
    fontFamily: fonts.sans,
    marginBottom: 6,
    maxWidth: BODY_MAX_W,
  },
});

/** PAGE 1 — Executive opening: position, signals in prose, short diagnosis (white, editorial). */
export function Page01ExecutiveSummary({ data }: { data: ReportData }): ReactElement {
  const rankLine = `Rank #${data.rank} of ${data.rankTotal}`;
  const statusUpper = String(data.status);
  const positionLabel = data.rank === 1 ? "Leading this set" : "Challenger in this set";
  const authEmpty = data.authorityScore === 0;
  const bottomBullets = splitSummaryBullets(data.bottomLine);
  const bottomLines = (
    bottomBullets.length ? bottomBullets : [data.bottomLine.trim() || "No executive summary was provided for this report."]
  ).slice(0, 4);

  const mr = `${data.mentionRate}%`;
  const tp = `${data.topPosition}%`;
  const auth = authEmpty ? "—" : `${data.authorityScore}%`;

  const standing = `Mention rate ${mr} · Top position ${tp} · Authority (citations) ${auth}${
    authEmpty ? " — not observed in this sample" : ""
  }. Status: ${statusUpper}. ${rankLine}. ${positionLabel}.`;

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.pdfSlidePage}>
      <View style={baseStyles.pdfSlideContent}>
        <PdfTraceMarker page={1} section="Fixed:P1" />
        <PdfHeader data={data} variant="cover" />

        <View style={{ flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Text style={styles.p1Section}>Executive summary</Text>
          <Text style={styles.p1Focal} orphans={2} widows={2}>
            You lead now, but the lead is vulnerable.
          </Text>
          <Text style={styles.p1Intro} orphans={2} widows={2}>
            {executiveOpeningIntro(data)}
          </Text>

          <View style={styles.scoreRow}>
            <View style={styles.scoreCol}>
              <ScoreRing score={data.overallScore} variant="hero" />
            </View>
            <View style={styles.standingCol}>
              <Text style={styles.standingLabel}>Current standing</Text>
              <Text style={styles.standingBody} orphans={2} widows={2}>
                {standing}
              </Text>
            </View>
          </View>

          <Text style={styles.mattersHead}>What matters now</Text>
          <Text style={styles.matterLine} orphans={2} widows={2}>
            <Text style={styles.matterPrefix}>Win — </Text>
            {`${data.alerts.win.title} ${data.alerts.win.detail}`.trim()}
          </Text>
          <Text style={styles.matterLine} orphans={2} widows={2}>
            <Text style={styles.matterPrefix}>Risk — </Text>
            {`${data.alerts.risk.title} ${data.alerts.risk.detail}`.trim()}
          </Text>
          <Text style={styles.matterLine} orphans={2} widows={2}>
            <Text style={styles.matterPrefix}>Priority — </Text>
            {`${data.alerts.priority.title} ${data.alerts.priority.detail}`.trim()}
          </Text>

          <View style={styles.diagnosisWrap}>
            <Text style={styles.diagnosisLabel}>Diagnosis</Text>
            {bottomLines.map((line, i) => (
              <Text key={`bl-${i}`} style={styles.diagLine} orphans={2} widows={2}>
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
