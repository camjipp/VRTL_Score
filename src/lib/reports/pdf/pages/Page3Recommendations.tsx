import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const STRIPE_BG = colors.ink2;
const HIGH_ACCENT = "#DC2626";

const styles = StyleSheet.create({
  intro: {
    fontSize: 8,
    lineHeight: 1.45,
    color: colors.ink2,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sans,
  },
  cardsBlock: {
    marginTop: rhythm.xs,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    marginBottom: 6,
    padding: 0,
    overflow: "hidden",
  },
  cardHigh: {
    borderLeftWidth: 2,
    borderLeftColor: HIGH_ACCENT,
  },
  leftStripe: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rhythm.sm,
  },
  stripeNum: { fontSize: 20, fontWeight: 400, color: colors.paper, fontFamily: fonts.sansBold },
  mid: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, paddingRight: 8 },
  priPill: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 3,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
  },
  priPillTxt: { fontSize: 5.5, fontWeight: 400, color: colors.ink2, fontFamily: fonts.sansBold, letterSpacing: 0.04 },
  title: { fontSize: 10, fontWeight: 400, color: colors.ink, marginBottom: 4, fontFamily: fonts.sansBold },
  insight: {
    fontSize: 8,
    fontWeight: 400,
    marginBottom: 6,
    fontFamily: fonts.sansBold,
    lineHeight: 1.35,
    color: colors.ink2,
  },
  micro: {
    fontSize: 6,
    fontWeight: 400,
    color: colors.ink3,
    letterSpacing: 0.08,
    marginBottom: 3,
    marginTop: 1,
    fontFamily: fonts.sansBold,
    textTransform: "uppercase",
  },
  body: { fontSize: 7.5, lineHeight: 1.48, color: colors.ink, fontFamily: fonts.sans },
  sep: { width: 1, backgroundColor: colors.rule },
  right: {
    width: 132,
    backgroundColor: colors.surface2,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "flex-start",
  },
  outLabel: {
    fontSize: 5.5,
    fontWeight: 400,
    color: colors.ink3,
    letterSpacing: 0.08,
    marginBottom: 6,
    fontFamily: fonts.sansBold,
    textTransform: "uppercase",
  },
  outText: { fontSize: 8, fontWeight: 400, lineHeight: 1.45, fontFamily: fonts.sansBold, color: colors.ink },
});

export function Page3Recommendations({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={3} section="Page3:start" />
        <PdfHeader data={data} variant="inner" pageNum={3} />
        <PdfTraceMarker page={3} section="Page3:after_header" />

        <ChapterTitle title="Recommendations" />
        <Text style={styles.intro}>
          Ranked by urgency and leverage. Execute in order where resourcing allows.
        </Text>

        <View style={styles.cardsBlock} wrap={false}>
          {data.recommendations.map((r, i) => {
            const titleLine = String(r.title);
            const insightLine = String(r.insight);
            const expLine = String(r.expectedOutcome);
            const actLine = String(r.action);
            const explLine = String(r.explanation);
            const isHigh = r.priority === "HIGH";
            return (
              <View
                key={`rec-${r.priority}-${i}`}
                style={[styles.card, isHigh ? styles.cardHigh : {}]}
                wrap={false}
              >
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
                  <Text style={styles.micro}>WHY IT MATTERS</Text>
                  <Text style={styles.body}>{explLine}</Text>
                  <Text style={[styles.micro, { marginTop: 6 }]}>RECOMMENDED ACTION</Text>
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
        </View>

        <PdfTraceMarker page={3} section="Page3:after_recommendations" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
