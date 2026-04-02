import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, space, baseStyles } from "../theme";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

/** 30+86+42+48+78+44+212 = 540 */
const W = {
  idx: 30,
  label: 86,
  yn: 42,
  pos: 48,
  str: 78,
  comp: 44,
  rest: 212,
} as const;

const styles = StyleSheet.create({
  h: {
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.65,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: 8,
    fontFamily: fonts.sans,
  },
  th: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    width: 540,
  },
  thText: {
    fontSize: 6.5,
    fontWeight: 700,
    color: colors.ink4,
    textTransform: "uppercase",
    fontFamily: fonts.sans,
  },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
    width: 540,
  },
  trAlt: { backgroundColor: colors.surface },
  td: { fontSize: 7.5, color: colors.ink2, fontFamily: fonts.sans },
  method: {
    marginTop: space.section,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    padding: 14,
    overflow: "hidden",
  },
  methodTitle: {
    fontSize: 9,
    fontWeight: 800,
    color: colors.ink,
    marginBottom: 8,
    fontFamily: fonts.sans,
  },
  methodBody: { fontSize: 9, lineHeight: 1.5, color: colors.ink2, fontFamily: fonts.sans },
  chipRow: { flexDirection: "row", marginTop: 14, justifyContent: "space-between", width: 540 },
  chip: {
    width: 168,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
    overflow: "hidden",
  },
  chipNum: { fontSize: 18, fontWeight: 800, color: colors.ink, fontFamily: fonts.sans },
  chipLab: { fontSize: 7, color: colors.ink4, marginTop: 4, textTransform: "uppercase", fontFamily: fonts.sans },
  ynY: { backgroundColor: colors.greenLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  ynN: { backgroundColor: colors.redLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
});

export function Page6Evidence({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={6} section="Page6:start" />
        <PdfHeader data={data} variant="inner" sectionSlug="Evidence & methodology" pageNum={6} />
        <PdfTraceMarker page={6} section="Page6:after_header" />

        <Text style={styles.h}>Evidence log</Text>
        <View style={{ marginBottom: 12 }}>
          <View style={styles.th}>
            <Text style={[styles.thText, { width: W.idx }]}>#</Text>
            <Text style={[styles.thText, { width: W.label }]}>Signal</Text>
            <Text style={[styles.thText, { width: W.yn }]}>Incl.</Text>
            <Text style={[styles.thText, { width: W.pos }]}>Pos</Text>
            <Text style={[styles.thText, { width: W.str }]}>Strength</Text>
            <Text style={[styles.thText, { width: W.comp }]}>#Comp</Text>
            <Text style={[styles.thText, { width: W.rest }]}>Notes</Text>
          </View>
          {data.evidenceLog.map((row, rowIdx) => {
            const yn = row.mentioned === "Yes";
            const strC =
              row.strength === "strong"
                ? colors.green
                : row.strength === "medium"
                  ? colors.orange
                  : colors.ink4;
            return (
              <View
                key={`evl-${row.idx}`}
                style={[styles.tr, rowIdx % 2 === 1 ? styles.trAlt : {}]}
                wrap={false}
              >
                <Text style={[styles.td, { width: W.idx }]}>{String(row.idx)}</Text>
                <Text style={[styles.td, { width: W.label, fontWeight: 700 }]}>{row.label}</Text>
                <View style={{ width: W.yn }}>
                  <View style={yn ? styles.ynY : styles.ynN}>
                    <Text
                      style={{
                        fontSize: 6.5,
                        fontWeight: 800,
                        color: yn ? colors.green : colors.red,
                        fontFamily: fonts.sans,
                      }}
                    >
                      {yn ? "YES" : "NO"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.td, { width: W.pos }]}>{row.position}</Text>
                <Text style={[styles.td, { width: W.str, color: strC, fontWeight: 700 }]}>
                  {row.strength}
                </Text>
                <Text style={[styles.td, { width: W.comp }]}>{row.competitors}</Text>
                <Text style={[styles.td, { width: W.rest, fontSize: 7 }]}>—</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.method}>
          <Text style={styles.methodTitle}>METHODOLOGY</Text>
          <Text style={styles.methodBody}>{data.methodology}</Text>
        </View>

        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipNum}>{String(data.meta.responses)}</Text>
            <Text style={styles.chipLab}>Responses</Text>
          </View>
          <View style={styles.chip}>
            <Text style={[styles.chipNum, { fontSize: 12 }]}>{data.meta.confidence}</Text>
            <Text style={styles.chipLab}>Confidence</Text>
          </View>
          <View style={styles.chip}>
            <Text style={[styles.chipNum, { fontSize: 11 }]}>{data.meta.generated}</Text>
            <Text style={styles.chipLab}>Generated</Text>
          </View>
        </View>

        <PdfTraceMarker page={6} section="Page6:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
