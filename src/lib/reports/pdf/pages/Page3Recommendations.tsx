import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const PRI_COL: Record<string, string> = {
  HIGH: colors.red,
  MEDIUM: colors.violet,
  LOW: colors.green,
};

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 10,
    fontWeight: 400,
    letterSpacing: 0.35,
    textTransform: "uppercase",
    color: colors.ink,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
  },
  intro: {
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.ink3,
    marginBottom: rhythm.md,
    fontFamily: fonts.sans,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    marginBottom: rhythm.lg,
    padding: 0,
    overflow: "hidden",
    minHeight: 108,
  },
  leftStripe: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rhythm.md,
  },
  stripeNum: { fontSize: 24, fontWeight: 400, color: colors.paper, fontFamily: fonts.sansBold },
  mid: { flex: 1, paddingVertical: rhythm.md, paddingHorizontal: rhythm.md, paddingRight: rhythm.sm },
  priPill: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 4,
    marginBottom: rhythm.sm,
  },
  priPillTxt: { fontSize: 6.5, fontWeight: 400, color: colors.paper, fontFamily: fonts.sansBold },
  title: { fontSize: 11, fontWeight: 400, color: colors.ink, marginBottom: rhythm.sm, fontFamily: fonts.sansBold },
  insight: { fontSize: 9, fontWeight: 400, marginBottom: rhythm.md, fontFamily: fonts.sansBold },
  micro: {
    fontSize: 6,
    fontWeight: 400,
    color: colors.ink4,
    letterSpacing: 0.35,
    marginBottom: 4,
    fontFamily: fonts.sansBold,
  },
  body: { fontSize: 8.5, lineHeight: 1.55, color: colors.ink2, fontFamily: fonts.sans },
  sep: { width: 1, backgroundColor: colors.rule },
  right: {
    width: 154,
    backgroundColor: colors.surface,
    paddingVertical: rhythm.md,
    paddingHorizontal: rhythm.md,
    justifyContent: "center",
  },
  outLabel: {
    fontSize: 6,
    fontWeight: 400,
    color: colors.ink4,
    letterSpacing: 0.4,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
  },
  outText: { fontSize: 9, fontWeight: 400, lineHeight: 1.45, fontFamily: fonts.sansBold },
});

export function Page3Recommendations({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={3} section="Page3:start" />
        <PdfHeader data={data} variant="inner" sectionSlug="Recommendations" pageNum={3} />
        <PdfTraceMarker page={3} section="Page3:after_header" />

        <Text style={styles.pageTitle}>Prioritized actions</Text>
        <Text style={styles.intro}>
          Ranked by urgency and leverage. Execute in order where resourcing allows.
        </Text>

        {data.recommendations.map((r, i) => {
          const pc = PRI_COL[r.priority] ?? colors.ink4;
          const titleLine = String(r.title);
          const insightLine = String(r.insight);
          const expLine = String(r.expectedOutcome);
          const actLine = String(r.action);
          const explLine = String(r.explanation);
          return (
            <View key={`rec-${r.priority}-${i}`} style={styles.card} wrap={false}>
              <View style={[styles.leftStripe, { backgroundColor: pc }]}>
                <Text style={styles.stripeNum}>{String(i + 1)}</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.mid}>
                <View style={[styles.priPill, { backgroundColor: pc }]}>
                  <Text style={styles.priPillTxt}>{`${r.priority} PRIORITY`}</Text>
                </View>
                <Text style={styles.title}>{titleLine}</Text>
                <Text style={[styles.insight, { color: pc }]}>{insightLine}</Text>
                <Text style={styles.micro}>WHY IT MATTERS</Text>
                <Text style={styles.body}>{explLine}</Text>
                <Text style={[styles.micro, { marginTop: rhythm.md }]}>RECOMMENDED ACTION</Text>
                <Text style={styles.body}>{actLine}</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.right}>
                <Text style={styles.outLabel}>EXPECTED OUTCOME</Text>
                <Text style={[styles.outText, { color: pc }]}>{expLine}</Text>
              </View>
            </View>
          );
        })}

        <PdfTraceMarker page={3} section="Page3:after_recommendations" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
