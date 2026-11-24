/**
 * Client helpers for the Pluggy Open Finance integration used by the Banks tab.
 *
 * Credentials never live in the frontend: the backend owns PLUGGY_* env vars and
 * issues short-lived connect tokens. The UI only talks to /api/pluggy/* and
 * opens Pluggy Connect when a token is available. Every call degrades gracefully
 * so the Banks tab stays an honest catalogue when the backend is missing or not
 * configured yet.
 */

export type PluggyStatusState = "ready" | "unconfigured" | "unavailable" | "error";

export interface PluggyStatus {
  /** Ready to open Pluggy Connect (backend configured and token issuance works). */
  ready: boolean;
  /** Backend reports Pluggy credentials/configuration are present. */
  configured: boolean;
  /** Human/machine reason from backend when not ready. */
  reason?: string;
  /** Optional sandbox flag forwarded to the widget when supported. */
  sandbox?: boolean;
  /** Normalized state for UI rendering. */
  state: PluggyStatusState;
  /** HTTP status when the probe failed in a notable way. */
  httpStatus?: number;
}

export interface PluggyConnectToken {
  accessToken: string;
  /** Pass-through fields some backends include (item id, client user id, etc.). */
  raw: Record<string, unknown>;
}

export interface PluggyConnectResult {
  item?: {
    id?: string;
    connector?: { id?: number; name?: string };
    status?: string;
  };
  raw: unknown;
}

export interface OpenPluggyConnectOptions {
  connectToken: string;
  connectorId?: number;
  sandbox?: boolean;
  onSuccess: (result: PluggyConnectResult) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

let widgetScriptPromise: Promise<void> | null = null;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickString(record: Record<string, unknown> | null, keys: string[]): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function pickBoolean(record: Record<string, unknown> | null, keys: string[]): boolean | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return undefined;
}

async function readJson(response: Response): Promise<Record<string, unknown> | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    try {
      const text = await response.text();
      return text ? ({ message: text.slice(0, 200) } as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  try {
    return asRecord(await response.json());
  } catch {
    return null;
  }
}

/** Probes backend Pluggy status. Missing/unimplemented backend is treated as unavailable, not a crash. */
export async function fetchPluggyStatus(signal?: AbortSignal): Promise<PluggyStatus> {
  try {
    const response = await fetch("/api/pluggy/status", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      signal,
    });
    const body = await readJson(response);

    if (response.status === 404 || response.status === 501) {
      return { ready: false, configured: false, state: "unavailable", httpStatus: response.status, reason: "backend_unavailable" };
    }
    if (!response.ok) {
      const reason = pickString(body, ["reason", "error", "message", "code"]) ?? `http_${response.status}`;
      return { ready: false, configured: false, state: "error", httpStatus: response.status, reason };
    }

    const configured = pickBoolean(body, ["configured", "isConfigured", "hasCredentials", "enabled"]) ?? false;
    const ready = pickBoolean(body, ["ready", "isReady", "canConnect"]) ?? configured;
    const reason = pickString(body, ["reason", "message", "status", "error"]);
    const sandbox = pickBoolean(body, ["sandbox", "includeSandbox", "isSandbox"]);
    return {
      ready,
      configured,
      sandbox,
      reason,
      state: ready ? "ready" : "unconfigured",
      httpStatus: response.status,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return {
      ready: false,
      configured: false,
      state: "error",
      reason: error instanceof Error ? error.message : "network_error",
    };
  }
}

export interface CreatePluggyConnectTokenOptions {
  connectorId?: number;
  clientUserId?: string;
  itemId?: string;
  includeSandbox?: boolean;
}

/** Requests a short-lived Pluggy Connect token from the backend. */
export async function createPluggyConnectToken(options: CreatePluggyConnectTokenOptions = {}): Promise<PluggyConnectToken> {
  const payload: Record<string, unknown> = {};
  if (typeof options.connectorId === "number" && Number.isFinite(options.connectorId)) payload.connectorId = options.connectorId;
  if (options.clientUserId) payload.clientUserId = options.clientUserId;
  if (options.itemId) payload.itemId = options.itemId;
  if (typeof options.includeSandbox === "boolean") payload.includeSandbox = options.includeSandbox;

  const response = await fetch("/api/pluggy/connect-token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  const body = await readJson(response);

  if (!response.ok) {
    const reason = pickString(body, ["reason", "error", "message", "code"]) ?? `http_${response.status}`;
    throw new Error(reason);
  }

  const accessToken = pickString(body, ["accessToken", "connectToken", "token"]);
  if (!accessToken) throw new Error("missing_connect_token");
  return { accessToken, raw: body ?? {} };
}

/** Loads the Pluggy Connect widget script once. Safe to call multiple times. */
export function loadPluggyConnectScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no_window"));
  const existing = (window as { PluggyConnect?: unknown }).PluggyConnect;
  if (existing) return Promise.resolve();
  if (widgetScriptPromise) return widgetScriptPromise;

  widgetScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => {
      widgetScriptPromise = null;
      reject(new Error("pluggy_script_load_failed"));
    };
    document.head.appendChild(script);
  });
  return widgetScriptPromise;
}

function normalizeSuccess(payload: unknown): PluggyConnectResult {
  const record = asRecord(payload);
  const item = asRecord(record?.item) ?? record;
  const connector = asRecord(item?.connector);
  return {
    item: item
      ? {
          id: typeof item.id === "string" ? item.id : undefined,
          status: typeof item.status === "string" ? item.status : undefined,
          connector: connector
            ? {
                id: typeof connector.id === "number" ? connector.id : undefined,
                name: typeof connector.name === "string" ? connector.name : undefined,
              }
            : undefined,
        }
      : undefined,
    raw: payload,
  };
}

/**
 * Opens Pluggy Connect. Resolves once the widget is initialized/open requested;
 * lifecycle callbacks report success/error/close back to the caller.
 */
export async function openPluggyConnect(options: OpenPluggyConnectOptions): Promise<void> {
  await loadPluggyConnectScript();
  const PluggyConnect = (window as { PluggyConnect?: any }).PluggyConnect;
  if (!PluggyConnect) throw new Error("pluggy_widget_unavailable");

  const config: Record<string, unknown> = {
    connectToken: options.connectToken,
    onSuccess: (data: unknown) => options.onSuccess(normalizeSuccess(data)),
    onError: (error: unknown) => {
      const record = asRecord(error);
      options.onError(pickString(record, ["message", "error", "code"]) ?? "pluggy_connect_error");
    },
    onClose: () => options.onClose(),
  };
  if (typeof options.connectorId === "number" && Number.isFinite(options.connectorId)) config.connectorId = options.connectorId;
  if (typeof options.sandbox === "boolean") config.includeSandbox = options.sandbox;

  // v2 supports both constructor+init and static init depending on bundle shape.
  if (typeof PluggyConnect.init === "function") {
    PluggyConnect.init(config);
    return;
  }
  const instance = new PluggyConnect(config);
  if (instance && typeof instance.init === "function") {
    instance.init();
    return;
  }
  throw new Error("pluggy_widget_init_unavailable");
}
