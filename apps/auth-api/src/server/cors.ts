import { WHILO_INVITE_ORIGIN } from "@whilo/contracts/invite-links";

/**
 * The browser build of the app is served from its own origin and calls this Worker directly, so the
 * API routes need CORS. The same bundle is answerable at the `app` alias and at the apex of the zone,
 * so both are allowed. A request without an `Origin` header (the desktop app, a phone, curl) passes
 * through untouched, because it is not subject to CORS.
 */
const INVITE_ORIGIN = new URL(WHILO_INVITE_ORIGIN);
const INVITE_APEX = INVITE_ORIGIN.hostname.replace(/^app\./u, "");

const APP_ORIGINS = new Set([
  INVITE_ORIGIN.origin,
  `${INVITE_ORIGIN.protocol}//${INVITE_APEX}`,
  `${INVITE_ORIGIN.protocol}//app.${INVITE_APEX}`,
]);

/** A development build runs on another port of the same machine. */
const LOOPBACK_ORIGIN = /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/u;

const ALLOWED_HEADERS = "authorization, content-type, idempotency-key, x-whilo-client, x-requested-with";
const ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const MAX_AGE_SECONDS = "600";

function allowedOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  if (APP_ORIGINS.has(origin)) return origin;
  return LOOPBACK_ORIGIN.test(origin) ? origin : null;
}

/** Answers a CORS preflight, or null when the request is not one. */
export function corsPreflight(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null;
  const origin = allowedOrigin(request);
  if (!origin) return null;
  if (!request.headers.has("Access-Control-Request-Method")) return null;
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": ALLOWED_METHODS,
      "Access-Control-Allow-Headers": ALLOWED_HEADERS,
      "Access-Control-Max-Age": MAX_AGE_SECONDS,
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
    },
  });
}

/** Adds the CORS headers an allowed browser origin needs. A response is copied, never mutated in place. */
export function applyCors(request: Request, response: Response): Response {
  const origin = allowedOrigin(request);
  if (!origin) return response;
  if (response.headers.get("Access-Control-Allow-Origin") === origin) return response;
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.append("Vary", "Origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
