import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement, ReactNode } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import { formatEvidenceLogPillLabel } from "@/lib/reports/formatEvidenceFieldDisplay";
import type { ReportData, VulnerableExcerptParts } from "../types";
import {
  findStrengthPreview,
  findVulnerablePreview,
  normalizeVulnerableExcerptParts,
} from "./aiEvidencePick";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeEvidence } from "./pageNarratives";

const CARD_H = 300;

const local = StyleSheet.create({
  row: { flexDirection: "row", minHeight: CARD_H },
});

function brandName(data: ReportData): string {
  const n = data.clientName?.trim();
  return n && n.length > 0 ? n : "Your brand";
}

function looksLikeStructuredBlob(s: string): boolean {
  const t = s.trim();
  return t.startsWith("{") || t.startsWith("[") || /"\w+"\s*:/.test(t);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Highlights client brand inside an excerpt for faster scanning. */
function HighlightedExcerpt({ text, brand }: { text: string; brand: string }): ReactElement {
  const b = brand.trim();
  if (!b || !text.trim()) {
    return <Text style={lockedStyles.ev_responseExcerpt}>{text}</Text>;
  }
  let parts: string[];
  try {
    parts = text.split(new RegExp(`(${escapeRegExp(b)})`, "gi"));
  } catch {
    return <Text style={lockedStyles.ev_responseExcerpt}>{text}</Text>;
  }
  const nodes: ReactNode[] = parts.map((part, i) => {
    if (part.toLowerCase() === b.toLowerCase()) {
      return (
        <Text key={i} style={lockedStyles.ev_brandHit}>
          {part}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
  return <Text style={lockedStyles.ev_responseExcerpt}>{nodes}</Text>;
}

function strengthBody(data: ReportData): string {
  const s = findStrengthPreview(data.evidencePreview);
  if (!s?.snippet?.trim()) return clipPdfText("No strength excerpt in this export.");
  const raw = String(s.snippet).trim();
  if (looksLikeStructuredBlob(raw)) {
    return clipPdfText(
      `In this answer, ${brandName(data)} is positioned as a brand the assistant is willing to recommend.`,
    );
  }
  return clipPdfText(raw);
}

function competitorBulletsFromLine(namesLine: string): string[] {
  const t = namesLine.replace(/\s+/g, " ").trim();
  if (!t) return [];
  return t
    .split(/\s*,\s*|\s*;\s*|\s+and\s+/i)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

function vulnerableBlockFromParts(parts: VulnerableExcerptParts): ReactElement {
  const lead = clipPdfText(parts.summary.replace(/\s+/g, " ").trim());
  const bullets = competitorBulletsFromLine(parts.competitorsLine);
  const impact = clipPdfText(parts.implication.replace(/\s+/g, " ").trim());
  return (
    <View style={lockedStyles.ev_quote}>
      <Text style={lockedStyles.ev_quoteLead}>{lead}</Text>
      {bullets.length > 0 ? (
        <>
          <Text style={lockedStyles.ev_listIntro}>Instead, AI recommended:</Text>
          {bullets.map((b, i) => (
            <Text key={i} style={lockedStyles.ev_bullet}>
              {`• ${clipPdfText(b)}`}
            </Text>
          ))}
        </>
      ) : null}
      {impact ? <Text style={lockedStyles.ev_quoteImpact}>{impact}</Text> : null}
    </View>
  );
}

export function PageAiEvidence({ data }: { data: ReportData }): ReactElement {
  const s = findStrengthPreview(data.evidencePreview);
  const v = findVulnerablePreview(data.evidencePreview);
  const vulnParts = normalizeVulnerableExcerptParts(v);
  const strengthHint = s ? clipPdfText(formatEvidenceLogPillLabel(String(s.label)), 80) : "";
  const vulnHint = v ? clipPdfText(formatEvidenceLogPillLabel(String(v.label)), 80) : "";

  const strengthNote =
    s?.note?.trim() && !looksLikeStructuredBlob(String(s.note)) ? clipPdfText(String(s.note)) : "";

  let vulnerableQuote: ReactElement;
  if (vulnParts) {
    vulnerableQuote = vulnerableBlockFromParts(vulnParts);
  } else {
    const raw = v?.snippet?.trim() ? String(v.snippet) : "";
    const body = raw
      ? looksLikeStructuredBlob(raw)
        ? clipPdfText(
            `${brandName(data)} was not mentioned in this response. The assistant recommended other brands instead.`,
          )
        : clipPdfText(raw)
      : clipPdfText("No exposure excerpt in this export.");
    vulnerableQuote = (
      <View style={lockedStyles.ev_quote}>
        <Text style={lockedStyles.ev_quoteLead}>{body}</Text>
      </View>
    );
  }

  const vulnNote =
    v?.note?.trim() && !looksLikeStructuredBlob(String(v.note)) ? clipPdfText(String(v.note)) : "";
  const slice = narrativeEvidence(data);

  const strengthPrompt = s?.prompt?.trim() ? clipPdfText(String(s.prompt), 260) : "";
  const strengthExcerpt =
    s?.responseExcerpt?.trim() && !looksLikeStructuredBlob(String(s.responseExcerpt))
      ? clipPdfText(String(s.responseExcerpt), 460)
      : "";
  const vulnPrompt = v?.prompt?.trim() ? clipPdfText(String(v.prompt), 260) : "";
  const vulnExcerpt =
    v?.responseExcerpt?.trim() && !looksLikeStructuredBlob(String(v.responseExcerpt))
      ? clipPdfText(String(v.responseExcerpt), 460)
      : "";

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[6]!}>
      <LockedNarrativeStack slice={slice} variant="compact" include={["headline"]} />
      <View style={local.row} wrap={false}>
        <View style={lockedStyles.ev_cardStrength}>
          <Text style={lockedStyles.ev_badge}>STRENGTH</Text>
          {strengthHint ? <Text style={lockedStyles.ev_badgeHint}>{strengthHint}</Text> : null}
          {strengthPrompt ? (
            <>
              <Text style={lockedStyles.ev_fieldLabel}>Prompt</Text>
              <Text style={lockedStyles.ev_promptText}>{`"${strengthPrompt}"`}</Text>
            </>
          ) : null}
          <Text style={lockedStyles.ev_fieldLabel}>AI response</Text>
          {strengthExcerpt ? (
            <HighlightedExcerpt text={strengthExcerpt} brand={brandName(data)} />
          ) : (
            <View style={lockedStyles.ev_quote}>
              <Text style={lockedStyles.ev_quoteText}>{strengthBody(data)}</Text>
            </View>
          )}
          {strengthNote ? <Text style={lockedStyles.ev_note}>{strengthNote}</Text> : null}
        </View>
        <View style={lockedStyles.ev_cardRisk}>
          <Text style={lockedStyles.ev_badge}>VULNERABLE</Text>
          {vulnHint ? <Text style={lockedStyles.ev_badgeHint}>{vulnHint}</Text> : null}
          {vulnPrompt ? (
            <>
              <Text style={lockedStyles.ev_fieldLabel}>Prompt</Text>
              <Text style={lockedStyles.ev_promptText}>{`"${vulnPrompt}"`}</Text>
            </>
          ) : null}
          <Text style={lockedStyles.ev_fieldLabel}>AI response</Text>
          {vulnParts ? (
            vulnerableQuote
          ) : vulnExcerpt ? (
            <HighlightedExcerpt text={vulnExcerpt} brand={brandName(data)} />
          ) : (
            vulnerableQuote
          )}
          {vulnNote ? <Text style={lockedStyles.ev_note}>{vulnNote}</Text> : null}
        </View>
      </View>
      <LockedNarrativeStack
        slice={slice}
        stackRole="afterPrimary"
        variant="compact"
        include={["implication"]}
      />
    </PdfInnerPage>
  );
}
