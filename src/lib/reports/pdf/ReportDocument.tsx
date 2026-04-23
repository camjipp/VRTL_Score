import { Document, Font, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

/** Prevent Helvetica syllable splits that read as corrupted mid-word characters in exports. */
Font.registerHyphenationCallback((word) => (word.length === 0 ? [] : [word]));

import { PageAiEvidence } from "./locked/PageAiEvidence";
import { PageClosing } from "./locked/PageClosing";
import { PageCompetitiveLandscape } from "./locked/PageCompetitiveLandscape";
import { PageCover } from "./locked/PageCover";
import { PageDataSummary } from "./locked/PageDataSummary";
import { PageModelBreakdown } from "./locked/PageModelBreakdown";
import { PagePerformanceSnapshot } from "./locked/PagePerformanceSnapshot";
import { PageRecommendations } from "./locked/PageRecommendations";
import { PageToc } from "./locked/PageToc";
import type { ReportData } from "./types";

export type ReportDocumentProps = {
  data: ReportData;
  /**
   * Optional physical page filter (1–9) for diagnostics.
   * Omit to render the full locked nine-page document.
   */
  pages?: number[];
};

/**
 * Locked nine-page AI Authority report (structure-only layout).
 *
 * | # | Page |
 * |---|------|
 * | 1 | Cover |
 * | 2 | Table of Contents |
 * | 3 | Performance Snapshot |
 * | 4 | Competitive Landscape |
 * | 5 | Model Breakdown |
 * | 6 | AI Evidence |
 * | 7 | Recommendations |
 * | 8 | Data Summary |
 * | 9 | Closing |
 */
export function ReportDocument({ data, pages }: ReportDocumentProps): ReactElement<DocumentProps> {
  const probe = pages?.length ? new Set(pages) : null;
  const want = (physicalPage: number) => !probe || probe.has(physicalPage);

  return (
    <Document title={`AI Authority Report: ${data.clientName}`} author={data.agencyName ?? ""} subject={data.clientName}>
      {want(1) ? <PageCover key="locked-p1" data={data} /> : null}
      {want(2) ? <PageToc key="locked-p2" data={data} /> : null}
      {want(3) ? <PagePerformanceSnapshot key="locked-p3" data={data} /> : null}
      {want(4) ? <PageCompetitiveLandscape key="locked-p4" data={data} /> : null}
      {want(5) ? <PageModelBreakdown key="locked-p5" data={data} /> : null}
      {want(6) ? <PageAiEvidence key="locked-p6" data={data} /> : null}
      {want(7) ? <PageRecommendations key="locked-p7" data={data} /> : null}
      {want(8) ? <PageDataSummary key="locked-p8" data={data} /> : null}
      {want(9) ? <PageClosing key="locked-p9" data={data} /> : null}
    </Document>
  );
}
