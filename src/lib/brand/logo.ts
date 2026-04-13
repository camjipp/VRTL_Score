/**
 * Primary horizontal lockup (site, app, auth, footer, icons). PNG with
 * transparent background so it works on light and dark surfaces. Keep
 * `public/manifest.json` icon `src` in sync with this path.
 *
 * The shipped asset is a **square** canvas (wordmark centered with padding).
 * For bars/footers, use a wide short frame + `object-cover` so the mark fills
 * the height; `object-contain` on this file shrinks the type to a few pixels.
 */
export const BRAND_LOCKUP_SRC = "/brand/VRTLScore_New_Logo.png";

/** Pixel width/height of `BRAND_LOCKUP_SRC` (square). */
export const BRAND_LOCKUP_INTRINSIC_SIZE = 2000;
