import { Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ModelScoreRow, ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeModel } from "./pageNarratives";

function sortedModels(rows: readonly ModelScoreRow[]): ModelScoreRow[] {
  return [...rows].sort((a, b) => b.score - a.score);
}

function modelSignal(score: number): "Strong" | "Moderate" | "Weak" {
  if (score >= 70) return "Strong";
  if (score >= 50) return "Moderate";
  return "Weak";
}

function formatDelta(score: number, avg: number): string {
  const d = Math.round(score - avg);
  if (d === 0) return "0";
  return d > 0 ? `+${d}` : String(d);
}

function deltaTextStyle(score: number, avg: number) {
  const d = Math.round(score - avg);
  if (d > 0) return lockedStyles.model_scoresTdDeltaStrong;
  if (d < 0) return lockedStyles.model_scoresTdDeltaWeak;
  return lockedStyles.model_scoresTd;
}

function ProfileSpark({ score }: { score: number }): ReactElement {
  const s = Math.min(100, Math.max(0, score));
  const rest = 100 - s;
  return (
    <View style={{ width: 52 }} wrap={false}>
      <View style={lockedStyles.model_profileTrack} wrap={false}>
        <View style={[lockedStyles.model_profileFill, { flex: Math.max(1, s) }]} />
        <View style={[lockedStyles.model_profileRest, { flex: Math.max(1, rest) }]} />
      </View>
    </View>
  );
}

function spreadAsideHeadline(best: ModelScoreRow | undefined, worst: ModelScoreRow | undefined): string {
  if (best && worst && best.name !== worst.name) {
    return clipPdfText(
      `${best.name} reads strongest here; ${worst.name} reads weakest on the same scale.`,
      280,
    );
  }
  if (best) {
    return clipPdfText("One model signal in this export—add coverage to compare how each model answers.", 260);
  }
  return clipPdfText("No per-model scores in this export yet.", 200);
}

