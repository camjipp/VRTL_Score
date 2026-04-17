import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ModelScoreRow, ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, CONTENT_W, space } from "../theme";
import { ModelAnalysisCard } from "../components/ModelAnalysisCard";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const GAP = 10;
const COL_W = (CONTENT_W - GAP) / 2;
const TOP_ROW_H = 288;
const BOT_ROW_H = 218;

const NEUTRAL = {
  band: colors.surface2,
  scoreAccent: colors.cyan,
  dot: colors.ink4,
} as const;

const styles = StyleSheet.create({
  matrix: {
    width: CONTENT_W,
    marginTop: rhythm.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  slot: {
    width: COL_W,
    height: "100%",
  },
  summaryCard: {
    width: COL_W,
    height: "100%",
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    borderTopWidth: 3,
    borderTopColor: colors.ink2,
    padding: space.cardPad,
    overflow: "hidden",
  },
  summaryKicker: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: 10,
  },
  summaryMetric: {
    fontSize: 9,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    marginBottom: 6,
    lineHeight: 1.45,
  },
  summaryLabel: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    color: colors.ink3,
    textTransform: "uppercase",
    marginTop: 10,
    marginBottom: 4,
  },
  summaryBody: {
    fontSize: 8,
    lineHeight: 1.5,
    color: colors.ink2,
    fontFamily: fonts.sans,
  },
});

function pickModel(models: readonly ModelScoreRow[], key: string): ModelScoreRow | null {
  const k = key.toLowerCase();
  return models.find((m) => m.name.toLowerCase() === k) ?? models.find((m) => m.name.toLowerCase().includes(k)) ?? null;
}

function avgOf(models: ReportData["modelScores"]) {
  return models.length ? Math.round(models.reduce((s, m) => s + m.score, 0) / models.length) : 0;
}

/** Slide — 2×2 matrix: OpenAI + Anthropic (large row), Gemini + summary (compact row). Fixed heights; no overflow to next page. */
export function PageModelAnalysisMatrix({ data }: { data: ReportData }) {
  const models = data.modelScores;
  const a = avgOf(models);
  const sorted = [...models].sort((x, y) => y.score - x.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const scores = models.map((m) => m.score);
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;

  const openai = pickModel(models, "OpenAI");
  const anthropic = pickModel(models, "Anthropic");
  const gemini = pickModel(models, "Gemini");

  const subtitle =
    spread === 0
      ? "Scores align across assistant families in this snapshot."
      : `${spread} points from best to worst. Buyers see different short lists by assistant.`;

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={3} section="ModelMatrix:start" />
        <PdfHeader data={data} variant="inner" pageNum={3} />
        <ChapterTitle title="Model analysis" subtitle={subtitle} />
        <View style={styles.matrix}>
          <View style={[styles.row, { height: TOP_ROW_H }]}>
            <View style={styles.slot}>
              {openai ? (
                <ModelAnalysisCard
                  modelId="matrix-openai"
                  modelName={openai.name}
                  score={openai.score}
                  deltaVsAvg={openai.deltaVsAvg}
                  avg={a}
                  insights={openai.insights}
                  bandColor={NEUTRAL.band}
                  scoreAccent={NEUTRAL.scoreAccent}
                  bulletDotColor={NEUTRAL.dot}
                  cardWidth={COL_W}
                  maxBullets={2}
                />
              ) : (
                <EmptyModelSlot label="OpenAI" />
              )}
            </View>
            <View style={styles.slot}>
              {anthropic ? (
                <ModelAnalysisCard
                  modelId="matrix-anthropic"
                  modelName={anthropic.name}
                  score={anthropic.score}
                  deltaVsAvg={anthropic.deltaVsAvg}
                  avg={a}
                  insights={anthropic.insights}
                  bandColor={NEUTRAL.band}
                  scoreAccent={NEUTRAL.scoreAccent}
                  bulletDotColor={NEUTRAL.dot}
                  cardWidth={COL_W}
                  maxBullets={2}
                />
              ) : (
                <EmptyModelSlot label="Anthropic" />
              )}
            </View>
          </View>
          <View style={{ height: GAP }} />
          <View style={[styles.row, { height: BOT_ROW_H }]}>
            <View style={styles.slot}>
              {gemini ? (
                <ModelAnalysisCard
                  modelId="matrix-gemini"
                  modelName={gemini.name}
                  score={gemini.score}
                  deltaVsAvg={gemini.deltaVsAvg}
                  avg={a}
                  insights={gemini.insights}
                  bandColor={NEUTRAL.band}
                  scoreAccent={NEUTRAL.scoreAccent}
                  bulletDotColor={NEUTRAL.dot}
                  cardWidth={COL_W}
                  maxBullets={1}
                  compact
                />
              ) : (
                <EmptyModelSlot label="Gemini" compact />
              )}
            </View>
            <View style={styles.slot}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryKicker}>Cross-model summary</Text>
                <Text style={styles.summaryMetric}>{`Spread: ${spread} pts · Avg: ${a}`}</Text>
                {best ? (
                  <>
                    <Text style={styles.summaryLabel}>Strongest</Text>
                    <Text style={styles.summaryBody}>
                      {`${best.name} (${best.score}) — ${best.insights[0] ? String(best.insights[0]).slice(0, 140) : "Lead with what this assistant already rewards."}`}
                    </Text>
                  </>
                ) : null}
                {worst && worst !== best ? (
                  <>
                    <Text style={styles.summaryLabel}>Weakest</Text>
                    <Text style={styles.summaryBody}>
                      {`${worst.name} (${worst.score}) — ${worst.insights[0] ? String(worst.insights[0]).slice(0, 140) : "This path is where share is leaking."}`}
                    </Text>
                  </>
                ) : null}
              </View>
            </View>
          </View>
        </View>
        <PdfTraceMarker page={3} section="ModelMatrix:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}

function EmptyModelSlot({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <View
      style={{
        width: COL_W,
        height: "100%",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.rule,
        justifyContent: "center",
        alignItems: "center",
        padding: space.cardPad,
        backgroundColor: colors.surface2,
      }}
    >
      <Text style={{ fontSize: compact ? 8 : 9, fontFamily: fonts.sansBold, color: colors.ink3, marginBottom: 6 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 7.5, color: colors.ink4, fontFamily: fonts.sans, textAlign: "center" }}>
        No isolated score for this assistant in this run.
      </Text>
    </View>
  );
}
