import { Document, Font, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

/** Prevent Helvetica syllable splits that read as corrupted mid-word characters in exports. */
Font.registerHyphenationCallback((word) => (word.length === 0 ? [] : [word]));
import type { ReportData } from "./types";
import { Page1Overview } from "./pages/Page1Overview";
import { Page2ModelAnalysis } from "./pages/Page2ModelAnalysis";
import { Page3Recommendations } from "./pages/Page3Recommendations";
import { Page4ExecutionPlan } from "./pages/Page4ExecutionPlan";
import { Page5DataSummary } from "./pages/Page5DataSummary";
import { Page6Evidence } from "./pages/Page6Evidence";
import {
  shouldRenderDataSummaryPage,
  shouldRenderEvidenceMethodologyPage,
  shouldRenderExecutionPage,
  shouldRenderModelAnalysisPage,
  shouldRenderRecommendationsPage,
} from "./reportPageVisibility";

type PageBuilder = {
  num: number;
  render: (data: ReportData) => ReactElement | ReactElement[];
  include: (d: ReportData) => boolean;
};

const PAGE_BUILDERS: PageBuilder[] = [
  { num: 1, render: (d) => <Page1Overview key="p1" data={d} />, include: () => true },
  {
    num: 2,
    render: (d) => <Page2ModelAnalysis key="p2" data={d} />,
    include: shouldRenderModelAnalysisPage,
  },
  {
    num: 3,
    render: (d) => <Page3Recommendations key="p3" data={d} />,
    include: shouldRenderRecommendationsPage,
  },
  {
    num: 4,
    render: (d) => <Page4ExecutionPlan key="p4" data={d} />,
    include: shouldRenderExecutionPage,
  },
  {
    num: 5,
    render: (d) => <Page5DataSummary key="p5" data={d} />,
    include: shouldRenderDataSummaryPage,
  },
  {
    num: 6,
    render: (d) => <Page6Evidence key="p6" data={d} />,
    include: shouldRenderEvidenceMethodologyPage,
  },
];

export type ReportDocumentProps = {
  data: ReportData;
  /** If set, only these 1-based page numbers are included (for isolation probes). */
  pages?: number[];
};

export function ReportDocument({ data, pages }: ReportDocumentProps): ReactElement<DocumentProps> {
  /** Page probes (`pages=[n]`) force-include that section even if `include()` would skip it (empty data). */
  const probe = pages?.length ? new Set(pages) : null;
  const children = PAGE_BUILDERS.filter((p) => {
    if (probe) return probe.has(p.num);
    return p.include(data);
  }).flatMap((p) => {
    const rendered = p.render(data);
    return Array.isArray(rendered) ? rendered : [rendered];
  });

  return (
    <Document title={`AI Authority Report: ${data.clientName}`} author={data.agencyName ?? ""} subject={data.clientName}>
      {children}
    </Document>
  );
}
