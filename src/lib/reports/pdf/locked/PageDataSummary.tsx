import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { CompetitiveTableRow, ReportData, SignalRow } from "../types";
import { LOCKED_PAGE_HEADER, REPORT_CONTENT_HALF_H, REPORT_CONTENT_SPLIT_GUTTER } from "./layoutConstants";
import { LD } from "./lockedDesignTokens";
import { lockedStyles } from "./lockedDocumentStyles";

const SIGNAL_ROWS = 6;
const COMP_ROWS = 6;
const ROW_H = 20;

const local = StyleSheet.create({
  band: {
    height: REPORT_CONTENT_HALF_H,
    overflow: "hidden",
  },
  splitRule: {
    height: 1,
    marginBottom: REPORT_CONTENT_SPLIT_GUTTER - 1,
    backgroundColor: LD.color.rule,
  },
  thH: { height: ROW_H },
  trH: { height: ROW_H },
});

function pad<T>(rows: readonly T[], n: number): (T | null)[] {
  const out: (T | null)[] = [...rows.slice(0, n)];
  while (out.length < n) out.push(null);
  return out;
}

export function PageDataSummary({ data }: { data: ReportData }): ReactElement {
  const signals = pad(data.signalSummary, SIGNAL_ROWS) as (SignalRow | null)[];
  const comp = pad(data.competitiveTable, COMP_ROWS) as (CompetitiveTableRow | null)[];

  const interp = data.dataSummaryInterpretation?.trim()
    ? clipPdfText(data.dataSummaryInterpretation, 130)
    : "";

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[8]!}>
      <View style={local.band} wrap={false}>
        <View style={lockedStyles.data_bandHeader}>
          <Text style={lockedStyles.data_bandTitle}>Signal summary</Text>
        </View>
        {interp ? <Text style={lockedStyles.bandCaptionLead}>{interp}</Text> : null}
        <View style={[lockedStyles.data_th, local.thH]}>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigA]}>Signal</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigB]}>Count</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigC]}>Rate</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigD]}>Status</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigE]}>Note</Text>
        </View>
        {signals.map((r, i) => (
          <View key={`s-${i}`} style={[lockedStyles.data_tr, local.trH]} wrap={false}>
            <Text style={[lockedStyles.data_td, lockedStyles.data_sigA]}>
              {r ? clipPdfText(r.signal, 40) : " "}
            </Text>
            <Text style={[lockedStyles.data_td, lockedStyles.data_sigB]}>{r ? String(r.count) : " "}</Text>
            <Text style={[lockedStyles.data_tdMuted, lockedStyles.data_sigC]}>
              {r ? clipPdfText(r.rate, 10) : " "}
            </Text>
            <Text style={[lockedStyles.data_tdMuted, lockedStyles.data_sigD]}>
              {r ? clipPdfText(r.status, 12) : " "}
            </Text>
            <Text style={[lockedStyles.data_td, lockedStyles.data_sigE]}>
              {r ? clipPdfText(r.actionNote, 48) : " "}
            </Text>
          </View>
        ))}
      </View>
      <View style={local.splitRule} />
      <View style={local.band} wrap={false}>
        <View style={lockedStyles.data_bandHeader}>
          <Text style={lockedStyles.data_bandTitleSecondary}>Competitive set</Text>
        </View>
        <View style={[lockedStyles.data_th, local.thH]}>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compA]}>Brand</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compB]}>Mentions</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compC]}>Rate</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compD]}>vs You</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compE]}>Status</Text>
        </View>
        {comp.map((r, i) => (
          <View key={`c-${i}`} style={[lockedStyles.data_tr, local.trH]} wrap={false}>
            <Text style={[lockedStyles.data_td, lockedStyles.data_compA]}>
              {r ? clipPdfText(r.brand, 32) : " "}
            </Text>
            <Text style={[lockedStyles.data_td, lockedStyles.data_compB]}>{r ? String(r.mentions) : " "}</Text>
            <Text style={[lockedStyles.data_tdMuted, lockedStyles.data_compC]}>
              {r ? clipPdfText(r.rate, 10) : " "}
            </Text>
            <Text style={[lockedStyles.data_td, lockedStyles.data_compD]}>
              {r ? clipPdfText(r.vsYou, 14) : " "}
            </Text>
            <Text style={[lockedStyles.data_tdMuted, lockedStyles.data_compE]}>
              {r ? clipPdfText(r.status, 14) : " "}
            </Text>
          </View>
        ))}
      </View>
    </PdfInnerPage>
  );
}
