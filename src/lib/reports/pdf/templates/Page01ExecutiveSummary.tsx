import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, space, BODY_MAX_W } from "../theme";
import { executiveOpeningIntro } from "../editorial/pdfNarrative";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { ScoreRing, SCORE_RING_COLUMN_W_HERO } from "../components/ScoreRing";
import { WinRiskPriorityAlerts } from "../pages/RankingAlertsSection";

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
  hero: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: rhythm.sm,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingVertical: rhythm.md + 2,
    paddingHorizontal: rhythm.md,
    overflow: "hidden",
  },
  heroLeft: {
    width: SCORE_RING_COLUMN_W_HERO,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
  },
  focalHeadline: {
    marginTop: 10,
    paddingHorizontal: 4,
    fontSize: 11.5,
    lineHeight: 1.35,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    textAlign: "center",
    maxWidth: SCORE_RING_COLUMN_W_HERO,
  },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.rule, marginHorizontal: rhythm.sm },
  heroRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    minHeight: 112,
  },
  kpiTile: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: rhythm.sm - 2,
    paddingHorizontal: rhythm.sm - 2,
    borderRadius: 4,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  /** Single-line percent so digits and % do not break apart */
  kpiPct: {
    fontSize: 17,
    fontWeight: 400,
    fontFamily: fonts.sansBold,
    lineHeight: 1.1,
    color: colors.ink2,
    textAlign: "center",
  },
  kpiLab: {
    fontSize: 6,
    fontWeight: 400,
    color: colors.ink4,
    marginTop: 4,
    letterSpacing: 0.06,
    textTransform: "uppercase",
    fontFamily: fonts.sansBold,
    textAlign: "center",
    maxWidth: 100,
  },
  statusStrip: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: rhythm.sm,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    backgroundColor: colors.surface2,
    overflow: "hidden",
  },
  statusCell: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: rhythm.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: colors.rule,
  },
  statusCellLast: { borderRightWidth: 0 },
  statusText: { fontSize: 7, fontFamily: fonts.sansBold, textAlign: "center", color: colors.ink3 },
  calloutWrap: {
    flexDirection: "row",
    marginTop: rhythm.sm,
    marginBottom: 0,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  calloutBar: { width: 2, backgroundColor: colors.cyan },
  calloutInner: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: space.cardPad,
    justifyContent: "flex-start",
  },
  calloutKicker: {
    fontSize: 7,
    fontWeight: 400,
    color: colors.ink4,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.1,
    marginBottom: rhythm.sm,
    textTransform: "uppercase",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
    maxWidth: BODY_MAX_W + 8,
  },
  bulletMark: {
    width: 14,
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.cyan,
    fontFamily: fonts.sansBold,
    marginTop: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.48,
    color: colors.ink2,
    fontFamily: fonts.sans,
  },
  evidenceLabel: {
    fontSize: 6,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.1,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: 3,
  },
});

/** PAGE 1 — Opening / executive thesis + immediate signals + takeaway. */
export function Page01ExecutiveSummary({ data }: { data: ReportData }): ReactElement {
  const rankLine = `RANK #${data.rank} OF ${data.rankTotal}`;
  const statusUpper = String(data.status).toUpperCase();
  const leadingPill = data.rank === 1 ? "LEADING" : "CHALLENGER";
  const authEmpty = data.authorityScore === 0;
  const bottomBullets = splitSummaryBullets(data.bottomLine);
  const bottomLines = (
    bottomBullets.length ? bottomBullets : [data.bottomLine.trim() || "No executive summary was provided for this report."]
  ).slice(0, 4);

  const mr = `${data.mentionRate}%`;
  const tp = `${data.topPosition}%`;
  const auth = `${data.authorityScore}%`;

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.pdfSlidePage}>
      <View style={baseStyles.pdfSlideContent}>
        <PdfTraceMarker page={1} section="Fixed:P1" />
        <PdfHeader data={data} variant="cover" />

        <View style={{ flex: 1, flexDirection: "column", minHeight: 0 }}>
          <EditorialSectionHeader
            sectionLabel="Opening"
            title="Executive summary"
            intro={executiveOpeningIntro(data)}
            density="tight"
          />

          <Text style={styles.evidenceLabel}>Scores & share</Text>
          <View style={styles.hero}>
            <View style={styles.heroLeft}>
              <ScoreRing score={data.overallScore} variant="hero" />
              <Text style={styles.focalHeadline} orphans={2} widows={2}>
                You lead now, but the lead is vulnerable.
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.heroRight}>
              <View style={styles.kpiTile}>
                <Text style={styles.kpiPct}>{mr}</Text>
                <Text style={styles.kpiLab}>Mention rate</Text>
              </View>
              <View style={styles.kpiTile}>
                <Text style={styles.kpiPct}>{tp}</Text>
                <Text style={styles.kpiLab}>Top position</Text>
              </View>
              <View style={[styles.kpiTile, authEmpty ? { opacity: 0.85 } : {}]}>
                <Text style={[styles.kpiPct, authEmpty ? { color: colors.ink4 } : {}]}>{auth}</Text>
                <Text style={[styles.kpiLab, authEmpty ? { color: colors.ink4 } : {}]}>Authority (citations)</Text>
              </View>
            </View>
          </View>

          <View style={styles.statusStrip}>
            <View style={styles.statusCell}>
              <Text style={styles.statusText}>{statusUpper}</Text>
            </View>
            <View style={styles.statusCell}>
              <Text style={styles.statusText}>{rankLine}</Text>
            </View>
            <View style={[styles.statusCell, styles.statusCellLast]}>
              <Text style={styles.statusText}>{leadingPill}</Text>
            </View>
          </View>

          <Text style={[styles.evidenceLabel, { marginTop: rhythm.xs }]}>Early signals</Text>
          <WinRiskPriorityAlerts data={data} visualTier="secondary" />

          <View style={styles.calloutWrap}>
            <View style={styles.calloutBar} />
            <View style={styles.calloutInner}>
              <Text style={styles.calloutKicker}>Diagnosis</Text>
              {bottomLines.map((line, i) => (
                <View key={`bl-${i}`} style={styles.bulletRow}>
                  <Text style={styles.bulletMark}>•</Text>
                  <Text style={styles.bulletText} orphans={2} widows={2}>
                    {line}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
