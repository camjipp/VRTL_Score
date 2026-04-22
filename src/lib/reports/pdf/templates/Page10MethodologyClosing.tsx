import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { colors, fonts, rhythm, BODY_MAX_W, space } from "../theme";
import { closingPurpose } from "../editorial/pdfNarrative";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const styles = StyleSheet.create({
  methodSection: {
    marginTop: rhythm.md,
    marginBottom: 0,
  },
  methodKicker: {
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: rhythm.sm - 2,
    fontFamily: fonts.sansBold,
  },
  methodSub: {
    fontSize: 8,
    lineHeight: 1.5,
    color: colors.ink3,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
    marginBottom: rhythm.sm - 2,
  },
  method: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    paddingVertical: space.cardPad - 4,
    paddingHorizontal: space.cardPad - 2,
  },
  methodTitle: {
    fontSize: 7,
    fontWeight: 400,
    color: colors.ink4,
    marginBottom: rhythm.sm - 2,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
  },
  methodBody: {
    fontSize: 8.5,
    lineHeight: 1.58,
    color: colors.ink3,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  strip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    borderTopWidth: 4,
    borderTopColor: colors.cyan,
    backgroundColor: colors.surface,
    paddingVertical: space.cardPad + 2,
    paddingHorizontal: space.cardPad,
    marginBottom: 0,
  },
  stripTitle: {
    fontSize: 7.5,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    color: colors.ink2,
    marginBottom: rhythm.md,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    width: "100%",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: rhythm.xs,
  },
  statVsep: {
    width: 1,
    backgroundColor: colors.rule,
    alignSelf: "stretch",
    marginVertical: 2,
  },
  statVal: {
    fontSize: 22,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    lineHeight: 1.15,
    textAlign: "center",
  },
  statLab: {
    fontSize: 6.5,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.1,
    fontFamily: fonts.sansBold,
    color: colors.ink3,
    textAlign: "center",
  },
  nextBlock: {
    marginTop: rhythm.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surface2,
    paddingVertical: space.cardPad - 2,
    paddingHorizontal: space.cardPad - 2,
  },
  nextTitle: {
    fontSize: 7.5,
    fontWeight: 400,
    letterSpacing: 0.12,
    color: colors.ink4,
    textTransform: "uppercase",
    marginBottom: rhythm.sm - 2,
    fontFamily: fonts.sansBold,
  },
  nextBody: {
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.ink2,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  nextPlaceholder: {
    fontSize: 8.5,
    color: colors.ink3,
    fontFamily: fonts.sans,
    lineHeight: 1.5,
  },
  closingStack: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    minHeight: 0,
  },
});

/** PAGE 10 — Methodology, confidence, and forward motion. */
export function Page10MethodologyClosing({ data }: { data: ReportData }): ReactElement {
  const next =
    data.recommendedNextStepsVisible !== false && data.recommendedNextSteps?.trim()
      ? data.recommendedNextSteps.trim()
      : "";
  const methodology = data.methodology?.trim() ?? "";

  return (
    <FixedInnerPage data={data} pageNum={10} pagePaddingTop={90}>
      <PdfTraceMarker page={10} section="Fixed:P10" />
      <EditorialSectionHeader
        sectionLabel="Closing"
        title="How we measured this & what happens next"
        purpose={closingPurpose()}
        intro="Clear method. Clear confidence. Clear next move."
        density="tight"
      />
      <View style={{ flex: 1, minHeight: 0 }}>
        <View style={styles.closingStack}>
          <View style={styles.strip}>
            <Text style={styles.stripTitle}>Run summary & confidence</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{String(data.meta.responses)}</Text>
                <Text style={styles.statLab}>Responses</Text>
              </View>
              <View style={styles.statVsep} />
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{String(data.meta.confidence)}</Text>
                <Text style={styles.statLab}>Confidence</Text>
              </View>
              <View style={styles.statVsep} />
              <View style={styles.statCol}>
                <Text style={[styles.statVal, { fontSize: 13, lineHeight: 1.35 }]}>{data.date}</Text>
                <Text style={styles.statLab}>Report date</Text>
              </View>
            </View>
          </View>

          <View style={styles.nextBlock}>
            <Text style={styles.nextTitle}>What happens next</Text>
            {next ? (
              <Text style={styles.nextBody}>{next}</Text>
            ) : (
              <Text style={styles.nextPlaceholder}>Execute priorities, re-measure, and lock the next sprint.</Text>
            )}
          </View>

          {methodology ? (
            <View style={styles.methodSection}>
              <Text style={styles.methodKicker}>Methodology</Text>
              <Text style={styles.methodSub}>How this snapshot was produced and how to read the scorecard fairly.</Text>
              <View style={styles.method}>
                <Text style={styles.methodTitle}>Overview</Text>
                <Text style={styles.methodBody}>{methodology}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </FixedInnerPage>
  );
}
