import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { colors, fonts, rhythm, BODY_MAX_W, space } from "../theme";

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.section,
    width: "100%",
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.22,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: rhythm.xs,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    marginBottom: rhythm.sm,
    letterSpacing: -0.02,
  },
  purpose: {
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.ink2,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
    marginBottom: 0,
  },
  intro: {
    marginTop: rhythm.md,
    fontSize: 9,
    lineHeight: 1.62,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
});

/**
 * Editorial hierarchy below the fixed running header: section label → title → one-line purpose,
 * optional intro paragraph (thesis / framing before evidence).
 */
export function EditorialSectionHeader({
  sectionLabel,
  title,
  purpose,
  intro,
  minPresenceAhead = 56,
}: {
  sectionLabel: string;
  title: string;
  purpose: string;
  intro?: string;
  minPresenceAhead?: number;
}) {
  return (
    <View style={styles.wrap} minPresenceAhead={minPresenceAhead}>
      <Text style={styles.sectionLabel} orphans={2}>
        {sectionLabel}
      </Text>
      <Text style={styles.title} orphans={2}>
        {title}
      </Text>
      <Text style={styles.purpose} orphans={2} widows={2}>
        {purpose}
      </Text>
      {intro ? (
        <Text style={styles.intro} orphans={2} widows={2}>
          {intro}
        </Text>
      ) : null}
    </View>
  );
}
