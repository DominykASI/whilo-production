import type { WhiloDesktopApi } from "@whilo/contracts/ipc";

/**
 * What team presence reaches in main: who is online, and whether this member is typing.
 */
export interface TeamPort {
  servers: Pick<WhiloDesktopApi["servers"], "onPresence" | "setTyping">;
}

/** Read on each call: tests and stories replace `window.whilo` per case. */
export function teamPort(): TeamPort {
  return window.whilo;
}
