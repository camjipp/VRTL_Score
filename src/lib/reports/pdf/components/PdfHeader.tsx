import { Image, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { baseStyles, colors, fonts } from "../theme";
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
        <View style={{ maxWidth: 320 }}>
          <Text style={baseStyles.brandKicker}>VRTL SCORE</Text>
          <Text style={baseStyles.reportTitleMain}>AI AUTHORITY REPORT</Text>
          {variant === "inner" && sectionSlug ? (
            <Text style={baseStyles.sectionSlug}>{sectionSlug}</Text>
          ) : null}
          {data.agencyLogoUrl ? (
            <View style={{ marginTop: 8 }}>
              <PdfTraceMarker page={tracePage} section={`PdfHeader:before_logo:${variant}`} />
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
              <Image src={data.agencyLogoUrl} style={{ height: 22, objectFit: "contain", maxWidth: 120 }} />
              <PdfTraceMarker page={tracePage} section={`PdfHeader:after_logo:${variant}`} />
            </View>
          ) : null}
          {data.agencyName && !data.agencyLogoUrl ? (
            <Text style={{ fontSize: 8, color: colors.ink4, marginTop: 6, fontFamily: fonts.sans }}>{data.agencyName}</Text>
          ) : null}
        </View>
        <View style={baseStyles.headerMeta}>
          <Text style={baseStyles.clientName}>{data.clientName}</Text>
          <Text style={baseStyles.metaLine}>{data.domain}</Text>
          <Text style={baseStyles.metaLine}>{data.date}</Text>
          {pageNum != null ? (
            <Text style={{ fontSize: 8, color: colors.ink4, marginTop: 6, fontFamily: fonts.sans }}>Page {pageNum}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
