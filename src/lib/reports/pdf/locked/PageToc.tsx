import { Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { LOCKED_PAGE_HEADER, LOCKED_TOC_ROWS } from "./layoutConstants";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import type { ReportData } from "../types";
import { narrativeToc } from "./pageNarratives";

/** `data` unused today — kept for signature stability with other pages. */
export function PageToc({ data }: { data: ReportData }): ReactElement {
  const slice = narrativeToc(data);
  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[2]!}>
      <LockedNarrativeStack slice={slice} />
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
