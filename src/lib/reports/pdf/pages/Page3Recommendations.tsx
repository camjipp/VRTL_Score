import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, space, BODY_MAX_W, CONTENT_W } from "../theme";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const STRIPE_BG = colors.ink2;
const HIGH_ACCENT = "#DC2626";

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    borderTopWidth: 3,
    borderTopColor: HIGH_ACCENT,
    padding: space.cardPad,
    marginBottom: space.block,
    width: CONTENT_W,
  },
  heroKicker: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    color: colors.ink3,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroPri: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
    marginBottom: 10,
  },
  heroPriTxt: {
    fontSize: 6,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    letterSpacing: 0.06,
  },
  heroTitle: {
    fontSize: 14,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    marginBottom: 8,
    lineHeight: 1.25,
    maxWidth: BODY_MAX_W,
  },
  heroInsight: {
    fontSize: 9,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    lineHeight: 1.55,
    marginBottom: 12,
    maxWidth: BODY_MAX_W,
  },
  heroOutcomeLabel: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    color: colors.ink3,
    textTransform: "uppercase",
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  heroOutcome: {
    fontSize: 9.5,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    lineHeight: 1.5,
    maxWidth: BODY_MAX_W,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 6,
    marginBottom: space.block,
    padding: 0,
    overflow: "hidden",
  },
  cardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: HIGH_ACCENT,
  },
  leftStripe: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rhythm.md,
  },
  stripeNum: { fontSize: 18, fontWeight: 400, color: colors.paper, fontFamily: fonts.sansBold },
  mid: { flex: 1, paddingVertical: space.cardPad - 2, paddingHorizontal: space.cardPad, paddingRight: 12 },
  priPill: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surface,
  },
  priPillTxt: { fontSize: 5.5, fontWeight: 400, color: colors.ink2, fontFamily: fonts.sansBold, letterSpacing: 0.04 },
  title: { fontSize: 10, fontWeight: 400, color: colors.ink, marginBottom: 6, fontFamily: fonts.sansBold },
  insight: {
    fontSize: 8,
    fontWeight: 400,
    marginBottom: 8,
    fontFamily: fonts.sansBold,
    lineHeight: 1.48,
    color: colors.ink2,
    maxWidth: BODY_MAX_W - 24,
  },
  micro: {
    fontSize: 6,
    fontWeight: 400,
    color: colors.ink3,
    letterSpacing: 0.1,
    marginBottom: 4,
    marginTop: 2,
    fontFamily: fonts.sansBold,
    textTransform: "uppercase",
  },
  microSpaced: {
    marginTop: 10,
  },
  body: {
    fontSize: 8,
    lineHeight: 1.62,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W - 24,
  },
  sep: { width: 1, backgroundColor: colors.rule },
  right: {
    width: 128,
    backgroundColor: colors.surface2,
    paddingVertical: space.cardPad - 2,
    paddingHorizontal: 12,
    justifyContent: "flex-start",
  },
  outLabel: {
    fontSize: 5.5,
    fontWeight: 400,
    color: colors.ink3,
    letterSpacing: 0.1,
    marginBottom: 6,
    fontFamily: fonts.sansBold,
    textTransform: "uppercase",
  },
  outText: { fontSize: 8, fontWeight: 400, lineHeight: 1.55, fontFamily: fonts.sansBold, color: colors.ink },
});

export function Page3Recommendations({ data }: { data: ReportData }) {
  const [first, ...rest] = data.recommendations;
  const isHigh = first?.priority === "HIGH";

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={3} section="Page3:start" />
        <PdfHeader data={data} variant="inner" pageNum={3} />
        <PdfTraceMarker page={3} section="Page3:after_header" />

        <ChapterTitle
          title="Recommendations"
          subtitle="Highest-impact moves first—concrete execution tied to measurable recommendation outcomes."
        />

        {first ? (
          <View style={[styles.heroCard, isHigh ? { borderTopColor: HIGH_ACCENT } : { borderTopColor: colors.ink3 }]}>
            <Text style={styles.heroKicker}>Primary action</Text>
            <View style={styles.heroPri}>
              <Text style={styles.heroPriTxt}>{`${first.priority} PRIORITY`}</Text>
            </View>
            <Text style={styles.heroTitle}>{String(first.title)}</Text>
            <Text style={styles.heroInsight}>{String(first.insight)}</Text>
            <Text style={styles.heroOutcomeLabel}>Expected outcome</Text>
            <Text style={styles.heroOutcome}>{String(first.expectedOutcome)}</Text>
            <Text style={[styles.micro, styles.microSpaced]}>Why it matters</Text>
            <Text style={styles.body}>{String(first.explanation)}</Text>
            <Text style={[styles.micro, styles.microSpaced]}>What we do</Text>
            <Text style={styles.body}>{String(first.action)}</Text>
          </View>
        ) : null}

        {rest.map((r, i) => {
          const titleLine = String(r.title);
          const insightLine = String(r.insight);
          const expLine = String(r.expectedOutcome);
          const actLine = String(r.action);
          const explLine = String(r.explanation);
          const cardHigh = r.priority === "HIGH";
          const idx = i + 2;
          return (
            <View key={`rec-${r.priority}-${i}`} style={[styles.card, cardHigh ? styles.cardHigh : {}]}>
              <View style={[styles.leftStripe, { backgroundColor: STRIPE_BG }]}>
                <Text style={styles.stripeNum}>{String(idx)}</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.mid}>
                <View style={styles.priPill}>
                  <Text style={styles.priPillTxt}>{`${r.priority} PRIORITY`}</Text>
                </View>
                <Text style={styles.title}>{titleLine}</Text>
                <Text style={styles.insight}>{insightLine}</Text>
                <Text style={styles.micro}>Why it matters</Text>
                <Text style={styles.body}>{explLine}</Text>
                <Text style={[styles.micro, styles.microSpaced]}>What we do</Text>
                <Text style={styles.body}>{actLine}</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.right}>
                <Text style={styles.outLabel}>Expected outcome</Text>
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
