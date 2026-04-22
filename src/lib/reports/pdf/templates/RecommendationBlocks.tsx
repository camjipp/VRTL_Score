import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { RecommendationCard } from "../types";
import { colors, fonts, rhythm, BODY_MAX_W, CONTENT_W, space } from "../theme";

const STRIPE_BG = colors.ink2;
const STRIPE_SECONDARY = colors.ink3;
const HIGH_ACCENT = "#DC2626";

export const recommendationStyles = StyleSheet.create({
  heroShell: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    borderTopWidth: 3,
    borderTopColor: HIGH_ACCENT,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: rhythm.md + 6,
    width: CONTENT_W,
  },
  heroShellStd: {
    borderTopColor: colors.ink3,
  },
  heroStripe: {
    width: 42,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
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
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: space.cardPad + 2,
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
    fontSize: 15.5,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    marginBottom: 6,
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
    fontSize: 7.75,
    lineHeight: 1.52,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  numberedBody: {
    fontSize: 7,
    lineHeight: 1.48,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
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
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 0,
    overflow: "hidden",
  },
  numberedCard: {
    marginBottom: 6,
  },
  cardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: HIGH_ACCENT,
  },
  leftStripe: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rhythm.sm + 2,
    backgroundColor: STRIPE_SECONDARY,
  },
  stripeNum: { fontSize: 15, fontWeight: 400, color: colors.paper, fontFamily: fonts.sansBold },
  mid: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: space.cardPad - 2,
    paddingRight: 8,
  },
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
  title: { fontSize: 9.75, fontWeight: 400, color: colors.ink, marginBottom: 4, fontFamily: fonts.sansBold },
  insight: {
    fontSize: 6.75,
    fontWeight: 400,
    marginBottom: 4,
    fontFamily: fonts.sansBold,
    lineHeight: 1.38,
    color: colors.ink3,
    maxWidth: BODY_MAX_W - 28,
  },
  sep: { width: 1, backgroundColor: colors.rule },
  rightNumbered: {
    width: 112,
    borderLeftWidth: 1,
    borderLeftColor: colors.rule,
    backgroundColor: colors.surface,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 11,
    paddingRight: 10,
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
      ? `Move ${idx} of ${totalActions} · lead priority`
      : "Lead priority";
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
        <Text style={styles.micro}>Issue</Text>
        <Text style={styles.heroTitle}>{String(rec.title)}</Text>
        <Text style={[styles.micro, styles.microSpaced]}>Signal</Text>
        <Text style={styles.heroInsight}>{String(rec.insight)}</Text>
        <Text style={[styles.micro, styles.microSpaced]}>Why it matters</Text>
        <Text style={styles.body} orphans={2} widows={2}>
          {String(rec.explanation)}
        </Text>
        <Text style={[styles.micro, styles.microSpaced]}>The move</Text>
        <Text style={styles.body} orphans={2} widows={2}>
          {String(rec.action)}
        </Text>
        <Text style={[styles.micro, styles.microSpaced]}>Outcome</Text>
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
        <Text style={styles.micro}>Issue</Text>
        <Text style={styles.title}>{String(rec.title)}</Text>
        <Text style={styles.micro}>Signal</Text>
        <Text style={styles.insight}>{String(rec.insight)}</Text>
        <View>
          <Text style={[styles.micro, styles.microSpaced]}>Why it matters</Text>
          <Text style={styles.numberedBody} orphans={2} widows={2}>
            {String(rec.explanation)}
          </Text>
        </View>
        <View>
          <Text style={[styles.micro, styles.microSpaced]}>The move</Text>
          <Text style={styles.numberedBody} orphans={2} widows={2}>
            {String(rec.action)}
          </Text>
        </View>
      </View>
      <View style={styles.rightNumbered}>
        <Text style={styles.outLabel}>Outcome</Text>
        <Text style={styles.outText}>{String(rec.expectedOutcome)}</Text>
      </View>
    </View>
  );
}
