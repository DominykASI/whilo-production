import type { WhiloDesktopApi } from "@whilo/contracts/ipc";

/**
 * What the sidebar reaches in main: the saved sidebar layout and its changes, the pins that the host
 * keeps for all devices of the user, the free space on the disk of a server for the storage card, and
 * its machine use and alert levels for the machine card.
 */
export interface SidebarPort {
  agent: Pick<
    WhiloDesktopApi["agent"],
    "getSidebarLayout" | "mutateSidebarLayout" | "getSidebarPins" | "setSidebarPins" | "seedSidebarPins"
  >;
  storage: Pick<WhiloDesktopApi["storage"], "getDisk" | "getMachineMetrics">;
  hostAdmin: Pick<WhiloDesktopApi["hostAdmin"], "getMachineAlerts">;
}

/** Read on each call: tests and stories replace `window.whilo` per case. */
export function sidebarPort(): SidebarPort {
  return window.whilo;
}
