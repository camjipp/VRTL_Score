import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { ScoreRing } from "../components/ScoreRing";

/** Inner row columns sum to 537 (540 − 3pt accent rail) */
const W = { rank: 32, name: 118, bar: 229, count: 68, pill: 90 } as const;

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: space.section,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 14,
    overflow: "hidden",
  },
  heroLeft: { width: 148, alignItems: "center", justifyContent: "center" },
  divider: { width: 1, backgroundColor: colors.rule, marginHorizontal: 10 },
  heroRight: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "stretch" },
  kpiTile: {
    flex: 1,
    marginHorizontal: 4,
    paddingBottom: 8,
    borderBottomWidth: 2,
  },
  kpiVal: { fontSize: 22, fontWeight: 700, fontFamily: fonts.sans },
  kpiLab: {
    fontSize: 7,
    fontWeight: 600,
    color: colors.ink4,
    marginTop: 6,
    letterSpacing: 0.65,
    textTransform: "uppercase",
    fontFamily: fonts.sans,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: space.section },
  pillSp: { marginRight: 8, marginBottom: 6 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  pillTextBase: { fontSize: 8, fontFamily: fonts.sans },
  calloutWrap: {
    flexDirection: "row",
    marginBottom: space.section,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.cyanLight,
  },
  calloutBar: { width: 4, backgroundColor: colors.cyan },
  calloutInner: { flex: 1, padding: 14 },
  calloutBody: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: colors.ink2,
    fontStyle: "italic",
    fontFamily: fonts.sans,
  },
  rankHeader: {
    fontSize: 8,
    fontWeight: 600,
    color: colors.ink4,
    letterSpacing: 0.65,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: fonts.sans,
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
    paddingVertical: 8,
    paddingLeft: 6,
  },
  rankIdx: { width: W.rank, fontSize: 9, color: colors.ink4, fontWeight: 600, fontFamily: fonts.sans },
  rankName: { width: W.name, fontSize: 9, color: colors.ink2, fontFamily: fonts.sans },
  rankNameClient: { width: W.name, fontSize: 9, color: colors.ink, fontWeight: 700, fontFamily: fonts.sans },
  barWrap: { width: W.bar, height: 6, backgroundColor: colors.surface2, borderRadius: 3, marginHorizontal: 6 },
  barInner: { flex: 1, flexDirection: "row", height: 6 },
  barFill: { height: 6, backgroundColor: colors.cyan, borderRadius: 3, opacity: 0.85 },
  barFillNeu: { height: 6, backgroundColor: colors.ink4, borderRadius: 3, opacity: 0.45 },
  barRest: { height: 6 },
  rankCount: { width: W.count, fontSize: 9, color: colors.ink4, textAlign: "right", fontFamily: fonts.sans },
  pillCell: { width: W.pill, alignItems: "flex-end" },
  deltaPill: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 4 },
  deltaAhead: { backgroundColor: colors.redLight },
  deltaBehind: { backgroundColor: colors.greenLight },
  deltaTied: { backgroundColor: colors.surface2 },
  deltaTxt: { fontSize: 7, fontWeight: 700, color: colors.ink2, fontFamily: fonts.sans },
  alertRow: { flexDirection: "row", marginTop: 6 },
  alertSp: { marginRight: 8 },
  alertCard: {
    flex: 1,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.rule,
    minHeight: 76,
    overflow: "hidden",
  },
  alertWin: { backgroundColor: colors.greenLight, borderTopWidth: 3, borderTopColor: colors.green },
  alertRisk: { backgroundColor: colors.orangeLight, borderTopWidth: 3, borderTopColor: colors.orange },
  alertPri: { backgroundColor: colors.redLight, borderTopWidth: 3, borderTopColor: colors.red },
  alertPill: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  alertTitle: { fontSize: 10, fontWeight: 700, color: colors.ink, fontFamily: fonts.sans },
  alertDetail: { fontSize: 8, color: colors.ink2, marginTop: 4, lineHeight: 1.45, fontFamily: fonts.sans },
});

