import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
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

const CARD_H = 200;

const local = StyleSheet.create({
  row: { flexDirection: "row", height: CARD_H },
});

function brandName(data: ReportData): string {
  const n = data.clientName?.trim();
  return n && n.length > 0 ? n : "Your brand";
}

function looksLikeStructuredBlob(s: string): boolean {
  const t = s.trim();
  return t.startsWith("{") || t.startsWith("[") || /"\w+"\s*:/.test(t);
}

function strengthBody(data: ReportData): string {
  const s = findStrengthPreview(data.evidencePreview);
  if (!s?.snippet?.trim()) return clipPdfText("No strength excerpt in this export.", 280);
  const raw = String(s.snippet).trim();
  if (looksLikeStructuredBlob(raw)) {
    return clipPdfText(
      `In this answer, ${clipPdfText(brandName(data), 28)} is positioned as a brand the assistant is willing to recommend.`,
      200,
    );
  }
  return clipPdfText(raw, 280);
}

function vulnerableFromParts(parts: VulnerableExcerptParts): { lead: string; detail: string; impact: string } {
  const summary = parts.summary.replace(/\s+/g, " ").trim();
  const names = parts.competitorsLine.replace(/\s+/g, " ").trim();
  const impl = parts.implication.replace(/\s+/g, " ").trim();
  const lead = clipPdfText(summary, 118);
  const detail = names
    ? clipPdfText(`Competitors recommended in the same answer include ${names.replace(/\.$/, "")}.`, 130)
    : "";
  const impact = clipPdfText(impl, 108);
  return { lead, detail, impact };
}

export function PageAiEvidence({ data }: { data: ReportData }): ReactElement {
  const s = findStrengthPreview(data.evidencePreview);
  const v = findVulnerablePreview(data.evidencePreview);
  const vulnParts = normalizeVulnerableExcerptParts(v);
  const strengthHint = s ? clipPdfText(formatEvidenceLogPillLabel(String(s.label)), 48) : "";
  const vulnHint = v ? clipPdfText(formatEvidenceLogPillLabel(String(v.label)), 48) : "";

  const strengthNote = s?.note?.trim() ? clipPdfText(String(s.note), 90) : "";

  let vulnerableQuote: ReactElement;
  if (vulnParts) {
    const { lead, detail, impact } = vulnerableFromParts(vulnParts);
    vulnerableQuote = (
      <View style={lockedStyles.ev_quote}>
        <Text style={lockedStyles.ev_quoteLead}>{lead}</Text>
        {detail ? <Text style={lockedStyles.ev_quoteDetail}>{detail}</Text> : null}
        {impact ? <Text style={lockedStyles.ev_quoteImpact}>{impact}</Text> : null}
      </View>
    );
  } else {
    const raw = v?.snippet?.trim() ? String(v.snippet) : "";
    const body = raw
      ? looksLikeStructuredBlob(raw)
        ? clipPdfText(
            `${clipPdfText(brandName(data), 28)} was not mentioned in this response; the assistant recommended other brands instead.`,
            200,
          )
        : clipPdfText(raw, 240)
      : clipPdfText("No exposure excerpt in this export.", 120);
    vulnerableQuote = (
      <View style={lockedStyles.ev_quote}>
        <Text style={lockedStyles.ev_quoteLead}>{body}</Text>
      </View>
    );
  }

  const vulnNote = v?.note?.trim() ? clipPdfText(String(v.note), 85) : "";
  const slice = narrativeEvidence(data);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[6]!}>
      <LockedNarrativeStack slice={slice} variant="compact" include={["headline"]} />
      <View style={local.row} wrap={false}>
        <View style={lockedStyles.ev_cardStrength}>
          <Text style={lockedStyles.ev_badge}>STRENGTH</Text>
          {strengthHint ? <Text style={lockedStyles.ev_badgeHint}>{strengthHint}</Text> : null}
          <View style={lockedStyles.ev_quote}>
            <Text style={lockedStyles.ev_quoteText}>{strengthBody(data)}</Text>
          </View>
          {strengthNote ? <Text style={lockedStyles.ev_note}>{strengthNote}</Text> : null}
        </View>
        <View style={lockedStyles.ev_cardRisk}>
          <Text style={lockedStyles.ev_badge}>VULNERABLE</Text>
          {vulnHint ? <Text style={lockedStyles.ev_badgeHint}>{vulnHint}</Text> : null}
          {vulnerableQuote}
          {vulnNote ? <Text style={lockedStyles.ev_note}>{vulnNote}</Text> : null}
        </View>
      </View>
      <LockedNarrativeStack
        slice={slice}
        stackRole="afterPrimary"
        variant="compact"
        include={["interpretation", "implication", "inaction"]}
      />
    </PdfInnerPage>
  );
}
