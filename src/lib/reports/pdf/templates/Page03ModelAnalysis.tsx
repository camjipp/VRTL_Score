import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ModelScoreRow, ReportData } from "../types";
import { colors, fonts, rhythm, CONTENT_W, space } from "../theme";
import { modelAnalysisPurpose } from "../editorial/pdfNarrative";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { ModelAnalysisCard } from "../components/ModelAnalysisCard";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { truncateAtWord } from "../fixed/pdfTextBudget";

const GAP = 12;
const TOP_W = (CONTENT_W - GAP) / 2;
const COL3 = (CONTENT_W - 2 * GAP) / 3;

function pickModel(models: readonly ModelScoreRow[], key: string): ModelScoreRow | null {
  const k = key.toLowerCase();
  return models.find((m) => m.name.toLowerCase() === k) ?? models.find((m) => m.name.toLowerCase().includes(k)) ?? null;
}

function avgOf(models: ReportData["modelScores"]) {
  return models.length ? Math.round(models.reduce((s, m) => s + m.score, 0) / models.length) : 0;
}

const styles = StyleSheet.create({
  row2: {
    width: CONTENT_W,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: GAP,
  },
  surfaceCard: {
    width: TOP_W,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: space.cardPad - 2,
    backgroundColor: colors.surface,
  },
  surfaceCardStrong: { borderTopWidth: 4, borderTopColor: colors.green },
  surfaceCardWeak: { borderTopWidth: 4, borderTopColor: colors.red },
  surfaceKicker: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: 6,
  },
  surfaceName: { fontSize: 11, fontFamily: fonts.sansBold, color: colors.ink, marginBottom: 4 },
  surfaceScore: { fontSize: 22, fontFamily: fonts.sansBold, color: colors.ink, marginBottom: 6 },
  surfaceBody: { fontSize: 8, lineHeight: 1.45, color: colors.ink2, fontFamily: fonts.sans },
  rowLabel: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: GAP,
    width: CONTENT_W,
  },
  row3: {
    width: CONTENT_W,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: GAP,
  },
  summaryBox: {
    width: CONTENT_W,
    flex: 1,
    minHeight: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    borderTopWidth: 4,
    borderTopColor: colors.ink,
    backgroundColor: colors.surface2,
    padding: space.cardPad,
  },
  summaryKicker: {
    fontSize: 8,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink,
    marginBottom: 8,
  },
  summaryLine: { fontSize: 8, lineHeight: 1.5, color: colors.ink2, fontFamily: fonts.sans, marginBottom: 4 },
});

function SurfaceHighlight({
  kind,
  model,
  title,
}: {
  kind: "strongest" | "weakest";
  model: ModelScoreRow;
  title: string;
}) {
  const insight = model.insights[0] ? truncateAtWord(String(model.insights[0]), 200) : "—";
  return (
    <View style={[styles.surfaceCard, kind === "strongest" ? styles.surfaceCardStrong : styles.surfaceCardWeak]}>
      <Text style={styles.surfaceKicker}>{title}</Text>
      <Text style={styles.surfaceName}>{model.name}</Text>
      <Text style={styles.surfaceScore}>{String(model.score)}</Text>
      <Text style={styles.surfaceBody}>{insight}</Text>
    </View>
  );
}

