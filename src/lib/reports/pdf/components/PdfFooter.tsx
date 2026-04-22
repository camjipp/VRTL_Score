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
  return (
    <View
      style={topRule ? baseStyles.footer : [baseStyles.footer, { borderTopWidth: 0, paddingTop: 4 }]}
      fixed
    >
      <Text style={baseStyles.footerText}>Confidential</Text>
      <Text style={baseStyles.footerPageNum} render={({ pageNumber }) => `Page ${pageNumber}`} />
    </View>
  );
}
