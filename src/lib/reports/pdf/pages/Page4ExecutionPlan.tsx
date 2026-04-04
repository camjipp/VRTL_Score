import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const PHASE_NODE = colors.ink3;

const COL_W = 132;
const GAP = 11;

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

/** Presentation-only: optional “Expected impact” from first sentence break or legacy em-dash split. */
function splitImpact(text: string): { main: string; impact: string | null } {
  const t = text.trim();
  const m = t.split(/\s+[—–]\s+/);
  if (m.length >= 2) {
    return { main: m[0]!.trim(), impact: m.slice(1).join(" ").trim() || null };
  }
  const dot = t.indexOf(". ");
  if (dot > 0 && dot < t.length - 2) {
    const first = t.slice(0, dot + 1).trim();
    const second = t.slice(dot + 2).trim();
    if (second.length > 0) return { main: first, impact: second };
  }
  return { main: t, impact: null };
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: colors.ink2,
    marginBottom: rhythm.lg,
    fontFamily: fonts.sans,
  },
  timeline: { flexDirection: "row", alignItems: "flex-start", width: 540, flexGrow: 1 },
  nodeCol: { width: COL_W, alignItems: "center" },
  stepLab: {
    fontSize: 9.5,
    fontWeight: 400,
    marginBottom: 10,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    textAlign: "center",
    letterSpacing: 0.02,
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
    height: 26,
    backgroundColor: colors.rule,
    marginBottom: rhythm.xs,
  },
  card: {
    flexDirection: "column",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    minHeight: 152,
    width: COL_W,
    overflow: "hidden",
  },
  cardAccent: { width: "100%", height: 3 },
  cardBody: { flex: 1, paddingVertical: 14, paddingHorizontal: rhythm.sm },
  copy: { fontSize: 8.5, lineHeight: 1.6, color: colors.ink, fontFamily: fonts.sans },
  impactLabel: {
    fontSize: 6,
    fontFamily: fonts.sansBold,
    color: colors.ink3,
    marginTop: rhythm.sm,
    textTransform: "uppercase",
    letterSpacing: 0.08,
  },
  impactText: {
    fontSize: 7.5,
    lineHeight: 1.45,
    color: colors.ink2,
    marginTop: 3,
    fontFamily: fonts.sans,
  },
  spacer: { flexGrow: 1, minHeight: 24 },
});

export function Page4ExecutionPlan({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={[baseStyles.pageBody, { flexGrow: 1 }]}>
        <PdfTraceMarker page={4} section="Page4:start" />
        <PdfHeader data={data} variant="inner" pageNum={4} />
        <PdfTraceMarker page={4} section="Page4:after_header" />

        <ChapterTitle title="Execution Plan" />
        <Text style={styles.intro}>
          Four weeks, sequenced. Adjust dates to your cadence. Lock discovery before you scale execution.
        </Text>

        <PdfTraceMarker page={4} section="Page4:before_phases" />
        <View style={styles.timeline} wrap={false} minPresenceAhead={200}>
          {data.executionPhases.map((ph, i) => {
            const col = PHASE_NODE;
            const phaseLine = String(ph.phase);
            const textLine = stripPhasePrefix(phaseLine, String(ph.text));
            const { main, impact } = splitImpact(textLine);
            const last = i === data.executionPhases.length - 1;
            return (
              <View key={`phase-${i}`} style={[styles.nodeCol, !last ? { marginRight: GAP } : {}]} wrap={false}>
                <Text style={styles.stepLab}>{`Step ${i + 1}`}</Text>
                <View style={[styles.circleWrap, { backgroundColor: col }]}>
                  <View style={styles.circleInner} />
                </View>
                <View style={styles.connector} />
                <View style={styles.card}>
                  <View style={[styles.cardAccent, { backgroundColor: col }]} />
                  <View style={styles.cardBody}>
                    <Text style={styles.copy}>{main}</Text>
                    {impact ? (
                      <>
                        <Text style={styles.impactLabel}>Impact</Text>
                        <Text style={styles.impactText}>{impact}</Text>
                      </>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <PdfTraceMarker page={4} section="Page4:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
