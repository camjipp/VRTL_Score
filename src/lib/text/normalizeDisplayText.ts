/**
 * Strips soft hyphens, zero-width, bidi, and other invisible / format characters,
 * then Unicode-normalizes (NFC + NFKC) so display text has no mid-word break artifacts.
 * Use for any user- or model-generated string shown in UI or PDF/HTML reports.
 */

const INVISIBLE_AND_BREAK_CHARS =
  /[\u2000-\u200F\u202A-\u202E\u2060-\u206F\uFE00-\uFE0F\uFE20-\uFE2F\uFEFF\uFFF9-\uFFFB\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\uFFFC\uFFFD]/g;

const EXTRA_FORMAT_CHARS =
  /\u2000|\u2001|\u2002|\u2003|\u2004|\u2005|\u2006|\u2007|\u2008|\u2009|\u200A|\u200B|\u200C|\u200D|\u200E|\u200F|\u2060|\u2061|\u2062|\u2063|\u2064|\uFEFF|\u00AD|\u034F|\u061C|\uFFF9|\uFFFA|\uFFFB|\uFFFC/g;

function stripInvisibleLoop(s: string): string {
  let out = s;
  let prev = "";
  while (prev !== out) {
    prev = out;
    out = out.replace(INVISIBLE_AND_BREAK_CHARS, "");
    out = out.replace(EXTRA_FORMAT_CHARS, "");
    try {
      out = out.replace(/\p{Cf}/gu, "");
    } catch {
      /* engines without Unicode property escapes */
    }
  }
  return out;
}

export function normalizeDisplayText(raw: string): string {
  if (raw === "") return raw;
  let s = raw.replace(INVISIBLE_AND_BREAK_CHARS, "");
  s = s.replace(EXTRA_FORMAT_CHARS, "");
  try {
    s = s.normalize("NFC");
  } catch {
    /* ignore */
  }
  try {
    s = s.normalize("NFKC");
  } catch {
    /* ignore */
  }
  s = s.replace(EXTRA_FORMAT_CHARS, "");
  s = s.replace(INVISIBLE_AND_BREAK_CHARS, "");
  s = stripInvisibleLoop(s);

  s = s.replace(/\u00A0|\u202F|\u2007|\uFEFF/g, " ");
  s = s.replace(/[\u2028\u2029]/g, " ");
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  s = s.replace(/  +/g, " ");

  return s;
}
