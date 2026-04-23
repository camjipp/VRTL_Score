import { Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { baseStyles, rhythm } from "../theme";
import { PdfTraceMarker } from "./PdfTraceMarker";

type Props = {
  data: ReportData;
  variant?: "cover" | "inner";
  pageNum?: number;
  /** When false, omits the header bottom rule (e.g. Page 1 editorial cover). */
  bottomRule?: boolean;
};

/**
 * Minimal running header: report title, client, date only (no domain URL, no agency line).
 */
export function PdfHeader({ data, variant = "inner", pageNum, bottomRule = true }: Props) {
  const tracePage = pageNum ?? (variant === "cover" ? 1 : 0);

  return (
    <View fixed style={[baseStyles.headerFixedWrap, { top: 0 }]}>
      <View
        style={
          bottomRule
            ? baseStyles.headerRow
            : [baseStyles.headerRow, { borderBottomWidth: 0, paddingBottom: rhythm.xs }]
        }
      >
        <View style={baseStyles.headerRowTitle}>
          <PdfTraceMarker page={tracePage} section={`PdfHeader:title:${variant}`} />
          <Text style={baseStyles.reportTitleMain}>AI Authority Report</Text>
        </View>
        <View style={baseStyles.headerMeta}>
          <PdfTraceMarker page={tracePage} section={`PdfHeader:meta:${variant}`} />
          <Text style={baseStyles.clientName}>{data.clientName}</Text>
          <Text style={baseStyles.metaLine}>{data.date}</Text>
        </View>
      </View>
    </View>
  );
}
