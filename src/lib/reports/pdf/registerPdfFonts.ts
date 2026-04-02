import { Font } from "@react-pdf/renderer";

/**
 * Inter + DM Mono from /public/fonts — must exist or PDF generation will fail.
 * Browser (PDFViewer): absolute URL. Node (API renderToBuffer): filesystem path under cwd/public/fonts.
 * No node:path import — this module is bundled for the client preview route.
 */
function resolveFontFile(file: string): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/fonts/${file}`;
  }
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    const cwd = process.cwd().replace(/\\/g, "/");
    return `${cwd}/public/fonts/${file}`;
  }
  return `/fonts/${file}`;
}

const g = globalThis as typeof globalThis & { __vrtlPdfFontsRegistered?: boolean };
if (!g.__vrtlPdfFontsRegistered) {
  Font.register({
    family: "Inter",
    fonts: [
      { src: resolveFontFile("Inter-Regular.ttf"), fontWeight: 400 },
      { src: resolveFontFile("Inter-Medium.ttf"), fontWeight: 500 },
      { src: resolveFontFile("Inter-SemiBold.ttf"), fontWeight: 600 },
      { src: resolveFontFile("Inter-Bold.ttf"), fontWeight: 700 },
      { src: resolveFontFile("Inter-ExtraBold.ttf"), fontWeight: 800 },
    ],
  });

  Font.register({
    family: "DMMono",
    src: resolveFontFile("DMMono-Regular.ttf"),
  });

  g.__vrtlPdfFontsRegistered = true;
}
