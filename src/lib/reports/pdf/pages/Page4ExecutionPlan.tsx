import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const PHASE_COL = ["#0EA5E9", "#F59E0B", "#7C3AED", "#10B981"] as const;

const COL_W = 129;
const GAP = 8;

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 400,
    color: colors.ink,
    marginBottom: rhythm.xs,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.2,
  },
  intro: {
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.ink3,
    marginBottom: rhythm.lg,
    fontFamily: fonts.sans,
  },
  timeline: { flexDirection: "row", alignItems: "flex-start", width: 540 },
  nodeCol: { width: COL_W, alignItems: "center" },
  weekLab: {
    fontSize: 7,
    fontWeight: 400,
    marginBottom: rhythm.xs,
    fontFamily: fonts.sansBold,
  },
  circleWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: rhythm.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.paper,
  },
  connector: {
    width: 1,
    height: 20,
    backgroundColor: colors.rule,
    marginBottom: rhythm.xs,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    minHeight: 118,
    width: COL_W,
    overflow: "hidden",
  },
  cardAccent: { width: 3 },
  cardBody: { flex: 1, paddingVertical: rhythm.md, paddingHorizontal: rhythm.sm },
  copy: { fontSize: 8.5, lineHeight: 1.58, color: colors.ink2, fontFamily: fonts.sans },
});

export function Page4ExecutionPlan({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={4} section="Page4:start" />
        <PdfHeader data={data} variant="inner" sectionSlug="Execution plan" pageNum={4} />
        <PdfTraceMarker page={4} section="Page4:after_header" />

        <Text style={styles.title}>30-DAY EXECUTION ROADMAP</Text>
        <Text style={styles.intro}>
          A practical sequence for the next month. Adjust dates to your operating cadence. Each phase
          builds on the last — complete discovery before scaling execution.
        </Text>

        <PdfTraceMarker page={4} section="Page4:before_phases" />
        <View style={styles.timeline}>
          {data.executionPhases.map((ph, i) => {
            const col = PHASE_COL[i % PHASE_COL.length];
            const phaseLine = String(ph.phase);
            const textLine = String(ph.text);
            const last = i === data.executionPhases.length - 1;
            return (
              <View key={`phase-${i}`} style={[styles.nodeCol, !last ? { marginRight: GAP } : {}]} wrap={false}>
                <Text style={[styles.weekLab, { color: col }]}>{phaseLine}</Text>
                <View style={[styles.circleWrap, { backgroundColor: col }]}>
                  <View style={styles.circleInner} />
                </View>
                <View style={styles.connector} />
                <View style={styles.card}>
                  <View style={[styles.cardAccent, { backgroundColor: col }]} />
                  <View style={styles.cardBody}>
                    <Text style={styles.copy}>{textLine}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <PdfTraceMarker page={4} section="Page4:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
