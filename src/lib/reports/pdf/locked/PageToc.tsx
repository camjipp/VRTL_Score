import { Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { LOCKED_PAGE_HEADER, LOCKED_TOC_ROWS } from "./layoutConstants";
import { lockedStyles } from "./lockedDocumentStyles";
import type { ReportData } from "../types";
import { narrativeTocFraming } from "./pageNarratives";

/** `data` unused — kept for signature stability with other pages. */
export function PageToc({ data: _data }: { data: ReportData }): ReactElement {
  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[2]!}>
      <Text style={lockedStyles.toc_framing}>{narrativeTocFraming}</Text>
      <View>
        {LOCKED_TOC_ROWS.map((r) => (
          <View key={r.targetPage} style={lockedStyles.toc_row} wrap={false}>
            <Text style={lockedStyles.toc_title}>{r.title}</Text>
            <Text style={lockedStyles.toc_page}>{String(r.targetPage)}</Text>
          </View>
        ))}
      </View>
    </PdfInnerPage>
  );
}
