import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { fonts } from "../theme";

/** A4 + 48 pt pad — Page 1 only (rest of document uses `PAGE` in theme). */
const PAGE1 = { width: 595, height: 842, pad: 48 } as const;
import {
  executiveOpeningIntro,
  pageOneHeadlinePair,
  pageOnePositionSubline,
  pageOneSignalCardBodies,
  pageOneStandingBlock,
  pageOneSupportingReadLines,
} from "../editorial/pdfNarrative";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

/** Page 1 only — neutrals + brand green + red (no other hues). */
const colors = {
  bg: "#FFFFFF",
  text: "#0B0C0F",
  muted: "#6B7280",
  border: "#E5E7EB",
  surface: "#F9FAFB",
  green: "#22C55E",
  red: "#EF4444",
} as const;

const SIGNAL_LABELS = ["WIN", "RISK", "PRIORITY"] as const;
const SIGNAL_ACCENT: readonly [typeof colors.green, typeof colors.red, typeof colors.border] = [
  colors.green,
  colors.red,
  colors.border,
];

const styles = StyleSheet.create({
  page: {
    width: PAGE1.width,
    height: PAGE1.height,
    backgroundColor: colors.bg,
    padding: PAGE1.pad,
    fontFamily: fonts.sans,
    color: colors.text,
  },
  pageInner: {
    flex: 1,
    minHeight: PAGE1.height - PAGE1.pad * 2,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  main: {
    flexGrow: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerLeft: {
    fontSize: 7.5,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.muted,
  },
  headerRight: {
    fontSize: 9,
    fontFamily: fonts.sans,
    color: colors.text,
    textAlign: "right",
    maxWidth: 280,
  },
  headerRule: {
    height: 1,
    backgroundColor: colors.border,
    width: "100%",
    marginBottom: 22,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 16,
    minWidth: 0,
  },
  heroLine1: {
    fontSize: 21,
    fontFamily: fonts.sansBold,
    color: colors.text,
    lineHeight: 1.12,
    letterSpacing: -0.35,
  },
  heroLine2: {
    fontSize: 21,
    fontFamily: fonts.sansBold,
    color: colors.text,
    lineHeight: 1.12,
    letterSpacing: -0.35,
    marginTop: 4,
  },
  heroSub: {
    fontSize: 9.25,
    fontFamily: fonts.sans,
    color: colors.muted,
    lineHeight: 1.45,
    marginTop: 12,
    maxWidth: 300,
  },
  heroRight: {
    width: 128,
    alignItems: "flex-end",
  },
  scoreNum: {
    fontSize: 44,
    fontFamily: fonts.sansBold,
    color: colors.text,
    lineHeight: 1,
    textAlign: "right",
    width: "100%",
  },
  scoreFrac: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.muted,
    marginTop: 4,
    textAlign: "right",
    width: "100%",
  },
  scoreCaption: {
    fontSize: 8,
    fontFamily: fonts.sans,
    color: colors.muted,
    lineHeight: 1.35,
    marginTop: 10,
    textAlign: "right",
    width: "100%",
  },
  metricsRow: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 11,
    marginBottom: 14,
  },
  metricCell: {
    flex: 1,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  metricCellLast: {
    borderRightWidth: 0,
  },
  metricLabel: {
    fontSize: 7.5,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.06,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 12,
    fontFamily: fonts.sansBold,
    color: colors.text,
  },
  positionLead: {
    fontSize: 10,
    fontFamily: fonts.sansBold,
    color: colors.text,
    lineHeight: 1.35,
    marginBottom: 5,
  },
  positionSub: {
    fontSize: 9,
    fontFamily: fonts.sans,
    color: colors.muted,
    lineHeight: 1.45,
    marginBottom: 18,
  },
  mattersTitle: {
    fontSize: 11,
    fontFamily: fonts.sansBold,
    color: colors.text,
    letterSpacing: -0.15,
    marginBottom: 10,
  },
  cardsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    marginBottom: 14,
  },
  card: {
    flex: 1,
    flexBasis: 0,
    minHeight: 78,
    backgroundColor: colors.surface,
    paddingVertical: 11,
    paddingHorizontal: 11,
    paddingLeft: 13,
    marginRight: 9,
    borderLeftWidth: 3,
  },
  cardLast: {
    marginRight: 0,
  },
  cardLabel: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 7,
  },
  cardBody: {
    fontSize: 8.75,
    fontFamily: fonts.sans,
    color: colors.text,
    lineHeight: 1.38,
  },
  supportingLine: {
    fontSize: 8,
    fontFamily: fonts.sans,
    color: colors.muted,
    lineHeight: 1.48,
    marginBottom: 3,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
  },
  footerText: {
    fontSize: 8,
    fontFamily: fonts.sans,
    color: colors.muted,
  },
});

