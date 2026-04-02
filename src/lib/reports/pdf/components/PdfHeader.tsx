import { Image, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { baseStyles } from "../theme";
import { PdfTraceMarker } from "./PdfTraceMarker";
import { TopStripe } from "./TopStripe";

type Props = {
  data: ReportData;
  variant?: "cover" | "inner";
  sectionSlug?: string;
  pageNum?: number;
};

export function PdfHeader({ data, variant = "inner", sectionSlug, pageNum }: Props) {
  const tracePage = pageNum ?? (variant === "cover" ? 1 : 0);

  return (
    <View wrap={false}>
      <TopStripe />
      <View style={baseStyles.headerRow}>
        <View style={{ maxWidth: 300 }}>
          <Text style={baseStyles.reportTitleMain}>AI Authority Report</Text>
          {variant === "inner" && sectionSlug ? (
            <Text style={baseStyles.sectionSlug}>{sectionSlug}</Text>
          ) : null}
          {data.agencyLogoUrl ? (
            <View style={{ marginTop: 6 }}>
              <PdfTraceMarker page={tracePage} section={`PdfHeader:before_logo:${variant}`} />
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
              <Image src={data.agencyLogoUrl} style={{ height: 20, objectFit: "contain", maxWidth: 112 }} />
              <PdfTraceMarker page={tracePage} section={`PdfHeader:after_logo:${variant}`} />
            </View>
          ) : null}
        </View>
        <View style={baseStyles.headerMeta}>
          <Text style={baseStyles.clientName}>{data.clientName}</Text>
          <Text style={baseStyles.metaLine}>{data.domain}</Text>
          <Text style={baseStyles.metaLine}>{data.date}</Text>
        </View>
      </View>
    </View>
  );
}
