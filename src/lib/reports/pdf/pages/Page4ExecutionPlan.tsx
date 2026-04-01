import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { colors, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";

const styles = StyleSheet.create({
  title: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.text,
    marginBottom: 8,
  },
  intro: { fontSize: 10.5, lineHeight: 1.55, color: colors.textSecondary, marginBottom: space.section },
  grid: { gap: 12 },
  cell: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: space.cardPad,
  },
  phase: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  copy: { fontSize: 10.5, lineHeight: 1.58, color: colors.textSecondary },
});

export function Page4ExecutionPlan({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={baseStyles.page}>
      <PdfHeader data={data} variant="inner" sectionSlug="Execution plan" pageNum={4} />

      <Text style={styles.title}>30-day execution roadmap</Text>
      <Text style={styles.intro}>
        A practical sequence for the next month. Adjust dates to your operating cadence.
      </Text>

      <View style={styles.grid}>
        {data.executionPhases.map((ph, i) => (
          <View key={i} style={styles.cell} wrap={false}>
            <Text style={styles.phase}>{ph.phase}</Text>
            <Text style={styles.copy}>{ph.text}</Text>
          </View>
        ))}
      </View>

      <PdfFooter data={data} />
    </Page>
  );
}
