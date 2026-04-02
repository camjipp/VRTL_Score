import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, space, baseStyles } from "../theme";
import { ModelAnalysisCard, MODEL_CARD_WIDTH } from "../components/ModelAnalysisCard";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const CONTENT_W = PAGE.width - PAGE.margin * 2;

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
  bannerOuter: {
    flexDirection: "row",
    marginBottom: space.section,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.cyanLight,
  },
  bannerBar: { width: 4, backgroundColor: colors.cyan },
  bannerInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  bannerLeft: { flex: 1, paddingRight: 8 },
  bannerSpread: { fontSize: 18, fontWeight: 800, color: colors.ink, fontFamily: fonts.sans },
  bannerSub: {
    fontSize: 9,
    color: colors.ink2,
    marginTop: 4,
    lineHeight: 1.45,
    fontFamily: fonts.sans,
  },
  bannerPill: {
    backgroundColor: colors.cyan,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  bannerPillText: { fontSize: 7, fontWeight: 700, color: colors.paper, fontFamily: fonts.sans },
  row3: {
    width: CONTENT_W,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: space.section,
  },
  evidenceOuter: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: "hidden",
  },
  evidenceAccent: { width: 4 },
  evidenceInner: { flex: 1, padding: 14, backgroundColor: colors.paper },
  evLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.65,
    marginBottom: 8,
    textTransform: "uppercase",
    fontFamily: fonts.sans,
  },
  evMono: {
    fontFamily: fonts.mono,
    fontSize: 8,
    lineHeight: 1.45,
    color: colors.ink3,
    backgroundColor: colors.surface2,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  evNote: {
    fontSize: 8,
    color: colors.ink2,
    marginTop: 8,
    lineHeight: 1.45,
    fontFamily: fonts.sans,
  },
  takeawayOuter: {
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
  takeawayBar: { width: 4, backgroundColor: colors.violet },
  takeawayInner: { flex: 1, padding: 14, backgroundColor: colors.violetLight },
  takeawayTitle: {
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.65,
    color: colors.violet,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: fonts.sans,
  },
  takeawayBody: { fontSize: 10, lineHeight: 1.55, color: colors.ink2, fontFamily: fonts.sans },
  sectionTitle: {
    ...baseStyles.sectionLabel,
    marginTop: 6,
    marginBottom: 10,
    fontFamily: fonts.sans,
  },
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

        <View style={styles.bannerOuter} wrap={false}>
          <View style={styles.bannerBar} />
          <View style={styles.bannerInner}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerSpread}>{spreadLine}</Text>
              <Text style={styles.bannerSub}>{descLine}</Text>
            </View>
            <View style={styles.bannerPill}>
              <Text style={styles.bannerPillText}>HIGHEST-LEVERAGE OPPORTUNITY</Text>
            </View>
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
            <View key={`ev-${i}`} style={styles.evidenceOuter} wrap={false}>
              <View style={[styles.evidenceAccent, { backgroundColor: borderC }]} />
              <View style={styles.evidenceInner}>
                <Text style={[styles.evLabel, { color: colors.ink4 }]}>{labelLine}</Text>
                <Text style={styles.evMono}>{snippetLine}</Text>
                {ev.note ? <Text style={styles.evNote}>{noteLine}</Text> : null}
              </View>
            </View>
          );
        })}

        <PdfTraceMarker page={2} section="Page2:after_evidence_preview" />

        <View style={styles.takeawayOuter} wrap={false}>
          <View style={styles.takeawayBar} />
          <View style={styles.takeawayInner}>
            <Text style={styles.takeawayTitle}>Strategic takeaway</Text>
            <Text style={styles.takeawayBody}>{data.strategicTakeaway}</Text>
          </View>
        </View>

        <PdfTraceMarker page={2} section="Page2:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
