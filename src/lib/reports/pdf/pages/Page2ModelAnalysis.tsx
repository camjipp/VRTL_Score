import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, space, baseStyles } from "../theme";
import { ModelAnalysisCard, MODEL_CARD_WIDTH } from "../components/ModelAnalysisCard";

const CONTENT_W = PAGE.width - PAGE.margin * 2;
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const avgOf = (models: ReportData["modelScores"]) =>
  models.length ? Math.round(models.reduce((s, m) => s + m.score, 0) / models.length) : 0;

function visuals(score: number, avg: number) {
  if (score >= avg + 15) {
    return { band: colors.green, scoreAccent: colors.green, dot: colors.green };
  }
  if (score < avg - 5) {
    return { band: colors.red, scoreAccent: colors.red, dot: colors.red };
  }
  return { band: colors.orange, scoreAccent: colors.orange, dot: colors.orange };
}

const GAP = 12;

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.blueTint,
    borderLeftWidth: 4,
    borderLeftColor: colors.cyan,
    padding: 12,
    marginBottom: space.section,
    borderRadius: 4,
  },
  bannerLeft: { flex: 1, paddingRight: 8 },
  bannerSpread: { fontSize: 18, fontWeight: 800, color: colors.text, fontFamily: "Helvetica-Bold" },
  bannerSub: { fontSize: 9, color: colors.body, marginTop: 4, lineHeight: 1.45 },
  bannerPill: {
    backgroundColor: "#E0F2FE",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  bannerPillText: { fontSize: 7, fontWeight: 700, color: colors.cyan },
  row3: {
    width: CONTENT_W,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: space.section,
  },
  evidenceCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  evLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.65,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  evMono: {
    fontFamily: "Courier",
    fontSize: 8,
    lineHeight: 1.45,
    color: colors.body,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  evNote: { fontSize: 8, color: colors.body, marginTop: 8, lineHeight: 1.45 },
  takeaway: {
    backgroundColor: colors.strategyTint,
    borderLeftWidth: 4,
    borderLeftColor: colors.violet,
    padding: 14,
    borderRadius: 4,
    marginTop: 4,
  },
  takeawayTitle: {
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.65,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  takeawayBody: { fontSize: 10, lineHeight: 1.55, color: colors.body },
  sectionTitle: { ...baseStyles.sectionLabel, marginTop: 6, marginBottom: 10 },
});

export function Page2ModelAnalysis({ data }: { data: ReportData }) {
  const a = avgOf(data.modelScores);
  const scores = data.modelScores.map((m) => m.score);
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;
  const spreadLine = `${spread}-POINT SPREAD`;
  const descLine =
    "Largest gap between your strongest and weakest model surfaces — prioritize the trailing model first.";

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={2} section="Page2:start" />
        <PdfHeader data={data} variant="inner" sectionSlug="Model analysis" pageNum={2} />
        <PdfTraceMarker page={2} section="Page2:after_header" />

        <View style={styles.banner} wrap={false}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerSpread}>{spreadLine}</Text>
            <Text style={styles.bannerSub}>{descLine}</Text>
          </View>
          <View style={styles.bannerPill}>
            <Text style={styles.bannerPillText}>HIGHEST-LEVERAGE OPPORTUNITY</Text>
          </View>
        </View>

        <View style={styles.row3}>
          {data.modelScores.map((m, idx) => {
            const v = visuals(m.score, a);
            const cardId = `model-${m.name}-${idx}`;
            return (
              <View
                key={cardId}
                style={{
                  width: MODEL_CARD_WIDTH,
                  marginRight: idx < data.modelScores.length - 1 ? GAP : 0,
                }}
                wrap={false}
              >
                <ModelAnalysisCard
                  modelId={cardId}
                  modelName={m.name}
                  score={m.score}
                  deltaVsAvg={m.deltaVsAvg}
                  avg={a}
                  insights={m.insights}
                  bandColor={v.band}
                  scoreAccent={v.scoreAccent}
                  bulletDotColor={v.dot}
                />
              </View>
            );
          })}
        </View>

        <PdfTraceMarker page={2} section="Page2:after_model_grid" />

        <Text style={styles.sectionTitle}>Evidence preview</Text>
        {data.evidencePreview.map((ev, i) => {
          const borderC = ev.label.includes("STRENGTH") || ev.label.includes("STR") ? colors.green : colors.red;
          const labelLine = String(ev.label);
          const snippetLine = String(ev.snippet);
          const noteLine = ev.note ? String(ev.note) : "";
          return (
            <View
              key={`ev-${i}`}
              style={[styles.evidenceCard, { borderLeftWidth: 3, borderLeftColor: borderC }]}
              wrap={false}
            >
              <Text style={[styles.evLabel, { color: colors.muted }]}>{labelLine}</Text>
              <Text style={styles.evMono}>{snippetLine}</Text>
              {ev.note ? <Text style={styles.evNote}>{noteLine}</Text> : null}
            </View>
          );
        })}

        <PdfTraceMarker page={2} section="Page2:after_evidence_preview" />

        <View style={styles.takeaway} wrap={false}>
          <Text style={styles.takeawayTitle}>Strategic takeaway</Text>
          <Text style={styles.takeawayBody}>{data.strategicTakeaway}</Text>
        </View>

        <PdfTraceMarker page={2} section="Page2:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
