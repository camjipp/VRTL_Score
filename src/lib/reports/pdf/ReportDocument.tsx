import { Document, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "./types";
import { Page1Overview } from "./pages/Page1Overview";
import { Page2ModelAnalysis } from "./pages/Page2ModelAnalysis";
import { Page3Recommendations } from "./pages/Page3Recommendations";
import { Page4ExecutionPlan } from "./pages/Page4ExecutionPlan";
import { Page5DataSummary } from "./pages/Page5DataSummary";
import { Page6Evidence } from "./pages/Page6Evidence";

const PAGE_BUILDERS: Array<{ num: number; render: (data: ReportData) => ReactElement }> = [
  { num: 1, render: (data) => <Page1Overview key={1} data={data} /> },
  { num: 2, render: (data) => <Page2ModelAnalysis key={2} data={data} /> },
  { num: 3, render: (data) => <Page3Recommendations key={3} data={data} /> },
  { num: 4, render: (data) => <Page4ExecutionPlan key={4} data={data} /> },
  { num: 5, render: (data) => <Page5DataSummary key={5} data={data} /> },
  { num: 6, render: (data) => <Page6Evidence key={6} data={data} /> },
];

export type ReportDocumentProps = {
  data: ReportData;
  /** If set, only these 1-based page numbers are included (for isolation probes). */
  pages?: number[];
};

export function ReportDocument({ data, pages }: ReportDocumentProps): ReactElement<DocumentProps> {
  const filter = pages?.length ? new Set(pages) : null;
  const children = PAGE_BUILDERS.filter((p) => !filter || filter.has(p.num)).map((p) => p.render(data));

  return (
    <Document title="VRTL Score — AI Authority Report" author={data.agencyName ?? ""} subject={data.clientName}>
      {children}
    </Document>
  );
}
