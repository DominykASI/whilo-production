import { useEffect, useState } from "react";

export type WhiloExperienceMode = "pets" | "dots";

const MODE_KEY = "whilo:mode";
export const WHILO_MODE_EVENT = "whilo:mode";

function normalizeMode(value: string | null | undefined): WhiloExperienceMode | null {
  if (value === "dots" || value === "pets") return value;
  return null;
}

/** Read the persisted experience mode. URL ?mode wins for deep links/launch, then localStorage. */
export function readWhiloMode(): WhiloExperienceMode {
  try {
    const param = normalizeMode(new URLSearchParams(window.location.search).get("mode"));
    if (param) return param;
  } catch {}
  try {
    const value = normalizeMode(localStorage.getItem(MODE_KEY));
    if (value) return value;
  } catch {}
  return "pets";
}

export function writeWhiloMode(mode: WhiloExperienceMode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent(WHILO_MODE_EVENT, { detail: { mode } }));
  } catch {}
}

/** Update ?mode in the current URL without reloading (keeps launch/deep-link state in sync). */
export function syncWhiloModeUrl(mode: WhiloExperienceMode) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {}
}

export function useWhiloMode(): WhiloExperienceMode {
  const [mode, setMode] = useState<WhiloExperienceMode>(readWhiloMode);
  useEffect(() => {
    const onMode = (event: Event) => {
      const next = (event as CustomEvent<{ mode?: WhiloExperienceMode }>).detail?.mode;
      if (next === "dots" || next === "pets") setMode(next);
    };
    window.addEventListener(WHILO_MODE_EVENT, onMode as EventListener);
    return () => window.removeEventListener(WHILO_MODE_EVENT, onMode as EventListener);
  }, []);
  return mode;
}

/**
 * Sidebar tools available per mode.
 * - dots: everything (full Whilo power: automations, agenda/routines, workflows, tasks, usage, library, boards/data, plans, marketplace, server cloud, files, web panels)
 * - pets: focused companion experience without heavy planning/ops surfaces (no Agenda, no Workflows/Rotinas, no Whiteboard/Sheets/Data, no Usage analytics, no Tasks board, no Server Cloud). Keeps chat/bots, apps, marketplace, plans, library, files, and team map.
 */
export const PETS_ALLOWED_TOOLS = new Set<string>([
  "apps",
  "team-map",
  "files",
  "library",
  "plans",
  "marketplace",
]);

export const DOTS_ONLY_TOOLS = new Set<string>([
  "whiteboard",
  "workflows",
  "agenda",
  "tasks",
  "usage",
  "sheets",
  "whilo-data",
  "server-cloud",
]);

export function toolAllowedInMode(toolId: string, mode: WhiloExperienceMode): boolean {
  if (mode === "dots") return true;
  if (DOTS_ONLY_TOOLS.has(toolId)) return false;
  return PETS_ALLOWED_TOOLS.has(toolId);
}

/** Views/surfaces that should not be opened directly in Pets mode. */
export function viewAllowedInMode(activeView: string, mode: WhiloExperienceMode): boolean {
  if (mode === "dots") return true;
  return !["whiteboard", "workflows", "agenda", "tasks", "usage", "sheets", "whilo-data", "server-cloud", "routines"].includes(activeView);
}
