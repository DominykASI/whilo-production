import type { AppThemePalette } from "@whilo/contracts/app-appearance";

/** `color-mix` of one palette color into transparency, as the base palettes use translucent ink. */
function clear(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function mix(color: string, other: string, percent: number): string {
  return `color-mix(in srgb, ${color}, ${other} ${percent}%)`;
}

/**
 * The tokens that a palette sets, over the light or dark palette that its scheme names. A palette
 * gives twelve colors; the other tokens of each family come from them, as the base palettes make
 * their hover, soft and strong steps from one color. Tokens not listed here keep the base value:
 * illustrations, provider logos, charts and the file colors stay as they are in each scheme.
 *
 * Cards, sheets and controls are a step above the canvas: lighter than it in both base palettes. A
 * dark palette gives that step as `surface`. A light theme has no color lighter than its background
 * (Catppuccin Latte's `surface` is darker), so a light palette makes the step from its canvas and
 * white, as the base light palette is white over a grey canvas, and uses `surface` for the tab bar.
 */
function paletteTokens({ scheme, colors }: AppThemePalette): Record<string, string> {
  const raised = scheme === "light" ? mix(colors.canvas, "#ffffff", 70) : colors.surface;
  const tabsBar = scheme === "light" ? mix(colors.canvas, colors.surface, 30) : colors.surface;
  return {
    "--whilo-bg-canvas": colors.canvas,
    "--whilo-bg-canvas-clear": clear(colors.canvas, 0),
    "--whilo-bg-frame": colors.frame,
    "--whilo-bg-sidebar": colors.sidebar,
    "--whilo-bg-native-sidebar": colors.sidebar,
    "--whilo-bg-sheet": raised,
    "--whilo-bg-sheet-inset": colors.frame,
    "--whilo-bg-grouped": raised,
    "--whilo-bg-surface": raised,
    "--whilo-bg-surface-raised": mix(raised, colors.text, 3),
    "--whilo-bg-control": raised,
    "--whilo-bg-control-hover": mix(raised, colors.text, 4),
    "--whilo-bg-control-active": mix(raised, colors.text, 8),
    "--whilo-tabs-bar-bg": tabsBar,
    "--whilo-tabs-pill-bg": scheme === "light" ? raised : mix(colors.surface, colors.text, 8),
    "--whilo-marketplace-detail-bg": colors.frame,
    "--whilo-bg-overlay": clear(colors.canvas, 92),
    "--whilo-bg-glass": clear(raised, 76),
    "--whilo-scroll-edge-overlay": clear(colors.canvas, 72),

    "--whilo-border": clear(colors.border, 35),
    "--whilo-border-strong": clear(colors.border, 50),
    "--whilo-border-grouped": colors.border,
    "--whilo-dialog-ring": clear(colors.border, 70),
    "--whilo-image-outline": clear(colors.border, 60),
    "--whilo-hover": clear(colors.text, 5),

    "--whilo-text-primary": colors.text,
    "--whilo-text-secondary": mix(colors.text, colors.textMuted, 25),
    "--whilo-text-muted": colors.textMuted,
    "--whilo-text-dim": mix(colors.textMuted, colors.canvas, 30),
    "--whilo-text-placeholder": colors.textMuted,
    "--whilo-text-readable": colors.textMuted,
    "--whilo-text-grouped-secondary": colors.textMuted,
    "--whilo-settings-text-muted": colors.textMuted,

    // The inverted element (the default button, a checked switch, the user's bubble) is the text
    // color on the canvas, as it is in both base palettes.
    "--whilo-surface-light": colors.text,
    "--whilo-text-on-light": colors.canvas,
    "--whilo-text-muted-on-light": clear(colors.canvas, 64),
    "--whilo-text-dim-on-light": clear(colors.canvas, 40),
    "--whilo-border-on-light": clear(colors.canvas, 16),

    "--whilo-accent": colors.accent,
    "--whilo-accent-hover": mix(colors.accent, colors.text, 15),
    "--whilo-accent-text": colors.accent,
    "--whilo-accent-soft": clear(colors.accent, 16),
    "--whilo-accent-strong": clear(colors.accent, 34),
    "--whilo-text-on-accent": colors.accentForeground,

    "--whilo-success": colors.success,
    "--whilo-success-text": colors.success,
    "--whilo-success-soft": clear(colors.success, 14),
    "--whilo-success-wash": clear(colors.success, 6),
    "--whilo-warning": colors.warning,
    "--whilo-warning-text": colors.warning,
    "--whilo-warning-soft": clear(colors.warning, 14),
    "--whilo-danger": colors.danger,
    "--whilo-danger-hover": mix(colors.danger, colors.text, 15),
    "--whilo-danger-text": colors.danger,
    "--whilo-danger-soft": clear(colors.danger, 14),
    "--whilo-danger-soft-hover": clear(colors.danger, 22),
    "--whilo-danger-focus": clear(colors.danger, 36),
    "--whilo-danger-border": clear(colors.danger, 45),
  };
}

let applied: string[] = [];

/**
 * Sets the palette tokens on the root element, or removes them for null. Inline properties on the
 * root win over `tokens.css` and `tokens-light.css`, so the base palette shows again once they go.
 * The preload let only hex colors through, so each value is a color or a `color-mix` of colors.
 */
export function applyThemePalette(palette: AppThemePalette | null): void {
  const style = document.documentElement.style;
  for (const name of applied) style.removeProperty(name);
  applied = [];
  if (palette === null) return;
  for (const [name, value] of Object.entries(paletteTokens(palette))) {
    style.setProperty(name, value);
    applied.push(name);
  }
}
