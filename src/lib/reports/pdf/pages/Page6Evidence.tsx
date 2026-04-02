import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles } from "../theme";
import { sanitizePdfString } from "../sanitizeReportData";
import { ChapterTitle } from "../components/ChapterTitle";
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
  subHead: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.1,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: rhythm.sm,
    marginTop: rhythm.md,
    fontFamily: fonts.sansBold,
  },
  subHeadFirst: { marginTop: rhythm.sm },
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
    color: colors.ink3,
    textTransform: "uppercase",
    letterSpacing: 0.1,
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
  td: { fontSize: 7.5, color: colors.ink, fontFamily: fonts.sans },
  sigPill: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  sigPillTxt: { fontSize: 6, fontWeight: 400, fontFamily: fonts.sansBold },
  method: {
    marginTop: rhythm.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    padding: rhythm.md,
    overflow: "hidden",
  },
  methodTitle: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.ink3,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
  },
  methodBody: { fontSize: 9, lineHeight: 1.55, color: colors.ink, fontFamily: fonts.sans },
  chipDeck: {
    marginTop: rhythm.lg,
    width: 540,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    paddingVertical: rhythm.md,
    paddingHorizontal: rhythm.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  chip: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    paddingVertical: rhythm.md,
    paddingHorizontal: rhythm.xs,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  chipNum: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    lineHeight: 1,
    textAlign: "center",
  },
  chipLab: {
    fontSize: 6.5,
    color: colors.ink3,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.1,
    fontFamily: fonts.sansBold,
    textAlign: "center",
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
  const u = label.toUpperCase();
  if (u.includes("STRENGTH")) return { bg: colors.greenLight, fg: colors.ink };
  if (u.includes("OPPORTUNITY") || u.includes("COMPETITIVE")) return { bg: colors.orangeLight, fg: colors.ink };
  if (u.includes("INVISIBLE")) return { bg: colors.redLight, fg: colors.ink };
  return { bg: colors.surface2, fg: colors.ink };
}

export function Page6Evidence({ data }: { data: ReportData }) {
  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={6} section="Page6:start" />
        <PdfHeader data={data} variant="inner" pageNum={6} />
        <PdfTraceMarker page={6} section="Page6:after_header" />

        <ChapterTitle title="Evidence & Methodology" />

        <Text style={[styles.subHead, styles.subHeadFirst]}>Evidence log</Text>
        <View style={{ marginBottom: rhythm.sm }}>
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
            const strengthDisp = formatStrengthLabel(row.strength);
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
                        color: yn ? colors.ink2 : colors.ink3,
                        fontFamily: fonts.sansBold,
                      }}
                    >
                      {yn ? "YES" : "NO"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.td, { width: W.pos }]}>{row.position}</Text>
                <Text
                  style={[
                    styles.td,
                    {
                      width: W.str,
                      fontFamily: fonts.sansBold,
                      fontSize: 7,
                    },
                  ]}
                >
                  {strengthDisp}
                </Text>
                <Text style={[styles.td, { width: W.comp }]}>{row.competitors}</Text>
                <Text style={[styles.td, { width: W.rest, fontSize: 7 }]}>—</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.method} wrap={false}>
          <Text style={styles.methodTitle}>Methodology</Text>
          <Text style={styles.methodBody}>{data.methodology}</Text>
        </View>

        <View style={styles.chipDeck} wrap={false}>
          <View style={styles.chip}>
            <Text style={styles.chipNum}>{String(data.meta.responses)}</Text>
            <Text style={styles.chipLab}>Responses</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipNum}>{String(data.meta.confidence)}</Text>
            <Text style={styles.chipLab}>Confidence</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipNum}>{String(data.meta.generated)}</Text>
            <Text style={styles.chipLab}>Generated</Text>
          </View>
        </View>

        <PdfTraceMarker page={6} section="Page6:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
