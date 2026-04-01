import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { colors, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const avg = (models: ReportData["modelScores"]) =>
  models.length ? Math.round(models.reduce((s, m) => s + m.score, 0) / models.length) : 0;

const styles = StyleSheet.create({
  headline: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1.35,
    marginBottom: space.section,
    letterSpacing: -0.2,
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  modelCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: space.cardPad,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  modelName: { fontSize: 12, fontWeight: 600, color: colors.text },
  modelScore: { fontSize: 22, fontWeight: 700, color: colors.text, marginTop: 4 },
  modelDelta: { fontSize: 9, marginTop: 6, fontWeight: 500 },
  deltaPos: { color: colors.success },
  deltaNeg: { color: colors.danger },
  barTrack: { height: 4, backgroundColor: colors.barTrack, borderRadius: 2, marginTop: 10 },
  barFill: { height: 4, borderRadius: 2, backgroundColor: colors.barFill },
  bullet: { fontSize: 9.5, color: colors.textSecondary, lineHeight: 1.55, marginTop: 5, paddingLeft: 2 },
  evidenceCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: space.cardPad,
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  evidenceLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1,
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  evidenceQuote: {
    fontSize: 10,
    lineHeight: 1.58,
    color: colors.textSecondary,
  },
  evidenceNote: { fontSize: 9, color: colors.textSecondary, marginTop: 8, lineHeight: 1.45 },
  takeaway: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    borderRadius: 6,
    padding: 18,
    marginTop: 4,
  },
  takeawayTitle: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 1.1,
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  takeawayBody: { fontSize: 11, lineHeight: 1.58, color: colors.textSecondary },
  sectionTitle: { ...baseStyles.sectionLabel, marginTop: 4, marginBottom: 10 },
});

function ModelCard({ m, a }: { m: ReportData["modelScores"][0]; a: number }) {
  return (
    <View style={styles.modelCard}>
      <Text style={styles.modelName}>{m.name}</Text>
      <Text style={styles.modelScore}>{m.score}</Text>
      <Text style={[styles.modelDelta, m.deltaVsAvg >= 0 ? styles.deltaPos : styles.deltaNeg]}>
        {m.deltaVsAvg >= 0 ? "↑" : "↓"} {Math.abs(m.deltaVsAvg)} vs. average ({a})
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${m.score}%` as `${number}%` }]} />
      </View>
      {m.insights.map((line, i) => (
        <Text key={i} style={styles.bullet}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

export function Page2ModelAnalysis({ data }: { data: ReportData }) {
  const a = avg(data.modelScores);
  const models = data.modelScores;
  const pairs: (typeof models)[] = [];
  for (let i = 0; i < models.length; i += 2) {
    pairs.push(models.slice(i, i + 2));
  }

  return (
    <Page size="A4" style={baseStyles.page}>
      <PdfTraceMarker page={2} section="Page2:start" />
      <PdfHeader data={data} variant="inner" sectionSlug="Model analysis" pageNum={2} />
      <PdfTraceMarker page={2} section="Page2:after_header" />

      <Text style={styles.headline}>
        Where AI visibility concentrates — and where it breaks by model.
      </Text>

      {pairs.map((pair, ri) => (
        <View key={ri} style={styles.row}>
          {pair.map((m) => (
            <ModelCard key={m.name} m={m} a={a} />
          ))}
          {pair.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
      <PdfTraceMarker page={2} section="Page2:after_model_grid" />

      <Text style={styles.sectionTitle}>Evidence preview</Text>
      {data.evidencePreview.map((ev, i) => (
        <View key={i} style={styles.evidenceCard}>
          <Text style={styles.evidenceLabel}>{ev.label}</Text>
          <Text style={styles.evidenceQuote}>&ldquo;{ev.snippet}&rdquo;</Text>
          {ev.note ? <Text style={styles.evidenceNote}>{ev.note}</Text> : null}
        </View>
      ))}
      <PdfTraceMarker page={2} section="Page2:after_evidence_preview" />

      <View style={styles.takeaway}>
        <Text style={styles.takeawayTitle}>Strategic takeaway</Text>
        <Text style={styles.takeawayBody}>{data.strategicTakeaway}</Text>
      </View>
      <PdfTraceMarker page={2} section="Page2:before_footer" />

      <PdfFooter data={data} />
    </Page>
  );
}
