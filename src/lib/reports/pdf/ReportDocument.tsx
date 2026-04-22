import { Document, Font, type DocumentProps } from "@react-pdf/renderer";
import React, { type ReactElement } from "react";

/** Prevent Helvetica syllable splits that read as corrupted mid-word characters in exports. */
Font.registerHyphenationCallback((word) => (word.length === 0 ? [] : [word]));

import { sliceRecommendationsForFixedTemplates } from "./fixed/fixedRecommendationSlices";
import {
  includeCompetitiveSnapshot,
  includeDataSummary,
  includeEvidenceLog,
  includeExampleAnswers,
  includeExecutionPlan,
  includeExecutiveSummary,
  includeMethodologyClosing,
  includeModelAnalysis,
  includeRecommendationsContinuation,
  includeRecommendationsPage5,
} from "./fixed/fixedSectionInclusion";
import { Page1 } from "./templates/Page1";
import { Page02CompetitiveSnapshot } from "./templates/Page02CompetitiveSnapshot";
import { Page03ModelAnalysis } from "./templates/Page03ModelAnalysis";
import { Page04ExampleAnswers } from "./templates/Page04ExampleAnswers";
import { Page05RecommendationsA } from "./templates/Page05RecommendationsA";
import { Page06RecommendationsB } from "./templates/Page06RecommendationsB";
import { Page07ExecutionPlan } from "./templates/Page07ExecutionPlan";
import { Page08DataSummary } from "./templates/Page08DataSummary";
import { Page09EvidenceLog } from "./templates/Page09EvidenceLog";
import { Page10MethodologyClosing } from "./templates/Page10MethodologyClosing";
import type { ReportData } from "./types";

export type ReportDocumentProps = {
  data: ReportData;
  /** If set, only these logical section ids (1–10) are included. Section 6 includes every “Recommendations B” page. */
  pages?: number[];
};

/**
 * Fixed-template report (slide-deck): one React template per logical page slot.
 *
 * | Logical id | Component | Content |
 * |------------|-----------|---------|
 * | 1 | `Page1` | Executive summary (A4 cover) |
 * | 2 | `Page02CompetitiveSnapshot` | Ranking + WIN/RISK/PRIORITY |
 * | 3 | `Page03ModelAnalysis` | Strongest/weakest + OpenAI/Gemini/Anthropic + summary |
 * | 4 | `Page04ExampleAnswers` | Strength + vulnerable excerpts + takeaway |
 * | 5 | `Page05RecommendationsA` | Recommendations 1–2 |
 * | 6 | `Page06RecommendationsB` (×N) | Recommendations 3+ in pairs |
 * | 7 | `Page07ExecutionPlan` | Four execution steps |
 * | 8 | `Page08DataSummary` | Narrative + signals + competitive tables |
 * | 9 | `Page09EvidenceLog` | Evidence table only |
 * | 10 | `Page10MethodologyClosing` | Methodology + run summary + what’s next |
 *
 * `pages={[n]}` filters by logical id; id 6 includes every “Recommendations B” physical page.
 */
export function ReportDocument({ data, pages }: ReportDocumentProps): ReactElement<DocumentProps> {
  const probe = pages?.length ? new Set(pages) : null;
  const want = (sectionId: number) => !probe || probe.has(sectionId);

  const children: ReactElement[] = [];

  if (want(1) && includeExecutiveSummary()) {
    children.push(<Page1 key="pdf-tpl-1" data={data} />);
  }
  if (want(2) && includeCompetitiveSnapshot(data)) {
    children.push(<Page02CompetitiveSnapshot key="pdf-tpl-2" data={data} />);
  }
  if (want(3) && includeModelAnalysis(data)) {
    children.push(<Page03ModelAnalysis key="pdf-tpl-3" data={data} />);
  }
  if (want(4) && includeExampleAnswers(data)) {
    children.push(<Page04ExampleAnswers key="pdf-tpl-4" data={data} />);
  }
  if (want(5) && includeRecommendationsPage5(data)) {
    children.push(<Page05RecommendationsA key="pdf-tpl-5" data={data} />);
  }
  if (want(6) && includeRecommendationsContinuation(data)) {
    const { continuationPairs } = sliceRecommendationsForFixedTemplates(data.recommendations);
    /** Never emit a `<Page>` for an empty recommendation pair (avoids blank pages between sections). */
    const nonEmptyPairs = continuationPairs.filter((pair) => pair.length > 0);
    nonEmptyPairs.forEach((pair, i) => {
      children.push(
        <Page06RecommendationsB
          key={`pdf-tpl-6-${i}`}
          data={data}
          pair={pair}
          startNumber={3 + i * 2}
          sliceIndex={i}
        />,
      );
    });
  }
  if (want(7) && includeExecutionPlan(data)) {
    children.push(<Page07ExecutionPlan key="pdf-tpl-7" data={data} />);
  }
  if (want(8) && includeDataSummary(data)) {
    children.push(<Page08DataSummary key="pdf-tpl-8" data={data} />);
  }
  if (want(9) && includeEvidenceLog(data)) {
    children.push(<Page09EvidenceLog key="pdf-tpl-9" data={data} />);
  }
  if (want(10) && includeMethodologyClosing()) {
    children.push(<Page10MethodologyClosing key="pdf-tpl-10" data={data} />);
  }

  return (
    <Document title={`AI Authority Report: ${data.clientName}`} author={data.agencyName ?? ""} subject={data.clientName}>
      {children}
    </Document>
  );
}
