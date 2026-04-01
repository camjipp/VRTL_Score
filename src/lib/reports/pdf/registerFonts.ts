import { Font } from "@react-pdf/renderer";

let registered = false;

/** Register Inter for PDF (network fetch at render time in Node). Safe to call multiple times. */
export function registerPdfFonts(): void {
  if (registered) return;
  registered = true;
  try {
    Font.register({
      family: "Inter",
      fonts: [
        {
          src: "https://unpkg.com/@fontsource/inter@5.0.18/files/inter-latin-400-normal.ttf",
          fontWeight: 400,
        },
        {
          src: "https://unpkg.com/@fontsource/inter@5.0.18/files/inter-latin-600-normal.ttf",
          fontWeight: 600,
        },
        {
          src: "https://unpkg.com/@fontsource/inter@5.0.18/files/inter-latin-700-normal.ttf",
          fontWeight: 700,
        },
      ],
    });
  } catch {
    /* Fallback: Helvetica if registration fails offline */
  }
}
