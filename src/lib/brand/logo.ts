/**
 * Primary horizontal lockup (site, app, auth, footer). SVG for crisp scaling +
 * real transparency. `BRAND_LOCKUP_RASTER_ICON_SRC` stays PNG for PWA / Apple
 * touch / metadata where SVG support is spotty. Keep `public/manifest.json`
 * icon `src` in sync with the raster path.
 *
 * `VRTLScore_Lockup.svg` uses a **tight viewBox** around the wordmark (not a
 * square canvas) so `next/image` + `object-contain` size correctly.
 */
export const BRAND_LOCKUP_SRC = "/brand/VRTLScore_Lockup.svg";

/** PNG used for `manifest.json`, `metadata.icons`, and apple-touch. */
export const BRAND_LOCKUP_RASTER_ICON_SRC = "/brand/VRTLScore_New_Logo.png";

/** Matches SVG `viewBox` width / height after crop (full wordmark incl. Score). */
export const BRAND_LOCKUP_IMAGE_WIDTH = 1490;
export const BRAND_LOCKUP_IMAGE_HEIGHT = 450;

/** Required for local SVG when using `next/image`. */
export const BRAND_LOCKUP_IMAGE_UNOPTIMIZED = BRAND_LOCKUP_SRC.endsWith(".svg");
