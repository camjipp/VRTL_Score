import { Page, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { ReportData } from "../types";
import { PAGE, baseStyles, pdfPageRootPadding } from "../theme";
import { PdfFooter } from "./PdfFooter";
import { PdfHeader } from "./PdfHeader";

type Props = {
  data: ReportData;
  /** Trace / header hint only — not guaranteed to match PDF page index when sections are skipped. */
  pageNum: number;
  children: ReactNode;
  /** Use flex body so children can distribute vertical space (e.g. execution plan). */
  bodyVariant?: "default" | "flex";
  /** Top inset for `<Page>` so chapter titles clear the fixed running header (default matches `pdfPageRootPadding`). */
  pagePaddingTop?: number;
};

/**
 * Fixed-template inner page: one physical `<Page>` with header + footer and a single body slot.
 * Content layout is owned by each template — this shell does not implement flow-based breaks.
 */
export function FixedInnerPage({ data, pageNum, children, bodyVariant = "default", pagePaddingTop }: Props) {
  const bodyStyle = bodyVariant === "flex" ? baseStyles.pageBodyFlex : baseStyles.pageBody;
  const pagePad =
    pagePaddingTop != null ? { ...pdfPageRootPadding, paddingTop: pagePaddingTop } : pdfPageRootPadding;
  return (
    <Page size={[PAGE.width, PAGE.height]} style={[baseStyles.page, pagePad, baseStyles.pageColumn]}>
      <View style={bodyStyle}>
        <PdfHeader data={data} variant="inner" pageNum={pageNum} />
        {children}
        <PdfFooter data={data} />
      </View>
    </Page>
  );
}
