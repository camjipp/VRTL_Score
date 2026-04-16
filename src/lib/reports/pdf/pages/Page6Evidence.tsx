import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, space, BODY_MAX_W } from "../theme";
import { formatEvidenceLogPillLabel, formatPdfEvidenceTableCell } from "@/lib/reports/formatEvidenceFieldDisplay";
import { sanitizePdfString } from "../sanitizeReportData";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

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
    marginTop: space.block,
    fontFamily: fonts.sansBold,
  },
  subHeadFirst: { marginTop: 0 },
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
    marginTop: space.block,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    padding: space.cardPad,
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
  methodBody: {
    fontSize: 9.5,
    lineHeight: 1.68,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  chipDeck: {
    marginTop: space.block,
    width: 540,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    paddingVertical: space.cardPad,
    paddingHorizontal: space.cardPad,
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
    borderRadius: 6,
    paddingVertical: rhythm.md,
    paddingHorizontal: rhythm.xs,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 56,
  },
  chipValWrap: {
    width: "100%",
    minHeight: 22,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  chipNum: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    lineHeight: 1.15,
    textAlign: "center",
  },
  chipLab: {
    fontSize: 6.5,
    color: colors.ink3,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.1,
    fontFamily: fonts.sansBold,
    textAlign: "center",
    lineHeight: 1.2,
  },
  ynY: { backgroundColor: colors.surface2, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  ynN: { backgroundColor: colors.surface2, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  sampleCaption: {
    fontSize: 8.5,
    fontWeight: 400,
    color: colors.ink2,
    marginBottom: rhythm.sm,
    marginTop: 2,
    fontFamily: fonts.sans,
    lineHeight: 1.5,
    maxWidth: BODY_MAX_W,
  },
  nextOuter: {
    marginTop: space.block,
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surface2,
  },
  nextBar: { width: 3, backgroundColor: colors.cyan },
  nextInner: {
    flex: 1,
    paddingVertical: space.cardPad,
    paddingHorizontal: space.cardPad,
  },
  nextTitle: {
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 0.1,
    color: colors.ink3,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: fonts.sansBold,
  },
  nextBody: {
    fontSize: 9.5,
    lineHeight: 1.65,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
});

function logLabelPill(label: string): { bg: string; fg: string } {
  const u = label.toUpperCase();
  if (u.includes("STRENGTH")) return { bg: colors.greenLight, fg: colors.ink };
  if (u.includes("OPPORTUNITY") || u.includes("MENTIONED") || u.includes("COMPETITIVE")) return { bg: colors.orangeLight, fg: colors.ink };
  if (u.includes("VULNERABLE") || u.includes("INVISIBLE")) return { bg: colors.redLight, fg: colors.ink };
  return { bg: colors.surface2, fg: colors.ink };
}

export function Page6Evidence({ data }: { data: ReportData }) {
  const hasLog = data.evidenceLog.length > 0;

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={7} section="Page6:start" />
        <PdfHeader data={data} variant="inner" pageNum={7} />
        <PdfTraceMarker page={7} section="Page6:after_header" />

        <ChapterTitle
          title="Evidence & methodology"
          subtitle="Controlled test summary and a compact response log. No raw model dumps."
        />

        {hasLog ? (
          <>
            <Text style={[styles.subHead, styles.subHeadFirst]}>Response sample</Text>
            <Text style={styles.sampleCaption}>Structured fields from a subset of analyzed answers.</Text>
            <View style={{ marginBottom: rhythm.sm }}>
              <View style={styles.th}>
                <Text style={[styles.thText, { width: W.idx }]}>#</Text>
                <Text style={[styles.thText, { width: W.label }]}>Signal</Text>
                <Text style={[styles.thText, { width: W.yn }]}>Incl.</Text>
                <Text style={[styles.thText, { width: W.pos }]}>Pos</Text>
                <Text style={[styles.thText, { width: W.str }]}>Strength</Text>
                <Text style={[styles.thText, { width: W.comp }]}>#Comp</Text>
                <Text style={[styles.thText, { width: W.rest }]}>Context</Text>
              </View>
              {data.evidenceLog.map((row, rowIdx) => {
                const yn = row.mentioned === "Yes";
                const lp = logLabelPill(row.label);
                const strengthDisp = formatPdfEvidenceTableCell(sanitizePdfString(String(row.strength ?? "")));
                const positionDisp = formatPdfEvidenceTableCell(sanitizePdfString(String(row.position ?? "")));
                const noteDisp = row.note?.trim()
                  ? sanitizePdfString(row.note)
                  : "No signal";
                return (
                  <View
                    key={`evl-${row.idx}`}
                    style={[styles.tr, rowIdx % 2 === 1 ? styles.trAlt : {}]}
                  >
                    <Text style={[styles.td, { width: W.idx }]}>{String(row.idx)}</Text>
                    <View style={{ width: W.label, justifyContent: "center" }}>
                      <View style={[styles.sigPill, { backgroundColor: lp.bg }]}>
                        <Text style={[styles.sigPillTxt, { color: lp.fg }]}>
                          {formatEvidenceLogPillLabel(sanitizePdfString(row.label))}
                        </Text>
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
                    <Text style={[styles.td, { width: W.pos }]}>{positionDisp}</Text>
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
                    <Text style={[styles.td, { width: W.comp }]}>
                      {formatPdfEvidenceTableCell(sanitizePdfString(String(row.competitors ?? "")))}
                    </Text>
                    <Text style={[styles.td, { width: W.rest, fontSize: 7, lineHeight: 1.45 }]}>
                      {noteDisp}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}

        {data.methodology?.trim() ? (
          <View style={styles.method}>
            <Text style={styles.methodTitle}>Methodology</Text>
            <Text style={styles.methodBody}>{data.methodology}</Text>
          </View>
        ) : null}

        <View style={styles.chipDeck} wrap={false}>
          <View style={styles.chip}>
            <View style={styles.chipValWrap}>
              <Text style={styles.chipNum}>{String(data.meta.responses)}</Text>
            </View>
            <Text style={styles.chipLab}>Responses</Text>
          </View>
          <View style={styles.chip}>
            <View style={styles.chipValWrap}>
              <Text style={styles.chipNum}>{String(data.meta.confidence)}</Text>
            </View>
            <Text style={styles.chipLab}>Confidence</Text>
          </View>
          <View style={styles.chip}>
            <View style={styles.chipValWrap}>
              <Text style={styles.chipNum}>{String(data.meta.generated)}</Text>
            </View>
            <Text style={styles.chipLab}>Generated</Text>
          </View>
        </View>

        {data.recommendedNextStepsVisible !== false && data.recommendedNextSteps?.trim() ? (
          <View style={styles.nextOuter}>
            <View style={styles.nextBar} />
            <View style={styles.nextInner}>
              <Text style={styles.nextTitle}>What happens next</Text>
              <Text style={styles.nextBody}>{data.recommendedNextSteps}</Text>
            </View>
          </View>
        ) : null}

        <PdfTraceMarker page={7} section="Page6:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
