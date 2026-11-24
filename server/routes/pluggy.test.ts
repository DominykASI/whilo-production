import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";

import { json, readBody } from "../harness/http.ts";
import { createPluggyService } from "../pluggy/service.ts";
import { requiredScope, type RequestAuth } from "../request-auth.ts";
import { createPluggyRoutes } from "./pluggy.ts";
import { dispatchRoutes, type RouteHandler } from "./table.ts";

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((done) => server.close(() => done()))));
});

async function serve(service: ReturnType<typeof createPluggyService>, auth: RequestAuth = { kind: "loopback", scopes: ["admin"] } as unknown as RequestAuth) {
  const routes: RouteHandler[] = [createPluggyRoutes({ pluggy: service })];
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!await dispatchRoutes(routes, { req, res, url, path: url.pathname, method: req.method ?? "GET", auth, json, readBody })) {
      json(res, 404, { error: "not found" });
    }
  });
  servers.push(server);
  await new Promise<void>((ready) => server.listen(0, "127.0.0.1", ready));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (path: string, body?: unknown, type = "application/json") =>
    fetch(`${base}${path}`, { method: "POST", headers: type ? { "content-type": type } : undefined, body: body === undefined ? undefined : JSON.stringify(body) });
  return { base, post };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("pluggy routes", () => {
  it("exposes Marketplace bank endpoints to client sessions (no secrets)", () => {
    expect(requiredScope("GET", "/api/pluggy/status")).toBe("client");
    expect(requiredScope("POST", "/api/pluggy/connect-token")).toBe("client");
    expect(requiredScope("GET", "/api/pluggy/connectors")).toBe("client");
  });

  it("reports unconfigured status without calling Pluggy when credentials are missing", async () => {
    const fetchMock = vi.fn();
    const service = createPluggyService({ env: {}, fetch: fetchMock as any });
    const { base } = await serve(service);
    const response = await fetch(`${base}/api/pluggy/status`);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toMatchObject({ configured: false, ready: false, reason: "missing_credentials" });
    expect(JSON.stringify(body)).not.toMatch(/clientId|clientSecret|apiKey|PLUGGY_/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates a connect token via client credentials auth without leaking secrets", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/auth")) {
        expect(init?.method).toBe("POST");
        expect(init?.body).toContain("clientId");
        return jsonResponse({ apiKey: "pluggy-api-key-jwt" });
      }
      if (url.endsWith("/connect_token")) {
        expect(init?.method).toBe("POST");
        expect((init?.headers as Headers).get("X-API-KEY") || (init?.headers as any)?.["X-API-KEY"]).toBe("pluggy-api-key-jwt");
        return jsonResponse({ accessToken: "connect-token-123" });
      }
      throw new Error(`unexpected ${url}`);
    });
    const service = createPluggyService({ env: { PLUGGY_CLIENT_ID: "id", PLUGGY_CLIENT_SECRET: "secret" }, fetch: fetchMock as any });
    const { post } = await serve(service);
    const response = await post("/api/pluggy/connect-token", { clientUserId: "user-1", connectorId: 201 });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ accessToken: "connect-token-123" });
    expect(JSON.stringify(body)).not.toContain("secret");
    expect(JSON.stringify(body)).not.toContain("pluggy-api-key-jwt");
  });

  it("returns 503 when connect token is requested but Pluggy is not configured", async () => {
    const service = createPluggyService({ env: {}, fetch: vi.fn() as any });
    const { post } = await serve(service);
    const response = await post("/api/pluggy/connect-token", {});
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ configured: false, ready: false, reason: "missing_credentials" });
  });

  it("lists connectors and refuses non-JSON connect-token posts", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/auth")) return jsonResponse({ apiKey: "k" });
      if (url.startsWith("https://api.pluggy.ai/connectors")) {
        return jsonResponse({ results: [{ id: 201, name: "Itaú" }], page: 1, total: 1, totalPages: 1 });
      }
      throw new Error(`unexpected ${url}`);
    });
    const service = createPluggyService({ env: { PLUGGY_CLIENT_ID: "id", PLUGGY_CLIENT_SECRET: "secret" }, fetch: fetchMock as any });
    const { base, post } = await serve(service);
    const listed = await fetch(`${base}/api/pluggy/connectors?countries=BR&pageSize=10`);
    expect(listed.status).toBe(200);
    expect(await listed.json()).toMatchObject({ results: [{ id: 201, name: "Itaú" }] });
    const bad = await post("/api/pluggy/connect-token", { clientUserId: "x" }, "text/plain");
    expect(bad.status).toBe(415);
  });
});
