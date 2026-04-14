import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, baseStyles, CONTENT_W, space } from "../theme";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const STEP_HEADERS = [
  "STEP 1 — AUDIT FOUNDATION",
  "STEP 2 — FIX WEAKEST MODEL",
  "STEP 3 — BUILD AUTHORITY",
  "STEP 4 — RE-MEASURE & ITERATE",
] as const;

const LEFT_ACCENT_W = 3;

function stripPhasePrefix(phase: string, text: string): string {
  const p = phase.trim();
  const t = text.trim();
  if (!p || !t) return t;
  if (!t.toLowerCase().startsWith(p.toLowerCase())) return t;
  let rest = t.slice(p.length).trim();
  rest = rest.replace(/^[\s:–—\-]+/, "").trim();
  return rest.length > 0 ? rest : t;
}

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
  stepSection: {
    width: CONTENT_W,
    flexDirection: "row",
    marginBottom: space.block,
  },
  stepSectionLast: {
    marginBottom: 0,
  },
  accentBar: {
    width: LEFT_ACCENT_W,
    backgroundColor: colors.ink,
    borderRadius: 1,
  },
  stepCard: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderLeftWidth: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingVertical: space.cardPad,
    paddingHorizontal: space.cardPad,
  },
  stepHeader: {
    fontSize: 10,
    fontWeight: 400,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    letterSpacing: 0.02,
    marginBottom: 10,
  },
  blockLabel: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    color: colors.ink3,
    textTransform: "uppercase",
    letterSpacing: 0.12,
    marginBottom: 6,
  },
  copy: {
    fontSize: 9,
    lineHeight: 1.68,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: CONTENT_W - 40,
  },
  impactBlock: {
    marginTop: 12,
  },
  impactLabel: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    color: colors.ink3,
    textTransform: "uppercase",
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  impactText: {
    fontSize: 8.5,
    lineHeight: 1.58,
    color: colors.ink2,
    fontFamily: fonts.sans,
    maxWidth: CONTENT_W - 40,
  },
});

export function Page4ExecutionPlan({ data }: { data: ReportData }) {
  const phases = data.executionPhases;
  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={5} section="Page4:start" />
        <PdfHeader data={data} variant="inner" pageNum={5} />
        <PdfTraceMarker page={5} section="Page4:after_header" />

        <ChapterTitle
          title="Execution plan"
          subtitle="How we operationalize this snapshot—discovery, rebuild, proof, then measured iteration."
        />

        <PdfTraceMarker page={5} section="Page4:before_phases" />
        <View>
          {phases.map((ph, i) => {
            const phaseLine = String(ph.phase);
            const textLine = stripPhasePrefix(phaseLine, String(ph.text));
            const { main, impact } = splitImpact(textLine);
            const header = STEP_HEADERS[i] ?? `STEP ${i + 1}`;
            const last = i === phases.length - 1;
            return (
              <View key={`phase-${i}`} style={[styles.stepSection, last ? styles.stepSectionLast : {}]}>
                <View style={styles.accentBar} />
                <View style={styles.stepCard}>
                  <Text style={styles.stepHeader}>{header}</Text>
                  <Text style={styles.blockLabel}>What we execute</Text>
                  <Text style={styles.copy}>{main}</Text>
                  {impact ? (
                    <View style={styles.impactBlock}>
                      <Text style={styles.impactLabel}>How we measure it</Text>
                      <Text style={styles.impactText}>{impact}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <PdfTraceMarker page={5} section="Page4:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
