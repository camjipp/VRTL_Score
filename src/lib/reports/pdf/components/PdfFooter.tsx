import { Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { baseStyles } from "../theme";

type Props = {
  data: ReportData;
  /** When false, omits the footer top rule (e.g. Page 1 editorial cover). */
  topRule?: boolean;
};

export function PdfFooter({ data: _data, topRule = true }: Props) {
  void _data;
  const footerBand = topRule
    ? baseStyles.footer
    : [baseStyles.footer, { borderTopWidth: 0, paddingTop: 4, minHeight: 16 }];
  const textTop = topRule ? 8 : 4;
  return (
    <View style={footerBand} fixed>
      <Text style={[baseStyles.footerText, { top: textTop }]}>Confidential</Text>
      <Text
        style={[baseStyles.footerPageNum, { top: textTop }]}
        render={({ pageNumber }) => `Page ${pageNumber}`}
      />
    </View>
  );
}
