import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, baseStyles } from "../theme";
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
    letterSpacing: 0.65,
    textTransform: "uppercase",
    color: colors.ink,
    marginBottom: 8,
    fontFamily: fonts.sansBold,
  },
  intro: { fontSize: 9, lineHeight: 1.55, color: colors.ink2, marginBottom: 12, fontFamily: fonts.sans },
  card: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    marginBottom: 12,
    padding: 0,
    overflow: "hidden",
    minHeight: 96,
  },
  leftStripe: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  stripeNum: { fontSize: 22, fontWeight: 400, color: colors.paper, fontFamily: fonts.sansBold },
  mid: { flex: 1, padding: 12, paddingRight: 8 },
  priPill: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  priPillTxt: { fontSize: 7, fontWeight: 400, color: colors.paper, fontFamily: fonts.sansBold },
  title: { fontSize: 11, fontWeight: 400, color: colors.ink, marginBottom: 6, fontFamily: fonts.sansBold },
  insight: { fontSize: 9, fontWeight: 400, marginBottom: 6, fontFamily: fonts.sansBold },
  body: { fontSize: 8.5, lineHeight: 1.5, color: colors.ink2, fontFamily: fonts.sans },
  sep: { width: 1, backgroundColor: colors.rule },
  right: {
    width: 148,
    backgroundColor: colors.surface,
    padding: 10,
    justifyContent: "center",
  },
  outLabel: {
    fontSize: 7,
    fontWeight: 400,
    color: colors.ink4,
    letterSpacing: 0.65,
    marginBottom: 4,
    fontFamily: fonts.sansBold,
  },
  outText: { fontSize: 8.5, fontWeight: 400, lineHeight: 1.45, fontFamily: fonts.sansBold },
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
                <Text style={[styles.body, { marginTop: 4 }]}>{explLine}</Text>
                <Text style={[styles.body, { marginTop: 6 }]}>{actLine}</Text>
              </View>
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
