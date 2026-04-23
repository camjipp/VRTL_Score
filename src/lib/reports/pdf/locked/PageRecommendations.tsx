import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { RecommendationCard, ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeRecommendations } from "./pageNarratives";

const CARD_H = 128;
const MAX_CARDS = 3;

const local = StyleSheet.create({
  cardH: { height: CARD_H },
});

export function PageRecommendations({ data }: { data: ReportData }): ReactElement {
  const cards: readonly RecommendationCard[] = data.recommendations.slice(0, MAX_CARDS);
  const slice = narrativeRecommendations(data);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[7]!}>
      <LockedNarrativeStack slice={slice} include={["headline"]} />
      <View style={lockedStyles.rec_col}>
        {cards.length === 0 ? (
          <View style={[lockedStyles.rec_itemLast, local.cardH]} wrap={false}>
            <Text style={lockedStyles.rec_title}>{clipPdfText("No recommendations in this export.")}</Text>
          </View>
        ) : (
          cards.map((c, i) => {
            const last = i === cards.length - 1;
            const box = last ? lockedStyles.rec_itemLast : lockedStyles.rec_item;
            return (
              <View key={i} style={[box, local.cardH]} wrap={false}>
                <Text style={lockedStyles.rec_priority}>{clipPdfText(c.priority, 24)}</Text>
                <Text style={lockedStyles.rec_title}>{clipPdfText(c.title)}</Text>
                <Text style={lockedStyles.rec_insight}>{clipPdfText(c.insight)}</Text>
                <Text style={lockedStyles.rec_labelFirst}>Context</Text>
                <Text style={lockedStyles.rec_line}>{clipPdfText(c.explanation)}</Text>
                <Text style={lockedStyles.rec_label}>Action</Text>
                <Text style={lockedStyles.rec_actionLine}>{clipPdfText(c.action)}</Text>
                <Text style={lockedStyles.rec_label}>Outcome</Text>
                <Text style={lockedStyles.rec_line}>{clipPdfText(c.expectedOutcome)}</Text>
              </View>
            );
          })
        )}
      </View>
      <LockedNarrativeStack
        slice={slice}
        stackRole="afterPrimary"
        include={["interpretation", "implication", "inaction"]}
      />
    </PdfInnerPage>
  );
}
