import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

/** Table 1: 180+48+48+96+168 = 540 */
const S = {
  sig: 180,
  cnt: 48,
  rate: 48,
  pill: 96,
  note: 168,
} as const;

/** Table 2: 112+180+52+52+144 = 540 */
const C = {
  brand: 112,
  bar: 180,
  m: 52,
  r: 52,
  vs: 52,
  st: 92,
} as const;

const styles = StyleSheet.create({
  h: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.65,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: 8,
    marginTop: 4,
    fontFamily: fonts.sansBold,
  },
  hFirst: { marginTop: 0 },
  th: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  thText: {
    fontSize: 7,
    fontWeight: 400,
    color: colors.ink4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: fonts.sansBold,
  },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
    width: 540,
  },
  trAlt: { backgroundColor: colors.surface },
  trYou: { backgroundColor: colors.cyanLight },
  td: { fontSize: 8.5, color: colors.ink2, fontFamily: fonts.sans },
  tdStrong: { fontSize: 8.5, color: colors.ink, fontWeight: 400, fontFamily: fonts.sansBold },
  pill: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  pillT: { fontSize: 6.5, fontWeight: 400, fontFamily: fonts.sansBold },
  barWrap: { height: 5, backgroundColor: colors.surface2, borderRadius: 2, width: C.bar - 8 },
  barIn: { flex: 1, flexDirection: "row", height: 5 },
  barF: { height: 5, backgroundColor: colors.cyan, borderRadius: 2 },
  barR: { height: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
});

function sigPillBg(s: ReportData["signalSummary"][0]["status"]) {
  if (s === "positive") return colors.greenLight;
  if (s === "improvable") return colors.orangeLight;
  if (s === "gap") return colors.redLight;
  return colors.violetLight;
}

function sigPillFg(s: ReportData["signalSummary"][0]["status"]) {
  if (s === "positive") return colors.green;
  if (s === "improvable") return colors.orange;
  if (s === "gap") return colors.red;
  return colors.violet;
}

function statusLabel(s: ReportData["competitiveTable"][0]["status"] | undefined) {
  if (s === "You") return "YOU";
  if (s === "Ahead" || s === "Behind" || s === "Tied") return s.toUpperCase();
  return "—";
}

export function Page5DataSummary({ data }: { data: ReportData }) {
  const maxM = Math.max(...data.competitiveTable.map((r) => r.mentions), 1);

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={5} section="Page5:start" />
        <PdfHeader data={data} variant="inner" sectionSlug="Data summary" pageNum={5} />
        <PdfTraceMarker page={5} section="Page5:after_header" />

        <Text style={[styles.h, styles.hFirst]}>Signal summary</Text>
        <View style={{ marginBottom: space.section, width: 540 }}>
          <View style={styles.th}>
            <Text style={[styles.thText, { width: S.sig }]}>Signal</Text>
            <Text style={[styles.thText, { width: S.cnt, textAlign: "right" }]}>Count</Text>
            <Text style={[styles.thText, { width: S.rate, textAlign: "right" }]}>Rate</Text>
            <Text style={[styles.thText, { width: S.pill }]}>Status</Text>
            <Text style={[styles.thText, { width: S.note }]}>Action</Text>
          </View>
          {data.signalSummary.map((row, i) => (
            <View
              key={`sig-${i}`}
              style={[styles.tr, i % 2 === 1 ? styles.trAlt : {}]}
              wrap={false}
            >
              <View style={{ width: S.sig, flexDirection: "row", alignItems: "center" }}>
                <View style={[styles.dot, { backgroundColor: colors.cyan }]} />
                <Text style={styles.tdStrong}>{row.signal}</Text>
              </View>
              <Text style={[styles.td, { width: S.cnt, textAlign: "right" }]}>{row.count}</Text>
              <Text style={[styles.td, { width: S.rate, textAlign: "right" }]}>{row.rate}</Text>
              <View style={{ width: S.pill }}>
                <View style={[styles.pill, { backgroundColor: sigPillBg(row.status) }]}>
                  <Text style={[styles.pillT, { color: sigPillFg(row.status) }]}>
                    {row.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.td, { width: S.note, fontSize: 8 }]}>{row.actionNote}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h}>Competitive comparison</Text>
        <View style={{ width: 540 }}>
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
            return (
              <View
                key={`cmp-${i}`}
                style={[styles.tr, isYou ? styles.trYou : i % 2 === 1 ? styles.trAlt : {}]}
                wrap={false}
              >
                <Text style={[isYou ? styles.tdStrong : styles.td, { width: C.brand }]}>{row.brand}</Text>
                <View style={{ width: C.bar, flexDirection: "row", alignItems: "center" }}>
                  <View style={styles.barWrap}>
                    <View style={styles.barIn}>
                      <View style={[{ flex: wPct <= 0 ? 0 : wPct }, styles.barF]} />
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
                <Text style={[styles.td, { width: C.vs, textAlign: "right" }]}>{row.vsYou}</Text>
                <View style={{ width: C.st, justifyContent: "center" }}>
                  <View style={[styles.pill, { backgroundColor: colors.surface2 }]}>
                    <Text style={[styles.pillT, { color: colors.ink2 }]}>{statusLabel(row.status)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <PdfTraceMarker page={5} section="Page5:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
