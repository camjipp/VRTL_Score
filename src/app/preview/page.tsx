"use client";

import dynamicImport from "next/dynamic";

const PreviewClient = dynamicImport(() => import("./PreviewClient"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1117] text-sm text-gray-400">
      Loading preview…
    </div>
  ),
});

export default function PreviewPage() {
  return <PreviewClient />;
}
