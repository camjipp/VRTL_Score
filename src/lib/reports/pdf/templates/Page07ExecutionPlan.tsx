import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { colors, fonts, CONTENT_W, space } from "../theme";
import { executionPlanIntro, executionPlanPurpose } from "../editorial/pdfNarrative";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { FixedInnerPage } from "../components/FixedInnerPage";
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
    marginBottom: 2,
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
    backgroundColor: colors.paper,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: space.cardPad - 8,
    paddingHorizontal: space.cardPad - 2,
  },
  stepHeader: {
    fontSize: 10,
    fontWeight: 400,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    letterSpacing: 0.02,
    marginBottom: 8,
  },
  stepHeaderLead: {
    fontSize: 11,
    marginBottom: 7,
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
    marginTop: 8,
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
  phasesWrap: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    minHeight: 0,
  },
});

/** PAGE 7 — Execution as a sequenced process. */
export function Page07ExecutionPlan({ data }: { data: ReportData }): ReactElement {
  const phases = data.executionPhases;
  return (
    <FixedInnerPage data={data} pageNum={7}>
      <PdfTraceMarker page={7} section="Fixed:P7" />
      <EditorialSectionHeader
        sectionLabel="Execution"
        title="How we fix it"
        purpose={executionPlanPurpose()}
        intro={executionPlanIntro()}
      />
      <View style={styles.phasesWrap}>
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
                <Text style={[styles.stepHeader, i === 0 ? styles.stepHeaderLead : {}]}>{header}</Text>
                <Text style={styles.blockLabel}>Action</Text>
                <Text style={styles.copy}>{main}</Text>
                {impact ? (
                  <View style={styles.impactBlock}>
                    <Text style={styles.impactLabel}>Checkpoint</Text>
                    <Text style={styles.impactText}>{impact}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </FixedInnerPage>
  );
}
