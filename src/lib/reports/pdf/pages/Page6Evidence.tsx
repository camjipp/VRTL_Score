import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { sanitizePdfString } from "../sanitizeReportData";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

/** 28+102+40+44+72+40+214 = 540 */
const W = {
  idx: 28,
  label: 102,
  yn: 40,
  pos: 44,
  str: 72,
  comp: 40,
  rest: 214,
} as const;

const styles = StyleSheet.create({
  h: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.35,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
  },
  th: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    paddingVertical: 9,
    paddingHorizontal: rhythm.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    width: 540,
    alignItems: "center",
  },
  thText: {
    fontSize: 6.5,
    fontWeight: 400,
    color: colors.ink4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    fontFamily: fonts.sansBold,
  },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: rhythm.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    width: 540,
    minHeight: 28,
  },
  trAlt: { backgroundColor: colors.surface },
  td: { fontSize: 7.5, color: colors.ink2, fontFamily: fonts.sans },
  sigPill: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  sigPillTxt: { fontSize: 6, fontWeight: 400, fontFamily: fonts.sansBold },
  method: {
    marginTop: rhythm.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    padding: rhythm.lg,
    overflow: "hidden",
  },
  methodTitle: {
    fontSize: 9,
    fontWeight: 400,
    color: colors.ink,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.35,
  },
  methodBody: { fontSize: 9, lineHeight: 1.55, color: colors.ink3, fontFamily: fonts.sans },
  chipDeck: {
    marginTop: rhythm.lg,
    width: 540,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    paddingVertical: rhythm.md,
    paddingHorizontal: rhythm.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  chip: {
    width: 158,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 6,
    paddingVertical: rhythm.md,
    paddingHorizontal: rhythm.sm,
    alignItems: "center",
    overflow: "hidden",
  },
  chipNum: { fontSize: 18, fontWeight: 400, color: colors.ink, fontFamily: fonts.sansBold },
  chipLab: {
    fontSize: 6.5,
    color: colors.ink4,
    marginTop: rhythm.xs,
    textTransform: "uppercase",
    letterSpacing: 0.35,
    fontFamily: fonts.sansBold,
  },
  ynY: { backgroundColor: colors.surface2, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  ynN: { backgroundColor: colors.surface2, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
});

/** Human-readable strength for table cells (underscores → words). */
function formatStrengthLabel(raw: string): string {
  const s = sanitizePdfString(String(raw).trim());
  if (!s.includes("_")) return s;
  return s
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function logLabelPill(label: string): { bg: string; fg: string } {
  void label;
  return { bg: colors.surface2, fg: colors.ink3 };
}

export function Page6Evidence({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={6} section="Page6:start" />
        <PdfHeader data={data} variant="inner" sectionSlug="Evidence & methodology" pageNum={6} />
        <PdfTraceMarker page={6} section="Page6:after_header" />

        <Text style={styles.h}>Evidence log</Text>
        <View style={{ marginBottom: rhythm.md }}>
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
            const lp = logLabelPill(row.label);
            return (
              <View
                key={`evl-${row.idx}`}
                style={[styles.tr, rowIdx % 2 === 1 ? styles.trAlt : {}]}
                wrap={false}
              >
                <Text style={[styles.td, { width: W.idx }]}>{String(row.idx)}</Text>
                <View style={{ width: W.label, justifyContent: "center" }}>
                  <View style={[styles.sigPill, { backgroundColor: lp.bg }]}>
                    <Text style={[styles.sigPillTxt, { color: lp.fg }]}>{row.label}</Text>
                  </View>
                </View>
                <View style={{ width: W.yn, alignItems: "flex-start" }}>
                  <View style={yn ? styles.ynY : styles.ynN}>
                    <Text
                      style={{
                        fontSize: 6.5,
                        fontWeight: 400,
                        color: yn ? colors.ink2 : colors.ink4,
                        fontFamily: fonts.sansBold,
                      }}
                    >
                      {yn ? "YES" : "NO"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.td, { width: W.pos }]}>{row.position}</Text>
                <Text style={[styles.td, { width: W.str, color: colors.ink2, fontFamily: fonts.sansBold }]}>
                  {formatStrengthLabel(row.strength)}
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

        <View style={styles.chipDeck}>
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
