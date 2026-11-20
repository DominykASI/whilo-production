import type { WhiloDesktopApi } from "@whilo/contracts/ipc";

/** What the agent dock window and the main renderer reach in main for the dock. */
export interface AgentDockPort {
  agentDock: WhiloDesktopApi["agentDock"];
}

/** Read on each call: stories replace `window.whilo` per case. */
export function agentDockPort(): AgentDockPort {
  return window.whilo;
}
