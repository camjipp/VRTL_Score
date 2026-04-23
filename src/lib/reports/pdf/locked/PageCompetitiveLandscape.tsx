import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeCompetitive } from "./pageNarratives";

const ROW_H = 22;
const TABLE_ROWS = 6;
const ALERT_H = 58;

const local = StyleSheet.create({
  alertH: { height: ALERT_H },
  thH: { height: ROW_H },
  trH: { height: ROW_H },
});

function padRows<T>(rows: readonly T[], n: number): (T | null)[] {
  const out: (T | null)[] = [...rows.slice(0, n)];
  while (out.length < n) out.push(null);
  return out;
}

function alertBody(title: string, detail: string): string {
  const t = title.replace(/\s+/g, " ").trim();
  const d = detail.replace(/\s+/g, " ").trim();
  if (!t) return clipPdfText(d);
  if (!d) return clipPdfText(t);
  return clipPdfText(`${t} — ${d}`);
}

export function PageCompetitiveLandscape({ data }: { data: ReportData }): ReactElement {
  const { win, risk, priority } = data.alerts;
  const tableRows = padRows(data.competitors, TABLE_ROWS);
  const slice = narrativeCompetitive(data);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[4]!}>
      <LockedNarrativeStack slice={slice} include={["headline"]} />
      <Text style={lockedStyles.comp_tableIntro}>
        {clipPdfText("This table shows how often each brand is recommended and how they compare to you.")}
      </Text>
      {data.integrityNote ? <Text style={lockedStyles.comp_integrityNote}>{data.integrityNote}</Text> : null}
      <View style={lockedStyles.comp_alertsRow} wrap={false}>
        <View style={[lockedStyles.comp_alert, local.alertH]}>
          <Text style={lockedStyles.comp_alertEyebrow}>Win</Text>
          <Text style={lockedStyles.comp_alertBody}>{alertBody(win.title, win.detail)}</Text>
        </View>
        <View style={[lockedStyles.comp_alert, local.alertH]}>
          <Text style={lockedStyles.comp_alertEyebrow}>Risk</Text>
          <Text style={lockedStyles.comp_alertBody}>{alertBody(risk.title, risk.detail)}</Text>
        </View>
        <View style={[lockedStyles.comp_alertLast, local.alertH]}>
          <Text style={lockedStyles.comp_alertEyebrow}>Priority</Text>
          <Text style={lockedStyles.comp_alertBody}>{alertBody(priority.title, priority.detail)}</Text>
        </View>
      </View>
      <View wrap={false}>
        <View style={[lockedStyles.comp_tableTh, local.thH]}>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellName]}>Name</Text>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellNum]}>Mentions</Text>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellRate]}>Rate</Text>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellRank]}>Rank</Text>
          <Text style={[lockedStyles.comp_thText, lockedStyles.comp_cellFlag]}>You</Text>
        </View>
        {tableRows.map((r, i) => {
          const rowStyle = r?.isClient ? lockedStyles.comp_tableTrClient : lockedStyles.comp_tableTr;
          const nameStyle = r?.isClient ? lockedStyles.comp_tdClient : lockedStyles.comp_td;
          return (
            <View key={i} style={[rowStyle, local.trH]} wrap={false}>
              <Text style={[nameStyle, lockedStyles.comp_cellName]}>
                {r ? clipPdfText(r.name) : " "}
              </Text>
              <Text style={[r?.isClient ? lockedStyles.comp_tdClient : lockedStyles.comp_td, lockedStyles.comp_cellNum]}>
                {r ? String(r.mentions) : " "}
              </Text>
              <Text style={[lockedStyles.comp_td, lockedStyles.comp_cellRate]}>
                {r ? clipPdfText(String(r.rate), 10) : " "}
              </Text>
              <Text style={[lockedStyles.comp_td, lockedStyles.comp_cellRank]}>{r ? String(r.rank) : " "}</Text>
              <Text style={[lockedStyles.comp_tdMuted, lockedStyles.comp_cellFlag]}>
                {r?.isClient ? "You" : r ? "—" : " "}
              </Text>
            </View>
          );
        })}
      </View>
      <LockedNarrativeStack
        slice={slice}
        stackRole="afterPrimary"
        include={["interpretation", "implication"]}
      />
    </PdfInnerPage>
  );
}
