import { Image, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { baseStyles } from "../theme";

type Props = {
  data: ReportData;
  variant?: "cover" | "inner";
  sectionSlug?: string;
  pageNum?: number;
};

export function PdfHeader({ data, variant = "inner", sectionSlug, pageNum }: Props) {
  const titleStyle = variant === "cover" ? baseStyles.reportTitleCover : baseStyles.reportTitle;

  return (
    <View style={baseStyles.headerRow}>
      <View style={{ maxWidth: 340 }}>
        <Text style={titleStyle}>AI Authority Report</Text>
        {sectionSlug ? <Text style={baseStyles.sectionSlug}>{sectionSlug}</Text> : null}
        {data.agencyLogoUrl ? (
          <View style={{ marginTop: 8 }}>
            {/* @react-pdf Image — decorative agency mark in PDF */}
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            <Image src={data.agencyLogoUrl} style={{ height: 24, objectFit: "contain", maxWidth: 140 }} />
          </View>
        ) : null}
        {data.agencyName && !data.agencyLogoUrl ? (
          <Text style={{ fontSize: 9, color: "#9CA3AF", marginTop: 6 }}>{data.agencyName}</Text>
        ) : null}
      </View>
      <View style={baseStyles.headerMeta}>
        <Text style={baseStyles.clientName}>{data.clientName}</Text>
        <Text style={baseStyles.metaLine}>{data.domain}</Text>
        <Text style={baseStyles.metaLine}>{data.date}</Text>
        {pageNum != null ? (
          <Text style={{ fontSize: 8, color: "#6B7280", marginTop: 6 }}>Page {pageNum}</Text>
        ) : null}
      </View>
    </View>
  );
}
