import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { colors, fonts, rhythm, BODY_MAX_W, CONTENT_W } from "../theme";
import { evidenceLogPurpose } from "../editorial/pdfNarrative";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { formatEvidenceLogPillLabel, formatPdfEvidenceTableCell } from "@/lib/reports/formatEvidenceFieldDisplay";
import { sanitizePdfString } from "../sanitizeReportData";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { PdfTraceMarker } from "../components/PdfTraceMarker";

const W_TBL = CONTENT_W;
const W = {
  idx: 27,
  label: 97,
  yn: 38,
  pos: 42,
  str: 69,
  comp: 38,
  rest: W_TBL - 27 - 97 - 38 - 42 - 69 - 38,
} as const;

const styles = StyleSheet.create({
  caption: {
    fontSize: 8.5,
    fontWeight: 400,
    color: colors.ink2,
    marginBottom: rhythm.sm,
    fontFamily: fonts.sans,
    lineHeight: 1.5,
    maxWidth: BODY_MAX_W,
  },
  th: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    paddingVertical: 9,
    paddingHorizontal: rhythm.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    width: W_TBL,
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
    width: W_TBL,
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
  ynY: { backgroundColor: colors.surface2, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  ynN: { backgroundColor: colors.surface2, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
});

function logLabelPill(label: string): { bg: string; fg: string } {
  const u = label.toUpperCase();
  if (u.includes("STRENGTH")) return { bg: colors.greenLight, fg: colors.ink };
  if (u.includes("OPPORTUNITY") || u.includes("MENTIONED") || u.includes("COMPETITIVE")) return { bg: colors.orangeLight, fg: colors.ink };
  if (u.includes("VULNERABLE") || u.includes("INVISIBLE")) return { bg: colors.redLight, fg: colors.ink };
  return { bg: colors.surface2, fg: colors.ink };
}

/** PAGE 9 — Evidence log only (fixed template). */
export function Page09EvidenceLog({ data }: { data: ReportData }): ReactElement | null {
  if (!data.evidenceLog?.length) return null;

  return (
    <FixedInnerPage data={data} pageNum={9}>
      <PdfTraceMarker page={9} section="Fixed:P9" />
      <EditorialSectionHeader
        sectionLabel="Proof"
        title="Evidence log"
        purpose={evidenceLogPurpose()}
        intro="Each row is one analyzed answer in this export—structured fields only, not raw transcripts or dumps."
      />
      <Text style={styles.caption}>
        One row per sampled answer—structured fields for audit, not raw chat logs.
      </Text>
      <View style={{ flexGrow: 1, flexDirection: "column", minHeight: 0, marginBottom: rhythm.sm }}>
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
          const noteDisp = row.note?.trim() ? sanitizePdfString(row.note) : "No signal";
          return (
            <View
              key={`evl-${row.idx}`}
              style={[styles.tr, rowIdx % 2 === 1 ? styles.trAlt : {}]}
              minPresenceAhead={48}
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
              <Text style={[styles.td, { width: W.rest, fontSize: 7, lineHeight: 1.45 }]}>{noteDisp}</Text>
            </View>
          );
        })}
      </View>
    </FixedInnerPage>
  );
}
