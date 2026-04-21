import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { EvidencePreview, ReportData } from "../types";
import { vulnerableExcerptBlobUnsafe } from "../sanitizeReportData";
import { colors, fonts, rhythm, CONTENT_W, space, BODY_MAX_W } from "../theme";
import { exampleAnswersPurpose } from "../editorial/pdfNarrative";
import { formatEvidenceLogPillLabel } from "@/lib/reports/formatEvidenceFieldDisplay";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const GAP = 12;
const COL_W = (CONTENT_W - GAP) / 2;

const styles = StyleSheet.create({
  evidenceLabel: {
    fontSize: 7,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: rhythm.sm,
    marginTop: rhythm.sm,
  },
  row: { width: CONTENT_W, flexDirection: "row", alignItems: "stretch" },
  card: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: "hidden",
    width: COL_W,
    backgroundColor: colors.paper,
    minHeight: 120,
  },
  accent: { width: 3, backgroundColor: colors.ink2 },
  inner: { flex: 1, paddingVertical: space.cardPad - 4, paddingHorizontal: space.cardPad - 4 },
  colKicker: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.ink,
    marginBottom: 8,
  },
  kicker: {
    fontSize: 6,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: 6,
  },
  badge: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    marginBottom: 8,
  },
  quote: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  quoteText: { fontFamily: fonts.sans, fontSize: 8.5, lineHeight: 1.62, color: colors.ink },
  mini: {
    fontSize: 6,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.1,
    textTransform: "uppercase",
    color: colors.ink3,
    marginBottom: 4,
  },
  body: { fontFamily: fonts.sans, fontSize: 8.5, lineHeight: 1.58, color: colors.ink },
  takeawayOuter: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.surface2,
    marginTop: rhythm.md,
    minHeight: 0,
  },
  takeawayBar: { width: 3, backgroundColor: colors.ink },
  takeawayInner: { flex: 1, paddingVertical: space.cardPad, paddingHorizontal: space.cardPad },
  takeawayTitle: {
    fontSize: 7,
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

function findStrength(ev: readonly EvidencePreview[]): EvidencePreview | undefined {
  const byLabel = ev.find((e) => /strength/i.test(e.label));
  return byLabel ?? ev[0];
}

function findVulnerable(ev: readonly EvidencePreview[]): EvidencePreview | undefined {
  return (
    ev.find((e) => /vulnerable|invisible/i.test(e.label)) ??
    ev.find((e) => Boolean(e.vulnerableExcerpt))
  );
}

/** PAGE 4 — Proof: what assistants actually say (strength vs. exposure). */
export function Page04ExampleAnswers({ data }: { data: ReportData }): ReactElement {
  const strength = findStrength(data.evidencePreview);
  const vulnerable = findVulnerable(data.evidencePreview);
  const takeaway = data.strategicTakeaway?.trim() ?? "";

  return (
    <FixedInnerPage data={data} pageNum={4}>
      <PdfTraceMarker page={4} section="Fixed:P4" />
      <EditorialSectionHeader
        sectionLabel="Proof"
        title="What assistants are actually saying"
        purpose={exampleAnswersPurpose()}
        intro="Side-by-side: a representative strength versus a vulnerable pattern. The implication is what to protect and what to close before competitors do."
      />
      <Text style={styles.evidenceLabel}>Evidence — representative excerpts</Text>
      <View style={styles.row}>
        <View style={[styles.card, { marginRight: GAP }]}>
          <View style={styles.accent} />
          <View style={styles.inner}>
            <Text style={styles.colKicker}>What good looks like</Text>
            <Text style={styles.kicker}>Excerpt</Text>
            <Text style={styles.badge}>
              {strength ? formatEvidenceLogPillLabel(String(strength.label)) : "Strength"}
            </Text>
            {strength ? (
              <View style={styles.quote}>
                <Text style={styles.quoteText} orphans={2} widows={2}>
                  {String(strength.snippet)}
                </Text>
              </View>
            ) : (
              <Text style={styles.body}>No strength excerpt in this snapshot.</Text>
            )}
            {strength?.note ? (
              <Text style={[styles.body, { fontSize: 8, color: colors.ink2, marginTop: 6 }]}>{strength.note}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.card}>
          <View style={[styles.accent, { backgroundColor: colors.red }]} />
          <View style={styles.inner}>
            <Text style={styles.colKicker}>Where you are exposed</Text>
            <Text style={styles.kicker}>Excerpt</Text>
            <Text style={styles.badge}>
              {vulnerable ? formatEvidenceLogPillLabel(String(vulnerable.label)) : "Vulnerable"}
            </Text>
            {vulnerable ? (
              vulnerable.vulnerableExcerpt &&
              !vulnerableExcerptBlobUnsafe(vulnerable.vulnerableExcerpt, String(vulnerable.snippet)) ? (
                <>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.mini}>Summary</Text>
                    <Text style={styles.body} orphans={2} widows={2}>
                      {vulnerable.vulnerableExcerpt.summary}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.mini}>Competitors named</Text>
                    <Text style={styles.body} orphans={2} widows={2}>
                      {vulnerable.vulnerableExcerpt.competitorsLine}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.mini}>Implication</Text>
                    <Text style={styles.body} orphans={2} widows={2}>
                      {vulnerable.vulnerableExcerpt.implication}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.quote}>
                  <Text style={styles.quoteText}>No excerpt available.</Text>
                </View>
              )
            ) : (
              <Text style={styles.body}>No vulnerable excerpt in this snapshot.</Text>
            )}
          </View>
        </View>
      </View>
      {takeaway ? (
        <View style={styles.takeawayOuter}>
          <View style={styles.takeawayBar} />
          <View style={styles.takeawayInner}>
            <Text style={styles.takeawayTitle}>Implication — strategic takeaway</Text>
            <Text style={styles.takeawayBody}>{takeaway}</Text>
          </View>
        </View>
      ) : null}
    </FixedInnerPage>
  );
}
