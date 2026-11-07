/**
 * The custom look of the interface that the user picks in Settings: one accent color and one corner
 * radius. It is separate from the theme, which is Light, Dark or System: a look applies to both.
 *
 * The identifiers cross the IPC boundary and are saved as written. Add one, never rename one: a
 * renamed identifier reads back as the default on the next launch. The order is the Settings order.
 *
 * The accent changes `--whilo-accent` and the four tokens that are drawn from it. The radius scales
 * the corner tokens, so a card, a dialog and a bubble keep their proportions at every step.
 */
export const APP_ACCENTS = ["blue", "violet", "teal", "amber", "rose", "graphite", "lagoon", "ember"] as const;

export type AppAccent = (typeof APP_ACCENTS)[number];

/** The released accent, `--whilo-accent` in the dark palette. */
export const DEFAULT_APP_ACCENT: AppAccent = "blue";

/** The corner radius steps. `compact` is sharper, `round` is softer; `default` keeps the release look. */
export const APP_CORNER_RADII = ["compact", "default", "round", "pill"] as const;

export type AppCornerRadius = (typeof APP_CORNER_RADII)[number];

export const DEFAULT_APP_CORNER_RADIUS: AppCornerRadius = "default";

/**
 * The colors of each accent, in the dark palette, and the same four values for the light palette.
 * A picker swatch shows `swatch`, so the grid needs one number per choice instead of a screenshot.
 */
export interface AppAccentColors {
  /** The fill: a primary button, a selected tab, a focused control. */
  accent: `#${string}`;
  /** The fill of a hovered accent control. */
  hover: `#${string}`;
  /** Accent-colored text on the canvas. It must stay readable, so it is not the fill. */
  text: `#${string}`;
  /** The translucent accents: a soft background, and a stronger one for a border or a badge. */
  soft: string;
  strong: string;
}

export const APP_ACCENT_COLORS = {
  blue: {
    swatch: "#007cf7",
    dark: {
      accent: "#0068cc",
      hover: "#005cb4",
      text: "#5aa9ff",
      soft: "rgba(0, 124, 247, 0.16)",
      strong: "rgba(0, 124, 247, 0.34)",
    },
    light: {
      accent: "#007cf7",
      hover: "#1f8cf8",
      text: "#0064c8",
      soft: "rgba(0, 124, 247, 0.14)",
      strong: "rgba(0, 124, 247, 0.28)",
    },
  },
  violet: {
    swatch: "#8b5cf6",
    dark: {
      accent: "#7440e0",
      hover: "#6638c5",
      text: "#b393fa",
      soft: "rgba(139, 92, 246, 0.18)",
      strong: "rgba(139, 92, 246, 0.36)",
    },
    light: {
      accent: "#9d75f8",
      hover: "#a986f9",
      text: "#6d3ed6",
      soft: "rgba(157, 117, 248, 0.14)",
      strong: "rgba(157, 117, 248, 0.28)",
    },
  },
  teal: {
    swatch: "#0ea5a5",
    dark: {
      accent: "#0a7676",
      hover: "#096868",
      text: "#4ed0d0",
      soft: "rgba(14, 165, 165, 0.18)",
      strong: "rgba(14, 165, 165, 0.36)",
    },
    light: {
      accent: "#0ea5a5",
      hover: "#2bb0b0",
      text: "#0a7d7d",
      soft: "rgba(14, 165, 165, 0.14)",
      strong: "rgba(14, 165, 165, 0.28)",
    },
  },
  amber: {
    swatch: "#d99a17",
    dark: {
      accent: "#96680e",
      hover: "#845c0c",
      text: "#f0c060",
      soft: "rgba(217, 154, 23, 0.18)",
      strong: "rgba(217, 154, 23, 0.36)",
    },
    light: {
      accent: "#d99a17",
      hover: "#dea633",
      text: "#8f6408",
      soft: "rgba(217, 154, 23, 0.14)",
      strong: "rgba(217, 154, 23, 0.28)",
    },
  },
  rose: {
    swatch: "#e0559b",
    dark: {
      accent: "#b03071",
      hover: "#9b2a63",
      text: "#f28cbd",
      soft: "rgba(224, 85, 155, 0.18)",
      strong: "rgba(224, 85, 155, 0.36)",
    },
    light: {
      accent: "#e0559b",
      hover: "#e469a7",
      text: "#a83070",
      soft: "rgba(224, 85, 155, 0.14)",
      strong: "rgba(224, 85, 155, 0.28)",
    },
  },
  graphite: {
    swatch: "#8e8e96",
    dark: {
      accent: "#63636a",
      hover: "#57575d",
      text: "#b9b9c0",
      soft: "rgba(142, 142, 150, 0.18)",
      strong: "rgba(142, 142, 150, 0.36)",
    },
    light: {
      accent: "#8e8e96",
      hover: "#9c9ca3",
      text: "#565660",
      soft: "rgba(142, 142, 150, 0.14)",
      strong: "rgba(142, 142, 150, 0.28)",
    },
  },
  lagoon: {
    swatch: "#38bdf8",
    dark: {
      accent: "#0b7f9e",
      hover: "#0a708b",
      text: "#7dd6fb",
      soft: "rgba(56, 189, 248, 0.18)",
      strong: "rgba(56, 189, 248, 0.36)",
    },
    light: {
      accent: "#38bdf8",
      hover: "#50c5f9",
      text: "#0a749a",
      soft: "rgba(56, 189, 248, 0.14)",
      strong: "rgba(56, 189, 248, 0.28)",
    },
  },
  ember: {
    swatch: "#f2683c",
    dark: {
      accent: "#c2421a",
      hover: "#ab3a17",
      text: "#fb9c7d",
      soft: "rgba(242, 104, 60, 0.18)",
      strong: "rgba(242, 104, 60, 0.36)",
    },
    light: {
      accent: "#f2683c",
      hover: "#f47a53",
      text: "#b03f1c",
      soft: "rgba(242, 104, 60, 0.14)",
      strong: "rgba(242, 104, 60, 0.28)",
    },
  },
} as const satisfies Record<AppAccent, {
  swatch: `#${string}`;
  dark: AppAccentColors;
  light: AppAccentColors;
}>;

/**
 * The corner scale of each step, as the multiplier of every radius token. `default` is 1, so the
 * release look needs no change, and a step never moves the control sizes of the design system.
 */
export const APP_CORNER_RADIUS_SCALE = {
  compact: 0.5,
  default: 1,
  round: 1.6,
  pill: 2.4,
} as const satisfies Record<AppCornerRadius, number>;

/** The preference as it is stored and as it crosses IPC. */
export interface AppInterfaceLookPreference {
  accent: AppAccent;
  cornerRadius: AppCornerRadius;
}

/** One field or both. Each Settings control sends only its own, so two quick changes do not undo each other. */
export type SetAppInterfaceLookPreferenceInput = Partial<AppInterfaceLookPreference>;

export function isAppAccent(value: unknown): value is AppAccent {
  return APP_ACCENTS.some((accent) => accent === value);
}

export function isAppCornerRadius(value: unknown): value is AppCornerRadius {
  return APP_CORNER_RADII.some((radius) => radius === value);
}
