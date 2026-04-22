import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { RecommendationCard } from "../types";
import { colors, fonts, rhythm, BODY_MAX_W, CONTENT_W, space } from "../theme";

const STRIPE_BG = colors.ink2;
const STRIPE_SECONDARY = colors.ink3;
const HIGH_ACCENT = "#DC2626";

export const recommendationStyles = StyleSheet.create({
  heroShell: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    borderTopWidth: 4,
    borderTopColor: HIGH_ACCENT,
    overflow: "hidden",
    marginBottom: rhythm.md + 2,
    width: CONTENT_W,
  },
  heroShellStd: {
    borderTopColor: colors.ink3,
  },
  heroStripe: {
    width: 42,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 16,
    backgroundColor: STRIPE_BG,
  },
  heroStripeNum: {
    fontSize: 28,
    fontWeight: 400,
    color: colors.paper,
    fontFamily: fonts.sansBold,
    lineHeight: 1,
  },
  heroBody: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: space.cardPad - 2,
  },
  micro: {
    fontSize: 6,
    fontFamily: fonts.sansBold,
    color: colors.ink3,
    letterSpacing: 0.1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  microSpaced: {
    marginTop: 7,
  },
  heroPri: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.paper,
    marginBottom: 8,
  },
  heroPriTxt: {
    fontSize: 6,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    letterSpacing: 0.06,
  },
  heroTitle: {
    fontSize: 13.5,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    marginBottom: 4,
    lineHeight: 1.2,
    maxWidth: BODY_MAX_W,
  },
  heroInsight: {
    fontSize: 9,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    lineHeight: 1.45,
    marginBottom: 6,
    maxWidth: BODY_MAX_W,
  },
  body: {
    fontSize: 7.5,
    lineHeight: 1.52,
    color: colors.ink,
    fontFamily: fonts.sans,
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
    fontSize: 9,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    lineHeight: 1.45,
    maxWidth: BODY_MAX_W,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 6,
    padding: 0,
    overflow: "hidden",
  },
  numberedCard: {
    marginBottom: 8,
  },
  cardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: HIGH_ACCENT,
  },
  leftStripe: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rhythm.sm + 4,
    backgroundColor: STRIPE_SECONDARY,
  },
  stripeNum: { fontSize: 16, fontWeight: 400, color: colors.paper, fontFamily: fonts.sansBold },
  mid: { flex: 1, paddingVertical: space.cardPad - 4, paddingHorizontal: space.cardPad - 2, paddingRight: 10 },
  priPill: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 3,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surface,
  },
  priPillTxt: { fontSize: 5.5, fontWeight: 400, color: colors.ink3, fontFamily: fonts.sansBold, letterSpacing: 0.04 },
  title: { fontSize: 9, fontWeight: 400, color: colors.ink2, marginBottom: 3, fontFamily: fonts.sansBold },
  insight: {
    fontSize: 7,
    fontWeight: 400,
    marginBottom: 5,
    fontFamily: fonts.sansBold,
    lineHeight: 1.42,
    color: colors.ink3,
    maxWidth: BODY_MAX_W - 28,
  },
  sep: { width: 1, backgroundColor: colors.rule },
  rightNumbered: {
    width: 118,
    backgroundColor: colors.surface,
    paddingTop: space.cardPad - 4,
    paddingBottom: 12,
    paddingHorizontal: 10,
    justifyContent: "flex-start",
  },
  outLabel: {
    fontSize: 5.5,
    fontWeight: 400,
    color: colors.ink4,
    letterSpacing: 0.1,
    marginBottom: 5,
    fontFamily: fonts.sansBold,
    textTransform: "uppercase",
  },
  outText: { fontSize: 7, fontWeight: 400, lineHeight: 1.45, fontFamily: fonts.sansBold, color: colors.ink2 },
});

const styles = recommendationStyles;

export function PrimaryRecommendationCard({
  rec,
  actionIndex,
  totalActions,
}: {
  rec: RecommendationCard;
  /** Global position in the ranked list (visual only). */
  actionIndex?: number;
  totalActions?: number;
}) {
  const isHigh = rec.priority === "HIGH";
  const idx = actionIndex ?? 1;
  const microLead =
    totalActions != null && totalActions > 0
      ? `Action ${idx} of ${totalActions} — highest impact first`
      : "Highest-priority action";
  return (
    <View style={[styles.heroShell, isHigh ? {} : styles.heroShellStd]}>
      <View style={styles.heroStripe}>
        <Text style={styles.heroStripeNum}>{String(idx)}</Text>
      </View>
      <View style={styles.heroBody}>
        <Text style={[styles.micro, { marginBottom: 8 }]}>{microLead}</Text>
        <View style={styles.heroPri}>
          <Text style={styles.heroPriTxt}>{`${rec.priority} PRIORITY`}</Text>
        </View>
        <Text style={styles.micro}>The issue</Text>
        <Text style={styles.heroTitle}>{String(rec.title)}</Text>
        <Text style={[styles.micro, styles.microSpaced]}>Key observation</Text>
        <Text style={styles.heroInsight}>{String(rec.insight)}</Text>
        <Text style={[styles.micro, styles.microSpaced]}>Why it matters</Text>
        <Text style={styles.body} orphans={2} widows={2}>
          {String(rec.explanation)}
        </Text>
        <Text style={[styles.micro, styles.microSpaced]}>What we do</Text>
        <Text style={styles.body} orphans={2} widows={2}>
          {String(rec.action)}
        </Text>
        <Text style={[styles.micro, styles.microSpaced]}>Expected result</Text>
        <Text style={styles.heroOutcome}>{String(rec.expectedOutcome)}</Text>
      </View>
    </View>
  );
}

export function NumberedRecommendationCard({ rec, num }: { rec: RecommendationCard; num: number }) {
  const cardHigh = rec.priority === "HIGH";
  return (
    <View style={[styles.card, styles.numberedCard, cardHigh ? styles.cardHigh : {}]}>
      <View style={styles.leftStripe}>
        <Text style={styles.stripeNum}>{String(num)}</Text>
      </View>
      <View style={styles.sep} />
      <View style={styles.mid}>
        <View style={styles.priPill}>
          <Text style={styles.priPillTxt}>{`${rec.priority} PRIORITY`}</Text>
        </View>
        <Text style={styles.micro}>The issue</Text>
        <Text style={styles.title}>{String(rec.title)}</Text>
        <Text style={styles.micro}>Key observation</Text>
        <Text style={styles.insight}>{String(rec.insight)}</Text>
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
      <View style={styles.sep} />
      <View style={styles.rightNumbered}>
        <Text style={styles.outLabel}>Expected result</Text>
        <Text style={styles.outText}>{String(rec.expectedOutcome)}</Text>
      </View>
    </View>
  );
}
