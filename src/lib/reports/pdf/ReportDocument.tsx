import { Document, Font, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

/** Prevent Helvetica syllable splits that read as corrupted mid-word characters in exports. */
Font.registerHyphenationCallback((word) => (word.length === 0 ? [] : [word]));
import type { ReportData } from "./types";
import { Page1Overview } from "./pages/Page1Overview";
import { PageModelAnalysisExamples } from "./pages/Page2ModelAnalysis";
import { PageModelAnalysisMatrix } from "./pages/PageModelAnalysisMatrix";
import { PageRankingAlerts } from "./pages/PageRankingAlerts";
import { renderRecommendationPages } from "./pages/PageRecommendations";
import { Page4ExecutionPlan } from "./pages/Page4ExecutionPlan";
import { Page5DataSummary } from "./pages/Page5DataSummary";
import { renderEvidenceSectionPages } from "./renderEvidenceSectionPages";
import {
  shouldRenderDataSummaryPage,
  shouldRenderEvidenceMethodologyPage,
  shouldRenderExecutionPage,
  shouldRenderModelAnalysisExamplesSubpage,
  shouldRenderModelAnalysisPage,
  shouldRenderRecommendationsPage,
} from "./reportPageVisibility";

type PageBuilder = {
  num: number;
  render: (data: ReportData) => ReactElement | ReactElement[];
  include: (d: ReportData) => boolean;
};

function buildModelAnalysisSectionPages(data: ReportData): ReactElement[] {
  const pages: ReactElement[] = [];
  pages.push(<PageRankingAlerts key="pdf-ranking" data={data} />);
  pages.push(<PageModelAnalysisMatrix key="pdf-matrix" data={data} />);
  if (shouldRenderModelAnalysisExamplesSubpage(data)) {
    const ex = <PageModelAnalysisExamples key="pdf-examples" data={data} />;
    if (ex) pages.push(ex);
  }
  return pages;
}

const PAGE_BUILDERS: PageBuilder[] = [
  { num: 1, render: (d) => <Page1Overview key="p1" data={d} />, include: () => true },
  {
    num: 2,
    render: (d) => buildModelAnalysisSectionPages(d),
    include: shouldRenderModelAnalysisPage,
  },
  {
    num: 3,
    render: (d) => renderRecommendationPages(d),
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
    render: (d) => renderEvidenceSectionPages(d),
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
