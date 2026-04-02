import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { ModelAnalysisCard, MODEL_CARD_WIDTH } from "../components/ModelAnalysisCard";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const CONTENT_W = PAGE.width - PAGE.margin * 2;

const avgOf = (models: ReportData["modelScores"]) =>
  models.length ? Math.round(models.reduce((s, m) => s + m.score, 0) / models.length) : 0;

const GAP = 12;

/** Props unused for palette (cards use neutral + single cyan bar); kept for API stability. */
const NEUTRAL_MODEL_VISUAL = {
  band: colors.surface2,
  scoreAccent: colors.cyan,
  dot: colors.ink4,
} as const;

const styles = StyleSheet.create({
  bannerOuter: {
    flexDirection: "row",
    marginBottom: rhythm.xl,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    minHeight: 56,
  },
  bannerBar: { width: 3, backgroundColor: colors.ink3 },
  bannerInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: rhythm.lg,
    paddingHorizontal: rhythm.lg,
  },
  bannerLeft: { flex: 1, paddingRight: rhythm.md, maxWidth: 360 },
  bannerSpread: {
    fontSize: 15,
    fontWeight: 400,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.06,
  },
  bannerSub: {
    fontSize: 8.5,
    color: colors.ink3,
    marginTop: rhythm.sm,
    lineHeight: 1.58,
    fontFamily: fonts.sans,
  },
  bannerPill: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.cyan,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    maxWidth: 172,
  },
  bannerPillText: {
    fontSize: 6,
    fontWeight: 400,
    color: colors.cyan,
    fontFamily: fonts.sansBold,
    lineHeight: 1.35,
    textAlign: "center",
    letterSpacing: 0.08,
  },
  row3: {
    width: CONTENT_W,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: rhythm.xl,
  },
  evidenceOuter: {
    flexDirection: "row",
    marginBottom: rhythm.md,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: "hidden",
  },
  evidenceAccent: { width: 4 },
  evidenceInner: {
    flex: 1,
    paddingVertical: rhythm.lg,
    paddingHorizontal: rhythm.lg,
    backgroundColor: colors.paper,
  },
  evLabel: {
    fontSize: 7.5,
    fontWeight: 400,
    letterSpacing: 0.3,
    marginBottom: rhythm.sm,
    textTransform: "uppercase",
    fontFamily: fonts.sansBold,
  },
  evMono: {
    fontFamily: fonts.mono,
    fontSize: 7.5,
    lineHeight: 1.52,
    color: colors.ink3,
    backgroundColor: colors.surface,
    paddingVertical: rhythm.md,
    paddingHorizontal: rhythm.md,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  evNote: {
    fontSize: 9,
    color: colors.ink,
    marginTop: rhythm.lg,
    lineHeight: 1.62,
    fontFamily: fonts.sans,
  },
  takeawayOuter: {
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: rhythm.md,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  takeawayBar: { width: 3, backgroundColor: colors.ink },
  takeawayInner: {
    flex: 1,
    paddingVertical: rhythm.xl,
    paddingHorizontal: rhythm.lg,
    backgroundColor: colors.surface2,
  },
  takeawayTitle: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.12,
    color: colors.ink4,
    textTransform: "uppercase",
    marginBottom: rhythm.md,
    fontFamily: fonts.sansBold,
  },
  takeawayBody: { fontSize: 10.5, lineHeight: 1.65, color: colors.ink, fontFamily: fonts.sans },
  sectionTitle: {
    ...baseStyles.sectionLabel,
    marginTop: rhythm.sm,
    marginBottom: rhythm.md,
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

        <View style={styles.row3} wrap={false} minPresenceAhead={260}>
          {data.modelScores.map((m, idx) => {
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
                  bandColor={NEUTRAL_MODEL_VISUAL.band}
                  scoreAccent={NEUTRAL_MODEL_VISUAL.scoreAccent}
                  bulletDotColor={NEUTRAL_MODEL_VISUAL.dot}
                />
              </View>
            );
          })}
        </View>

        <PdfTraceMarker page={2} section="Page2:after_model_grid" />

        <View wrap={false} minPresenceAhead={200}>
          <Text style={styles.sectionTitle}>Evidence preview</Text>
          {data.evidencePreview.map((ev, i) => {
            const labelLine = String(ev.label);
            const snippetLine = String(ev.snippet);
            const noteLine = ev.note ? String(ev.note) : "";
            return (
            <View key={`ev-${i}`} style={styles.evidenceOuter} wrap={false} minPresenceAhead={130}>
              <View style={[styles.evidenceAccent, { backgroundColor: colors.ink3 }]} />
              <View style={styles.evidenceInner}>
                <Text style={[styles.evLabel, { color: colors.ink4 }]}>{labelLine}</Text>
                <Text style={styles.evMono}>{snippetLine}</Text>
                {ev.note ? <Text style={styles.evNote}>{noteLine}</Text> : null}
              </View>
            </View>
            );
          })}
        </View>

        <PdfTraceMarker page={2} section="Page2:after_evidence_preview" />

        <View style={styles.takeawayOuter} wrap={false} minPresenceAhead={120}>
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
