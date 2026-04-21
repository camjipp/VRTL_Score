import { View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { sliceRecommendationsForFixedTemplates } from "../fixed/fixedRecommendationSlices";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { NumberedRecommendationCard, PrimaryRecommendationCard } from "./RecommendationBlocks";

/** PAGE 5 — Recommendations A: first two cards only (fixed template). */
export function Page05RecommendationsA({ data }: { data: ReportData }): ReactElement {
  const { page5Pair } = sliceRecommendationsForFixedTemplates(data.recommendations);
  const [first, second] = page5Pair;

  return (
    <FixedInnerPage data={data} pageNum={5}>
      <PdfTraceMarker page={5} section="Fixed:P5" />
      <ChapterTitle
        title="Recommendations"
        subtitle="Highest-impact moves first: concrete execution tied to measurable recommendation outcomes."
      />
      {first ? (
        <View style={second ? {} : { flexGrow: 1, minHeight: 0 }}>
          <PrimaryRecommendationCard rec={first} />
        </View>
      ) : null}
      {second ? (
        <View style={{ flexGrow: 1, minHeight: 0 }}>
          <NumberedRecommendationCard rec={second} num={2} />
        </View>
      ) : null}
    </FixedInnerPage>
  );
}
