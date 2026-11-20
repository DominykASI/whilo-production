import {
  isWhiloMode,
  WHILO_MODE_ATTRIBUTE,
  WHILO_MODE_EVENT,
  WHILO_MODE_STORAGE_KEY,
  type WhiloExperienceMode,
} from "@whilo/contracts/whilo-mode";
import { createSignal } from "solid-js";

/**
 * The experience mode of this window. On the web the edge injects `data-whilo-mode`, a link may add
 * `?mode`, and the choice persists in `localStorage`. On the desktop shell the same key and event
 * carry it, so one hook serves both surfaces.
 *
 * The order is URL, then storage, then the injected attribute, then the platform default. The URL
 * wins so a launch or a deep link opens the intended surface; a later choice overwrites it in storage.
 */
function readMode(): WhiloExperienceMode {
  if (typeof window === "undefined") return "pets";
  const param = new URLSearchParams(window.location.search).get("mode");
  const stored = window.localStorage.getItem(WHILO_MODE_STORAGE_KEY);
  const injected = document.documentElement.getAttribute(WHILO_MODE_ATTRIBUTE);
  if (isWhiloMode(param)) return param;
  if (isWhiloMode(stored)) return stored;
  if (isWhiloMode(injected)) return injected;
  return "pets";
}

const [mode, setMode] = createSignal<WhiloExperienceMode>(readMode());

if (typeof window !== "undefined") {
  window.addEventListener(WHILO_MODE_EVENT, (event) => {
    const next = (event as CustomEvent<{ mode?: WhiloExperienceMode }>).detail?.mode;
    if (isWhiloMode(next)) setMode(next);
  });
}

/** The mode of this window. */
export function whiloMode(): WhiloExperienceMode {
  return mode();
}

/** Persists a new mode, keeps `?mode` in sync, and notifies the other listeners. */
export function setWhiloMode(next: WhiloExperienceMode): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(WHILO_MODE_STORAGE_KEY, next);
    } catch {}
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", next);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    } catch {}
    try {
      window.dispatchEvent(new CustomEvent(WHILO_MODE_EVENT, { detail: { mode: next } }));
    } catch {}
  }
  setMode(next);
}
