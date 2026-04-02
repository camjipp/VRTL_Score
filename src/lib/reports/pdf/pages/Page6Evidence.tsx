import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { colors, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const styles = StyleSheet.create({
  h: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 0.35,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: 10,
  },
  th: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 2,
  },
  thText: {
    fontSize: 6.5,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  td: { fontSize: 8, color: colors.textSecondary },
  c1: { width: "6%" },
  c2: { width: "18%" },
  c3: { width: "12%" },
  c4: { width: "14%" },
  c5: { width: "14%" },
  c6: { width: "16%" },
  method: {
    marginTop: space.section,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: space.cardPad,
  },
  methodTitle: {
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.35,
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  methodBody: { fontSize: 10, lineHeight: 1.55, color: colors.textSecondary },
  metaRow: { flexDirection: "row", marginTop: 14 },
  metaItem: { flex: 1 },
  metaLabel: {
    fontSize: 7,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.35,
    marginBottom: 4,
  },
  metaValue: { fontSize: 10, color: colors.text, fontWeight: 500 },
});

export function Page6Evidence({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={baseStyles.page}>
      <PdfTraceMarker page={6} section="Page6:start" />
      <PdfHeader data={data} variant="inner" sectionSlug="Evidence & methodology" pageNum={6} />
      <PdfTraceMarker page={6} section="Page6:after_header" />

      <Text style={styles.h}>Evidence log</Text>
      <View style={{ marginBottom: space.section }}>
        <View style={styles.th}>
          <Text style={[styles.thText, styles.c1]}>#</Text>
          <Text style={[styles.thText, styles.c2]}>Label</Text>
          <Text style={[styles.thText, styles.c3]}>Mentioned</Text>
          <Text style={[styles.thText, styles.c4]}>Position</Text>
          <Text style={[styles.thText, styles.c5]}>Strength</Text>
          <Text style={[styles.thText, styles.c6]}>Competitors</Text>
        </View>
        {data.evidenceLog.map((row) => (
          <View key={row.idx} style={styles.tr} wrap={false}>
            <Text style={[styles.td, styles.c1]}>{row.idx}</Text>
            <Text style={[styles.td, styles.c2]}>{row.label}</Text>
            <Text style={[styles.td, styles.c3]}>{row.mentioned}</Text>
            <Text style={[styles.td, styles.c4]}>{row.position}</Text>
            <Text style={[styles.td, styles.c5]}>{row.strength}</Text>
            <Text style={[styles.td, styles.c6]}>{row.competitors}</Text>
          </View>
        ))}
      </View>
      <PdfTraceMarker page={6} section="Page6:after_evidence_table" />

      <View style={styles.method}>
        <Text style={styles.methodTitle}>Methodology</Text>
        <Text style={styles.methodBody}>{data.methodology}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Responses analyzed</Text>
            <Text style={styles.metaValue}>{data.meta.responses}</Text>
          </View>
          <View style={[styles.metaItem, { marginLeft: 24 }]}>
            <Text style={styles.metaLabel}>Confidence</Text>
            <Text style={styles.metaValue}>{data.meta.confidence}</Text>
          </View>
          <View style={[styles.metaItem, { marginLeft: 24 }]}>
            <Text style={styles.metaLabel}>Generated</Text>
            <Text style={styles.metaValue}>{data.meta.generated}</Text>
          </View>
        </View>
      </View>
      <PdfTraceMarker page={6} section="Page6:before_footer" />

      <PdfFooter data={data} />
    </Page>
  );
}