function formatClientDate(data: ReportData): string {
  const name = data.clientName.trim() || "Client";
  const date = data.date.trim() || "—";
  return `${name} · ${date}`;
}

function displayScore(score: number | null): string {
  if (score == null) return "—";
  return String(score);
}

/** A4 Page 1 — AI Authority Report cover (minimal, agency-facing). */
export function Page1({ data }: { data: ReportData }): ReactElement {
  const standing = pageOneStandingBlock(data);
  const [h1, h2] = pageOneHeadlinePair(data);
  const subline = executiveOpeningIntro(data);
  const positionSub = pageOnePositionSubline(data);
  const cards = pageOneSignalCardBodies(data);
  const supporting = pageOneSupportingReadLines(data);
  const citeZero = data.authorityScore === 0;
  const citeLabel = `${data.authorityScore}%`;

  return (
    <Page size={[PAGE1.width, PAGE1.height]} style={styles.page} wrap={false}>
      <PdfTraceMarker page={1} section="Fixed:P1" />
      <View style={styles.pageInner}>
        <View style={styles.main}>
          <View style={styles.headerRow}>
            <Text style={styles.headerLeft}>AI AUTHORITY REPORT</Text>
            <Text style={styles.headerRight}>{formatClientDate(data)}</Text>
          </View>
          <View style={styles.headerRule} />

          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLine1} orphans={2} widows={2}>
                {h1}
              </Text>
              {h2 ? (
                <Text style={styles.heroLine2} orphans={2} widows={2}>
                  {h2}
                </Text>
              ) : null}
              <Text style={styles.heroSub} orphans={2} widows={2}>
                {subline}
              </Text>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.scoreNum}>{displayScore(data.overallScore)}</Text>
              <Text style={styles.scoreFrac}>/100</Text>
              <Text style={styles.scoreCaption}>Composite authority score</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Mention rate</Text>
              <Text style={styles.metricValue}>{data.mentionRate}%</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Top position</Text>
              <Text style={styles.metricValue}>{data.topPosition}%</Text>
            </View>
            <View style={[styles.metricCell, styles.metricCellLast]}>
              <Text style={styles.metricLabel}>Citations</Text>
              <Text style={styles.metricValue}>
                {citeZero ? <Text style={{ color: colors.red }}>{citeLabel}</Text> : citeLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.positionLead} orphans={2} widows={2}>
            {standing.lead}
          </Text>
          <Text style={styles.positionSub} orphans={2} widows={2}>
            {positionSub}
          </Text>

          <Text style={styles.mattersTitle}>What matters right now</Text>
          <View style={styles.cardsRow}>
            {SIGNAL_LABELS.map((label, i) => (
              <View
                key={label}
                wrap={false}
                style={[
                  styles.card,
                  { borderLeftColor: SIGNAL_ACCENT[i] },
                  ...(i === SIGNAL_LABELS.length - 1 ? [styles.cardLast] : []),
                ]}
              >
                <Text style={styles.cardLabel}>{label}</Text>
                <Text style={styles.cardBody} orphans={2} widows={2}>
                  {cards[i]}
                </Text>
              </View>
            ))}
          </View>

          {supporting.map((line, i) => (
            <Text key={`sup-${i}`} style={styles.supportingLine} orphans={2} widows={2}>
              {line}
            </Text>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Confidential</Text>
          <Text style={styles.footerText}>Page 1</Text>
        </View>
      </View>
    </Page>
  );
}
