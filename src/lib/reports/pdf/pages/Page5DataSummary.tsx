import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { colors, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";

const styles = StyleSheet.create({
  h: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: 10,
    marginTop: 6,
  },
  hFirst: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: 10,
  },
  table: { marginBottom: space.section },
  th: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 4,
  },
  thText: {
    fontSize: 7,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trClient: { backgroundColor: "rgba(16, 185, 129, 0.06)" },
  td: { fontSize: 9, color: colors.textSecondary },
  tdStrong: { fontSize: 9, color: colors.text, fontWeight: 600 },
  pill: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  pillText: { fontSize: 7, fontWeight: 600, color: colors.textSecondary },
  pillPos: { borderColor: "rgba(16,185,129,0.35)" },
  pillImp: { borderColor: "rgba(96,165,250,0.35)" },
  pillGap: { borderColor: "rgba(239,68,68,0.35)" },
  pillTrust: { borderColor: "rgba(245,158,11,0.35)" },
  colSignal: { width: "38%" },
  colNum: { width: "12%", textAlign: "right" as const },
  colRate: { width: "12%", textAlign: "right" as const },
  colPill: { width: "18%" },
  colNote: { width: "20%" },
  colBrand: { width: "32%" },
  colM: { width: "14%", textAlign: "right" as const },
  colR: { width: "14%", textAlign: "right" as const },
  colVs: { width: "14%", textAlign: "right" as const },
  colSt: { width: "26%" },
});

function signalPillStyle(s: ReportData["signalSummary"][0]["status"]) {
  if (s === "positive") return styles.pillPos;
  if (s === "improvable") return styles.pillImp;
  if (s === "gap") return styles.pillGap;
  return styles.pillTrust;
}

function statusLabel(s: ReportData["competitiveTable"][0]["status"]) {
  if (s === "You") return "You";
  return s;
}

export function Page5DataSummary({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={baseStyles.page}>
      <PdfHeader data={data} variant="inner" sectionSlug="Data summary" pageNum={5} />

      <Text style={styles.hFirst}>Signal summary</Text>
      <View style={styles.table}>
        <View style={styles.th}>
          <Text style={[styles.thText, styles.colSignal]}>Signal</Text>
          <Text style={[styles.thText, styles.colNum]}>Count</Text>
          <Text style={[styles.thText, styles.colRate]}>Rate</Text>
          <Text style={[styles.thText, styles.colPill]}>Status</Text>
          <Text style={[styles.thText, styles.colNote]}>Note</Text>
        </View>
        {data.signalSummary.map((row, i) => (
          <View key={i} style={styles.tr} wrap={false}>
            <Text style={[styles.td, styles.colSignal]}>{row.signal}</Text>
            <Text style={[styles.td, styles.colNum]}>{row.count}</Text>
            <Text style={[styles.td, styles.colRate]}>{row.rate}</Text>
            <View style={[styles.colPill, { justifyContent: "center" }]}>
              <View style={[styles.pill, signalPillStyle(row.status)]}>
                <Text style={styles.pillText}>{row.status}</Text>
              </View>
            </View>
            <Text style={[styles.td, styles.colNote, { fontSize: 8 }]}>{row.actionNote}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.h}>Competitive comparison</Text>
      <View style={styles.table}>
        <View style={styles.th}>
          <Text style={[styles.thText, styles.colBrand]}>Brand</Text>
          <Text style={[styles.thText, styles.colM]}>Mentions</Text>
          <Text style={[styles.thText, styles.colR]}>Rate</Text>
          <Text style={[styles.thText, styles.colVs]}>vs. you</Text>
          <Text style={[styles.thText, styles.colSt]}>Status</Text>
        </View>
        {data.competitiveTable.map((row, i) => (
          <View
            key={i}
            style={[styles.tr, row.status === "You" ? styles.trClient : {}]}
            wrap={false}
          >
            <Text style={[row.status === "You" ? styles.tdStrong : styles.td, styles.colBrand]}>
              {row.brand}
            </Text>
            <Text style={[row.status === "You" ? styles.tdStrong : styles.td, styles.colM]}>
              {row.mentions}
            </Text>
            <Text style={[row.status === "You" ? styles.tdStrong : styles.td, styles.colR]}>
              {row.rate}
            </Text>
            <Text style={[styles.td, styles.colVs]}>{row.vsYou}</Text>
            <View style={[styles.colSt, { justifyContent: "center" }]}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{statusLabel(row.status)}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <PdfFooter data={data} />
    </Page>
  );
}
