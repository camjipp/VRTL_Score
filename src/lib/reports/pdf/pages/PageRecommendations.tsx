import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import type { RecommendationCard } from "../types";
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
    padding: space.cardPad - 4,
    marginBottom: rhythm.md,
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
    marginBottom: rhythm.md,
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
    marginTop: 8,
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
  fill: { flex: 1 },
});

function HeroCard({ rec }: { rec: RecommendationCard }) {
  const isHigh = rec.priority === "HIGH";
  return (
    <View
      style={[styles.heroCard, isHigh ? { borderTopColor: HIGH_ACCENT } : { borderTopColor: colors.ink3 }]}
      wrap={false}
    >
      <Text style={styles.heroKicker}>Primary action</Text>
      <View style={styles.heroPri}>
        <Text style={styles.heroPriTxt}>{`${rec.priority} PRIORITY`}</Text>
      </View>
      <Text style={styles.heroTitle}>{String(rec.title)}</Text>
      <Text style={styles.heroInsight}>{String(rec.insight)}</Text>
      <Text style={styles.heroOutcomeLabel}>Expected outcome</Text>
      <Text style={styles.heroOutcome}>{String(rec.expectedOutcome)}</Text>
      <View>
        <Text style={[styles.micro, styles.microSpaced]}>Why it matters</Text>
        <Text style={styles.body} orphans={2} widows={2}>
          {String(rec.explanation)}
        </Text>
      </View>
      <View>
        <Text style={[styles.micro, styles.microSpaced]}>What we do</Text>
        <Text style={styles.body} orphans={2} widows={2}>
          {String(rec.action)}
        </Text>
      </View>
    </View>
  );
}

function NumberedCard({ rec, num }: { rec: RecommendationCard; num: number }) {
  const cardHigh = rec.priority === "HIGH";
  const titleLine = String(rec.title);
  const insightLine = String(rec.insight);
  const expLine = String(rec.expectedOutcome);
  const actLine = String(rec.action);
  const explLine = String(rec.explanation);
  return (
    <View style={[styles.card, cardHigh ? styles.cardHigh : {}]} wrap={false}>
      <View style={[styles.leftStripe, { backgroundColor: STRIPE_BG }]}>
        <Text style={styles.stripeNum}>{String(num)}</Text>
      </View>
      <View style={styles.sep} />
      <View style={styles.mid}>
        <View style={styles.priPill}>
          <Text style={styles.priPillTxt}>{`${rec.priority} PRIORITY`}</Text>
        </View>
        <Text style={styles.title}>{titleLine}</Text>
        <Text style={styles.insight}>{insightLine}</Text>
        <View>
          <Text style={styles.micro}>Why it matters</Text>
          <Text style={styles.body} orphans={2} widows={2}>
            {explLine}
          </Text>
        </View>
        <View>
          <Text style={[styles.micro, styles.microSpaced]}>What we do</Text>
          <Text style={styles.body} orphans={2} widows={2}>
            {actLine}
          </Text>
        </View>
      </View>
      <View style={styles.sep} />
      <View style={styles.right}>
        <Text style={styles.outLabel}>Expected outcome</Text>
        <Text style={styles.outText}>{expLine}</Text>
      </View>
    </View>
  );
}

/** At most two recommendation cards per slide; each card is a single non-splitting block. */
export function renderRecommendationPages(data: ReportData): ReactElement[] {
  const recs = data.recommendations;
  if (recs.length === 0) return [];

  const [first, ...rest] = recs;
  const pages: ReactElement[] = [];

  pages.push(
    <Page key="rec-p1" size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={5} section="Rec:p1" />
        <PdfHeader data={data} variant="inner" pageNum={5} />
        <View style={styles.fill}>
          <ChapterTitle
            title="Recommendations"
            subtitle="Highest-impact moves first: concrete execution tied to measurable recommendation outcomes."
          />
          {first ? <HeroCard rec={first} /> : null}
          {rest[0] ? <NumberedCard rec={rest[0]} num={2} /> : null}
        </View>
        <PdfFooter data={data} />
      </View>
    </Page>,
  );

  for (let k = 1; k < rest.length; k += 2) {
    const a = rest[k];
    const b = rest[k + 1];
    if (!a) break;
    const pageIdx = (k + 1) / 2 + 1;
    pages.push(
      <Page key={`rec-p${pageIdx}`} size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
        <View style={baseStyles.pageBody}>
          <PdfTraceMarker page={5} section={`Rec:p${pageIdx}`} />
          <PdfHeader data={data} variant="inner" pageNum={5} />
          <View style={styles.fill}>
            <NumberedCard rec={a} num={k + 2} />
            {b ? <NumberedCard rec={b} num={k + 3} /> : null}
          </View>
          <PdfFooter data={data} />
        </View>
      </Page>,
    );
  }

  return pages;
}
