import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ModelScoreRow, ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { lockedStyles } from "./lockedDocumentStyles";

const HIGHLIGHT_H = 56;
const ROW_H = 44;
const MAX_SLOTS = 9;
const COLS = 3;

const local = StyleSheet.create({
  highlight: { height: HIGHLIGHT_H },
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

function highlightLine(data: ReportData, sorted: ModelScoreRow[]): string {
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  if (best && worst && best.name !== worst.name) {
    return clipPdfText(`Strongest ${best.name} (${best.score}). Weakest ${worst.name} (${worst.score}).`, 200);
  }
  if (best) return clipPdfText(`Primary model signal: ${best.name} (${best.score}).`, 200);
  return "No model rows in this export.";
}

export function PageModelBreakdown({ data }: { data: ReportData }): ReactElement {
  const sorted = sortedModels(data.modelScores);
  const hl = highlightLine(data, sorted);
  const grid = rowsOfThree(sorted);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[5]!}>
      <View style={[lockedStyles.model_highlight, local.highlight]} wrap={false}>
        <Text style={lockedStyles.model_highlightText}>{hl}</Text>
      </View>
      {grid.map((row, ri) => (
        <View key={ri} style={local.gridRow} wrap={false}>
          {row.map((m, ci) => {
            const last = ci === row.length - 1;
            const box = last ? lockedStyles.model_cellLast : lockedStyles.model_cell;
            return (
              <View key={ci} style={box}>
                {m ? (
                  <>
                    <Text style={lockedStyles.model_name}>{clipPdfText(m.name, 22)}</Text>
                    <Text style={lockedStyles.model_score}>{clipPdfText(String(m.score), 12)}</Text>
                  </>
                ) : (
                  <Text style={lockedStyles.model_name}> </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
      <View style={{ marginTop: 8 }}>
        <Text style={lockedStyles.model_takeawayLabel}>Read</Text>
        <Text style={lockedStyles.model_takeaway}>{clipPdfText(data.strategicTakeaway, 220)}</Text>
      </View>
    </PdfInnerPage>
  );
}
