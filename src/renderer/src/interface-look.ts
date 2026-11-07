import {
  APP_ACCENT_COLORS,
  APP_CORNER_RADIUS_SCALE,
  type AppAccent,
  type AppCornerRadius,
  type AppInterfaceLookPreference,
  DEFAULT_APP_ACCENT,
  DEFAULT_APP_CORNER_RADIUS,
} from "@whilo/contracts/ipc";
import { createSignal, onSettled } from "solid-js";
import { appPort } from "./app-port";

/**
 * The radius tokens of the design system, in the order the cascade reads them. `bubble-inset` and
 * `media-preview` are derived from a base token in CSS, so they are left alone: scaling both a base
 * and its `calc()` would apply the step twice.
 */
const SCALED_RADII = [
  "--whilo-radius-xs",
  "--whilo-radius-sm",
  "--whilo-radius-md",
  "--whilo-radius-lg",
  "--whilo-radius-card",
  "--whilo-radius-xl",
  "--whilo-radius-bubble",
  "--whilo-radius-modal",
] as const;

/**
 * The released values, read once before any step is applied. Reading them again after a step would
 * read the step back, and each change of the theme would multiply the corners again. Radius does not
 * change with the theme, so one read is correct for both palettes.
 */
let releasedRadii: Record<string, string> | undefined;

function baseRadii(): Record<string, string> {
  if (releasedRadii) return releasedRadii;
  const style = getComputedStyle(document.documentElement);
  const radii: Record<string, string> = {};
  for (const token of SCALED_RADII) radii[token] = style.getPropertyValue(token).trim();
  releasedRadii = radii;
  return radii;
}

/** Whether this window paints the light palette, which has its own accent values. */
function isLight(): boolean {
  return document.documentElement.dataset.whiloColorScheme === "light";
}

/**
 * Paints a look on this window. The accent comes from the contract, and the radius is a multiple of
 * the value the design system already declares, so no colour literal and no pixel value is invented
 * here: `check:ui` owns both.
 */
function applyLook(preference: AppInterfaceLookPreference): void {
  const root = document.documentElement;
  const accent = APP_ACCENT_COLORS[preference.accent][isLight() ? "light" : "dark"];
  root.style.setProperty("--whilo-accent", accent.accent);
  root.style.setProperty("--whilo-accent-hover", accent.hover);
  root.style.setProperty("--whilo-accent-text", accent.text);
  root.style.setProperty("--whilo-accent-soft", accent.soft);
  root.style.setProperty("--whilo-accent-strong", accent.strong);

  const scale = APP_CORNER_RADIUS_SCALE[preference.cornerRadius];
  if (scale === 1) {
    for (const token of SCALED_RADII) root.style.removeProperty(token);
    root.style.removeProperty("--whilo-radius-bubble-inset");
    return;
  }
  const base = baseRadii();
  for (const token of SCALED_RADII) {
    const value = base[token];
    if (value) root.style.setProperty(token, `calc(${value} * ${scale})`);
  }
  // The inset is a subtraction of the bubble, so a sharp step takes it below zero, and a negative
  // border-radius is an invalid value the browser drops. The floor keeps the nested media square
  // instead of leaving the radius to a value the palette never declared.
  const bubble = base["--whilo-radius-bubble"];
  if (bubble) {
    root.style.setProperty(
      "--whilo-radius-bubble-inset",
      `max(0px, calc(${bubble} * ${scale} - var(--whilo-space-3) - 1px))`,
    );
  }
}

/** Removes the painted look, so the next story or test starts from the brand tokens. */
function clearLook(): void {
  const root = document.documentElement;
  for (const token of [
    "--whilo-accent",
    "--whilo-accent-hover",
    "--whilo-accent-text",
    "--whilo-accent-soft",
    "--whilo-accent-strong",
    ...SCALED_RADII,
    "--whilo-radius-bubble-inset",
  ])
    root.style.removeProperty(token);
}

/**
 * Keeps this window on the saved look. Every window runs it, the Dynamic Island too, because main
 * broadcasts each change to every window. The light palette changes with the theme, so a change of
 * the color scheme repaints the accent: `syncAppearance` calls `refreshInterfaceLook`.
 */
let repaint: (() => void) | undefined;

/** Repaints the accent after the color scheme changed. A no-op before `syncInterfaceLook` runs. */
export function refreshInterfaceLook(): void {
  repaint?.();
}

export function syncInterfaceLook(): { dispose: () => void } {
  let active = true;
  let latest: AppInterfaceLookPreference = {
    accent: DEFAULT_APP_ACCENT,
    cornerRadius: DEFAULT_APP_CORNER_RADIUS,
  };
  const apply = (preference: AppInterfaceLookPreference) => {
    if (!active) return;
    latest = preference;
    applyLook(preference);
  };
  repaint = () => applyLook(latest);
  void appPort()
    .getAppInterfaceLookPreference()
    .then(apply)
    .catch(() => undefined);
  const unsubscribe = appPort().onAppInterfaceLookPreference(apply);
  return {
    dispose: () => {
      active = false;
      unsubscribe();
      repaint = undefined;
      clearLook();
    },
  };
}

/** The Settings control state. Set optimistically, and reverted if main refuses the write. */
export function useInterfaceLookChoice() {
  const [accent, setAccent] = createSignal<AppAccent>(DEFAULT_APP_ACCENT);
  const [cornerRadius, setCornerRadius] = createSignal<AppCornerRadius>(DEFAULT_APP_CORNER_RADIUS);
  let confirmed: AppInterfaceLookPreference = {
    accent: DEFAULT_APP_ACCENT,
    cornerRadius: DEFAULT_APP_CORNER_RADIUS,
  };
  let latestRequest = 0;
  let pending = 0;

  /** A saved value from main. A choice that is still in flight is newer, so it stays on screen. */
  function confirm(next: AppInterfaceLookPreference): void {
    confirmed = next;
    if (pending === 0) {
      setAccent(next.accent);
      setCornerRadius(next.cornerRadius);
    }
  }

  function change(change: Partial<AppInterfaceLookPreference>): void {
    const next: AppInterfaceLookPreference = { accent: accent(), cornerRadius: cornerRadius(), ...change };
    const request = ++latestRequest;
    pending += 1;
    setAccent(next.accent);
    setCornerRadius(next.cornerRadius);
    void appPort()
      .setAppInterfaceLookPreference(change)
      .then((preference) => {
        confirmed = preference;
        if (request === latestRequest) confirm(preference);
      })
      .catch(() => {
        if (request === latestRequest) confirm(confirmed);
      })
      .finally(() => {
        pending -= 1;
      });
  }

  onSettled(() => {
    void appPort()
      .getAppInterfaceLookPreference()
      .then(confirm)
      .catch(() => undefined);
    return appPort().onAppInterfaceLookPreference(confirm);
  });

  return { accent, cornerRadius, change };
}