export function PageModelBreakdown({ data }: { data: ReportData }): ReactElement {
  const sorted = sortedModels(data.modelScores);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const slice = narrativeModel(data);

  const showPoles = Boolean(best && worst && best.name !== worst.name);
  const gap =
    showPoles ? Math.max(0, Math.round((best?.score ?? 0) - (worst?.score ?? 0))) : null;
  const avgScore =
    sorted.length > 0 ? Math.round(sorted.reduce((s, m) => s + m.score, 0) / sorted.length) : 0;

  const tensionLine =
    showPoles && gap != null && gap >= 15 && worst
      ? clipPdfText(
          `${gap} points from best to worst model in this snapshot—parity work should start on ${worst.name} first.`,
          420,
        )
      : null;

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[5]!}>
      <LockedNarrativeStack slice={slice} include={["headline"]} />

      {sorted.length === 0 ? (
        <View style={lockedStyles.perf_section} wrap={false}>
          <Text style={lockedStyles.model_takeawayLabel}>Model data</Text>
          <Text style={lockedStyles.model_takeaway}>
            {clipPdfText("No model rows in this export. Once scores exist, this page compares them on one scale.")}
          </Text>
        </View>
      ) : (
        <>
          <View style={lockedStyles.perf_section} wrap={false}>
            <Text style={lockedStyles.perf_sectionEyebrow}>Spread at a glance</Text>
            <View style={lockedStyles.model_spreadRow} wrap={false}>
              <View style={lockedStyles.model_spreadDial} wrap={false}>
                {gap != null ? (
                  <Text style={lockedStyles.model_spreadGapNumber}>{String(gap)}</Text>
                ) : (
                  <Text style={lockedStyles.model_spreadGapNumberMuted}>—</Text>
                )}
                <Text style={lockedStyles.model_spreadGapCaption}>
                  {gap != null
                    ? clipPdfText("Points between highest- and lowest-scoring models (same 0–100 scale).", 120)
                    : clipPdfText("Not enough distinct models to show a spread in this export.", 120)}
                </Text>
              </View>
              <View style={lockedStyles.model_spreadAside} wrap={false}>
                <Text style={lockedStyles.model_spreadAsideLabel}>Range</Text>
                <Text style={lockedStyles.model_spreadAsideHeadline}>{spreadAsideHeadline(best, worst)}</Text>
                {best ? (
                  <View style={lockedStyles.model_spreadFactsRow} wrap={false}>
                    <Text style={lockedStyles.model_spreadFactKey}>Highest</Text>
                    <Text style={lockedStyles.model_spreadFactVal}>
                      {clipPdfText(best.name, 28)} — {String(best.score)}
                    </Text>
                  </View>
                ) : null}
                <View style={lockedStyles.model_spreadFactsRow} wrap={false}>
                  <Text style={lockedStyles.model_spreadFactKey}>Blended</Text>
                  <Text style={lockedStyles.model_spreadFactVal}>
                    {String(avgScore)} across {String(sorted.length)} model{sorted.length === 1 ? "" : "s"}
                  </Text>
                </View>
                {showPoles && worst ? (
                  <View style={lockedStyles.model_spreadFactsRow} wrap={false}>
                    <Text style={lockedStyles.model_spreadFactKey}>Lowest</Text>
                    <Text style={lockedStyles.model_spreadFactVal}>
                      {clipPdfText(worst.name, 28)} — {String(worst.score)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={lockedStyles.model_scoresBlock} wrap={false}>
            <Text style={lockedStyles.model_scoresTitle}>Scores by model</Text>
            <View style={lockedStyles.model_scoresTable} wrap={false}>
              <View style={lockedStyles.model_scoresThRow} wrap={false}>
                <Text style={[lockedStyles.model_scoresThText, lockedStyles.model_scoresColModel]}>Model</Text>
                <Text style={[lockedStyles.model_scoresThText, lockedStyles.model_scoresColScore]}>Score</Text>
                <Text style={[lockedStyles.model_scoresThText, lockedStyles.model_scoresColDelta]}>vs blended</Text>
                <Text style={[lockedStyles.model_scoresThText, lockedStyles.model_scoresColSignal]}>Signal</Text>
                <Text style={[lockedStyles.model_scoresThText, lockedStyles.model_scoresColProfile]}>Shape</Text>
              </View>
              {sorted.map((m, i) => {
                const isBest = i === 0;
                const isWorst = i === sorted.length - 1 && sorted.length > 1;
                const rowBg =
                  isBest && showPoles
                    ? lockedStyles.model_scoresTrBest
                    : isWorst && showPoles
                      ? lockedStyles.model_scoresTrWorst
                      : sorted.length === 1 && isBest
                        ? lockedStyles.model_scoresTrBest
                        : i % 2 === 1
                          ? lockedStyles.model_scoresRowBgAlt
                          : lockedStyles.model_scoresRowBg;
                const nameStyle =
                  isBest || isWorst ? lockedStyles.model_scoresTdEmphasis : lockedStyles.model_scoresTd;
                return (
                  <View key={`${m.name}-${i}`} style={[lockedStyles.model_scoresTr, rowBg]} wrap={false}>
                    <Text style={[nameStyle, lockedStyles.model_scoresColModel]}>{clipPdfText(m.name, 32)}</Text>
                    <Text style={[lockedStyles.model_scoresTdEmphasis, lockedStyles.model_scoresColScore]}>
                      {String(m.score)}
                    </Text>
                    <Text style={[deltaTextStyle(m.score, avgScore), lockedStyles.model_scoresColDelta]}>
                      {formatDelta(m.score, avgScore)}
                    </Text>
                    <Text style={[lockedStyles.model_scoresTd, lockedStyles.model_scoresColSignal]}>
                      {modelSignal(m.score)}
                    </Text>
                    <View style={[lockedStyles.model_scoresColProfile, { justifyContent: "center" }]} wrap={false}>
                      <ProfileSpark score={m.score} />
                    </View>
                  </View>
                );
              })}
            </View>
            {tensionLine ? <Text style={lockedStyles.model_scoresTension}>{tensionLine}</Text> : null}
            <Text style={lockedStyles.model_scoresFoot}>
              {clipPdfText(
                "Each row is the same 0–100 scale as your headline AI Authority Score—deltas are against the blended average above.",
                520,
              )}
            </Text>
          </View>

          <View style={lockedStyles.perf_sectionDiagnosis} wrap={false}>
            <Text style={lockedStyles.perf_sectionEyebrow}>Implication</Text>
            <View style={lockedStyles.perf_diagWrap} wrap={false}>
              <View style={lockedStyles.perf_diagNarrativeWrap} wrap={false}>
                <Text style={[lockedStyles.perf_diagNarrative, lockedStyles.perf_diagNarrativeGap]}>
                  {slice.interpretation}
                </Text>
                <Text style={[lockedStyles.perf_diagNarrative, lockedStyles.perf_diagNarrativeGap]}>
                  {slice.implication}
                </Text>
                {slice.action ? <Text style={lockedStyles.model_implicationAction}>{slice.action}</Text> : null}
              </View>
            </View>
          </View>
        </>
      )}
    </PdfInnerPage>
  );
}
