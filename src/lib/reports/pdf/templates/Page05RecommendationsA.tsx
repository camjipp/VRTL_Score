import { View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "../types";
import { sliceRecommendationsForFixedTemplates } from "../fixed/fixedRecommendationSlices";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { NumberedRecommendationCard, PrimaryRecommendationCard } from "./RecommendationBlocks";

/** PAGE 5 — Ranked action plan (items 1–2). */
export function Page05RecommendationsA({ data }: { data: ReportData }): ReactElement {
  const { page5Pair } = sliceRecommendationsForFixedTemplates(data.recommendations);
  const [first, second] = page5Pair;
  const total = data.recommendations.length;
  const range =
    first && second ? "Items 1–2" : first ? "Item 1" : "";
  const purpose =
    total <= 0
      ? "Ordered fixes tied to measurable outcomes."
      : `Your ranked action plan (${total} ${total === 1 ? "move" : "moves"} total), ordered by business impact.${range ? ` This page: ${range}.` : ""}`;

  return (
    <FixedInnerPage data={data} pageNum={5}>
      <PdfTraceMarker page={5} section="Fixed:P5" />
      <EditorialSectionHeader sectionLabel="Prioritized actions" title="Top priorities" purpose={purpose} />
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
