import { Page, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { clipPdfText } from "../editorial/pdfNarrative";
import { PDF_PAGE_SIZE } from "../theme";
import type { ReportData } from "../types";
import { lockedStyles } from "./lockedDocumentStyles";

export function PageCover({ data }: { data: ReportData }): ReactElement {
  return (
    <Page size={PDF_PAGE_SIZE} style={lockedStyles.cover_page}>
      <View style={lockedStyles.cover_center}>
        <View style={lockedStyles.cover_rule} />
        <Text style={lockedStyles.cover_title}>{clipPdfText("AI Authority Report")}</Text>
        <Text style={lockedStyles.cover_client}>{clipPdfText(data.clientName)}</Text>
        <Text style={lockedStyles.cover_date}>{clipPdfText(data.date)}</Text>
      </View>
    </Page>
  );
}
