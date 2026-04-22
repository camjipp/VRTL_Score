import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { colors, fonts, rhythm, space, CONTENT_W } from "../theme";

/** Inner row columns — 3pt accent rail; widths sum to `CONTENT_W` − 3 */
const INNER_W = CONTENT_W - 3;
const W = {
  rank: 29,
  name: 111,
  bar: 221,
  count: 63,
  pill: INNER_W - 29 - 111 - 221 - 63,
} as const;

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
    width: CONTENT_W,
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
  alertRow: { flexDirection: "row", marginTop: 40, alignItems: "stretch" },
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
  /** Opening page: tighter WIN/RISK/PRIORITY strip */
  alertRowCompact: { flexDirection: "row", marginTop: rhythm.md, alignItems: "stretch" },
  alertCardCompact: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: space.cardPad - 6,
    paddingHorizontal: space.cardPad - 4,
    borderWidth: 1,
    borderColor: colors.rule,
    minHeight: 0,
    overflow: "hidden",
  },
  alertTitleCompact: {
    fontSize: 8.5,
    fontWeight: 400,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    lineHeight: 1.22,
  },
  alertDetailCompact: {
    fontSize: 7,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 1.55,
    fontFamily: fonts.sans,
  },
  /** Opening page — tier-3 strip: lighter shells than default WIN/RISK/PRIORITY */
  alertRowSecondary: {
    flexDirection: "row",
    marginTop: rhythm.sm + 2,
    alignItems: "stretch",
  },
  alertCardSecondary: {
    flex: 1,
    borderRadius: 5,
    paddingVertical: space.cardPad - 8,
    paddingHorizontal: space.cardPad - 6,
    borderWidth: 1,
    borderColor: colors.rule,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: colors.paper,
  },
  alertWinSecondary: { borderTopWidth: 1, borderTopColor: colors.green },
  alertRiskSecondary: { borderTopWidth: 1, borderTopColor: colors.orange },
  alertPriSecondary: { borderTopWidth: 1, borderTopColor: colors.red },
  alertTitleSecondary: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.ink2,
    fontFamily: fonts.sansBold,
    lineHeight: 1.2,
  },
  alertDetailSecondary: {
    fontSize: 6.5,
    color: colors.ink3,
    marginTop: 5,
    lineHeight: 1.48,
    fontFamily: fonts.sans,
  },
});

/** Ranked competitor rows + mini-bars (no WIN/RISK row). */
export function CompetitiveRankingBlock({
  data,
  emphasis = "default",
}: {
  data: ReportData;
  /** Page 2 focal: slightly larger type and row rhythm. */
  emphasis?: "default" | "focal";
}) {
  const maxM = Math.max(...data.competitors.map((c) => c.mentions), 1);
  const clientM = data.competitors.find((c) => c.isClient)?.mentions ?? 0;
  const focal = emphasis === "focal";

  return (
    <View>
      <Text style={[styles.rankHeader, focal ? { fontSize: 9, marginBottom: rhythm.sm + 2, marginTop: rhythm.sm + 2 } : {}]}>
        Competitive ranking
      </Text>
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
            <View
              style={[
                styles.rankInner,
                { backgroundColor: isClient ? colors.cyanLight : "transparent" },
                focal ? { paddingVertical: 9 } : {},
              ]}
            >
              <Text
                style={[
                  styles.rankIdx,
                  isClient ? {} : { color: colors.ink4, fontFamily: fonts.sans },
                  focal ? { fontSize: 9 } : {},
                ]}
              >{`#${c.rank}`}</Text>
              <Text style={[isClient ? styles.rankNameClient : styles.rankName, focal ? { fontSize: isClient ? 9.5 : 9 } : {}]}>{c.name}</Text>
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
    </View>
  );
}

/** WIN / RISK / PRIORITY strip — pair with {@link CompetitiveRankingBlock}. */
export function WinRiskPriorityAlerts({
  data,
  alertRowStyle,
  compact,
  visualTier = "default",
}: {
  data: ReportData;
  /** e.g. `{ marginTop: 0 }` when a flex spacer already separates this row from the ranking block. */
  alertRowStyle?: { marginTop?: number };
  /** Tighter typography for the opening page. */
  compact?: boolean;
  /** `secondary` — tier-3 strip on page 1 (lighter than compact WIN/RISK). */
  visualTier?: "default" | "secondary";
}) {
  const secondary = visualTier === "secondary";
  const rowStyle = secondary
    ? styles.alertRowSecondary
    : compact
      ? styles.alertRowCompact
      : styles.alertRow;
  const card = secondary
    ? styles.alertCardSecondary
    : compact
      ? styles.alertCardCompact
      : styles.alertCard;
  const winExtra = secondary ? styles.alertWinSecondary : styles.alertWin;
  const riskExtra = secondary ? styles.alertRiskSecondary : styles.alertRisk;
  const priExtra = secondary ? styles.alertPriSecondary : styles.alertPri;
  const titleS = secondary
    ? styles.alertTitleSecondary
    : compact
      ? styles.alertTitleCompact
      : styles.alertTitle;
  const detailS = secondary
    ? styles.alertDetailSecondary
    : compact
      ? styles.alertDetailCompact
      : styles.alertDetail;
  const pillFs = secondary ? 6 : 6.5;
  return (
    <View style={[rowStyle, ...(alertRowStyle ? [alertRowStyle] : [])]}>
      <View style={[card, winExtra, styles.alertSp]}>
        <View style={[styles.alertPill, { backgroundColor: colors.paper, borderColor: colors.green }]}>
          <Text style={{ fontSize: pillFs, fontWeight: 400, color: colors.green, fontFamily: fonts.sansBold }}>WIN</Text>
        </View>
        <Text style={titleS}>{data.alerts.win.title}</Text>
        <Text style={detailS}>{data.alerts.win.detail}</Text>
      </View>
      <View style={[card, riskExtra, styles.alertSp]}>
        <View style={[styles.alertPill, { backgroundColor: colors.paper, borderColor: colors.orange }]}>
          <Text style={{ fontSize: pillFs, fontWeight: 400, color: colors.orange, fontFamily: fonts.sansBold }}>RISK</Text>
        </View>
        <Text style={titleS}>{data.alerts.risk.title}</Text>
        <Text style={detailS}>{data.alerts.risk.detail}</Text>
      </View>
      <View style={[card, priExtra]}>
        <View style={[styles.alertPill, { backgroundColor: colors.paper, borderColor: colors.red }]}>
          <Text style={{ fontSize: pillFs, fontWeight: 400, color: colors.red, fontFamily: fonts.sansBold }}>PRIORITY</Text>
        </View>
        <Text style={titleS}>{data.alerts.priority.title}</Text>
        <Text style={detailS}>{data.alerts.priority.detail}</Text>
      </View>
    </View>
  );
}

/** Competitive ranking + WIN / RISK / PRIORITY — used on the dedicated snapshot slide. */
export function RankingAlertsSection({ data }: { data: ReportData }) {
  return (
    <View style={{ flex: 1, flexDirection: "column", justifyContent: "space-between", minHeight: 0 }}>
      <CompetitiveRankingBlock data={data} />
      <WinRiskPriorityAlerts data={data} alertRowStyle={{ marginTop: 0 }} />
    </View>
  );
}
