import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { vulnerableExcerptBlobUnsafe } from "../sanitizeReportData";
import { PAGE, colors, fonts, rhythm, baseStyles, CONTENT_W, pdfPageRootPadding, space, BODY_MAX_W } from "../theme";
import { formatEvidenceLogPillLabel } from "@/lib/reports/formatEvidenceFieldDisplay";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const EVIDENCE_GAP = 12;
const EVIDENCE_COL_W = (CONTENT_W - EVIDENCE_GAP) / 2;

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: rhythm.sm,
  },
  evidenceRow: {
    width: CONTENT_W,
    flexDirection: "row",
    alignItems: "stretch",
  },
  exampleCard: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: "hidden",
    width: EVIDENCE_COL_W,
    backgroundColor: colors.paper,
    minHeight: 200,
  },
  exampleAccent: { width: 3, backgroundColor: colors.ink2 },
  exampleInner: {
    flex: 1,
    paddingVertical: space.cardPad - 4,
    paddingHorizontal: space.cardPad - 4,
  },
  exampleKicker: {
    fontSize: 6,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: 6,
  },
  exampleBadge: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    marginBottom: 8,
  },
  exampleQuote: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  exampleQuoteText: {
    fontFamily: fonts.sans,
    fontSize: 8.5,
    lineHeight: 1.62,
    color: colors.ink,
  },
  exampleNote: {
    fontSize: 8,
    color: colors.ink2,
    lineHeight: 1.58,
    fontFamily: fonts.sans,
  },
  vulnBlock: {
    marginBottom: 8,
  },
  vulnMini: {
    fontSize: 5.8,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.1,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: 4,
  },
  vulnBody: {
    fontFamily: fonts.sans,
    fontSize: 8.5,
    lineHeight: 1.58,
    color: colors.ink,
  },
  takeawayOuter: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surface2,
    marginTop: rhythm.md,
  },
  takeawayBar: { width: 3, backgroundColor: colors.ink },
  takeawayInner: {
    flex: 1,
    paddingVertical: space.cardPad,
    paddingHorizontal: space.cardPad,
  },
  takeawayTitle: {
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 0.1,
    color: colors.ink3,
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: fonts.sansBold,
  },
  takeawayBody: {
    fontSize: 9.5,
    lineHeight: 1.65,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  slideFill: {
    flex: 1,
    flexDirection: "column",
  },
});

/** Example answers + strategic takeaway — dedicated slide after the model matrix. */
export function PageModelAnalysisExamples({ data }: { data: ReportData }) {
  const hasEvidence = data.evidencePreview.length > 0;
  const hasTakeaway = Boolean(data.strategicTakeaway?.trim());
  if (!hasEvidence && !hasTakeaway) return null;

  return (
    <Page size={[PAGE.width, PAGE.height]} style={[baseStyles.page, pdfPageRootPadding]}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={4} section="ModelExamples:start" />
        <PdfHeader data={data} variant="inner" pageNum={4} />

        <View style={styles.slideFill}>
          <ChapterTitle
            title="Example answers"
            subtitle="Representative assistant excerpts and the strategic takeaway for this snapshot."
          />

          {hasEvidence ? (
            <View style={{ width: CONTENT_W }}>
              <Text style={styles.sectionLabel}>Client-readable excerpts</Text>
              <View style={styles.evidenceRow}>
                {data.evidencePreview.map((ev, i) => {
                  const labelLine = formatEvidenceLogPillLabel(String(ev.label));
                  const noteLine = ev.note ? String(ev.note) : "";
                  const vuln = ev.vulnerableExcerpt;
                  return (
                    <View
                      key={`ev-${i}`}
                      style={[styles.exampleCard, i === 0 ? { marginRight: EVIDENCE_GAP } : {}]}
                    >
                      <View style={styles.exampleAccent} />
                      <View style={styles.exampleInner}>
                        <Text style={styles.exampleKicker}>Client-readable excerpt</Text>
                        <Text style={styles.exampleBadge}>{labelLine}</Text>
                        {vuln ? (
                          vulnerableExcerptBlobUnsafe(vuln, String(ev.snippet)) ? (
                            <View style={styles.exampleQuote}>
                              <Text style={styles.exampleQuoteText}>No excerpt available.</Text>
                            </View>
                          ) : (
                            <>
                              <View style={styles.vulnBlock}>
                                <Text style={styles.vulnMini}>Summary</Text>
                                <Text style={styles.vulnBody} orphans={2} widows={2}>
                                  {vuln.summary}
                                </Text>
                              </View>
                              <View style={styles.vulnBlock}>
                                <Text style={styles.vulnMini}>Competitors named</Text>
                                <Text style={styles.vulnBody} orphans={2} widows={2}>
                                  {vuln.competitorsLine}
                                </Text>
                              </View>
                              <View style={styles.vulnBlock}>
                                <Text style={styles.vulnMini}>Implication</Text>
                                <Text style={styles.vulnBody} orphans={2} widows={2}>
                                  {vuln.implication}
                                </Text>
                              </View>
                            </>
                          )
                        ) : (
                          <>
                            <View style={styles.exampleQuote}>
                              <Text style={styles.exampleQuoteText} orphans={2} widows={2}>
                                {String(ev.snippet)}
                              </Text>
                            </View>
                            {noteLine ? <Text style={styles.exampleNote}>{noteLine}</Text> : null}
                          </>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
          {hasTakeaway ? (
            <View style={styles.takeawayOuter}>
              <View style={styles.takeawayBar} />
              <View style={styles.takeawayInner}>
                <Text style={styles.takeawayTitle}>Strategic takeaway</Text>
                <Text style={styles.takeawayBody}>{data.strategicTakeaway}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <PdfTraceMarker page={4} section="ModelExamples:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
