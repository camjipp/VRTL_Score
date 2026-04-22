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
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    paddingVertical: space.cardPad - 4,
    paddingHorizontal: 0,
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
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    borderTopWidth: 3,
    borderTopColor: colors.cyan,
    backgroundColor: colors.paper,
    paddingVertical: space.cardPad + 2,
    paddingHorizontal: 0,
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
    marginTop: rhythm.md + 2,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    backgroundColor: colors.paper,
    paddingVertical: space.cardPad - 2,
    paddingHorizontal: 0,
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
        sectionLabel="Confidence"
        title="What happens now—and why you can trust this"
        purpose={closingPurpose()}
        intro="Methodology, sample strength, and the forward rhythm after delivery—so this reads as an operating cadence, not a one-off deck."
        density="tight"
      />
      <View style={{ flex: 1, minHeight: 0 }}>
        <View style={styles.closingStack}>
          <View style={styles.strip}>
            <Text style={styles.stripTitle}>Sample strength & confidence</Text>
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
            <Text style={styles.nextTitle}>Forward program</Text>
            {next ? (
              <Text style={styles.nextBody}>{next}</Text>
            ) : (
              <Text style={styles.nextPlaceholder}>
                Ship the priorities above, re-run the snapshot, and lock the next 30-day sprint from the delta.
              </Text>
            )}
          </View>

          {methodology ? (
            <View style={styles.methodSection}>
              <Text style={styles.methodKicker}>Methodology</Text>
              <Text style={styles.methodSub}>How we produced this snapshot—and how to read the scorecard without overfitting a single answer.</Text>
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
