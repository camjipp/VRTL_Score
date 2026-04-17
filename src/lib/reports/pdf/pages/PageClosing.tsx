import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, BODY_MAX_W, space } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
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
    marginBottom: rhythm.lg,
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
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surface2,
    padding: space.cardPad,
    minHeight: 220,
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
});

/** Final slide — run summary strip (responses, confidence, report date) + optional “What happens next”. */
export function PageClosing({ data }: { data: ReportData }) {
  const next =
    data.recommendedNextStepsVisible !== false && data.recommendedNextSteps?.trim()
      ? data.recommendedNextSteps.trim()
      : "";

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={7} section="Closing:start" />
        <PdfHeader data={data} variant="inner" pageNum={7} />
        <View style={styles.shell}>
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
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
