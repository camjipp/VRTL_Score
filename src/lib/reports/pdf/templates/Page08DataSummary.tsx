import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { colors, fonts, rhythm, space, BODY_MAX_W, CONTENT_W } from "../theme";
import { dataSummaryPurpose } from "../editorial/pdfNarrative";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const W = CONTENT_W;
const S = {
  sig: 176,
  cnt: 42,
  rate: 42,
  pill: 95,
  note: W - 176 - 42 - 42 - 95,
} as const;

const C = {
  brand: 103,
  bar: 168,
  m: 46,
  r: 46,
  vs: 50,
  st: W - 103 - 168 - 46 - 46 - 50,
} as const;

const styles = StyleSheet.create({
  interpret: {
    fontSize: 9.5,
    lineHeight: 1.68,
    color: colors.ink,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  h: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: rhythm.sm,
    marginTop: space.block - 4,
    fontFamily: fonts.sansBold,
  },
  hFirst: { marginTop: rhythm.sm + 2 },
  th: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    paddingVertical: 7,
    paddingHorizontal: rhythm.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    alignItems: "center",
    width: W,
  },
  thText: {
    fontSize: 6.5,
    fontWeight: 400,
    color: colors.ink3,
    textTransform: "uppercase",
    letterSpacing: 0.1,
    fontFamily: fonts.sansBold,
  },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: rhythm.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    width: W,
    minHeight: 32,
  },
  trAlt: { backgroundColor: colors.surface },
  trYou: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.cyan,
  },
  td: { fontSize: 8.5, color: colors.ink, fontFamily: fonts.sans },
  tdStrong: { fontSize: 8.5, color: colors.ink, fontWeight: 400, fontFamily: fonts.sansBold },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  pillT: { fontSize: 6.5, fontWeight: 400, fontFamily: fonts.sansBold },
  pillCmp: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    alignSelf: "flex-start",
  },
  pillCmpText: { fontSize: 6, fontWeight: 400, fontFamily: fonts.sansBold, letterSpacing: 0.03 },
  barWrap: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, width: C.bar - 8 },
  barIn: { flex: 1, flexDirection: "row", height: 6 },
  barF: { height: 6, backgroundColor: colors.cyan, borderRadius: 3 },
  barFGray: { height: 6, backgroundColor: colors.ink4, borderRadius: 3, opacity: 0.4 },
  barR: { height: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
});

function sigPillBg(s: ReportData["signalSummary"][0]["status"]) {
  if (s === "positive") return colors.greenLight;
  if (s === "improvable") return colors.orangeLight;
  if (s === "gap") return colors.redLight;
  return colors.surface2;
}

function sigPillFg(s: ReportData["signalSummary"][0]["status"]) {
  if (s === "positive") return colors.ink;
  if (s === "improvable") return colors.ink;
  if (s === "gap") return colors.ink;
  return colors.ink;
}

function statusLabel(s: ReportData["competitiveTable"][0]["status"] | undefined) {
  if (s === "You") return "YOU";
  if (s === "Ahead" || s === "Behind" || s === "Tied") return s.toUpperCase();
  return "N/A";
}

function cmpPillStyle(s: ReportData["competitiveTable"][0]["status"] | undefined) {
  if (s === "You") return { bg: colors.cyanLight, fg: colors.ink };
  if (s === "Tied") return { bg: colors.surface2, fg: colors.ink };
  if (s === "Behind") return { bg: colors.greenLight, fg: colors.ink };
  if (s === "Ahead") return { bg: colors.redLight, fg: colors.ink };
  return { bg: colors.surface2, fg: colors.ink };
}

