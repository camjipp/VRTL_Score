import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { EvidencePreview, ReportData, VulnerableExcerptParts } from "../types";
import { vulnerableExcerptBlobUnsafe } from "../sanitizeReportData";
import { colors, fonts, rhythm, CONTENT_W, space, BODY_MAX_W } from "../theme";
import { clipPdfText, exampleAnswersPurpose } from "../editorial/pdfNarrative";
import { formatEvidenceLogPillLabel } from "@/lib/reports/formatEvidenceFieldDisplay";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const GAP = 12;
const COL_W = (CONTENT_W - GAP) / 2;
const CENTER_CARD_W = CONTENT_W - 88;

const NO_EXCERPT_MSG = "No clean proof pair in this export—see the evidence log.";

const styles = StyleSheet.create({
  row: { width: CONTENT_W, flexDirection: "row", alignItems: "stretch" },
  centerBand: {
    width: CONTENT_W,
    alignItems: "center",
  },
  noExcerptCenter: {
    width: CONTENT_W - 48,
    textAlign: "center",
    fontSize: 9,
    lineHeight: 1.52,
    color: colors.ink2,
    fontFamily: fonts.sans,
  },
  card: {
    flexDirection: "row",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    overflow: "hidden",
    backgroundColor: colors.paper,
  },
  cardHalf: { width: COL_W },
  cardCentered: { width: CENTER_CARD_W },
  accent: { width: 3, backgroundColor: colors.ink2 },
  inner: { flex: 1, paddingVertical: space.cardPad - 4, paddingHorizontal: space.cardPad - 4 },
  badge: {
    fontSize: 6.5,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    marginBottom: 8,
  },
  quote: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 2,
    borderLeftColor: colors.rule,
    paddingVertical: 8,
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
    flexDirection: "row",
    marginTop: rhythm.md,
    paddingTop: rhythm.md,
    borderTopWidth: 2,
    borderTopColor: colors.rule,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    backgroundColor: colors.paper,
  },
  takeawayBar: { width: 2, backgroundColor: colors.ink2 },
  takeawayInner: {
    flex: 1,
    paddingVertical: 4,
    paddingLeft: rhythm.md,
    paddingRight: rhythm.sm,
  },
  takeawayTitle: {
    fontSize: 6.5,
    letterSpacing: 0.1,
    color: colors.ink3,
    textTransform: "uppercase",
    marginBottom: 3,
    fontFamily: fonts.sansBold,
  },
  takeawayBody: {
    fontSize: 10.5,
    lineHeight: 1.4,
    color: colors.ink,
    fontFamily: fonts.sansBold,
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

function lineField(x: unknown): string {
  if (x == null) return "";
  if (typeof x === "string") return x.trim();
  if (typeof x === "number" || typeof x === "boolean") return String(x).trim();
  return "";
}

/**
 * Coerce API / partial shapes into strings, then apply the same blob guard as sanitization.
 * Returns null when there is nothing safe to render in the vulnerable column.
 */
function normalizeVulnerableExcerptForPage4(v: EvidencePreview | undefined): VulnerableExcerptParts | null {
  const raw = v?.vulnerableExcerpt;
  if (raw == null || typeof raw !== "object") return null;

  const summary = lineField((raw as { summary?: unknown }).summary);
  const competitorsLine = lineField((raw as { competitorsLine?: unknown }).competitorsLine);
  const implication = lineField((raw as { implication?: unknown }).implication);

  const parts: VulnerableExcerptParts = {
    summary: summary || "Exposure detail unavailable for this row.",
    competitorsLine:
      competitorsLine || "See the competitive table and evidence log for named alternatives.",
    implication: implication || "Prioritize proof and retrievable comparisons where this signal repeats.",
  };

  const snippet = String(v?.snippet ?? "");
  try {
    if (vulnerableExcerptBlobUnsafe(parts, snippet)) return null;
  } catch {
    return null;
  }

  const hasAnyOriginal = Boolean(summary || competitorsLine || implication);
  if (!hasAnyOriginal) return null;

  return parts;
}

function hasStrengthSnippet(s: EvidencePreview | undefined): boolean {
  return Boolean(s?.snippet != null && String(s.snippet).trim().length > 0);
}

/** PAGE 4 — Proof: what assistants actually say (strength vs. exposure). */
export function Page04ExampleAnswers({ data }: { data: ReportData }): ReactElement {
  const strength = findStrength(data.evidencePreview);
  const vulnerable = findVulnerable(data.evidencePreview);
  const strengthOk = hasStrengthSnippet(strength);
  const vulnParts = normalizeVulnerableExcerptForPage4(vulnerable);
  const vulnRich = vulnParts != null;
  const takeaway = data.strategicTakeaway?.trim() ?? "";

  if (
    typeof process !== "undefined" &&
    (process.env.NODE_ENV !== "production" || process.env.PDF_DEBUG_PAGE4 === "1") &&
    vulnerable?.vulnerableExcerpt != null &&
    vulnParts == null
  ) {
    const ex = vulnerable.vulnerableExcerpt as Record<string, unknown>;
    console.warn("[pdf Page4] vulnerableExcerpt present but not renderable", {
      label: vulnerable.label,
      keys: Object.keys(vulnerable.vulnerableExcerpt as object),
      summaryType: typeof ex.summary,
      competitorsLineType: typeof ex.competitorsLine,
      implicationType: typeof ex.implication,
    });
  }

  const strengthCardInner = (
    <View style={styles.inner}>
      <Text style={styles.badge}>
        {strength ? formatEvidenceLogPillLabel(String(strength.label)) : "Strength"}
      </Text>
      {strength ? (
        <View style={styles.quote}>
            <Text style={styles.quoteText} orphans={2} widows={2}>
            {clipPdfText(String(strength.snippet), 420)}
          </Text>
        </View>
      ) : null}
      {strength?.note ? (
        <Text style={[styles.body, { fontSize: 8, color: colors.ink2, marginTop: 6 }]}>
          {clipPdfText(String(strength.note), 140)}
        </Text>
      ) : null}
    </View>
  );

  const vulnerableRichInner =
    vulnerable && vulnParts ? (
      <View style={styles.inner}>
        <Text style={styles.badge}>{formatEvidenceLogPillLabel(String(vulnerable.label))}</Text>
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.mini}>Summary</Text>
          <Text style={styles.body} orphans={2} widows={2}>
            {clipPdfText(vulnParts.summary, 160)}
          </Text>
        </View>
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.mini}>Names</Text>
          <Text style={styles.body} orphans={2} widows={2}>
            {clipPdfText(vulnParts.competitorsLine, 120)}
          </Text>
        </View>
        <View>
          <Text style={styles.mini}>Impact</Text>
          <Text style={styles.body} orphans={2} widows={2}>
            {clipPdfText(vulnParts.implication, 160)}
          </Text>
        </View>
      </View>
    ) : null;

  let excerptBlock: ReactElement;
  if (!strengthOk && !vulnRich) {
    excerptBlock = (
      <View style={styles.centerBand}>
        <Text style={styles.noExcerptCenter} orphans={2} widows={2}>
          {NO_EXCERPT_MSG}
        </Text>
      </View>
    );
  } else if (strengthOk && vulnRich) {
    excerptBlock = (
      <View style={styles.row}>
        <View style={[styles.card, styles.cardHalf, { marginRight: GAP }]}>
          <View style={styles.accent} />
          {strengthCardInner}
        </View>
        <View style={[styles.card, styles.cardHalf]}>
          <View style={[styles.accent, { backgroundColor: colors.red }]} />
          {vulnerableRichInner}
        </View>
      </View>
    );
  } else if (strengthOk && !vulnRich) {
    excerptBlock = (
      <View style={styles.centerBand}>
        <View style={[styles.card, styles.cardCentered]}>
          <View style={styles.accent} />
          {strengthCardInner}
        </View>
      </View>
    );
  } else {
    excerptBlock = (
      <View style={styles.centerBand}>
        <View style={[styles.card, styles.cardCentered]}>
          <View style={[styles.accent, { backgroundColor: colors.red }]} />
          {vulnerableRichInner}
        </View>
      </View>
    );
  }

  return (
    <FixedInnerPage data={data} pageNum={4}>
      <PdfTraceMarker page={4} section="Fixed:P4" />
      <EditorialSectionHeader sectionLabel="Proof" title="Is this real?" purpose={exampleAnswersPurpose()} />
      {excerptBlock}
      {takeaway ? (
        <View style={styles.takeawayOuter}>
          <View style={styles.takeawayBar} />
          <View style={styles.takeawayInner}>
            <Text style={styles.takeawayTitle}>Impact</Text>
            <Text style={styles.takeawayBody}>{clipPdfText(takeaway, 320)}</Text>
          </View>
        </View>
      ) : null}
    </FixedInnerPage>
  );
}
