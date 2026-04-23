import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeClosing } from "./pageNarratives";

/** Cap list length so the appendix reliably fits above the page footer. */
const LOG_ROWS = 7;
const PHASE_MAX = 2;

const local = StyleSheet.create({
  thH: { height: 14 },
});

export function PageClosing({ data }: { data: ReportData }): ReactElement {
  const phases = data.executionPhases.slice(0, PHASE_MAX);
  const log = data.evidenceLog.slice(0, LOG_ROWS);
  const next =
    data.recommendedNextStepsVisible === false
      ? ""
      : clipPdfText(data.recommendedNextSteps || "");
  const slice = narrativeClosing(data);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[9]!}>
      <LockedNarrativeStack slice={slice} include={["headline"]} />
      <View style={lockedStyles.close_block} wrap={false}>
        <Text style={lockedStyles.close_h_next}>Next steps</Text>
        <Text style={lockedStyles.close_nextBody}>{next || " "}</Text>
      </View>
      <View style={lockedStyles.close_block} wrap={false}>
        <Text style={lockedStyles.close_h_exec}>Execution</Text>
        {phases.map((ph, i) => (
          <View key={i} style={{ marginBottom: 6 }} wrap={false}>
            <Text style={lockedStyles.close_phaseTitle}>{clipPdfText(ph.phase)}</Text>
            <Text style={lockedStyles.close_phaseBody}>{clipPdfText(ph.text)}</Text>
          </View>
        ))}
      </View>
      <View style={lockedStyles.close_blockTight} wrap={false}>
        <Text style={lockedStyles.close_h_method}>Methodology</Text>
        <Text style={lockedStyles.close_methodBody}>{clipPdfText(data.methodology)}</Text>
      </View>
      <View style={lockedStyles.close_logWrap}>
        <Text style={lockedStyles.close_logEyebrow}>Evidence appendix</Text>
        <View style={[lockedStyles.close_logTh, local.thH]} wrap={false}>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c1]}>#</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c2]}>Label</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c3]}>Mentioned</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c4]}>Position</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c5]}>Prompt / context</Text>
        </View>
        {log.map((r) => {
          const contextLine = r.note
            ? clipPdfText(r.note, 120)
            : clipPdfText(`Also cited: ${r.competitors || "—"}`, 120);
          return (
            <View key={r.idx} style={lockedStyles.close_logTr} wrap={false}>
              <Text style={[lockedStyles.close_logCell, lockedStyles.close_c1]}>{String(r.idx)}</Text>
              <Text style={[lockedStyles.close_logCell, lockedStyles.close_c2]}>{clipPdfText(r.label)}</Text>
              <Text style={[lockedStyles.close_logCell, lockedStyles.close_c3]}>{clipPdfText(r.mentioned)}</Text>
              <Text style={[lockedStyles.close_logCell, lockedStyles.close_c4]}>{clipPdfText(r.position)}</Text>
              <Text style={[lockedStyles.close_logCell, lockedStyles.close_c5]}>{contextLine}</Text>
            </View>
          );
        })}
      </View>
    </PdfInnerPage>
  );
}
