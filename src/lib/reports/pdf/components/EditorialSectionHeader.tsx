import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { colors, fonts, rhythm, BODY_MAX_W } from "../theme";

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
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
    fontSize: 16,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    marginBottom: rhythm.xs,
    letterSpacing: -0.02,
  },
  purpose: {
    fontSize: 8,
    lineHeight: 1.5,
    color: colors.ink3,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
    marginBottom: 0,
  },
  intro: {
    marginTop: rhythm.sm + 2,
    fontSize: 8.5,
    lineHeight: 1.52,
    color: colors.ink2,
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
