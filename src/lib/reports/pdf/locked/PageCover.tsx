import { Page, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { clipPdfText } from "../editorial/pdfNarrative";
import { PDF_PAGE_SIZE } from "../theme";
import type { ReportData } from "../types";
import { lockedStyles } from "./lockedDocumentStyles";

export function PageCover({ data }: { data: ReportData }): ReactElement {
  const agency = data.agencyName?.trim() ?? "";

  return (
    <Page size={PDF_PAGE_SIZE} style={lockedStyles.cover_page}>
      <View style={lockedStyles.cover_root}>
        {agency.length > 0 ? (
          <View style={lockedStyles.cover_agency}>
            <Text style={lockedStyles.cover_agencyText}>{clipPdfText(agency)}</Text>
          </View>
        ) : null}

        <View style={lockedStyles.cover_titleCluster}>
          <View style={lockedStyles.cover_rule} />
          <Text style={lockedStyles.cover_title}>{clipPdfText("AI Authority Report")}</Text>
        </View>

        <Text style={lockedStyles.cover_client}>{clipPdfText(data.clientName)}</Text>

        <View style={lockedStyles.cover_spacer} />

        <Text style={lockedStyles.cover_date}>{clipPdfText(data.date)}</Text>
      </View>
    </Page>
  );
}
