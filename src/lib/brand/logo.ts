/**
 * Primary horizontal lockup (site, app, auth, footer). SVG for crisp scaling +
 * real transparency.
 *
 * Square mark (JPEG) is used for tab favicon, apple-touch, and PWA manifest.
 * `BRAND_LOCKUP_RASTER_ICON_SRC` is the legacy PNG wordmark where a raster
 * lockup is still needed (e.g. some embeds).
 *
 * `VRTLScore_Lockup.svg` uses a **tight viewBox** around the wordmark (not a
 * square canvas) so `next/image` + `object-contain` size correctly.
 */
export const BRAND_LOCKUP_SRC = "/brand/VRTLScore_Lockup.svg";

/** Square mark: favicon, `metadata.icons`, apple-touch, `manifest.json`. */
export const BRAND_FAVICON_SRC = "/brand/VRTLScore_Favicon.jpg";

/** PNG wordmark (legacy raster lockup). */
export const BRAND_LOCKUP_RASTER_ICON_SRC = "/brand/VRTLScore_New_Logo.png";

/** Matches SVG `viewBox` width / height after crop (full wordmark incl. Score). */
export const BRAND_LOCKUP_IMAGE_WIDTH = 1490;
export const BRAND_LOCKUP_IMAGE_HEIGHT = 450;

/** Required for local SVG when using `next/image`. */
export const BRAND_LOCKUP_IMAGE_UNOPTIMIZED = BRAND_LOCKUP_SRC.endsWith(".svg");
