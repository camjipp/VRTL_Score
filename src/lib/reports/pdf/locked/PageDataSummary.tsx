import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { CompetitiveTableRow, ReportData, SignalRow } from "../types";
import { LOCKED_PAGE_HEADER, REPORT_CONTENT_HALF_H, REPORT_CONTENT_SPLIT_GUTTER } from "./layoutConstants";
import { LD } from "./lockedDesignTokens";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeDataSummary } from "./pageNarratives";

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

function parsePct(rate: string): number {
  const n = parseInt(String(rate).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}

function signalStripeStyle(status: string | undefined) {
  if (status === "positive") return lockedStyles.data_trSignalPositive;
  if (status === "gap") return lockedStyles.data_trSignalGap;
  if (status === "improvable") return lockedStyles.data_trSignalImprovable;
  return undefined;
}

function RateMiniBar({ pct }: { pct: number }): ReactElement {
  const p = Math.min(100, Math.max(0, Math.round(pct)));
  const rest = 100 - p;
  return (
    <View style={lockedStyles.data_rateBarTrack} wrap={false}>
      <View style={[lockedStyles.data_rateBarFill, { flex: Math.max(1, p) }]} />
      <View style={[lockedStyles.data_rateBarRest, { flex: Math.max(1, rest) }]} />
    </View>
  );
}

function maxMentions(rows: readonly (CompetitiveTableRow | null)[]): number {
  let m = 1;
  for (const r of rows) {
    if (r && r.mentions > m) m = r.mentions;
  }
  return m;
}

function CompMentionBar({ mentions, max, isYou }: { mentions: number; max: number; isYou: boolean }): ReactElement {
  const pct = Math.min(100, Math.round((mentions / Math.max(1, max)) * 100));
  const rest = 100 - pct;
  const fill = isYou ? lockedStyles.data_compBarFillYou : lockedStyles.data_compBarFill;
  return (
    <View style={lockedStyles.data_compBarTrack} wrap={false}>
      <View style={[fill, { flex: Math.max(1, pct) }]} />
      <View style={[lockedStyles.data_compBarRest, { flex: Math.max(1, rest) }]} />
    </View>
  );
}

export function PageDataSummary({ data }: { data: ReportData }): ReactElement {
  const signals = pad(data.signalSummary, SIGNAL_ROWS) as (SignalRow | null)[];
  const comp = pad(data.competitiveTable, COMP_ROWS) as (CompetitiveTableRow | null)[];
  const slice = narrativeDataSummary(data);
  const compMax = maxMentions(comp);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[8]!}>
      <View style={local.band} wrap={false}>
        <View style={lockedStyles.data_bandHeader}>
          <Text style={lockedStyles.data_bandTitle}>Signal summary</Text>
        </View>
        <LockedNarrativeStack slice={slice} variant="compact" include={["headline", "interpretation"]} />
        <View style={[lockedStyles.data_th, local.thH]}>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigA]}>Signal</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigB]}>Count</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigC]}>Rate</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigD]}>Status</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_sigE]}>Note</Text>
        </View>
        {signals.map((r, i) => {
          const stripe = r ? signalStripeStyle(r.status) : undefined;
          const rowStyle = [lockedStyles.data_tr, local.trH, ...(stripe ? [stripe] : [])];
          return (
            <View key={`s-${i}`} style={rowStyle} wrap={false}>
            <Text style={[lockedStyles.data_td, lockedStyles.data_sigA]}>{r ? clipPdfText(r.signal) : " "}</Text>
            <Text style={[lockedStyles.data_td, lockedStyles.data_sigB]}>{r ? String(r.count) : " "}</Text>
            <View style={lockedStyles.data_sigStack}>
              {r ? (
                <>
                  <Text style={lockedStyles.data_tdMuted}>{clipPdfText(r.rate, 10)}</Text>
                  <RateMiniBar pct={parsePct(r.rate)} />
                </>
              ) : (
                <Text> </Text>
              )}
            </View>
            <Text style={[lockedStyles.data_tdMuted, lockedStyles.data_sigD]}>
              {r ? clipPdfText(r.status, 12) : " "}
            </Text>
            <Text style={[lockedStyles.data_td, lockedStyles.data_sigE]}>
              {r ? clipPdfText(r.actionNote, 80) : " "}
            </Text>
            </View>
          );
        })}
      </View>
      <View style={local.splitRule} />
      <View style={local.band} wrap={false}>
        <View style={lockedStyles.data_bandHeader}>
          <Text style={lockedStyles.data_bandTitleSecondary}>Competitive set</Text>
        </View>
        <LockedNarrativeStack slice={slice} variant="compact" include={["implication"]} />
        <View style={[lockedStyles.data_th, local.thH]}>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compA]}>Brand</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compB]}>Mentions</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compC]}>Share</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compD]}>vs You</Text>
          <Text style={[lockedStyles.data_thText, lockedStyles.data_compE]}>Status</Text>
        </View>
        {comp.map((r, i) => (
          <View
            key={`c-${i}`}
            style={[
              lockedStyles.data_tr,
              local.trH,
              r?.status === "You" ? lockedStyles.data_trSignalPositive : {},
            ]}
            wrap={false}
          >
            <Text style={[lockedStyles.data_td, lockedStyles.data_compA]}>{r ? clipPdfText(r.brand) : " "}</Text>
            <View style={lockedStyles.data_compMentionsCol}>
              {r ? (
                <>
                  <Text style={lockedStyles.data_td}>{String(r.mentions)}</Text>
                  <CompMentionBar mentions={r.mentions} max={compMax} isYou={r.status === "You"} />
                </>
              ) : (
                <Text> </Text>
              )}
            </View>
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
