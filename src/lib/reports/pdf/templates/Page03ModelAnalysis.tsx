import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ModelScoreRow, ReportData } from "../types";
import { colors, fonts, rhythm, CONTENT_W, space } from "../theme";
import { modelAnalysisPurpose } from "../editorial/pdfNarrative";
import { insightsForModelCard } from "../editorial/modelCardInsights";
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
    marginBottom: GAP + 2,
  },
  surfaceCard: {
    width: TOP_W,
    paddingVertical: space.cardPad + 2,
    paddingHorizontal: space.cardPad - 2,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  surfaceCardStrong: {
    borderTopWidth: 5,
    borderTopColor: colors.green,
    backgroundColor: colors.greenLight,
  },
  surfaceCardWeak: {
    borderTopWidth: 5,
    borderTopColor: colors.red,
    backgroundColor: colors.redLight,
  },
  surfaceKicker: {
    fontSize: 8,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: 10,
  },
  surfaceName: { fontSize: 13, fontFamily: fonts.sansBold, color: colors.ink, marginBottom: 6 },
  surfaceScore: { fontSize: 32, fontFamily: fonts.sansBold, color: colors.ink, marginBottom: 6 },
  surfaceBody: { fontSize: 8.25, lineHeight: 1.45, color: colors.ink2, fontFamily: fonts.sans },
  rowLabel: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.1,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: rhythm.sm + 2,
    marginTop: rhythm.sm,
    width: CONTENT_W,
  },
  row3: {
    width: CONTENT_W,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rhythm.sm,
  },
  summaryBox: {
    width: CONTENT_W,
    marginTop: rhythm.md + 6,
    paddingTop: rhythm.md + 4,
    borderTopWidth: 2,
    borderTopColor: colors.rule,
    backgroundColor: colors.paper,
    paddingBottom: rhythm.sm,
  },
  summaryKicker: {
    fontSize: 8,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.1,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: 6,
  },
  summaryLead: {
    fontSize: 11.5,
    lineHeight: 1.36,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    marginBottom: 4,
  },
  summaryMeta: { fontSize: 7.5, lineHeight: 1.45, color: colors.ink3, fontFamily: fonts.sans },
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
  const nameColor = kind === "weakest" ? "#991B1B" : colors.ink;
  const scoreColor = kind === "weakest" ? "#B91C1C" : colors.ink;
  return (
    <View style={[styles.surfaceCard, kind === "strongest" ? styles.surfaceCardStrong : styles.surfaceCardWeak]}>
      <Text style={styles.surfaceKicker}>{title}</Text>
      <Text style={[styles.surfaceName, { color: nameColor }]}>{model.name}</Text>
      <Text style={[styles.surfaceScore, { color: scoreColor }]}>{String(model.score)}</Text>
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

  return (
    <FixedInnerPage data={data} pageNum={3}>
      <PdfTraceMarker page={3} section="Fixed:P3" />
      <EditorialSectionHeader
        sectionLabel="Model analysis"
        title="Where you win — and where you disappear"
        purpose={purpose}
        intro="The same buyer question can surface different leaders by assistant family. Exploit your strongest family; recover the weakest first."
      />

      <View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start", minHeight: 0 }}>
        <View style={styles.row2}>
          <SurfaceHighlight kind="strongest" model={best} title="Where you win" />
          <SurfaceHighlight kind="weakest" model={worst} title="Where you lose" />
        </View>

        <View>
          <Text style={styles.rowLabel}>By assistant family</Text>
          <View style={styles.row3}>
            <View style={{ width: COL3 }}>
              {openai ? (
                <ModelAnalysisCard
                  modelId="p3-openai"
                  modelName={openai.name}
                  score={openai.score}
                  deltaVsAvg={openai.deltaVsAvg}
                  avg={a}
                  insights={insightsForModelCard(openai, best, worst)}
                  bandColor={colors.surface2}
                  scoreAccent={colors.cyan}
                  bulletDotColor={colors.ink4}
                  cardWidth={COL3}
                  maxBullets={1}
                  compact
                  tier="supporting"
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
                  insights={insightsForModelCard(gemini, best, worst)}
                  bandColor={colors.surface2}
                  scoreAccent={colors.cyan}
                  bulletDotColor={colors.ink4}
                  cardWidth={COL3}
                  maxBullets={1}
                  compact
                  tier="supporting"
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
                  insights={insightsForModelCard(anthropic, best, worst)}
                  bandColor={colors.surface2}
                  scoreAccent={colors.cyan}
                  bulletDotColor={colors.ink4}
                  cardWidth={COL3}
                  maxBullets={1}
                  compact
                  tier="supporting"
                />
              ) : (
                <EmptySlot label="Anthropic" />
              )}
            </View>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryKicker}>What this means</Text>
          <Text style={styles.summaryLead}>{`Double down on ${best.name} (${best.score}). Recover ${worst.name} (${worst.score}) first.`}</Text>
          <Text style={styles.summaryMeta}>{`${spread} pt spread · ${a} avg across models`}</Text>
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
        minHeight: 72,
        paddingVertical: rhythm.md,
        paddingHorizontal: rhythm.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.rule,
        justifyContent: "center",
        backgroundColor: colors.paper,
      }}
    >
      <Text style={{ fontSize: 8, fontFamily: fonts.sansBold, color: colors.ink3 }}>{label}</Text>
      <Text style={{ fontSize: 7.5, color: colors.ink4, marginTop: 4 }}>No score in this export.</Text>
    </View>
  );
}
