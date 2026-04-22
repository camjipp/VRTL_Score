import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { colors, fonts, rhythm, BODY_MAX_W } from "../theme";

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
    width: "100%",
  },
  wrapTight: {
    marginBottom: 12,
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
  /** Tighter bottom margin when the page hero sits immediately below. */
  density = "standard",
}: {
  sectionLabel: string;
  title: string;
  /** Omit or leave empty to skip the purpose line (use when the focal headline lives elsewhere). */
  purpose?: string;
  intro?: string;
  minPresenceAhead?: number;
  density?: "standard" | "tight";
}) {
  const purposeLine = purpose?.trim() ?? "";
  return (
    <View
      style={[styles.wrap, density === "tight" ? styles.wrapTight : {}]}
      minPresenceAhead={minPresenceAhead}
    >
      <Text style={styles.sectionLabel} orphans={2}>
        {sectionLabel}
      </Text>
      <Text style={styles.title} orphans={2}>
        {title}
      </Text>
      {purposeLine ? (
        <Text style={styles.purpose} orphans={2} widows={2}>
          {purposeLine}
        </Text>
      ) : null}
      {intro ? (
        <Text style={styles.intro} orphans={2} widows={2}>
          {intro}
        </Text>
      ) : null}
    </View>
  );
}
