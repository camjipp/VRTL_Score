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
const ROW_H = 44;
const MAX_SLOTS = 9;
const COLS = 3;

const local = StyleSheet.create({
  fracture: { minHeight: FRACTURE_H },
  gridRow: { flexDirection: "row", height: ROW_H, marginBottom: 6 },
});

function sortedModels(rows: readonly ModelScoreRow[]): ModelScoreRow[] {
  return [...rows].sort((a, b) => b.score - a.score);
}

function rowsOfThree(models: ModelScoreRow[]): (ModelScoreRow | null)[][] {
  const slots: (ModelScoreRow | null)[] = [...models.slice(0, MAX_SLOTS)];
  while (slots.length < MAX_SLOTS) slots.push(null);
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

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[5]!}>
      <LockedNarrativeStack slice={slice} include={["headline"]} />
      <View style={[lockedStyles.model_fractureShell, local.fracture]} wrap={false}>
        <Text style={lockedStyles.model_fractureEyebrow}>Models disagree on you</Text>
        {best && worst && best.name !== worst.name ? (
          <View style={lockedStyles.model_fractureRow}>
            <View style={[lockedStyles.model_pole, lockedStyles.model_poleBest]}>
              <Text style={lockedStyles.model_poleLabel}>Strongest read</Text>
              <Text style={lockedStyles.model_poleName}>{clipPdfText(best.name, 22)}</Text>
              <Text style={lockedStyles.model_poleScore}>{String(best.score)}</Text>
            </View>
            <View style={lockedStyles.model_gapColumn}>
              <Text style={lockedStyles.model_gapLabel}>Spread</Text>
              <Text style={lockedStyles.model_gapValue}>{gap === 0 ? "0" : String(gap)}</Text>
              <Text style={lockedStyles.model_gapCaption}>points between best and worst</Text>
            </View>
            <View style={[lockedStyles.model_pole, lockedStyles.model_poleWorst]}>
              <Text style={lockedStyles.model_poleLabel}>Weakest read</Text>
              <Text style={lockedStyles.model_poleName}>{clipPdfText(worst.name, 22)}</Text>
              <Text style={lockedStyles.model_poleScore}>{String(worst.score)}</Text>
            </View>
          </View>
        ) : best ? (
          <View style={lockedStyles.model_fractureRow}>
            <View style={[lockedStyles.model_pole, lockedStyles.model_poleBest, { flex: 1, marginRight: 0 }]}>
              <Text style={lockedStyles.model_poleLabel}>Primary signal</Text>
              <Text style={lockedStyles.model_poleName}>{clipPdfText(best.name, 28)}</Text>
              <Text style={lockedStyles.model_poleScore}>{String(best.score)}</Text>
              <Text style={[lockedStyles.model_gapCaption, { marginTop: 6, textAlign: "left" }]}>
                {clipPdfText("Add model coverage to measure how assistants diverge on you.", 96)}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={lockedStyles.model_takeaway}>No model rows in this export.</Text>
        )}
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
                <Text style={lockedStyles.model_name}>{clipPdfText(m.name, 22)}</Text>
                <Text style={lockedStyles.model_score}>{clipPdfText(String(m.score), 12)}</Text>
              </View>
            );
          })}
        </View>
      ))}
      <LockedNarrativeStack
        slice={slice}
        stackRole="afterPrimary"
        include={["interpretation", "implication", "action", "inaction"]}
      />
    </PdfInnerPage>
  );
}
