import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { baseStyles, space } from "../theme";

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.section,
    width: "100%",
  },
});

/** `minPresenceAhead` reduces orphan headings at page bottoms (react-pdf, pt). */
export function ChapterTitle({
  title,
  subtitle,
  minPresenceAhead = 72,
}: {
  title: string;
  subtitle?: string;
  minPresenceAhead?: number;
}) {
  return (
    <View style={styles.wrap} minPresenceAhead={minPresenceAhead}>
      <Text style={baseStyles.chapterTitle} orphans={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={baseStyles.chapterSubtitle} orphans={2} widows={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
