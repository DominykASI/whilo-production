import type { WhiloDesktopApi } from "@whilo/contracts/ipc";

/** What the Voice tab reaches in main: the dictation models and the dictation settings. */
export interface VoicePort {
  voice: WhiloDesktopApi["voice"];
}

/** Read on each call: tests and stories replace `window.whilo` per case. */
export function voicePort(): VoicePort {
  return window.whilo;
}
