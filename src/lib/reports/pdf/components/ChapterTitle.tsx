import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { baseStyles, space } from "../theme";

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.section,
    width: "100%",
  },
});

export function ChapterTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={baseStyles.chapterTitle}>{title}</Text>
      {subtitle ? <Text style={baseStyles.chapterSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}
