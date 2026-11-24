// Pluggy Open Finance integration: server-side only. Never expose credentials or raw API keys.
// Auth: POST /auth with clientId+clientSecret -> { apiKey } (preferred), or use PLUGGY_API_KEY from env.
// Connect: POST /connect_token with X-API-KEY -> { accessToken } for the frontend widget.

const PLUGGY_API = "https://api.pluggy.ai";
const DEFAULT_TIMEOUT_MS = 15_000;
const AUTH_REFRESH_SKEW_MS = 60_000;
const DEFAULT_AUTH_TTL_MS = 90 * 60_000;
const CONNECTORS_CACHE_TTL_MS = 10 * 60_000;
const MAX_CACHE_ENTRIES = 20;

export type PluggyServiceEnv = {
  PLUGGY_CLIENT_ID?: string;
  PLUGGY_CLIENT_SECRET?: string;
  PLUGGY_API_KEY?: string;
};

export type PluggyStatus = {
  configured: boolean;
  ready: boolean;
  reason?: string;
  sandbox?: boolean;
  auth?: "client_credentials" | "api_key" | "none";
};

export type CreateConnectTokenInput = {
  connectorId?: number;
  clientUserId?: string;
  itemId?: string;
  includeSandbox?: boolean;
  oauthRedirectUri?: string;
  webhookUrl?: string;
  /** Optional override for countries/products if needed by future callers. */
  countries?: string[];
  products?: string[];
  avoidDuplicates?: boolean;
};

export type CreateConnectTokenResult = {
  accessToken: string;
  raw: Record<string, unknown>;
};

export type PluggyConnector = Record<string, unknown>;

export type ListConnectorsInput = {
  countries?: string[];
  types?: string[];
  name?: string;
  sandbox?: boolean;
  isOpenFinance?: boolean;
  page?: number;
  pageSize?: number;
};

export type ListConnectorsResult = {
  results: PluggyConnector[];
  page?: number;
  total?: number;
  totalPages?: number;
  raw: unknown;
};

type CachedApiKey = { key: string; expiresAt: number; source: "auth" | "env" };

type FetchLike = typeof fetch;

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readEnv(env: PluggyServiceEnv = process.env): { clientId?: string; clientSecret?: string; apiKey?: string } {
  return {
    clientId: trimEnv(env.PLUGGY_CLIENT_ID),
    clientSecret: trimEnv(env.PLUGGY_CLIENT_SECRET),
    apiKey: trimEnv(env.PLUGGY_API_KEY),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function decodeJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    const parsed = JSON.parse(json) as { exp?: unknown };
    if (typeof parsed.exp === "number" && Number.isFinite(parsed.exp)) return parsed.exp * 1000;
  } catch {
    return null;
  }
  return null;
}

function expiresAtFor(token: string, fallbackMs: number): number {
  const exp = decodeJwtExp(token);
  if (exp && exp > Date.now()) return exp - AUTH_REFRESH_SKEW_MS;
  return Date.now() + fallbackMs;
}

function pickString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

async function readJsonSafe(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("json")) {
    const text = await response.text().catch(() => "");
    return text ? { message: text.slice(0, 300) } : null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function safeErrorReason(body: unknown, status: number): string {
  if (isRecord(body)) {
    const code = pickString(body, ["code", "error", "type"]);
    const message = pickString(body, ["message", "error_description", "detail"]);
    if (code && message) return `${code}: ${message}`.slice(0, 160);
    if (message) return message.slice(0, 160);
    if (code) return code.slice(0, 120);
  }
  return `http_${status}`;
}

function sanitizeClientUserId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Conservative: allow common id chars, cap length.
  if (!/^[A-Za-z0-9._:@-]{1,128}$/.test(trimmed)) return undefined;
  return trimmed;
}

function sanitizeItemId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!/^[A-Za-z0-9-]{1,64}$/.test(trimmed)) return undefined;
  return trimmed;
}

function sanitizeConnectorId(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : typeof value === "string" && /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN;
  if (!Number.isInteger(num) || num <= 0 || num > 2_147_483_647) return undefined;
  return num;
}

function sanitizeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function sanitizeStringList(value: unknown, maxItems: number, maxLen: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (trimmed.length > maxLen) continue;
    if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) continue;
    out.push(trimmed);
    if (out.length >= maxItems) break;
  }
  return out.length ? out : undefined;
}

