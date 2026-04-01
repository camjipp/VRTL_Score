import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { colors, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: space.section,
    gap: 20,
  },
  scoreBlock: {
    minWidth: 120,
  },
  scoreNum: {
    fontSize: 56,
    fontWeight: 700,
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: 1,
  },
  scoreSuffix: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: 500,
  },
  statusChip: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    backgroundColor: colors.card,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 1,
    color: colors.text,
    textTransform: "uppercase",
  },
  rankText: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 1.45,
    color: colors.textSecondary,
  },
  rankStrong: {
    color: colors.text,
    fontWeight: 600,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: space.section,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: space.cardPad,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.text,
  },
  kpiLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  execBlock: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 18,
    marginBottom: space.section,
  },
  execLabel: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 1.2,
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  execBody: {
    fontSize: 11.5,
    lineHeight: 1.58,
    color: colors.textSecondary,
  },
  tension: {
    fontSize: 10,
    lineHeight: 1.55,
    color: colors.textSecondary,
    marginBottom: space.section,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.warning,
  },
  rankHeader: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankIdx: { width: 28, fontSize: 9, color: colors.textSecondary, fontWeight: 600 },
  rankName: { width: 110, fontSize: 10, color: colors.textSecondary },
  rankNameClient: { width: 110, fontSize: 10, color: colors.text, fontWeight: 600 },
  barWrap: { flex: 1, height: 6, backgroundColor: colors.barTrack, borderRadius: 3, marginHorizontal: 8 },
  barFill: { height: 6, backgroundColor: colors.barFill, borderRadius: 3 },
  barFillClient: { height: 6, backgroundColor: colors.accent, borderRadius: 3, opacity: 0.9 },
  rankCount: { width: 52, fontSize: 9, color: colors.textSecondary, textAlign: "right" },
  pill: {
    width: 40,
    alignItems: "flex-end",
  },
  pillInner: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  pillText: { fontSize: 7, fontWeight: 600, color: colors.textSecondary },
  alertRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  alertCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: space.cardPad,
    minHeight: 72,
  },
  alertWin: { borderLeftWidth: 2, borderLeftColor: colors.success },
  alertRisk: { borderLeftWidth: 2, borderLeftColor: colors.danger },
  alertPri: { borderLeftWidth: 2, borderLeftColor: colors.accent },
  alertLabel: {
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  alertTitle: { fontSize: 10, fontWeight: 600, color: colors.text, lineHeight: 1.35 },
  alertDetail: { fontSize: 9, color: colors.textSecondary, marginTop: 5, lineHeight: 1.45 },
});

export function Page1Overview({ data }: { data: ReportData }) {
  const maxM = Math.max(...data.competitors.map((c) => c.mentions), 1);
  const clientM = data.competitors.find((c) => c.isClient)?.mentions ?? 0;

  return (
    <Page size="A4" style={baseStyles.page}>
      <PdfTraceMarker page={1} section="Page1:start" />
      <PdfHeader data={data} variant="cover" />
      <PdfTraceMarker page={1} section="Page1:after_header" />

      <View style={styles.heroRow}>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreNum}>{data.overallScore ?? "—"}</Text>
          <Text style={styles.scoreSuffix}>/ 100</Text>
          <View style={styles.statusChip}>
            <Text style={styles.statusText}>{data.status}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rankText}>
            Rank <Text style={styles.rankStrong}>#{data.rank}</Text> of {data.rankTotal} tracked
          </Text>
        </View>
      </View>
      <PdfTraceMarker page={1} section="Page1:after_hero" />

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{data.mentionRate}%</Text>
          <Text style={styles.kpiLabel}>Mention rate</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{data.topPosition}%</Text>
          <Text style={styles.kpiLabel}>Top position</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{data.authorityScore}%</Text>
          <Text style={styles.kpiLabel}>Authority</Text>
        </View>
      </View>
      <PdfTraceMarker page={1} section="Page1:after_kpi" />

      {data.tensionNote ? <Text style={styles.tension}>{data.tensionNote}</Text> : null}

      <View style={styles.execBlock}>
        <Text style={styles.execLabel}>Bottom line</Text>
        <Text style={styles.execBody}>{data.bottomLine}</Text>
      </View>
      <PdfTraceMarker page={1} section="Page1:after_bottom_line" />

      <Text style={styles.rankHeader}>Competitive ranking</Text>
      {data.competitors.map((c) => {
        const widthPct = Math.round((c.mentions / maxM) * 100);
        const delta = c.isClient ? "" : c.mentions - clientM;
        const deltaStr = delta === "" ? "" : delta > 0 ? `+${delta}` : String(delta);
        return (
          <View key={c.name} style={styles.rankRow} wrap={false}>
            <Text style={styles.rankIdx}>#{c.rank}</Text>
            <Text style={c.isClient ? styles.rankNameClient : styles.rankName}>{c.name}</Text>
            <View style={styles.barWrap}>
              <View style={[c.isClient ? styles.barFillClient : styles.barFill, { width: `${widthPct}%` }]} />
            </View>
            <Text style={styles.rankCount}>
              {c.mentions}/{data.meta.responses}
            </Text>
            <View style={styles.pill}>
              {deltaStr !== "" ? (
                <View style={styles.pillInner}>
                  <Text style={styles.pillText}>{deltaStr}</Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
      <PdfTraceMarker page={1} section="Page1:after_ranking" />

      <View style={styles.alertRow}>
        <View style={[styles.alertCard, styles.alertWin]}>
          <Text style={styles.alertLabel}>Win</Text>
          <Text style={styles.alertTitle}>{data.alerts.win.title}</Text>
          <Text style={styles.alertDetail}>{data.alerts.win.detail}</Text>
        </View>
        <View style={[styles.alertCard, styles.alertRisk]}>
          <Text style={styles.alertLabel}>Risk</Text>
          <Text style={styles.alertTitle}>{data.alerts.risk.title}</Text>
          <Text style={styles.alertDetail}>{data.alerts.risk.detail}</Text>
        </View>
        <View style={[styles.alertCard, styles.alertPri]}>
          <Text style={styles.alertLabel}>Priority</Text>
          <Text style={styles.alertTitle}>{data.alerts.priority.title}</Text>
          <Text style={styles.alertDetail}>{data.alerts.priority.detail}</Text>
        </View>
      </View>
      <PdfTraceMarker page={1} section="Page1:before_footer" />

      <PdfFooter data={data} />
    </Page>
  );
}
