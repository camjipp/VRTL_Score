import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, space, BODY_MAX_W } from "../theme";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const styles = StyleSheet.create({
  method: {
    marginTop: rhythm.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    padding: space.cardPad,
    overflow: "hidden",
    flex: 1,
  },
  methodTitle: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.ink3,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
  },
  methodBody: {
    fontSize: 9.5,
    lineHeight: 1.68,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  fill: { flex: 1, flexDirection: "column" },
});

export function PageMethodology({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={7} section="Methodology:start" />
        <PdfHeader data={data} variant="inner" pageNum={7} />
        <ChapterTitle title="Methodology" subtitle="How this snapshot was produced and how to read the tables." />
        <View style={styles.fill}>
          <View style={styles.method}>
            <Text style={styles.methodTitle}>Overview</Text>
            <Text style={styles.methodBody}>{data.methodology}</Text>
          </View>
        </View>
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
