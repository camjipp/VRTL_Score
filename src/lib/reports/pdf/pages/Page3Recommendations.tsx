import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { colors, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const priorityBorder = (p: string | undefined) => {
  if (p === "HIGH") return colors.danger;
  if (p === "MEDIUM") return colors.warning;
  if (p === "LOW") return colors.success;
  return colors.border;
};

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.35,
    textTransform: "uppercase",
    color: colors.text,
    marginBottom: 8,
  },
  intro: {
    fontSize: 10.5,
    lineHeight: 1.62,
    color: colors.textSecondary,
    marginBottom: space.section + 6,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  pri: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 0.35,
    marginBottom: 8,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: 11.5,
    fontWeight: 600,
    color: colors.text,
    lineHeight: 1.4,
    marginBottom: 10,
  },
  label: {
    fontSize: 8,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.35,
    marginTop: 10,
    marginBottom: 5,
  },
  body: { fontSize: 9.5, lineHeight: 1.58, color: colors.textSecondary },
  outcomeRow: {
    marginTop: 12,
    paddingTop: 12,
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
      <PdfTraceMarker page={3} section="Page3:start" />
      <PdfHeader data={data} variant="inner" sectionSlug="Recommendations" pageNum={3} />
      <PdfTraceMarker page={3} section="Page3:after_header" />

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
      <PdfTraceMarker page={3} section="Page3:after_recommendations" />

      <PdfFooter data={data} />
    </Page>
  );
}
