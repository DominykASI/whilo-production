// The Whilo mark as plain data, so that a canvas can draw the same mark that
// `AppLogo` draws as SVG: the social cards in apps/auth-api do.

/** The mark is a square of this side, in its own units. */
export const APP_LOGO_SIZE = 240;
/** The corner radius of the square, in the same units. */
export const APP_LOGO_CORNER = 50;

/** The `W` is one thick rounded stroke, so the two valleys read as one ribbon rather than four lines. */
export const APP_LOGO_W_PATH = "M52 96 L86 164 L120 116 L154 164 L188 96";

/** Each sparkle is a four-point star centered on the given coordinates, sized by its arm length. */
export const APP_LOGO_SPARKLES = [
  { cx: 192, cy: 62, arm: 15 },
  { cx: 50, cy: 182, arm: 13 },
] as const;

/** Each eye is one scribbled stroke, as SVG `points`. The orca pet carries the old face. */
export const APP_LOGO_EYE_POINTS = {
  left: "43.55 93.61 64.69 81.41 36.48 108.04 79.67 83.11 35.93 122.88 91.58 90.74 38.9 132.69 97.66 98.76 42.44 138.88 100.43 105.4 46.9 143.83 101.97 112.04 55.08 149.51 101.83 122.52 73.01 152.43 94.14 140.23",
  right:
    "145.65 93.61 166.79 81.41 140.83 101.52 175.58 81.46 138.3 109.53 183.18 83.63 137.55 117.43 189.67 87.33 139.67 129.39 197.88 95.78 142.92 136.32 201.52 102.48 149.03 143.86 204.07 112.08 159.14 150.37 203.51 124.75 169.28 152.61 199.82 134.98",
} as const;
