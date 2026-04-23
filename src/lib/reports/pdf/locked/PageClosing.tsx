import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { lockedStyles } from "./lockedDocumentStyles";

const LOG_ROWS = 5;
const ROW_H = 16;
const PHASE_MAX = 3;

const local = StyleSheet.create({
  thH: { height: ROW_H },
  trH: { height: ROW_H },
});

export function PageClosing({ data }: { data: ReportData }): ReactElement {
  const phases = data.executionPhases.slice(0, PHASE_MAX);
  const log = data.evidenceLog.slice(0, LOG_ROWS);
  const next =
    data.recommendedNextStepsVisible === false
      ? ""
      : clipPdfText(data.recommendedNextSteps || "", 400);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[9]!}>
      <View style={lockedStyles.close_block}>
        <Text style={lockedStyles.close_h_exec}>Execution</Text>
        {phases.map((ph, i) => (
          <View key={i} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={lockedStyles.close_phaseTitle}>{clipPdfText(ph.phase, 48)}</Text>
            <Text style={lockedStyles.close_phaseBody}>{clipPdfText(ph.text, 220)}</Text>
          </View>
        ))}
      </View>
      <View style={lockedStyles.close_block} wrap={false}>
        <Text style={lockedStyles.close_h_method}>Methodology</Text>
        <Text style={lockedStyles.close_methodBody}>{clipPdfText(data.methodology, 280)}</Text>
      </View>
      <View style={lockedStyles.close_block} wrap={false}>
        <Text style={lockedStyles.close_h_next}>Next steps</Text>
        <Text style={lockedStyles.close_nextBody}>{next || clipPdfText(" ", 8)}</Text>
      </View>
      <View style={lockedStyles.close_logWrap} wrap={false}>
        <Text style={lockedStyles.close_logEyebrow}>Evidence appendix</Text>
        <View style={[lockedStyles.close_logTh, local.thH]}>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c1]}>#</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c2]}>Label</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c3]}>Mentioned</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c4]}>Position</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c5]}>Competitors</Text>
        </View>
        {log.map((r) => (
          <View key={r.idx} style={[lockedStyles.close_logTr, local.trH]} wrap={false}>
            <Text style={[lockedStyles.close_logCell, lockedStyles.close_c1]}>{String(r.idx)}</Text>
            <Text style={[lockedStyles.close_logCell, lockedStyles.close_c2]}>{clipPdfText(r.label, 26)}</Text>
            <Text style={[lockedStyles.close_logCell, lockedStyles.close_c3]}>{clipPdfText(r.mentioned, 12)}</Text>
            <Text style={[lockedStyles.close_logCell, lockedStyles.close_c4]}>{clipPdfText(r.position, 16)}</Text>
            <Text style={[lockedStyles.close_logCell, lockedStyles.close_c5]}>{clipPdfText(r.competitors, 38)}</Text>
          </View>
        ))}
      </View>
    </PdfInnerPage>
  );
}
