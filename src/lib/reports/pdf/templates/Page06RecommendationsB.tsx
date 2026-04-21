import { View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { RecommendationCard, ReportData } from "../types";
import { FixedInnerPage } from "../components/FixedInnerPage";
import { ChapterTitle } from "../components/ChapterTitle";
import { PdfTraceMarker } from "../components/PdfTraceMarker";
import { NumberedRecommendationCard } from "./RecommendationBlocks";

type Props = {
  data: ReportData;
  /** Up to two cards for this physical page (indices 2+ in the full list). */
  pair: RecommendationCard[];
  /** Display number for the first card on this page (1-based, global). */
  startNumber: number;
  /** Distinguish multiple continuation pages in React keys. */
  sliceIndex: number;
};

/** PAGE 6+ — Recommendations B: remaining cards, two per page (fixed template, repeated as needed). */
export function Page06RecommendationsB({ data, pair, startNumber, sliceIndex }: Props): ReactElement {
  return (
    <FixedInnerPage data={data} pageNum={6}>
      <PdfTraceMarker page={6} section={`Fixed:P6-${sliceIndex}`} />
      <ChapterTitle title="Recommendations (continued)" subtitle="Next priorities from the same ordered list." />
      {pair.map((rec, i) => (
        <View
          key={`rec-${sliceIndex}-${i}`}
          style={i === pair.length - 1 ? { flexGrow: 1, minHeight: 0 } : {}}
        >
          <NumberedRecommendationCard rec={rec} num={startNumber + i} />
        </View>
      ))}
    </FixedInnerPage>
  );
}
