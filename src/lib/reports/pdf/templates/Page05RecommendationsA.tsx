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
  const purpose =
    total <= 0
      ? "Ranked moves tied to measurable outcomes."
      : total === 1
        ? "One move—execute it before you split attention across noise."
        : total === 2
          ? "Two moves below: #1 is the lead bet; #2 follows in the same wave when bandwidth allows."
          : `Move #1 below is the lead bet. This page covers items 1–2 of ${total}—impact-ranked through the rest of the deck.`;

  return (
    <FixedInnerPage data={data} pageNum={5}>
      <PdfTraceMarker page={5} section="Fixed:P5" />
      <EditorialSectionHeader
        sectionLabel="Decision"
        title="What we fix first"
        purpose={purpose}
        intro="Approve issue → move → outcome. No jargon."
      />
      {first ? (
        <View>
          <PrimaryRecommendationCard rec={first} actionIndex={1} totalActions={total} />
        </View>
      ) : null}
      {second ? (
        <View>
          <NumberedRecommendationCard rec={second} num={2} secondary />
        </View>
      ) : null}
    </FixedInnerPage>
  );
}