/** PAGE 8 — Data summary (fixed template). */
export function Page08DataSummary({ data }: { data: ReportData }): ReactElement {
  const maxM = Math.max(...data.competitiveTable.map((r) => r.mentions), 1);

  return (
    <FixedInnerPage data={data} pageNum={8}>
      <PdfTraceMarker page={8} section="Fixed:P8" />
      <EditorialSectionHeader
        sectionLabel="Data"
        title="Signals & competitive set"
        purpose={dataSummaryPurpose()}
        intro="Read this page as proof, not prose."
      />
      <Text style={{ fontSize: 7, fontFamily: fonts.sansBold, letterSpacing: 0.1, color: colors.ink4, marginBottom: rhythm.sm, textTransform: "uppercase" }}>
        What the numbers prove
      </Text>
      <Text style={styles.interpret}>{data.dataSummaryInterpretation}</Text>
      <Text style={[styles.h, styles.hFirst]}>Signals</Text>
      <View style={{ marginBottom: space.block, width: W }}>
        <View style={styles.th}>
          <Text style={[styles.thText, { width: S.sig }]}>Signal</Text>
          <Text style={[styles.thText, { width: S.cnt, textAlign: "center" }]}>Count</Text>
          <Text style={[styles.thText, { width: S.rate, textAlign: "center" }]}>Rate</Text>
          <Text style={[styles.thText, { width: S.pill }]}>Status</Text>
          <Text style={[styles.thText, { width: S.note, textAlign: "right" }]}>Action</Text>
        </View>
        {data.signalSummary.map((row, i) => (
          <View key={`sig-${i}`} style={[styles.tr, i % 2 === 1 ? styles.trAlt : {}]} minPresenceAhead={40}>
            <View style={{ width: S.sig, flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.dot, { backgroundColor: colors.cyan }]} />
              <Text style={styles.tdStrong}>{row.signal}</Text>
            </View>
            <Text style={[styles.td, { width: S.cnt, textAlign: "center" }]}>{row.count}</Text>
            <Text style={[styles.td, { width: S.rate, textAlign: "center" }]}>{row.rate}</Text>
            <View style={{ width: S.pill, justifyContent: "center" }}>
              <View style={[styles.pill, { backgroundColor: sigPillBg(row.status) }]}>
                <Text style={[styles.pillT, { color: sigPillFg(row.status) }]}>{row.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[styles.td, { width: S.note, fontSize: 8, textAlign: "right", color: colors.ink2 }]}>
              {row.actionNote}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.h}>Competitive set</Text>
      <View style={{ flexGrow: 1, minHeight: 0, width: W }}>
        <View style={styles.th}>
          <Text style={[styles.thText, { width: C.brand }]}>Brand</Text>
          <Text style={[styles.thText, { width: C.bar }]}>Mentions</Text>
          <Text style={[styles.thText, { width: C.m, textAlign: "right" }]}>#</Text>
          <Text style={[styles.thText, { width: C.r, textAlign: "right" }]}>Rate</Text>
          <Text style={[styles.thText, { width: C.vs, textAlign: "right" }]}>vs.</Text>
          <Text style={[styles.thText, { width: C.st }]}>Status</Text>
        </View>
        {data.competitiveTable.map((row, i) => {
          const wPct = Math.min(100, Math.max(0, Math.round((row.mentions / maxM) * 100)));
          const rest = Math.max(0, 100 - wPct);
          const isYou = row.status === "You";
          const cp = cmpPillStyle(row.status);
          return (
            <View
              key={`cmp-${i}`}
              style={[styles.tr, isYou ? styles.trYou : i % 2 === 1 ? styles.trAlt : {}]}
              minPresenceAhead={44}
            >
              <Text style={[isYou ? styles.tdStrong : styles.td, { width: C.brand }]}>{row.brand}</Text>
              <View style={{ width: C.bar, flexDirection: "row", alignItems: "center" }}>
                <View style={styles.barWrap}>
                  <View style={styles.barIn}>
                    <View style={[{ flex: wPct <= 0 ? 0 : wPct }, isYou ? styles.barF : styles.barFGray]} />
                    <View style={[{ flex: rest }, styles.barR]} />
                  </View>
                </View>
              </View>
              <Text style={[isYou ? styles.tdStrong : styles.td, { width: C.m, textAlign: "right" }]}>
                {row.mentions}
              </Text>
              <Text style={[isYou ? styles.tdStrong : styles.td, { width: C.r, textAlign: "right" }]}>
                {row.rate}
              </Text>
              <Text
                style={[
                  styles.td,
                  {
                    width: C.vs,
                    textAlign: "right",
                    color: colors.ink2,
                    fontFamily: fonts.sansBold,
                    paddingRight: 4,
                  },
                ]}
              >
                {row.vsYou}
              </Text>
              <View style={{ width: C.st, justifyContent: "center", paddingLeft: 2 }}>
                <View style={[styles.pillCmp, { backgroundColor: cp.bg }]}>
                  <Text style={[styles.pillCmpText, { color: cp.fg }]}>{statusLabel(row.status)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </FixedInnerPage>
  );
}
