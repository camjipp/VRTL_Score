import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const PHASE_NODE = colors.ink3;

const COL_W = 129;
const GAP = 8;

/** Avoid repeating the phase label when the body text starts with the same week string. */
function stripPhasePrefix(phase: string, text: string): string {
  const p = phase.trim();
  const t = text.trim();
  if (!p || !t) return t;
  if (!t.toLowerCase().startsWith(p.toLowerCase())) return t;
  let rest = t.slice(p.length).trim();
  rest = rest.replace(/^[\s:–—\-]+/, "").trim();
  return rest.length > 0 ? rest : t;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: 400,
    color: colors.ink,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.06,
  },
  intro: {
    fontSize: 9,
    lineHeight: 1.62,
    color: colors.ink3,
    marginBottom: rhythm.xl,
    fontFamily: fonts.sans,
  },
  timeline: { flexDirection: "row", alignItems: "flex-start", width: 540 },
  nodeCol: { width: COL_W, alignItems: "center" },
  weekLab: {
    fontSize: 7.5,
    fontWeight: 400,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    textAlign: "center",
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
    borderRadius: 4,
    minHeight: 128,
    width: COL_W,
    overflow: "hidden",
  },
  cardAccent: { width: 3 },
  cardBody: { flex: 1, paddingVertical: rhythm.md, paddingHorizontal: rhythm.sm },
  copy: { fontSize: 8.5, lineHeight: 1.62, color: colors.ink2, fontFamily: fonts.sans },
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
        <View style={styles.timeline} wrap={false} minPresenceAhead={200}>
          {data.executionPhases.map((ph, i) => {
            const col = PHASE_NODE;
            const phaseLine = String(ph.phase);
            const textLine = stripPhasePrefix(phaseLine, String(ph.text));
            const last = i === data.executionPhases.length - 1;
            return (
              <View key={`phase-${i}`} style={[styles.nodeCol, !last ? { marginRight: GAP } : {}]} wrap={false}>
                <Text style={styles.weekLab}>{phaseLine}</Text>
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
