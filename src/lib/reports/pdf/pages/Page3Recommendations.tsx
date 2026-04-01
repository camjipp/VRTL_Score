import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { colors, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";

const priorityBorder = (p: string) =>
  p === "HIGH" ? colors.danger : p === "MEDIUM" ? colors.warning : colors.success;

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.text,
    marginBottom: 6,
  },
  intro: { fontSize: 10.5, lineHeight: 1.58, color: colors.textSecondary, marginBottom: space.section },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  pri: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginBottom: 6,
    color: colors.textSecondary,
  },
  cardTitle: { fontSize: 11.5, fontWeight: 600, color: colors.text, lineHeight: 1.35, marginBottom: 6 },
  label: {
    fontSize: 8,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 6,
    marginBottom: 3,
  },
  body: { fontSize: 9.5, lineHeight: 1.52, color: colors.textSecondary },
  outcomeRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  outcomeLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: "uppercase",
    width: "30%",
  },
  outcomeText: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: colors.textSecondary,
    width: "68%",
    textAlign: "right",
  },
});

export function Page3Recommendations({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={baseStyles.page}>
      <PdfHeader data={data} variant="inner" sectionSlug="Recommendations" pageNum={3} />

      <Text style={styles.pageTitle}>Prioritized actions</Text>
      <Text style={styles.intro}>
        Ranked by urgency and leverage. Execute in order where resourcing allows.
      </Text>

      {data.recommendations.map((r, i) => (
        <View key={i} style={[styles.card, { borderLeftColor: priorityBorder(r.priority) }]}>
          <Text style={styles.pri}>{r.priority} PRIORITY</Text>
          <Text style={styles.cardTitle}>{r.title}</Text>
          <Text style={styles.label}>Insight</Text>
          <Text style={styles.body}>{r.insight}</Text>
          <Text style={styles.label}>Why it matters</Text>
          <Text style={styles.body}>{r.explanation}</Text>
          <Text style={styles.label}>Recommended action</Text>
          <Text style={styles.body}>{r.action}</Text>
          <View style={styles.outcomeRow}>
            <Text style={styles.outcomeLabel}>Expected outcome</Text>
            <Text style={styles.outcomeText}>{r.expectedOutcome}</Text>
          </View>
        </View>
      ))}

      <PdfFooter data={data} />
    </Page>
  );
}
