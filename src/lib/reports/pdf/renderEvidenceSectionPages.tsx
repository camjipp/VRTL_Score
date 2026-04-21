import type { ReactElement } from "react";
import type { ReportData } from "./types";
import { PageClosing } from "./pages/PageClosing";
import { PageEvidenceLog } from "./pages/PageEvidenceLog";

/** Evidence log (when present), then closing (methodology + run summary + next steps — merged for even fill). */
export function renderEvidenceSectionPages(data: ReportData): ReactElement[] {
  const out: ReactElement[] = [];
  if (data.evidenceLog.length > 0) {
    out.push(<PageEvidenceLog key="pdf-evidence-log" data={data} />);
  }
  out.push(<PageClosing key="pdf-closing" data={data} />);
  return out;
}