export function normalizeConnectTokenInput(body: unknown): CreateConnectTokenInput {
  if (!isRecord(body)) return {};
  const includeSandbox = typeof body.includeSandbox === "boolean" ? body.includeSandbox
    : typeof body.sandbox === "boolean" ? body.sandbox
    : undefined;
  const avoidDuplicates = typeof body.avoidDuplicates === "boolean" ? body.avoidDuplicates : undefined;
  return {
    connectorId: sanitizeConnectorId(body.connectorId),
    clientUserId: sanitizeClientUserId(body.clientUserId),
    itemId: sanitizeItemId(body.itemId),
    includeSandbox,
    oauthRedirectUri: sanitizeHttpUrl(body.oauthRedirectUri ?? body.redirectUri),
    webhookUrl: sanitizeHttpUrl(body.webhookUrl),
    countries: sanitizeStringList(body.countries, 10, 8),
    products: sanitizeStringList(body.products, 20, 40),
    avoidDuplicates,
  };
}

export function createPluggyService(options?: { env?: PluggyServiceEnv; fetch?: FetchLike; now?: () => number; timeoutMs?: number }) {
  const getEnv = () => readEnv(options?.env ?? process.env);
  const doFetch: FetchLike = options?.fetch ?? fetch;
  const now = options?.now ?? (() => Date.now());
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let cachedKey: CachedApiKey | null = null;
  let inflightAuth: Promise<CachedApiKey> | null = null;
  const connectorsCache = new Map<string, { expiresAt: number; value: ListConnectorsResult }>();

  async function request(path: string, init: RequestInit & { apiKey?: string } = {}): Promise<{ response: Response; body: unknown }> {
    const headers = new Headers(init.headers);
    if (init.apiKey) headers.set("X-API-KEY", init.apiKey);
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    if (init.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await doFetch(`${PLUGGY_API}${path}`, {
      ...init,
      headers,
      signal: init.signal ?? AbortSignal.timeout(timeoutMs),
    });
    const body = await readJsonSafe(response);
    return { response, body };
  }

  async function authenticate(): Promise<CachedApiKey> {
    const { clientId, clientSecret, apiKey } = getEnv();
    if (clientId && clientSecret) {
      const { response, body } = await request("/auth", {
        method: "POST",
        body: JSON.stringify({ clientId, clientSecret }),
      });
      if (!response.ok) {
        throw new Error(safeErrorReason(body, response.status) || "pluggy_auth_failed");
      }
      const key = isRecord(body) ? pickString(body, ["apiKey", "accessToken", "token"]) : undefined;
      if (!key) throw new Error("pluggy_auth_missing_api_key");
      return { key, expiresAt: expiresAtFor(key, DEFAULT_AUTH_TTL_MS), source: "auth" };
    }
    if (apiKey) {
      return { key: apiKey, expiresAt: expiresAtFor(apiKey, DEFAULT_AUTH_TTL_MS), source: "env" };
    }
    throw new Error("missing_credentials");
  }

  async function ensureApiKey(force = false): Promise<CachedApiKey> {
    const current = cachedKey;
    if (!force && current && current.expiresAt > now()) return current;
    if (inflightAuth) return inflightAuth;
    inflightAuth = (async () => {
      try {
        const next = await authenticate();
        cachedKey = next;
        return next;
      } finally {
        inflightAuth = null;
      }
    })();
    return inflightAuth;
  }

  function configuredState(): { configured: boolean; auth: PluggyStatus["auth"] } {
    const { clientId, clientSecret, apiKey } = getEnv();
    if (clientId && clientSecret) return { configured: true, auth: "client_credentials" };
    if (apiKey) return { configured: true, auth: "api_key" };
    return { configured: false, auth: "none" };
  }

  async function getStatus(opts?: { probe?: boolean }): Promise<PluggyStatus> {
    const base = configuredState();
    if (!base.configured) {
      return { configured: false, ready: false, reason: "missing_credentials", auth: base.auth };
    }
    // Probe by default: uses cache when valid, otherwise authenticates once. Keeps UI honest.
    const probe = opts?.probe !== false;
    if (!probe) return { configured: true, ready: true, auth: base.auth };
    try {
      await ensureApiKey(false);
      return { configured: true, ready: true, auth: base.auth };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "auth_failed";
      return { configured: true, ready: false, reason, auth: base.auth };
    }
  }

  async function createConnectToken(input: CreateConnectTokenInput = {}): Promise<CreateConnectTokenResult> {
    const base = configuredState();
    if (!base.configured) throw new Error("missing_credentials");

    const payload: Record<string, unknown> = {};
    if (input.connectorId) payload.connectorId = input.connectorId;
    if (input.clientUserId) payload.clientUserId = input.clientUserId;
    if (input.itemId) payload.itemId = input.itemId;
    if (typeof input.includeSandbox === "boolean") payload.includeSandbox = input.includeSandbox;
    if (input.oauthRedirectUri) payload.oauthRedirectUri = input.oauthRedirectUri;
    if (input.webhookUrl) payload.webhookUrl = input.webhookUrl;
    if (input.countries) payload.countries = input.countries;
    if (input.products) payload.products = input.products;
    if (typeof input.avoidDuplicates === "boolean") payload.avoidDuplicates = input.avoidDuplicates;

    const attempt = async (forceAuth: boolean) => {
      const { key } = await ensureApiKey(forceAuth);
      return request("/connect_token", { method: "POST", apiKey: key, body: JSON.stringify(payload) });
    };

    let { response, body } = await attempt(false);
    // Retry once on auth failures in case cached/env key expired.
    if (response.status === 401 || response.status === 403) {
      ({ response, body } = await attempt(true));
    }

    if (!response.ok) {
      throw new Error(safeErrorReason(body, response.status) || "connect_token_failed");
    }
    const accessToken = isRecord(body) ? pickString(body, ["accessToken", "connectToken", "token"]) : undefined;
    if (!accessToken) throw new Error("missing_connect_token");
    return { accessToken, raw: isRecord(body) ? body : { value: body } };
  }

  function connectorsCacheKey(input: ListConnectorsInput): string {
    const norm = {
      countries: [...(input.countries ?? [])].sort(),
      types: [...(input.types ?? [])].sort(),
      name: input.name ?? "",
      sandbox: input.sandbox ?? null,
      isOpenFinance: input.isOpenFinance ?? null,
      page: input.page ?? null,
      pageSize: input.pageSize ?? null,
    };
    return JSON.stringify(norm);
  }

  async function listConnectors(input: ListConnectorsInput = {}): Promise<ListConnectorsResult> {
    const base = configuredState();
    if (!base.configured) throw new Error("missing_credentials");

    const key = connectorsCacheKey(input);
    const cached = connectorsCache.get(key);
    if (cached && cached.expiresAt > now()) return cached.value;

    const params = new URLSearchParams();
    if (input.countries?.length) params.set("countries", input.countries.join(","));
    if (input.types?.length) params.set("types", input.types.join(","));
    if (input.name) params.set("name", input.name);
    if (typeof input.sandbox === "boolean") params.set("sandbox", String(input.sandbox));
    if (typeof input.isOpenFinance === "boolean") params.set("isOpenFinance", String(input.isOpenFinance));
    if (input.page && Number.isInteger(input.page) && input.page > 0) params.set("page", String(input.page));
    if (input.pageSize && Number.isInteger(input.pageSize) && input.pageSize > 0) params.set("pageSize", String(Math.min(500, input.pageSize)));
    const qs = params.toString();
    const path = `/connectors${qs ? `?${qs}` : ""}`;

    const attempt = async (forceAuth: boolean) => {
      const { key: apiKey } = await ensureApiKey(forceAuth);
      return request(path, { method: "GET", apiKey });
    };

    let { response, body } = await attempt(false);
    if (response.status === 401 || response.status === 403) {
      ({ response, body } = await attempt(true));
    }
    if (!response.ok) {
      throw new Error(safeErrorReason(body, response.status) || "connectors_failed");
    }

    let results: PluggyConnector[] = [];
    let page: number | undefined;
    let total: number | undefined;
    let totalPages: number | undefined;
    if (Array.isArray(body)) {
      results = body.filter(isRecord) as PluggyConnector[];
    } else if (isRecord(body)) {
      const rawResults = body.results;
      if (Array.isArray(rawResults)) results = rawResults.filter(isRecord) as PluggyConnector[];
      if (typeof body.page === "number") page = body.page;
      if (typeof body.total === "number") total = body.total;
      if (typeof body.totalPages === "number") totalPages = body.totalPages;
    }

    const value: ListConnectorsResult = { results, page, total, totalPages, raw: body };
    if (connectorsCache.size >= MAX_CACHE_ENTRIES) {
      const first = connectorsCache.keys().next().value;
      if (first) connectorsCache.delete(first);
    }
    connectorsCache.set(key, { expiresAt: now() + CONNECTORS_CACHE_TTL_MS, value });
    return value;
  }

  return {
    configured: () => configuredState().configured,
    getStatus,
    createConnectToken,
    listConnectors,
    // exposed for tests/internal use; never send to clients
    _normalizeConnectTokenInput: normalizeConnectTokenInput,
  };
}

export type PluggyService = ReturnType<typeof createPluggyService>;