export function Page1Overview({ data }: { data: ReportData }) {
  const maxM = Math.max(...data.competitors.map((c) => c.mentions), 1);
  const clientM = data.competitors.find((c) => c.isClient)?.mentions ?? 0;

  const rankLine = `RANK #${data.rank} OF ${data.rankTotal}`;
  const statusUpper = String(data.status).toUpperCase();
  const leadingPill = data.rank === 1 ? "LEADING" : "CHALLENGER";

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={1} section="Page1:start" />
        <PdfHeader data={data} variant="cover" />
        <PdfTraceMarker page={1} section="Page1:after_header" />

        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <ScoreRing score={data.overallScore} />
          </View>
          <View style={styles.divider} />
          <View style={styles.heroRight}>
            <View style={[styles.kpiTile, { borderBottomColor: colors.cyan }]}>
              <Text style={[styles.kpiVal, { color: colors.cyan }]}>{data.mentionRate}%</Text>
              <Text style={styles.kpiLab}>Mention rate</Text>
            </View>
            <View style={[styles.kpiTile, { borderBottomColor: colors.violet }]}>
              <Text style={[styles.kpiVal, { color: colors.violet }]}>{data.topPosition}%</Text>
              <Text style={styles.kpiLab}>Top position</Text>
            </View>
            <View style={[styles.kpiTile, { borderBottomColor: colors.green }]}>
              <Text style={[styles.kpiVal, { color: colors.green }]}>{data.authorityScore}%</Text>
              <Text style={styles.kpiLab}>Authority</Text>
            </View>
          </View>
        </View>

        <View style={styles.pillRow}>
          <View style={[styles.pill, styles.pillSp, { backgroundColor: colors.orangeLight }]}>
            <Text style={[styles.pillTextBase, { color: colors.orange, fontWeight: 600 }]}>{statusUpper}</Text>
          </View>
          <View style={[styles.pill, styles.pillSp, { backgroundColor: colors.surface2 }]}>
            <Text style={[styles.pillTextBase, { color: colors.ink2, fontWeight: 700 }]}>{rankLine}</Text>
          </View>
          <View style={[styles.pill, styles.pillSp, { backgroundColor: colors.greenLight }]}>
            <Text style={[styles.pillTextBase, { color: colors.green, fontWeight: 600 }]}>{leadingPill}</Text>
          </View>
        </View>

        <View style={styles.calloutWrap} wrap={false}>
          <View style={styles.calloutBar} />
          <View style={styles.calloutInner}>
            <Text style={styles.calloutBody}>{data.bottomLine}</Text>
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
                style={[
                  styles.rankInner,
                  { backgroundColor: isClient ? colors.cyanLight : "transparent" },
                ]}
              >
                <Text style={styles.rankIdx}>{`#${c.rank}`}</Text>
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

        <View style={styles.alertRow}>
          <View style={[styles.alertCard, styles.alertWin, styles.alertSp]}>
            <View style={[styles.alertPill, { backgroundColor: colors.greenLight }]}>
              <Text style={{ fontSize: 7, fontWeight: 700, color: colors.green, fontFamily: fonts.sans }}>WIN</Text>
            </View>
            <Text style={styles.alertTitle}>{data.alerts.win.title}</Text>
            <Text style={styles.alertDetail}>{data.alerts.win.detail}</Text>
          </View>
          <View style={[styles.alertCard, styles.alertRisk, styles.alertSp]}>
            <View style={[styles.alertPill, { backgroundColor: colors.orangeLight }]}>
              <Text style={{ fontSize: 7, fontWeight: 700, color: colors.orange, fontFamily: fonts.sans }}>RISK</Text>
            </View>
            <Text style={styles.alertTitle}>{data.alerts.risk.title}</Text>
            <Text style={styles.alertDetail}>{data.alerts.risk.detail}</Text>
          </View>
          <View style={[styles.alertCard, styles.alertPri]}>
            <View style={[styles.alertPill, { backgroundColor: colors.redLight }]}>
              <Text style={{ fontSize: 7, fontWeight: 700, color: colors.red, fontFamily: fonts.sans }}>PRIORITY</Text>
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
