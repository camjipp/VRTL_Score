import { Text, View } from "@react-pdf/renderer";
import type { ReportData } from "../types";
import { baseStyles } from "../theme";

export function PdfFooter({ data: _data }: { data: ReportData }) {
  void _data;
  return (
    <View style={baseStyles.footer} fixed>
      <Text style={baseStyles.footerText}>Confidential</Text>
      <Text style={baseStyles.footerPageNum} render={({ pageNumber }) => `Page ${pageNumber}`} />
    </View>
  );
}
