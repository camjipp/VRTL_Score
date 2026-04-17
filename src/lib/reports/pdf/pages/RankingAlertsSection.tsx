import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { colors, fonts, rhythm, space } from "../theme";

/** Inner row columns sum to 537 (540 − 3pt accent rail) */
const W = { rank: 30, name: 116, bar: 231, count: 66, pill: 91 } as const;

const styles = StyleSheet.create({
  rankHeader: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.ink3,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    marginBottom: rhythm.sm,
    marginTop: rhythm.sm,
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
    minHeight: 64,
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

/** Competitive ranking + WIN / RISK / PRIORITY — used on the dedicated snapshot slide. */
export function RankingAlertsSection({ data }: { data: ReportData }) {
  const maxM = Math.max(...data.competitors.map((c) => c.mentions), 1);
  const clientM = data.competitors.find((c) => c.isClient)?.mentions ?? 0;

  return (
    <View>
      <Text style={styles.rankHeader}>Competitive ranking</Text>
      {data.competitors.map((c) => {
        const widthPct = Math.min(100, Math.max(0, Math.round((c.mentions / maxM) * 100)));
        const barRest = Math.max(0, 100 - widthPct);
        const delta = c.isClient ? null : c.mentions - clientM;
        const deltaStr =
          delta === null ? "" : delta === 0 ? "0" : delta > 0 ? `+${delta}` : String(delta);
        const isClient = !!c.isClient;
        return (
          <View key={`rank-${c.name}`} style={styles.rankOuter}>
            <View style={[styles.rankAccent, { backgroundColor: isClient ? colors.cyan : "transparent" }]} />
            <View style={[styles.rankInner, { backgroundColor: isClient ? colors.cyanLight : "transparent" }]}>
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
                    style={[{ flex: widthPct <= 0 ? 0 : widthPct }, isClient ? styles.barFill : styles.barFillNeu]}
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
    </View>
  );
}
