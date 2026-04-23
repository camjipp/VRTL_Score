import { Page, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { clipPdfText } from "../editorial/pdfNarrative";
import { PDF_PAGE_SIZE } from "../theme";
import type { ReportData } from "../types";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeCover } from "./pageNarratives";

export function PageCover({ data }: { data: ReportData }): ReactElement {
  return (
    <Page size={PDF_PAGE_SIZE} style={lockedStyles.cover_page}>
      <View style={lockedStyles.cover_center}>
        <View style={lockedStyles.cover_rule} />
        <Text style={lockedStyles.cover_title}>{clipPdfText("AI Authority Report", 80)}</Text>
        <Text style={lockedStyles.cover_client}>{clipPdfText(data.clientName, 72)}</Text>
        <Text style={lockedStyles.cover_date}>{clipPdfText(data.date, 40)}</Text>
        <View style={lockedStyles.cover_narBlock}>
          <LockedNarrativeStack slice={narrativeCover(data)} variant="cover" />
        </View>
      </View>
    </Page>
  );
}
