"use client";

import { PDFViewer } from "@react-pdf/renderer";
import clsx from "clsx";
import { ReportDocument } from "@/lib/reports/pdf/ReportDocument";
import { stanleyData } from "@/lib/reports/pdf/stanleyData";

export default function PreviewClient() {
  return (
    <div className={clsx("min-h-screen w-full bg-[#0F1117]")}>
      <PDFViewer width="100%" height="100vh" showToolbar>
        <ReportDocument data={stanleyData} />
      </PDFViewer>
    </div>
  );
}
