import { Page, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { ReportData } from "../types";
import { PAGE, baseStyles } from "../theme";
import { PdfFooter } from "./PdfFooter";
import { PdfHeader } from "./PdfHeader";

type Props = {
  data: ReportData;
  /** Trace / header hint only — not guaranteed to match PDF page index when sections are skipped. */
  pageNum: number;
  children: ReactNode;
  /** Slide top inset — default 90 so titles clear the fixed header; use 100 on methodology if needed. */
  pagePaddingTop?: number;
};

const bodyColumn = { flex: 1, flexDirection: "column" as const, minHeight: 0 };

/**
 * Fixed-template inner page: one physical `<Page>` with slide padding, header + footer, and a flex body slot.
 */
export function FixedInnerPage({ data, pageNum, children, pagePaddingTop }: Props) {
  const pageStyle =
    pagePaddingTop != null ? [baseStyles.pdfSlidePage, { paddingTop: pagePaddingTop }] : baseStyles.pdfSlidePage;
  return (
    <Page size={[PAGE.width, PAGE.height]} style={pageStyle}>
      <View style={baseStyles.pdfSlideContent}>
        <PdfHeader data={data} variant="inner" pageNum={pageNum} />
        <View style={bodyColumn}>{children}</View>
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
