import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { formatEvidenceLogPillLabel } from "@/lib/reports/formatEvidenceFieldDisplay";
import { ModelAnalysisCard, MODEL_CARD_WIDTH } from "../components/ModelAnalysisCard";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const CONTENT_W = PAGE.width - PAGE.margin * 2;
const EVIDENCE_GAP = 10;
const EVIDENCE_COL_W = (CONTENT_W - EVIDENCE_GAP) / 2;

const avgOf = (models: ReportData["modelScores"]) =>
  models.length ? Math.round(models.reduce((s, m) => s + m.score, 0) / models.length) : 0;

const GAP = 10;

const NEUTRAL_MODEL_VISUAL = {
  band: colors.surface2,
  scoreAccent: colors.cyan,
  dot: colors.ink4,
} as const;

const styles = StyleSheet.create({
  bannerOuter: {
    flexDirection: "row",
    marginBottom: rhythm.sm,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    minHeight: 36,
  },
  bannerBar: { width: 3, backgroundColor: colors.ink3 },
  bannerInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: rhythm.sm,
  },
  bannerLeft: { flex: 1, paddingRight: rhythm.sm, maxWidth: 380 },
  bannerSpread: {
    fontSize: 12,
    fontWeight: 400,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.02,
  },
  bannerSub: {
    fontSize: 7.5,
    color: colors.ink2,
    marginTop: 2,
    lineHeight: 1.4,
    fontFamily: fonts.sans,
  },
  bannerPill: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    maxWidth: 148,
  },
  bannerPillText: {
    fontSize: 5,
    fontWeight: 400,
    color: colors.ink2,
    fontFamily: fonts.sansBold,
    lineHeight: 1.25,
    textAlign: "center",
    letterSpacing: 0.05,
  },
  row3: {
    width: CONTENT_W,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: rhythm.xs,
  },
  evidenceRow: {
    width: CONTENT_W,
    flexDirection: "row",
    marginBottom: rhythm.sm,
    alignItems: "stretch",
  },
  evidenceOuter: {
    flexDirection: "row",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: "hidden",
    width: EVIDENCE_COL_W,
    minHeight: 128,
  },
  evidenceAccent: { width: 3 },
  evidenceInner: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: colors.paper,
    justifyContent: "flex-start",
  },
  evLabel: {
    fontSize: 6.5,
    fontWeight: 400,
    letterSpacing: 0.12,
    marginBottom: 5,
    textTransform: "uppercase",
    fontFamily: fonts.sansBold,
    color: colors.ink3,
  },
  evProseWrap: {
    minHeight: 74,
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "flex-start",
  },
  evProse: {
    fontFamily: fonts.sans,
    fontSize: 8,
    lineHeight: 1.48,
    color: colors.ink,
  },
  evNote: {
    fontSize: 8,
    color: colors.ink,
    marginTop: 10,
    lineHeight: 1.5,
    fontFamily: fonts.sans,
  },
  takeawayOuter: {
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: rhythm.sm,
    borderWidth: 1,
    borderColor: colors.rule,
    minHeight: 108,
  },
  takeawayBar: { width: 3, backgroundColor: colors.ink },
  takeawayInner: {
    flex: 1,
    paddingVertical: rhythm.lg,
    paddingHorizontal: rhythm.md,
    backgroundColor: colors.surface2,
    justifyContent: "center",
    minHeight: 104,
  },
  takeawayTitle: {
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 0.1,
    color: colors.ink3,
    textTransform: "uppercase",
    marginBottom: 6,
    fontFamily: fonts.sansBold,
  },
  takeawayBody: { fontSize: 9, lineHeight: 1.58, color: colors.ink, fontFamily: fonts.sans },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink3,
    marginTop: 0,
    marginBottom: 4,
    fontFamily: fonts.sansBold,
  },
});

export function Page2ModelAnalysis({ data }: { data: ReportData }) {
  const a = avgOf(data.modelScores);
  const scores = data.modelScores.map((m) => m.score);
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;
  const spreadLine = `${spread}-POINT SPREAD`;
  const descLine =
    spread === 0
      ? "No spread across assistant families in this snapshot."
      : `${spread} points separate best and worst—buyers get different short lists depending on which assistant they use.`;

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={2} section="Page2:start" />
        <PdfHeader data={data} variant="inner" pageNum={2} />
        <PdfTraceMarker page={2} section="Page2:after_header" />

        <ChapterTitle title="Model Analysis" />

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

        <View style={styles.row3} wrap={false}>
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

        <Text style={styles.sectionTitle}>What assistants are surfacing</Text>
        <View style={styles.evidenceRow} wrap={false}>
          {data.evidencePreview.map((ev, i) => {
            const labelLine = formatEvidenceLogPillLabel(String(ev.label));
            const snippetLine = String(ev.snippet);
            const noteLine = ev.note ? String(ev.note) : "";
            return (
              <View
                key={`ev-${i}`}
                style={[styles.evidenceOuter, i === 0 ? { marginRight: EVIDENCE_GAP } : {}]}
                wrap={false}
              >
                <View style={[styles.evidenceAccent, { backgroundColor: colors.ink3 }]} />
                <View style={styles.evidenceInner}>
                  <Text style={styles.evLabel}>{labelLine}</Text>
                  <View style={styles.evProseWrap}>
                    <Text style={styles.evProse}>{snippetLine}</Text>
                  </View>
                  {ev.note ? <Text style={styles.evNote}>{noteLine}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>

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