/** PAGE 3 — Model analysis with clear strongest / weakest / by-family / summary hierarchy. */
export function Page03ModelAnalysis({ data }: { data: ReportData }): ReactElement {
  const models = data.modelScores;
  const a = avgOf(models);
  const sorted = [...models].sort((x, y) => y.score - x.score);
  const best = sorted[0]!;
  const worst = sorted[sorted.length - 1]!;
  const scores = models.map((m) => m.score);
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;

  const openai = pickModel(models, "OpenAI");
  const anthropic = pickModel(models, "Anthropic");
  const gemini = pickModel(models, "Gemini");

  const purpose = modelAnalysisPurpose(spread);

  const bestLine = best.insights[0] ? truncateAtWord(String(best.insights[0]), 200) : "";
  const worstLine = worst.insights[0] ? truncateAtWord(String(worst.insights[0]), 200) : "";

  return (
    <FixedInnerPage data={data} pageNum={3}>
      <PdfTraceMarker page={3} section="Fixed:P3" />
      <EditorialSectionHeader
        sectionLabel="Model analysis"
        title="Performance by assistant family"
        purpose={purpose}
        intro="OpenAI, Gemini, and Anthropic matter because buyers use different assistants—and each surfaces a different short list. Strong on one and weak on another still costs recommendation share."
      />

      <View style={{ flex: 1, flexDirection: "column", justifyContent: "space-between", minHeight: 0 }}>
        <View style={styles.row2}>
          <SurfaceHighlight kind="strongest" model={best} title="Strongest model" />
          <SurfaceHighlight kind="weakest" model={worst} title="Weakest model" />
        </View>

        <View>
          <Text style={styles.rowLabel}>Full breakdown — OpenAI · Gemini · Anthropic</Text>
          <View style={styles.row3}>
            <View style={{ width: COL3 }}>
              {openai ? (
                <ModelAnalysisCard
                  modelId="p3-openai"
                  modelName={openai.name}
                  score={openai.score}
                  deltaVsAvg={openai.deltaVsAvg}
                  avg={a}
                  insights={openai.insights}
                  bandColor={colors.surface2}
                  scoreAccent={colors.cyan}
                  bulletDotColor={colors.ink4}
                  cardWidth={COL3}
                  maxBullets={1}
                  compact
                />
              ) : (
                <EmptySlot label="OpenAI" />
              )}
            </View>
            <View style={{ width: COL3 }}>
              {gemini ? (
                <ModelAnalysisCard
                  modelId="p3-gemini"
                  modelName={gemini.name}
                  score={gemini.score}
                  deltaVsAvg={gemini.deltaVsAvg}
                  avg={a}
                  insights={gemini.insights}
                  bandColor={colors.surface2}
                  scoreAccent={colors.cyan}
                  bulletDotColor={colors.ink4}
                  cardWidth={COL3}
                  maxBullets={1}
                  compact
                />
              ) : (
                <EmptySlot label="Gemini" />
              )}
            </View>
            <View style={{ width: COL3 }}>
              {anthropic ? (
                <ModelAnalysisCard
                  modelId="p3-anthropic"
                  modelName={anthropic.name}
                  score={anthropic.score}
                  deltaVsAvg={anthropic.deltaVsAvg}
                  avg={a}
                  insights={anthropic.insights}
                  bandColor={colors.surface2}
                  scoreAccent={colors.cyan}
                  bulletDotColor={colors.ink4}
                  cardWidth={COL3}
                  maxBullets={1}
                  compact
                />
              ) : (
                <EmptySlot label="Anthropic" />
              )}
            </View>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryKicker}>What this means overall</Text>
          <Text style={styles.summaryLine}>{`Spread: ${spread} pts · Average: ${a}`}</Text>
          {bestLine ? (
            <Text style={styles.summaryLine}>{`Strongest — ${best.name} (${best.score}): ${bestLine}`}</Text>
          ) : null}
          {worstLine && worst !== best ? (
            <Text style={styles.summaryLine}>{`Weakest — ${worst.name} (${worst.score}): ${worstLine}`}</Text>
          ) : null}
        </View>
      </View>
    </FixedInnerPage>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <View
      style={{
        width: COL3,
        minHeight: 120,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.rule,
        justifyContent: "center",
        alignItems: "center",
        padding: rhythm.md,
        backgroundColor: colors.surface2,
      }}
    >
      <Text style={{ fontSize: 8, fontFamily: fonts.sansBold, color: colors.ink3 }}>{label}</Text>
      <Text style={{ fontSize: 7, color: colors.ink4, marginTop: 4, textAlign: "center" }}>No isolated score.</Text>
    </View>
  );
}
