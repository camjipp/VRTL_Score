import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ModelScoreRow, ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeModel } from "./pageNarratives";

const FRACTURE_H = 108;
const ROW_H = 52;
const COLS = 3;

const local = StyleSheet.create({
  fracture: { minHeight: FRACTURE_H },
  gridRow: { flexDirection: "row", height: ROW_H, marginBottom: 6 },
});

function sortedModels(rows: readonly ModelScoreRow[]): ModelScoreRow[] {
  return [...rows].sort((a, b) => b.score - a.score);
}

function ModelScoreBar({ score }: { score: number }): ReactElement {
  const s = Math.min(100, Math.max(0, score));
  const rest = 100 - s;
  return (
    <View style={lockedStyles.model_scoreBarTrack} wrap={false}>
      <View style={[lockedStyles.model_scoreBarFill, { flex: Math.max(1, s) }]} />
      <View style={[lockedStyles.model_scoreBarRest, { flex: Math.max(1, rest) }]} />
    </View>
  );
}

function rowsOfThree(models: ModelScoreRow[]): (ModelScoreRow | null)[][] {
  const cap = Math.max(COLS, models.length);
  const slots: (ModelScoreRow | null)[] = [...models.slice(0, cap)];
  while (slots.length % COLS !== 0) slots.push(null);
  const out: (ModelScoreRow | null)[][] = [];
  for (let i = 0; i < slots.length; i += COLS) {
    out.push(slots.slice(i, i + COLS) as (ModelScoreRow | null)[]);
  }
  return out;
}

export function PageModelBreakdown({ data }: { data: ReportData }): ReactElement {
  const sorted = sortedModels(data.modelScores);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const grid = rowsOfThree(sorted);
  const slice = narrativeModel(data);

  const gap =
    best && worst && best.name !== worst.name ? Math.max(0, Math.round(best.score - worst.score)) : null;
  const avgScore =
    sorted.length > 0 ? Math.round(sorted.reduce((s, m) => s + m.score, 0) / sorted.length) : 0;

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[5]!}>
      <LockedNarrativeStack slice={slice} include={["headline"]} />
      <View style={[lockedStyles.model_fractureShell, local.fracture]} wrap={false}>
        <Text style={lockedStyles.model_fractureEyebrow}>
          {"Model divergence"}
        </Text>
        {best && worst && best.name !== worst.name ? (
          <View style={lockedStyles.model_fractureRow}>
            <View style={[lockedStyles.model_pole, lockedStyles.model_poleBest]}>
              <Text style={lockedStyles.model_poleLabel}>Strongest read</Text>
              <Text style={lockedStyles.model_poleName}>{clipPdfText(best.name)}</Text>
              <Text style={lockedStyles.model_poleScore}>{String(best.score)}</Text>
              <ModelScoreBar score={best.score} />
            </View>
            <View style={[lockedStyles.model_gapColumn, lockedStyles.model_gapColumnStrong]}>
              <Text style={lockedStyles.model_gapLabel}>Spread</Text>
              <Text style={lockedStyles.model_gapValue}>{gap === 0 ? "0" : String(gap)}</Text>
              <Text style={lockedStyles.model_gapCaption}>points between best and worst</Text>
            </View>
            <View style={[lockedStyles.model_pole, lockedStyles.model_poleWorst]}>
              <Text style={lockedStyles.model_poleLabel}>Weakest read</Text>
              <Text style={lockedStyles.model_poleName}>{clipPdfText(worst.name)}</Text>
              <Text style={lockedStyles.model_poleScore}>{String(worst.score)}</Text>
              <ModelScoreBar score={worst.score} />
            </View>
          </View>
        ) : best ? (
          <View style={lockedStyles.model_fractureRow}>
            <View style={[lockedStyles.model_pole, lockedStyles.model_poleBest, { flex: 1, marginRight: 0 }]}>
              <Text style={lockedStyles.model_poleLabel}>Primary signal</Text>
              <Text style={lockedStyles.model_poleName}>{clipPdfText(best.name)}</Text>
              <Text style={lockedStyles.model_poleScore}>{String(best.score)}</Text>
              <ModelScoreBar score={best.score} />
              <Text style={[lockedStyles.model_gapCaption, { marginTop: 6, textAlign: "left" }]}>
                {clipPdfText("Add model coverage to measure how assistants diverge on you.")}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={lockedStyles.model_takeaway}>No model rows in this export.</Text>
        )}
        {sorted.length > 0 ? (
          <View style={lockedStyles.model_avgRow} wrap={false}>
            <Text style={lockedStyles.model_avgLabel}>Blended average (same 0–100 scale)</Text>
            <View style={lockedStyles.model_avgBarTrack} wrap={false}>
              <View style={[lockedStyles.model_scoreBarFill, { flex: Math.max(1, avgScore) }]} />
              <View style={[lockedStyles.model_scoreBarRest, { flex: Math.max(1, 100 - avgScore) }]} />
            </View>
            <Text style={[lockedStyles.model_gapCaption, { textAlign: "left", marginTop: 4 }]}>
              {String(avgScore)} — compare each bar above to this baseline.
            </Text>
          </View>
        ) : null}
      </View>
      {grid.map((row, ri) => (
        <View key={ri} style={local.gridRow} wrap={false}>
          {row.map((m, ci) => {
            const last = ci === row.length - 1;
            if (!m) {
              const emptyBox = last ? lockedStyles.model_cellEmptyLast : lockedStyles.model_cellEmpty;
              return (
                <View key={ci} style={emptyBox}>
                  <Text style={lockedStyles.model_name}> </Text>
                </View>
              );
            }
            const box = last ? lockedStyles.model_cellLast : lockedStyles.model_cell;
            return (
              <View key={ci} style={box}>
                <Text style={lockedStyles.model_cellLabel}>Model</Text>
                <Text style={lockedStyles.model_name}>{clipPdfText(m.name)}</Text>
                <Text style={lockedStyles.model_score}>{clipPdfText(String(m.score))}</Text>
                <ModelScoreBar score={m.score} />
              </View>
            );
          })}
        </View>
      ))}
      <View style={lockedStyles.model_closingBlock} wrap={false}>
        <Text style={lockedStyles.model_closingLead}>{slice.interpretation}</Text>
        <Text style={lockedStyles.model_closingBody}>{slice.implication}</Text>
        {slice.action ? <Text style={lockedStyles.model_closingAction}>{slice.action}</Text> : null}
      </View>
    </PdfInnerPage>
  );
}
