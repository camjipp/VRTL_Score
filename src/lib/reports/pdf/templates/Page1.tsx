import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { baseStyles, fonts } from "../theme";
import {
  executiveOpeningIntro,
  pageOneHeadlinePair,
  pageOnePositionSubline,
  pageOneSignalCardBodies,
  pageOneStandingBlock,
  pageOneSupportingReadLines,
} from "../editorial/pdfNarrative";
import { PdfFooter } from "../components/PdfFooter";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { ReportPage } from "../components/ReportPage";

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

const bodyColumn = { flex: 1, flexDirection: "column" as const, minHeight: 0 };

/** Distributes top / middle / bottom so the page fills vertically without a dead lower zone. */
const pageFlow = {
  flex: 1,
  flexDirection: "column" as const,
  justifyContent: "space-between" as const,
  minHeight: 0,
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
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
    marginBottom: 16,
  },
  /** Headline + subline + score + metrics read as one band */
  heroMetricsBand: {
    width: "100%",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
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
    marginTop: 2,
  },
  heroSub: {
    fontSize: 9.25,
    fontFamily: fonts.sans,
    color: colors.muted,
    lineHeight: 1.45,
    marginTop: 8,
    maxWidth: 300,
  },
  heroRight: {
    width: 128,
    alignItems: "flex-end",
    paddingBottom: 2,
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
    marginTop: 2,
    textAlign: "right",
    width: "100%",
  },
  scoreCaption: {
    fontSize: 8,
    fontFamily: fonts.sans,
    color: colors.muted,
    lineHeight: 1.35,
    marginTop: 6,
    textAlign: "right",
    width: "100%",
  },
  metricsRow: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    marginBottom: 0,
  },
  metricCell: {
    flex: 1,
    paddingHorizontal: 8,
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
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontFamily: fonts.sansBold,
    color: colors.text,
  },
  clusterMid: {
    width: "100%",
  },
  positionLead: {
    fontSize: 10,
    fontFamily: fonts.sansBold,
    color: colors.text,
    lineHeight: 1.35,
    marginBottom: 4,
  },
  positionSub: {
    fontSize: 9,
    fontFamily: fonts.sans,
    color: colors.muted,
    lineHeight: 1.45,
    marginBottom: 16,
  },
  mattersTitle: {
    fontSize: 11,
    fontFamily: fonts.sansBold,
    color: colors.text,
    letterSpacing: -0.15,
    marginBottom: 8,
  },
  cardsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    marginBottom: 0,
  },
  card: {
    flex: 1,
    flexBasis: 0,
    minHeight: 72,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingLeft: 11,
    marginRight: 8,
    borderLeftWidth: 3,
  },
  cardLast: {
    marginRight: 0,
  },
  cardLabel: {
    fontSize: 6.25,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 9,
    fontFamily: fonts.sansBold,
    color: colors.text,
    lineHeight: 1.36,
  },
  clusterBottom: {
    width: "100%",
    paddingTop: 8,
  },
  supportingLine: {
    fontSize: 8,
    fontFamily: fonts.sans,
    color: colors.muted,
    lineHeight: 1.48,
  },
  supportingLineGap: {
    marginBottom: 4,
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

/** Page 1 — AI Authority Report cover (same physical shell as all other pages). */
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
    <ReportPage wrap={false}>
      <View style={baseStyles.pdfSlideContent}>
        <View wrap={false} fixed style={[baseStyles.headerFixedWrap, { top: 0 }]}>
          <View style={styles.headerRow}>
            <Text style={styles.headerLeft}>AI AUTHORITY REPORT</Text>
            <Text style={styles.headerRight}>{formatClientDate(data)}</Text>
          </View>
          <View style={styles.headerRule} />
        </View>

        <View style={bodyColumn}>
          <PdfTraceMarker page={1} section="Fixed:P1" />

          <View style={pageFlow}>
            <View style={styles.heroMetricsBand}>
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
            </View>

            <View style={styles.clusterMid}>
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
            </View>

            <View style={styles.clusterBottom}>
              {supporting.map((line, i) => (
                <Text
                  key={`sup-${i}`}
                  style={[
                    styles.supportingLine,
                    ...(i < supporting.length - 1 ? [styles.supportingLineGap] : []),
                  ]}
                  orphans={2}
                  widows={2}
                >
                  {line}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <PdfFooter data={data} />
      </View>
    </ReportPage>
  );
}
