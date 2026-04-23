import { Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { LOCKED_PAGE_HEADER, LOCKED_TOC_ROWS } from "./layoutConstants";
import { lockedStyles } from "./lockedDocumentStyles";

export function PageToc(): ReactElement {
  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[2]!}>
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
