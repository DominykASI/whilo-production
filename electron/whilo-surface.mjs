/** Whilo unified surface (Pets|Dots) loading for Architecture A: one Electron shell.
 *  Config: WHILO_UNIFIED_URL (+ optional WHILO_UNIFIED_FALLBACK=0 to disable fallback),
 *          WHILO_MODE=pets|dots (default pets), WHILO_UNIFIED_TRUST=0 to load without
 *          granting local-privilege IPC (default: trusted when URL is explicitly configured).
 *  The shell keeps the current Pets flow by default; unified loading is opt-in. */
export const WHILO_MODES = Object.freeze(["pets", "dots"]);

export function normalizeWhiloMode(value, fallback = "pets") {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  return WHILO_MODES.includes(v) ? v : fallback;
}

export function normalizeWhiloUnifiedUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "file:") return null;
    // file: allowed for packaged/local unified builds; credentials never accepted.
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

/** Build the unified surface URL with ?mode=pets|dots merged (preserving existing params). */
export function buildWhiloUnifiedUrl(baseUrl, mode) {
  const url = new URL(baseUrl.toString());
  url.searchParams.set("mode", normalizeWhiloMode(mode));
  return url.toString();
}

export function resolveWhiloSurface({
  env = process.env,
  unifiedUrl: explicitUrl,
  mode: explicitMode,
  localUrl,
} = {}) {
  const base = normalizeWhiloUnifiedUrl(explicitUrl ?? env.WHILO_UNIFIED_URL ?? env.WHILO_SURFACE_URL);
  const mode = normalizeWhiloMode(explicitMode ?? env.WHILO_MODE, "pets");
  if (!base) {
    return { kind: "local", mode, url: localUrl ?? null, origin: null, trusted: false, configured: false, fallback: true };
  }
  const trustEnv = env.WHILO_UNIFIED_TRUST;
  const trusted = trustEnv === "0" || trustEnv === "false" ? false : true;
  const fallbackEnv = env.WHILO_UNIFIED_FALLBACK;
  const fallback = fallbackEnv === "0" || fallbackEnv === "false" ? false : true;
  return {
    kind: "unified",
    mode,
    baseUrl: base.toString(),
    url: buildWhiloUnifiedUrl(base, mode),
    origin: base.origin === "null" ? null : base.origin,
    trusted,
    configured: true,
    fallback,
  };
}

export function isWhiloSurfaceUrl(rawUrl, surface) {
  if (!surface || surface.kind !== "unified" || !surface.origin) return false;
  try {
    return new URL(rawUrl).origin === surface.origin;
  } catch {
    return false;
  }
}

/** Apply mode to an existing unified URL (for in-shell mode switching). */
export function withWhiloMode(rawUrl, mode, surface) {
  if (!isWhiloSurfaceUrl(rawUrl, surface)) return null;
  try {
    const url = new URL(rawUrl);
    url.searchParams.set("mode", normalizeWhiloMode(mode));
    return url.toString();
  } catch {
    return null;
  }
}
