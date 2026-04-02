import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const STRIPE_BG = colors.ink2;

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 10,
    fontWeight: 400,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
  },
  intro: {
    fontSize: 9,
    lineHeight: 1.62,
    color: colors.ink3,
    marginBottom: rhythm.lg,
    fontFamily: fonts.sans,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    marginBottom: rhythm.xl,
    padding: 0,
    overflow: "hidden",
    minHeight: 112,
  },
  leftStripe: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rhythm.md,
  },
  stripeNum: { fontSize: 24, fontWeight: 400, color: colors.paper, fontFamily: fonts.sansBold },
  mid: { flex: 1, paddingVertical: rhythm.lg, paddingHorizontal: rhythm.lg, paddingRight: rhythm.md },
  priPill: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 3,
    marginBottom: rhythm.md,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
  },
  priPillTxt: { fontSize: 6, fontWeight: 400, color: colors.ink2, fontFamily: fonts.sansBold, letterSpacing: 0.06 },
  title: { fontSize: 11, fontWeight: 400, color: colors.ink, marginBottom: rhythm.sm, fontFamily: fonts.sansBold },
  insight: { fontSize: 9, fontWeight: 400, marginBottom: rhythm.lg, fontFamily: fonts.sansBold, lineHeight: 1.4, color: colors.ink2 },
  micro: {
    fontSize: 6.5,
    fontWeight: 400,
    color: colors.ink3,
    letterSpacing: 0.12,
    marginBottom: 6,
    marginTop: 2,
    fontFamily: fonts.sansBold,
    textTransform: "uppercase",
  },
  body: { fontSize: 8.5, lineHeight: 1.65, color: colors.ink2, fontFamily: fonts.sans },
  sep: { width: 1, backgroundColor: colors.rule },
  right: {
    width: 156,
    backgroundColor: colors.surface2,
    paddingVertical: rhythm.lg,
    paddingHorizontal: rhythm.md,
    justifyContent: "center",
  },
  outLabel: {
    fontSize: 6,
    fontWeight: 400,
    color: colors.ink4,
    letterSpacing: 0.12,
    marginBottom: rhythm.md,
    fontFamily: fonts.sansBold,
    textTransform: "uppercase",
  },
  outText: { fontSize: 9, fontWeight: 400, lineHeight: 1.55, fontFamily: fonts.sansBold, color: colors.ink },
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
          const titleLine = String(r.title);
          const insightLine = String(r.insight);
          const expLine = String(r.expectedOutcome);
          const actLine = String(r.action);
          const explLine = String(r.explanation);
          return (
            <View key={`rec-${r.priority}-${i}`} style={styles.card} wrap={false} minPresenceAhead={320}>
              <View style={[styles.leftStripe, { backgroundColor: STRIPE_BG }]}>
                <Text style={styles.stripeNum}>{String(i + 1)}</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.mid}>
                <View style={styles.priPill}>
                  <Text style={styles.priPillTxt}>{`${r.priority} PRIORITY`}</Text>
                </View>
                <Text style={styles.title}>{titleLine}</Text>
                <Text style={styles.insight}>{insightLine}</Text>
                <Text style={[styles.micro, { marginTop: rhythm.sm }]}>WHY IT MATTERS</Text>
                <Text style={styles.body}>{explLine}</Text>
                <Text style={[styles.micro, { marginTop: rhythm.lg }]}>RECOMMENDED ACTION</Text>
                <Text style={styles.body}>{actLine}</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.right}>
                <Text style={styles.outLabel}>EXPECTED OUTCOME</Text>
                <Text style={styles.outText}>{expLine}</Text>
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
