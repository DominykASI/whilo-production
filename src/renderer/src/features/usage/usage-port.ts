import type { WhiloDesktopApi } from "@whilo/contracts/ipc";

/**
 * What the usage panel reaches in main: the analytics of a server, its agents, and the events that
 * make the report stale.
 */
export interface UsagePort {
  agent: Pick<WhiloDesktopApi["agent"], "getHostAnalytics" | "listAgents" | "onScopedEvent">;
  servers: Pick<WhiloDesktopApi["servers"], "onEvent">;
}

/** Read on each call: tests and stories replace `window.whilo` per case. */
export function usagePort(): UsagePort {
  return window.whilo;
}
