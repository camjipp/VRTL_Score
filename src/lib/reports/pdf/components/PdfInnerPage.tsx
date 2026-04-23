import { Page, Text, View } from "@react-pdf/renderer";
import type { ReactElement, ReactNode } from "react";
import { PDF_PAGE_SIZE } from "../theme";
import { reportFrameStyles } from "../locked/reportFrameStyles";

type Props = {
  /** Top-left header title (must match TOC row for that page). */
  title: string;
  children: ReactNode;
};

/**
 * Locked inner page: absolute header + absolute content + absolute footer.
 * All flow content must be placed only inside `children` (content bounds).
 */
export function PdfInnerPage({ title, children }: Props): ReactElement {
  return (
    <Page size={PDF_PAGE_SIZE} style={reportFrameStyles.page}>
      <View style={reportFrameStyles.header}>
        <Text style={reportFrameStyles.headerTitle}>{title}</Text>
      </View>
      <View style={reportFrameStyles.content}>{children}</View>
      <View style={reportFrameStyles.footer}>
        <Text style={reportFrameStyles.footerPage} render={({ pageNumber }) => `Page ${pageNumber}`} />
      </View>
    </Page>
  );
}
