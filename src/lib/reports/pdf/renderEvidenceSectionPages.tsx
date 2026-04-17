import type { ReactElement } from "react";
import type { ReportData } from "./types";
import { PageClosing } from "./pages/PageClosing";
import { PageEvidenceLog } from "./pages/PageEvidenceLog";
import { PageMethodology } from "./pages/PageMethodology";

/** Evidence log slide, methodology slide (optional), then closing slide — explicit pages, no flow. */
export function renderEvidenceSectionPages(data: ReportData): ReactElement[] {
  const out: ReactElement[] = [];
  if (data.evidenceLog.length > 0) {
    out.push(<PageEvidenceLog key="pdf-evidence-log" data={data} />);
  }
  if (data.methodology?.trim()) {
    out.push(<PageMethodology key="pdf-methodology" data={data} />);
  }
  out.push(<PageClosing key="pdf-closing" data={data} />);
  return out;
}
