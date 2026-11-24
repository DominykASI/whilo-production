import { useSyncExternalStore } from "react";

import type { LocaleKey } from "@/locales";

export type MobileNavItemId =
  | "chat"
  | "workflows"
  | "agenda"
  | "tasks"
  | "usage"
  | "library"
  | "server-cloud"
  | "plans"
  | "automations"
  | "team-map"
  | "whiteboard"
  | "sheets"
  | "whilo-data"
  | "files"
  | "apps"
  | "marketplace"
  | "store";

export const MOBILE_NAV_MAX_ITEMS = 4;

export const MOBILE_NAV_KEY = "whilo.mobileNav.v1";

export const MOBILE_NAV_CATALOG: readonly MobileNavItemId[] = [
  "chat",
  "workflows",
  "agenda",
  "tasks",
  "usage",
  "library",
  "server-cloud",
  "plans",
  "automations",
  "team-map",
  "whiteboard",
  "sheets",
  "whilo-data",
  "files",
  "apps",
  "marketplace",
  "store",
];

export const MOBILE_NAV_DEFAULT: readonly MobileNavItemId[] = ["chat", "workflows", "agenda", "store"];

export function mobileNavLabelKey(id: MobileNavItemId): LocaleKey {
  switch (id) {
    case "chat":
      return "mobileNav.chat";
    case "plans":
      return "mobileNav.plans";
    case "store":
      return "mobileNav.store";
    case "apps":
      return "mobileNav.apps";
    case "marketplace":
      return "sidebar.nav.marketplace";
    case "files":
      return "mobileNav.files";
    case "automations":
      return "mobileNav.automations";
    case "team-map":
      return "mobileNav.teamMap";
    case "whiteboard":
      return "mobileNav.whiteboard";
    case "sheets":
      return "mobileNav.sheets";
    case "whilo-data":
      return "mobileNav.data";
    default:
      return `sidebar.nav.${id}` as LocaleKey;
  }
}

const KNOWN = new Set<string>(MOBILE_NAV_CATALOG);

function isItem(value: unknown): value is MobileNavItemId {
  return typeof value === "string" && KNOWN.has(value);
}

export function parseMobileNav(value: string | null): MobileNavItemId[] {
  if (!value) return [...MOBILE_NAV_DEFAULT];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [...MOBILE_NAV_DEFAULT];
    const items = parsed.filter(isItem).slice(0, MOBILE_NAV_MAX_ITEMS);
    return items.length > 0 ? items : [...MOBILE_NAV_DEFAULT];
  } catch {
    return [...MOBILE_NAV_DEFAULT];
  }
}

export function loadMobileNav(storage?: Pick<Storage, "getItem"> | null): MobileNavItemId[] {
  try {
    const target = storage === undefined ? (globalThis.localStorage ?? null) : storage;
    return parseMobileNav(target?.getItem(MOBILE_NAV_KEY) ?? null);
  } catch {
    return [...MOBILE_NAV_DEFAULT];
  }
}

export function saveMobileNav(items: readonly MobileNavItemId[], storage?: Pick<Storage, "setItem"> | null): void {
  try {
    const target = storage === undefined ? (globalThis.localStorage ?? null) : storage;
    target?.setItem(MOBILE_NAV_KEY, JSON.stringify(items.slice(0, MOBILE_NAV_MAX_ITEMS)));
  } catch {
  }
}

/** Moves `id` to `to`, keeping the rest in order. Returns the same list when the move changes nothing. */
export function moveMobileNav(items: readonly MobileNavItemId[], id: MobileNavItemId, to: number): MobileNavItemId[] {
  const at = items.indexOf(id);
  if (at === -1) return [...items];
  const bounded = Math.max(0, Math.min(items.length - 1, to));
  if (at === bounded) return [...items];
  const next = [...items];
  next.splice(at, 1);
  next.splice(bounded, 0, id);
  return next;
}

/** Trades a slot for a new item: the chosen one takes `to`, the item that was there leaves. */
export function swapMobileNav(
  items: readonly MobileNavItemId[],
  id: MobileNavItemId,
  to: number,
): MobileNavItemId[] {
  const bounded = Math.max(0, Math.min(items.length - 1, to));
  const at = items.indexOf(id);
  if (at === bounded) return [...items];
  const next = [...items];
  if (at === -1) {
    next[bounded] = id;
    return next;
  }
  next.splice(at, 1);
  next.splice(bounded, 0, id);
  return next.slice(0, MOBILE_NAV_MAX_ITEMS);
}

let navSessionChoice: MobileNavItemId[] | undefined;
let navSnapshot: MobileNavItemId[] | undefined;
let navSnapshotKey = "";
const navListeners = new Set<() => void>();

/** useSyncExternalStore needs a stable snapshot: the same array comes back until the stored value actually changes. */
function currentMobileNav(): MobileNavItemId[] {
  const next = navSessionChoice ?? loadMobileNav();
  const key = next.join("\u0000");
  if (!navSnapshot || key !== navSnapshotKey) {
    navSnapshot = next;
    navSnapshotKey = key;
  }
  return navSnapshot;
}

function notifyMobileNav(): void {
  for (const listener of navListeners) listener();
}

function onMobileNavStorage(event: StorageEvent): void {
  if (event.key !== MOBILE_NAV_KEY && event.key !== null) return;
  try {
    if (event.storageArea && event.storageArea !== globalThis.localStorage) return;
  } catch {
    return;
  }
  navSessionChoice = undefined;
  navSnapshotKey = "";
  notifyMobileNav();
}

function subscribeMobileNav(listener: () => void): () => void {
  navListeners.add(listener);
  if (navListeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onMobileNavStorage);
  }
  return () => {
    navListeners.delete(listener);
    if (navListeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onMobileNavStorage);
    }
  };
}

export function setMobileNav(items: readonly MobileNavItemId[]): void {
  const bounded = items.slice(0, MOBILE_NAV_MAX_ITEMS);
  navSessionChoice = bounded;
  navSnapshot = bounded;
  navSnapshotKey = bounded.join("\u0000");
  saveMobileNav(bounded);
  notifyMobileNav();
}

const SERVER_SNAPSHOT: MobileNavItemId[] = [...MOBILE_NAV_DEFAULT];

export function useMobileNav(): MobileNavItemId[] {
  return useSyncExternalStore(subscribeMobileNav, currentMobileNav, () => SERVER_SNAPSHOT);
}
