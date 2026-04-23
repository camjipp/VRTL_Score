import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import { formatEvidenceLogPillLabel } from "@/lib/reports/formatEvidenceFieldDisplay";
import type { ReportData } from "../types";
import {
  findStrengthPreview,
  findVulnerablePreview,
  normalizeVulnerableExcerptParts,
} from "./aiEvidencePick";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { lockedStyles } from "./lockedDocumentStyles";

const CARD_H = 200;

const local = StyleSheet.create({
  row: { flexDirection: "row", height: CARD_H },
});

function strengthBody(data: ReportData): string {
  const s = findStrengthPreview(data.evidencePreview);
  if (!s?.snippet?.trim()) return clipPdfText("No strength excerpt in this export.", 300);
  return clipPdfText(String(s.snippet), 300);
}

export function PageAiEvidence({ data }: { data: ReportData }): ReactElement {
  const s = findStrengthPreview(data.evidencePreview);
  const v = findVulnerablePreview(data.evidencePreview);
  const vulnParts = normalizeVulnerableExcerptParts(v);
  const strengthLabel = s ? formatEvidenceLogPillLabel(String(s.label)) : "Strength";
  const vulnLabel = v ? formatEvidenceLogPillLabel(String(v.label)) : "Exposure";

  const strengthNote = s?.note?.trim()
    ? clipPdfText(String(s.note), 110)
    : "";

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[6]!}>
      <View style={local.row} wrap={false}>
        <View style={lockedStyles.ev_cardStrength}>
          <Text style={lockedStyles.ev_badge}>{strengthLabel}</Text>
          <View style={lockedStyles.ev_quote}>
            <Text style={lockedStyles.ev_quoteText}>{strengthBody(data)}</Text>
          </View>
          {strengthNote ? <Text style={lockedStyles.ev_note}>{strengthNote}</Text> : null}
        </View>
        <View style={lockedStyles.ev_cardRisk}>
          <Text style={lockedStyles.ev_badge}>{vulnLabel}</Text>
          {vulnParts ? (
            <>
              <Text style={lockedStyles.ev_micro}>Summary</Text>
              <Text style={lockedStyles.ev_microBody}>{clipPdfText(vulnParts.summary, 95)}</Text>
              <Text style={lockedStyles.ev_micro}>Named alternatives</Text>
              <Text style={lockedStyles.ev_microBody}>{clipPdfText(vulnParts.competitorsLine, 72)}</Text>
              <Text style={lockedStyles.ev_micro}>Impact</Text>
              <Text style={lockedStyles.ev_microBody}>{clipPdfText(vulnParts.implication, 85)}</Text>
            </>
          ) : (
            <>
              <View style={lockedStyles.ev_quote}>
                <Text style={lockedStyles.ev_quoteText}>
                  {v?.snippet?.trim()
                    ? clipPdfText(String(v.snippet), 280)
                    : clipPdfText("No exposure excerpt in this export.", 120)}
                </Text>
              </View>
              {v?.note?.trim() ? <Text style={lockedStyles.ev_note}>{clipPdfText(String(v.note), 100)}</Text> : null}
            </>
          )}
        </View>
      </View>
    </PdfInnerPage>
  );
}
