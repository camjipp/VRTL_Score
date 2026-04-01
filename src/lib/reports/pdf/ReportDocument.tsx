import { Document, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "./types";
import { registerPdfFonts } from "./registerFonts";
import { Page1Overview } from "./pages/Page1Overview";
import { Page2ModelAnalysis } from "./pages/Page2ModelAnalysis";
import { Page3Recommendations } from "./pages/Page3Recommendations";
import { Page4ExecutionPlan } from "./pages/Page4ExecutionPlan";
import { Page5DataSummary } from "./pages/Page5DataSummary";
import { Page6Evidence } from "./pages/Page6Evidence";

registerPdfFonts();

export function ReportDocument({ data }: { data: ReportData }): ReactElement<DocumentProps> {
  return (
    <Document title="AI Authority Report" author={data.agencyName ?? ""} subject={data.clientName}>
      <Page1Overview data={data} />
      <Page2ModelAnalysis data={data} />
      <Page3Recommendations data={data} />
      <Page4ExecutionPlan data={data} />
      <Page5DataSummary data={data} />
      <Page6Evidence data={data} />
    </Document>
  );
}
