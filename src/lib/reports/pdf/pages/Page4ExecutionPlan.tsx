import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const PHASE_COL = ["#0EA5E9", "#F59E0B", "#7C3AED", "#10B981"] as const;

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 400,
    color: colors.ink,
    marginBottom: 6,
    fontFamily: fonts.sansBold,
  },
  intro: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.ink2,
    marginBottom: 16,
    fontFamily: fonts.sans,
  },
  timeline: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8, width: 540 },
  nodeCol: { width: 129, alignItems: "center", marginRight: 8 },
  weekLab: { fontSize: 7, fontWeight: 400, color: colors.ink4, marginBottom: 4, fontFamily: fonts.sansBold },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 4,
  },
  connector: { width: 2, flex: 1, minHeight: 24, backgroundColor: colors.surface2 },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    padding: 14,
    marginTop: 4,
    width: 129,
    overflow: "hidden",
  },
  phaseTitle: { fontSize: 8, fontWeight: 400, color: colors.ink, marginBottom: 6, fontFamily: fonts.sansBold },
  copy: { fontSize: 8.5, lineHeight: 1.5, color: colors.ink2, fontFamily: fonts.sans },
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
            return (
              <View key={`phase-${i}`} style={styles.nodeCol} wrap={false}>
                <Text style={styles.weekLab}>{phaseLine}</Text>
                <View style={[styles.circle, { backgroundColor: col }]} />
                <View style={[styles.connector, { backgroundColor: col, opacity: 0.35, maxHeight: 20 }]} />
                <View style={styles.card}>
                  <Text style={styles.phaseTitle}>{phaseLine}</Text>
                  <Text style={styles.copy}>{textLine}</Text>
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
