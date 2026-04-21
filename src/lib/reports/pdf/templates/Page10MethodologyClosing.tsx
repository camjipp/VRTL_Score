import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { colors, fonts, rhythm, BODY_MAX_W, space } from "../theme";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const styles = StyleSheet.create({
  methodSection: {
    marginBottom: 0,
  },
  methodKicker: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
  },
  methodSub: {
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.ink2,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
    marginBottom: rhythm.sm,
  },
  method: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    padding: space.cardPad,
  },
  methodTitle: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.ink3,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
  },
  methodBody: {
    fontSize: 9.5,
    lineHeight: 1.68,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  strip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    borderTopWidth: 3,
    borderTopColor: colors.cyan,
    backgroundColor: colors.surface,
    paddingVertical: space.cardPad,
    paddingHorizontal: space.cardPad,
    marginBottom: 0,
  },
  stripTitle: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    color: colors.ink3,
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
    fontSize: 17,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    lineHeight: 1.2,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surface2,
    padding: space.cardPad,
  },
  nextTitle: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.12,
    color: colors.ink3,
    textTransform: "uppercase",
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
  },
  nextBody: {
    fontSize: 10,
    lineHeight: 1.65,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  nextPlaceholder: {
    fontSize: 9,
    color: colors.ink3,
    fontFamily: fonts.sans,
    lineHeight: 1.55,
  },
  threeUp: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 0,
  },
});

/** PAGE 10 — Methodology + closing (fixed template). */
export function Page10MethodologyClosing({ data }: { data: ReportData }): ReactElement {
  const next =
    data.recommendedNextStepsVisible !== false && data.recommendedNextSteps?.trim()
      ? data.recommendedNextSteps.trim()
      : "";
  const methodology = data.methodology?.trim() ?? "";

  return (
    <FixedInnerPage data={data} pageNum={10} pagePaddingTop={100}>
      <PdfTraceMarker page={10} section="Fixed:P10" />
      <View style={styles.threeUp}>
        {methodology ? (
          <View style={styles.methodSection}>
            <Text style={styles.methodKicker}>Methodology</Text>
            <Text style={styles.methodSub}>How this snapshot was produced and how to read the tables.</Text>
            <View style={styles.method}>
              <Text style={styles.methodTitle}>Overview</Text>
              <Text style={styles.methodBody}>{methodology}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.strip}>
          <Text style={styles.stripTitle}>Run summary</Text>
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
              <Text style={[styles.statVal, { fontSize: 12, lineHeight: 1.35 }]}>{data.date}</Text>
              <Text style={styles.statLab}>Report date</Text>
            </View>
          </View>
        </View>

        <View style={styles.nextBlock}>
          <Text style={styles.nextTitle}>What happens next</Text>
          {next ? (
            <Text style={styles.nextBody}>{next}</Text>
          ) : (
            <Text style={styles.nextPlaceholder}>
              Your agency will align the next sprint to the priorities above and re-measure on the following snapshot.
            </Text>
          )}
        </View>
      </View>
    </FixedInnerPage>
  );
}
