import { View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { RecommendationCard, ReportData } from "../types";
import { EditorialSectionHeader } from "../components/EditorialSectionHeader";
import { FixedInnerPage } from "../components/FixedInnerPage";
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

/** PAGE 6+ — Continuation of the same ranked plan. */
export function Page06RecommendationsB({ data, pair, startNumber, sliceIndex }: Props): ReactElement {
  const total = data.recommendations.length;
  const end = startNumber + pair.length - 1;
  const span = startNumber === end ? `${startNumber}` : `${startNumber}–${end}`;
  const purpose = `Same ordered plan as page 5 — items ${span} of ${total}.`;

  const title =
    startNumber === end ? `Action ${startNumber}` : `Actions ${startNumber}–${end}`;

  return (
    <FixedInnerPage data={data} pageNum={6}>
      <PdfTraceMarker page={6} section={`Fixed:P6-${sliceIndex}`} />
      <EditorialSectionHeader sectionLabel="Prioritized actions" title={title} purpose={purpose} />
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
