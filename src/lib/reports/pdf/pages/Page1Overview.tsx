import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, space, BODY_MAX_W } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { ScoreRing, SCORE_RING_COLUMN_W } from "../components/ScoreRing";

/** Inner row columns sum to 537 (540 − 3pt accent rail) */
const W = { rank: 30, name: 116, bar: 231, count: 66, pill: 91 } as const;

function splitSummaryBullets(text: string): string[] {
  const raw = text.replace(/\s+/g, " ").trim();
  if (!raw) return [];
  return raw
    .split(". ")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((c) => (c.endsWith(".") ? c : `${c}.`))
    .slice(0, 6);
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
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  calloutBar: { width: 3, backgroundColor: colors.ink3 },
  calloutInner: { flex: 1, paddingVertical: space.cardPad - 2, paddingHorizontal: space.cardPad },
  calloutKicker: {
    fontSize: 6,
    fontWeight: 400,
    color: colors.ink4,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.15,
    marginBottom: rhythm.sm,
    textTransform: "uppercase",
  },
  calloutBody: {
    fontSize: 10,
    lineHeight: 1.72,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    maxWidth: BODY_MAX_W + 8,
  },
  bulletMark: {
    width: 14,
    fontSize: 10,
    lineHeight: 1.72,
    color: colors.ink3,
    fontFamily: fonts.sansBold,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.72,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  rankHeader: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.ink3,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    marginBottom: rhythm.sm,
    marginTop: space.block,
    fontFamily: fonts.sansBold,
  },
  rankOuter: {
    width: 540,
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  rankAccent: { width: 3 },
  rankInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingLeft: rhythm.sm,
  },
  rankIdx: { width: W.rank, fontSize: 8.5, color: colors.ink4, fontWeight: 400, fontFamily: fonts.sansBold },
  rankName: { width: W.name, fontSize: 8.5, color: colors.ink2, fontFamily: fonts.sans },
  rankNameClient: { width: W.name, fontSize: 9, color: colors.ink, fontWeight: 400, fontFamily: fonts.sansBold },
  barWrap: { width: W.bar, height: 7, backgroundColor: colors.surface2, borderRadius: 4, marginHorizontal: 6 },
  barInner: { flex: 1, flexDirection: "row", height: 7 },
  barFill: { height: 7, backgroundColor: colors.cyan, borderRadius: 4 },
  barFillNeu: { height: 7, backgroundColor: colors.ink4, borderRadius: 4, opacity: 0.35 },
  barRest: { height: 7 },
  rankCount: { width: W.count, fontSize: 8, color: colors.ink4, textAlign: "right", fontFamily: fonts.sans },
  pillCell: { width: W.pill, alignItems: "flex-end" },
  deltaPill: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: 4 },
  deltaAhead: { backgroundColor: colors.surface2 },
  deltaBehind: { backgroundColor: colors.surface2 },
  deltaTied: { backgroundColor: colors.surface2 },
  deltaTxt: { fontSize: 6.5, fontWeight: 400, color: colors.ink3, fontFamily: fonts.sansBold },
  alertRow: { flexDirection: "row", marginTop: space.block, alignItems: "stretch" },
  alertSp: { marginRight: rhythm.sm },
  alertCard: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: space.cardPad,
    paddingHorizontal: space.cardPad,
    borderWidth: 1,
    borderColor: colors.rule,
    minHeight: 96,
    overflow: "hidden",
  },
  alertWin: { backgroundColor: colors.greenLight, borderTopWidth: 2, borderTopColor: colors.green },
  alertRisk: { backgroundColor: colors.orangeLight, borderTopWidth: 2, borderTopColor: colors.orange },
  alertPri: { backgroundColor: colors.redLight, borderTopWidth: 2, borderTopColor: colors.red },
  alertPill: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 3,
    marginBottom: rhythm.sm,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  alertTitle: { fontSize: 9.5, fontWeight: 400, color: colors.ink, fontFamily: fonts.sansBold, lineHeight: 1.25 },
  alertDetail: {
    fontSize: 8,
    color: colors.ink,
    marginTop: rhythm.sm,
    lineHeight: 1.68,
    fontFamily: fonts.sans,
  },
});

