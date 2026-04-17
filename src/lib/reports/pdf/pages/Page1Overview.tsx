import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, space, BODY_MAX_W } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { ScoreRing, SCORE_RING_COLUMN_W } from "../components/ScoreRing";

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
    alignItems: "center",
    marginBottom: space.block,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingVertical: rhythm.lg,
    paddingHorizontal: rhythm.lg,
    overflow: "hidden",
  },
  heroLeft: {
    width: SCORE_RING_COLUMN_W,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: colors.rule, marginHorizontal: rhythm.md },
  heroRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 132,
  },
  kpiTile: {
    flex: 1,
    marginHorizontal: 8,
    paddingTop: rhythm.md,
    paddingHorizontal: rhythm.md,
    paddingBottom: rhythm.md,
    borderRadius: 4,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  kpiVal: { fontSize: 24, fontWeight: 400, fontFamily: fonts.sansBold, lineHeight: 1.05, color: colors.ink },
  kpiLab: {
    fontSize: 6,
    fontWeight: 400,
    color: colors.ink3,
    marginTop: rhythm.sm,
    letterSpacing: 0.06,
    textTransform: "uppercase",
    fontFamily: fonts.sansBold,
    maxWidth: 92,
  },
  statusStrip: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: rhythm.md,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    backgroundColor: colors.paper,
    overflow: "hidden",
  },
  statusCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: rhythm.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: colors.rule,
  },
  statusCellLast: { borderRightWidth: 0 },
  statusText: { fontSize: 7.5, fontFamily: fonts.sansBold, textAlign: "center" },
  calloutWrap: {
    flexDirection: "row",
    marginBottom: rhythm.lg,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  calloutBar: { width: 4, backgroundColor: colors.cyan },
  calloutInner: {
    flex: 1,
    paddingVertical: space.cardPad + 18,
    paddingHorizontal: space.cardPad + 8,
  },
  calloutKicker: {
    fontSize: 7,
    fontWeight: 400,
    color: colors.ink3,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.14,
    marginBottom: rhythm.md + 4,
    textTransform: "uppercase",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    maxWidth: BODY_MAX_W + 8,
  },
  bulletMark: {
    width: 18,
    fontSize: 12,
    lineHeight: 1.65,
    color: colors.cyan,
    fontFamily: fonts.sansBold,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.72,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
});

export function Page1Overview({ data }: { data: ReportData }): ReactElement[] {
  const rankLine = `RANK #${data.rank} OF ${data.rankTotal}`;
  const statusUpper = String(data.status).toUpperCase();
  const leadingPill = data.rank === 1 ? "LEADING" : "CHALLENGER";
  const authEmpty = data.authorityScore === 0;
  const bottomBullets = splitSummaryBullets(data.bottomLine);
  const bottomLines = bottomBullets.length
    ? bottomBullets
    : [data.bottomLine.trim() || "No executive summary was provided for this report."];

  return [
    <Page key="p1-cover" size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={1} section="Page1:start" />
        <PdfHeader data={data} variant="cover" />
        <PdfTraceMarker page={1} section="Page1:after_header" />

        <View style={styles.hero} wrap={false}>
          <View style={styles.heroLeft}>
            <ScoreRing score={data.overallScore} />
          </View>
          <View style={styles.divider} />
          <View style={styles.heroRight}>
            <View style={styles.kpiTile}>
              <Text style={styles.kpiVal}>{data.mentionRate}%</Text>
              <Text style={styles.kpiLab}>
                Mention{"\u00A0"}rate
              </Text>
            </View>
            <View style={styles.kpiTile}>
              <Text style={styles.kpiVal}>{data.topPosition}%</Text>
              <Text style={styles.kpiLab}>
                Top{"\u00A0"}position
              </Text>
            </View>
            <View style={[styles.kpiTile, authEmpty ? { opacity: 0.88 } : {}]}>
              <Text style={[styles.kpiVal, authEmpty ? { color: colors.ink4 } : {}]}>{data.authorityScore}%</Text>
              <Text style={[styles.kpiLab, authEmpty ? { color: colors.ink4 } : {}]}>
                Authority (citations)
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.statusStrip, { marginBottom: space.block }]} wrap={false}>
          <View style={styles.statusCell}>
            <Text style={[styles.statusText, { color: colors.ink2 }]}>{statusUpper}</Text>
          </View>
          <View style={styles.statusCell}>
            <Text style={[styles.statusText, { color: colors.ink2 }]}>{rankLine}</Text>
          </View>
          <View style={[styles.statusCell, styles.statusCellLast]}>
            <Text style={[styles.statusText, { color: colors.ink2 }]}>{leadingPill}</Text>
          </View>
        </View>

        <View style={[styles.calloutWrap, { marginBottom: 0 }]}>
          <View style={styles.calloutBar} />
          <View style={styles.calloutInner}>
            <Text style={styles.calloutKicker}>Bottom line</Text>
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

        <PdfTraceMarker page={1} section="Page1:cover_before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>,
  ];
}
