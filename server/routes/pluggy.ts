// Pluggy Open Finance routes for the Marketplace > Bancos tab.
// Never exposes secrets; the service owns credentials and talks to api.pluggy.ai.
//   GET  /api/pluggy/status        -> { configured, ready, reason?, auth? }
//   POST /api/pluggy/connect-token -> { accessToken } (short-lived, for Pluggy Connect widget)
//   GET  /api/pluggy/connectors   -> connector catalogue (optional filters; cached server-side)
import type { PluggyService } from "../pluggy/service.ts";
import { normalizeConnectTokenInput } from "../pluggy/service.ts";
import { PASS, type RouteHandler } from "./table.ts";

export interface PluggyRouteDeps {
  pluggy: PluggyService;
}

function parseBool(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

function parseIntParam(value: string | null): number | undefined {
  if (value === null) return undefined;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  const num = Number(trimmed);
  return Number.isSafeInteger(num) ? num : undefined;
}

function parseCsv(value: string | null, maxItems = 10): string[] | undefined {
  if (value === null) return undefined;
  const items = value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, maxItems);
  return items.length ? items : undefined;
}

export function createPluggyRoutes(deps: PluggyRouteDeps): RouteHandler {
  const { pluggy } = deps;
  return async ({ req, res, url, path, method, json, readBody }) => {
    if (path !== "/api/pluggy" && !path.startsWith("/api/pluggy/")) return PASS;
    res.setHeader("Cache-Control", "no-store");

    if (path === "/api/pluggy/status") {
      if (method !== "GET") return json(res, 405, { error: "method not allowed" });
      const status = await pluggy.getStatus({ probe: true });
      return json(res, 200, status);
    }

    if (path === "/api/pluggy/connect-token") {
      if (method !== "POST") return json(res, 405, { error: "method not allowed" });
      // JSON only, so a form post from another origin cannot mint a connect token.
      const mediaType = String(req.headers["content-type"] ?? "").split(";", 1)[0]!.trim().toLowerCase();
      if (mediaType && mediaType !== "application/json") {
        return json(res, 415, { error: "content-type must be application/json" });
      }
      let body: unknown = {};
      try {
        body = await readBody(req, 8_192);
      } catch (error) {
        const status = typeof (error as { status?: unknown })?.status === "number" ? (error as { status: number }).status : 400;
        return json(res, status, { error: "invalid body", reason: "bad_request" });
      }
      const input = normalizeConnectTokenInput(body);
      try {
        const result = await pluggy.createConnectToken(input);
        // accessToken is the field Pluggy Connect expects and the frontend helper picks up.
        return json(res, 200, { accessToken: result.accessToken });
      } catch (error) {
        const reason = error instanceof Error ? error.message : "connect_token_failed";
        if (reason === "missing_credentials") {
          return json(res, 503, { error: "Pluggy is not configured", reason, configured: false, ready: false });
        }
        return json(res, 502, { error: "Could not create a Pluggy connect token", reason });
      }
    }

    if (path === "/api/pluggy/connectors") {
      if (method !== "GET") return json(res, 405, { error: "method not allowed" });
      try {
        const result = await pluggy.listConnectors({
          countries: parseCsv(url.searchParams.get("countries"), 10),
          types: parseCsv(url.searchParams.get("types"), 10),
          name: url.searchParams.get("name")?.trim() || undefined,
          sandbox: parseBool(url.searchParams.get("sandbox")),
          isOpenFinance: parseBool(url.searchParams.get("isOpenFinance")),
          page: parseIntParam(url.searchParams.get("page")),
          pageSize: parseIntParam(url.searchParams.get("pageSize")),
        });
        return json(res, 200, result);
      } catch (error) {
        const reason = error instanceof Error ? error.message : "connectors_failed";
        if (reason === "missing_credentials") {
          return json(res, 503, { error: "Pluggy is not configured", reason, configured: false });
        }
        return json(res, 502, { error: "Could not list Pluggy connectors", reason });
      }
    }

    return json(res, 404, { error: "not found" });
  };
}