export function Page1Overview({ data }: { data: ReportData }) {
  const maxM = Math.max(...data.competitors.map((c) => c.mentions), 1);
  const clientM = data.competitors.find((c) => c.isClient)?.mentions ?? 0;

  const rankLine = `RANK #${data.rank} OF ${data.rankTotal}`;
  const statusUpper = String(data.status).toUpperCase();
  const leadingPill = data.rank === 1 ? "LEADING" : "CHALLENGER";
  const authEmpty = data.authorityScore === 0;
  const bottomBullets = splitSummaryBullets(data.bottomLine);
  const bottomLines = bottomBullets.length ? bottomBullets : [data.bottomLine.trim() || "—"];

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
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
                Authority{"\u00A0"}(citations)
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

        <View style={[styles.calloutWrap, { marginBottom: space.block }]} wrap={false}>
          <View style={styles.calloutBar} />
          <View style={styles.calloutInner}>
            <Text style={styles.calloutKicker}>Bottom line</Text>
            {bottomLines.map((line, i) => (
              <View key={`bl-${i}`} style={styles.bulletRow} wrap={false}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.rankHeader}>Competitive ranking</Text>
        {data.competitors.map((c) => {
          const widthPct = Math.min(100, Math.max(0, Math.round((c.mentions / maxM) * 100)));
          const barRest = Math.max(0, 100 - widthPct);
          const delta = c.isClient ? null : c.mentions - clientM;
          const deltaStr =
            delta === null ? "" : delta === 0 ? "0" : delta > 0 ? `+${delta}` : String(delta);
          const isClient = !!c.isClient;
          return (
            <View key={`rank-${c.name}`} style={styles.rankOuter} wrap={false}>
              <View style={[styles.rankAccent, { backgroundColor: isClient ? colors.cyan : "transparent" }]} />
              <View
                style={[styles.rankInner, { backgroundColor: isClient ? colors.cyanLight : "transparent" }]}
              >
                <Text
                  style={[
                    styles.rankIdx,
                    isClient ? {} : { color: colors.ink4, fontFamily: fonts.sans },
                  ]}
                >{`#${c.rank}`}</Text>
                <Text style={isClient ? styles.rankNameClient : styles.rankName}>{c.name}</Text>
                <View style={styles.barWrap}>
                  <View style={styles.barInner}>
                    <View
                      style={[
                        { flex: widthPct <= 0 ? 0 : widthPct },
                        isClient ? styles.barFill : styles.barFillNeu,
                      ]}
                    />
                    <View style={[{ flex: barRest }, styles.barRest]} />
                  </View>
                </View>
                <Text style={styles.rankCount}>{`${c.mentions}/${data.meta.responses}`}</Text>
                <View style={styles.pillCell}>
                  {deltaStr !== "" ? (
                    <View
                      style={[
                        styles.deltaPill,
                        deltaStr === "0"
                          ? styles.deltaTied
                          : deltaStr.startsWith("-")
                            ? styles.deltaBehind
                            : styles.deltaAhead,
                      ]}
                    >
                      <Text style={styles.deltaTxt}>{deltaStr}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.alertRow} wrap={false}>
          <View style={[styles.alertCard, styles.alertWin, styles.alertSp]}>
            <View style={[styles.alertPill, { backgroundColor: colors.paper, borderColor: colors.green }]}>
              <Text style={{ fontSize: 6.5, fontWeight: 400, color: colors.green, fontFamily: fonts.sansBold }}>WIN</Text>
            </View>
            <Text style={styles.alertTitle}>{data.alerts.win.title}</Text>
            <Text style={styles.alertDetail}>{data.alerts.win.detail}</Text>
          </View>
          <View style={[styles.alertCard, styles.alertRisk, styles.alertSp]}>
            <View style={[styles.alertPill, { backgroundColor: colors.paper, borderColor: colors.orange }]}>
              <Text style={{ fontSize: 6.5, fontWeight: 400, color: colors.orange, fontFamily: fonts.sansBold }}>RISK</Text>
            </View>
            <Text style={styles.alertTitle}>{data.alerts.risk.title}</Text>
            <Text style={styles.alertDetail}>{data.alerts.risk.detail}</Text>
          </View>
          <View style={[styles.alertCard, styles.alertPri]}>
            <View style={[styles.alertPill, { backgroundColor: colors.paper, borderColor: colors.red }]}>
              <Text style={{ fontSize: 6.5, fontWeight: 400, color: colors.red, fontFamily: fonts.sansBold }}>PRIORITY</Text>
            </View>
            <Text style={styles.alertTitle}>{data.alerts.priority.title}</Text>
            <Text style={styles.alertDetail}>{data.alerts.priority.detail}</Text>
          </View>
        </View>

        <PdfTraceMarker page={1} section="Page1:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
