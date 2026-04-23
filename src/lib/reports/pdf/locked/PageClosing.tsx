import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeClosing } from "./pageNarratives";

const LOG_ROWS = 8;
const ROW_H = 12;
const PHASE_MAX = 3;

const local = StyleSheet.create({
  thH: { height: ROW_H },
  trH: { minHeight: ROW_H },
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
      <LockedNarrativeStack
        slice={slice}
        variant="compact"
        stackRole="afterPrimary"
        include={["interpretation", "implication"]}
      />
      <View style={lockedStyles.close_block} wrap={false}>
        <Text style={lockedStyles.close_h_exec}>Execution</Text>
        {phases.map((ph, i) => (
          <View key={i} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={lockedStyles.close_phaseTitle}>{clipPdfText(ph.phase)}</Text>
            <Text style={lockedStyles.close_phaseBody}>{clipPdfText(ph.text)}</Text>
          </View>
        ))}
      </View>
      <View style={lockedStyles.close_blockTight} wrap={false}>
        <Text style={lockedStyles.close_h_method}>Methodology</Text>
        <Text style={lockedStyles.close_methodBody}>{clipPdfText(data.methodology)}</Text>
      </View>
      <View style={lockedStyles.close_logWrap} wrap={false}>
        <Text style={lockedStyles.close_logEyebrow}>Evidence appendix</Text>
        <View style={[lockedStyles.close_logTh, local.thH]}>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c1]}>#</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c2]}>Label</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c3]}>Mentioned</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c4]}>Position</Text>
          <Text style={[lockedStyles.close_logThText, lockedStyles.close_c5]}>Prompt / context</Text>
        </View>
        {log.map((r) => (
          <View key={r.idx} style={[lockedStyles.close_logTr, local.trH]} wrap={false}>
            <Text style={[lockedStyles.close_logCell, lockedStyles.close_c1]}>{String(r.idx)}</Text>
            <Text style={[lockedStyles.close_logCell, lockedStyles.close_c2]}>{clipPdfText(r.label)}</Text>
            <Text style={[lockedStyles.close_logCell, lockedStyles.close_c3]}>{clipPdfText(r.mentioned)}</Text>
            <Text style={[lockedStyles.close_logCell, lockedStyles.close_c4]}>{clipPdfText(r.position)}</Text>
            <View style={[lockedStyles.close_c5, { flexDirection: "column", paddingRight: 2 }]}>
              <Text style={lockedStyles.close_logCell}>
                {clipPdfText(`Other brands cited: ${r.competitors}`)}
              </Text>
              {r.strength ? (
                <Text style={lockedStyles.close_logCellMuted}>{clipPdfText(`Strength: ${r.strength}`)}</Text>
              ) : null}
              {r.note ? <Text style={lockedStyles.close_logCellMuted}>{clipPdfText(r.note)}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </PdfInnerPage>
  );
}
