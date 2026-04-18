import { Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { baseStyles } from "../theme";
import { PdfTraceMarker } from "./PdfTraceMarker";

type Props = {
  data: ReportData;
  variant?: "cover" | "inner";
  pageNum?: number;
};

/**
 * Minimal running header: report title, client, date only (no domain URL, no agency line).
 */
export function PdfHeader({ data, variant = "inner", pageNum }: Props) {
  const tracePage = pageNum ?? (variant === "cover" ? 1 : 0);

  return (
    <View wrap={false} fixed style={baseStyles.headerFixedWrap}>
      <View style={baseStyles.headerRow}>
        <View style={{ flex: 1, paddingRight: 12 }}>
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
