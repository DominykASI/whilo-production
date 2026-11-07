import { describe, expect, it } from "vitest";
import { APP_ACCENT_COLORS, APP_ACCENTS } from "@whilo/contracts/ipc";

/**
 * The canvas each palette paints behind text, from `packages/brand`: the window background, not a
 * raised sheet. Text is placed on it directly.
 */
const CANVAS = { dark: "#1a1a1a", light: "#f5f5f6" } as const;

/** The minimum contrast WCAG 2.2 asks of body text. */
const MIN_CONTRAST = 4.5;

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function contrast(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter! + 0.05) / (darker! + 0.05);
}

describe("accent palette", () => {
  it.each(APP_ACCENTS)("keeps %s text readable on both canvases", (accent) => {
    const colors = APP_ACCENT_COLORS[accent];

    expect(contrast(colors.dark.text, CANVAS.dark)).toBeGreaterThanOrEqual(MIN_CONTRAST);
    expect(contrast(colors.light.text, CANVAS.light)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  it.each(APP_ACCENTS)("keeps %s a filled shape a white label can sit on", (accent) => {
    const colors = APP_ACCENT_COLORS[accent];

    // A badge and a selected tab paint the fill in the dark palette and put white on it.
    expect(contrast(colors.dark.accent, "#ffffff")).toBeGreaterThanOrEqual(MIN_CONTRAST);
    // The light palette keeps the released ink on its fill, which is the dark text colour.
    expect(contrast(colors.light.accent, "#141414")).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  it.each(APP_ACCENTS)("raises the contrast of %s when a control is hovered", (accent) => {
    const colors = APP_ACCENT_COLORS[accent];

    // A hover that lowers contrast makes a label harder to read at the moment of the click.
    expect(contrast(colors.dark.hover, "#ffffff")).toBeGreaterThan(contrast(colors.dark.accent, "#ffffff"));
    expect(contrast(colors.light.hover, "#141414")).toBeGreaterThan(contrast(colors.light.accent, "#141414"));
  });
});
