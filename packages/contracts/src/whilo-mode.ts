/**
 * The experience mode of Whilo: `pets` is the focused companion, `dots` is the full workspace.
 *
 * One account, one product, two surfaces. The mode is a preference, not a separate build: the web app
 * reads it from `?mode`, then `localStorage["whilo:mode"]`, then the `data-whilo-mode` attribute the
 * edge injects, and falls back to the platform default. The desktop shell passes the mode it resolved
 * on the command line.
 *
 * The identifiers cross a deep link and a storage key, so they are stable: add a mode, never rename
 * one. The allow-lists are the single source of truth for both the web app and the desktop shell.
 */

export const WHILO_MODES = ["pets", "dots"] as const;

export type WhiloExperienceMode = (typeof WHILO_MODES)[number];

/** The storage key and the custom event name. The edge writes the same key into the page. */
export const WHILO_MODE_STORAGE_KEY = "whilo:mode";
export const WHILO_MODE_EVENT = "whilo:mode";
export const WHILO_MODE_ATTRIBUTE = "data-whilo-mode";

export function isWhiloMode(value: unknown): value is WhiloExperienceMode {
  return value === "pets" || value === "dots";
}

/**
 * The sidebar tools that the focused Pets surface keeps. Everything else that `DOTS_ONLY_TOOLS`
 * names is hidden in Pets and shown in Dots.
 */
export const PETS_ALLOWED_TOOLS: ReadonlySet<string> = new Set<string>([
  "apps",
  "team-map",
  "files",
  "library",
  "plans",
  "marketplace",
]);

/** The heavy planning and operations surfaces: Dots only. */
export const DOTS_ONLY_TOOLS: ReadonlySet<string> = new Set<string>([
  "whiteboard",
  "workflows",
  "agenda",
  "tasks",
  "usage",
  "sheets",
  "whilo-data",
  "server-cloud",
]);

/** The views that Pets must not open directly, even from a deep link. */
export const DOTS_ONLY_VIEWS: ReadonlySet<string> = new Set<string>([
  "whiteboard",
  "workflows",
  "agenda",
  "tasks",
  "usage",
  "sheets",
  "whilo-data",
  "server-cloud",
  "routines",
]);

export function toolAllowedInMode(toolId: string, mode: WhiloExperienceMode): boolean {
  if (mode === "dots") return true;
  if (DOTS_ONLY_TOOLS.has(toolId)) return false;
  return PETS_ALLOWED_TOOLS.has(toolId);
}

export function viewAllowedInMode(activeView: string, mode: WhiloExperienceMode): boolean {
  if (mode === "dots") return true;
  return !DOTS_ONLY_VIEWS.has(activeView);
}
