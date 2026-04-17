import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { PAGE, colors, fonts, rhythm, baseStyles, CONTENT_W, space, BODY_MAX_W } from "../theme";
import { formatEvidenceLogPillLabel } from "@/lib/reports/formatEvidenceFieldDisplay";
import { ModelAnalysisCard, MODEL_CARD_WIDTH } from "../components/ModelAnalysisCard";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfFooter } from "../components/PdfFooter";
import { PdfHeader } from "../components/PdfHeader";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { RankingAlertsSection } from "./RankingAlertsSection";

const avgOf = (models: ReportData["modelScores"]) =>
  models.length ? Math.round(models.reduce((s, m) => s + m.score, 0) / models.length) : 0;

const GAP = 12;
const EVIDENCE_GAP = 12;
const EVIDENCE_COL_W = (CONTENT_W - EVIDENCE_GAP) / 2;

const NEUTRAL_MODEL_VISUAL = {
  band: colors.surface2,
  scoreAccent: colors.cyan,
  dot: colors.ink4,
} as const;

const styles = StyleSheet.create({
  contrastRow: {
    width: CONTENT_W,
    flexDirection: "row",
    marginBottom: rhythm.sm,
    alignItems: "stretch",
  },
  contrastCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: space.cardPad,
    backgroundColor: colors.surface,
  },
  contrastCardLeft: {
    marginRight: GAP / 2,
    borderTopWidth: 3,
    borderTopColor: colors.green,
  },
  contrastCardRight: {
    marginLeft: GAP / 2,
    borderTopWidth: 3,
    borderTopColor: colors.red,
  },
  contrastLabel: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    color: colors.ink3,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  contrastScore: {
    fontSize: 44,
    fontFamily: fonts.sansBold,
    color: colors.ink,
    lineHeight: 1,
    marginBottom: 6,
  },
  contrastName: {
    fontSize: 11,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    marginBottom: 10,
  },
  contrastBlurb: {
    fontSize: 8.5,
    lineHeight: 1.62,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: CONTENT_W / 2 - 24,
  },
  row3: {
    width: CONTENT_W,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 0,
  },
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
    marginBottom: rhythm.sm,
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
});

/** Model scores + contrast — own page so cards are never split from Example answers. */
export function Page2ModelAnalysisGridPage({ data }: { data: ReportData }) {
  const a = avgOf(data.modelScores);
  const sorted = [...data.modelScores].sort((x, y) => y.score - x.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const scores = data.modelScores.map((m) => m.score);
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;

  const spreadSubtitle =
    spread === 0
      ? "Scores align across assistant families in this snapshot."
      : `${spread} points from best to worst surface. Buyers see different short lists by assistant.`;

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={2} section="Page2Grid:start" />
        <PdfHeader data={data} variant="inner" pageNum={3} />
        <PdfTraceMarker page={2} section="Page2Grid:after_header" />

        <RankingAlertsSection data={data} />

        <ChapterTitle title="Model analysis" subtitle={spreadSubtitle} minPresenceAhead={40} />

        {best && worst ? (
          <View style={styles.contrastRow}>
            <View style={[styles.contrastCard, styles.contrastCardLeft]}>
              <Text style={styles.contrastLabel}>Strongest surface</Text>
              <Text style={styles.contrastScore}>{best.score}</Text>
              <Text style={styles.contrastName}>{best.name}</Text>
              <Text style={styles.contrastBlurb} orphans={2} widows={2}>
                {best.insights[0] ? String(best.insights[0]) : "Lead with the content pattern this assistant already rewards."}
              </Text>
            </View>
            <View style={[styles.contrastCard, styles.contrastCardRight]}>
              <Text style={styles.contrastLabel}>Weakest surface</Text>
              <Text style={styles.contrastScore}>{worst.score}</Text>
              <Text style={styles.contrastName}>{worst.name}</Text>
              <Text style={styles.contrastBlurb} orphans={2} widows={2}>
                {worst.insights[0] ? String(worst.insights[0]) : "This path is where recommendation share is leaking today."}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.row3}>
          {data.modelScores.map((m, idx) => {
            const cardId = `model-${m.name}-${idx}`;
            return (
              <View
                key={cardId}
                style={{
                  width: MODEL_CARD_WIDTH,
                  marginRight: idx < data.modelScores.length - 1 ? GAP : 0,
                }}
              >
                <ModelAnalysisCard
                  modelId={cardId}
                  modelName={m.name}
                  score={m.score}
                  deltaVsAvg={m.deltaVsAvg}
                  avg={a}
                  insights={m.insights}
                  bandColor={NEUTRAL_MODEL_VISUAL.band}
                  scoreAccent={NEUTRAL_MODEL_VISUAL.scoreAccent}
                  bulletDotColor={NEUTRAL_MODEL_VISUAL.dot}
                />
              </View>
            );
          })}
        </View>

        <PdfTraceMarker page={2} section="Page2Grid:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}

/** Example excerpts + strategic takeaway — starts after model grid page. */
export function Page2ModelAnalysisExamplesPage({ data }: { data: ReportData }) {
  const hasEvidence = data.evidencePreview.length > 0;
  const hasTakeaway = Boolean(data.strategicTakeaway?.trim());
  if (!hasEvidence && !hasTakeaway) return null;

  return (
    <Page size={[PAGE.width, PAGE.height]} style={baseStyles.page}>
      <View style={baseStyles.pageBody}>
        <PdfTraceMarker page={3} section="Page2Examples:start" />
        <PdfHeader data={data} variant="inner" pageNum={4} />
        <PdfTraceMarker page={3} section="Page2Examples:after_header" />

        <ChapterTitle
          title="Example answers"
          subtitle="Representative assistant excerpts and the strategic takeaway for this snapshot."
          minPresenceAhead={48}
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
                    minPresenceAhead={72}
                  >
                    <View style={styles.exampleAccent} />
                    <View style={styles.exampleInner}>
                      <Text style={styles.exampleKicker}>Client-readable excerpt</Text>
                      <Text style={styles.exampleBadge}>{labelLine}</Text>
                      {vuln ? (
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
          <View
            style={[styles.takeawayOuter, hasEvidence ? { marginTop: rhythm.sm } : {}]}
            minPresenceAhead={64}
          >
            <View style={styles.takeawayBar} />
            <View style={styles.takeawayInner}>
              <Text style={styles.takeawayTitle}>Strategic takeaway</Text>
              <Text style={styles.takeawayBody}>{data.strategicTakeaway}</Text>
            </View>
          </View>
        ) : null}

        <PdfTraceMarker page={3} section="Page2Examples:before_footer" />
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
