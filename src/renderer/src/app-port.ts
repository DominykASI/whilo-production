import type { WhiloDesktopApi } from "@whilo/contracts/ipc";

/**
 * What the app shell and the cross-domain root modules reach in main, plus the shell actions
 * (`openUrl`, `openExternal`) that several domains share.
 */
export interface AppPort {
  getAppInfo: WhiloDesktopApi["getAppInfo"];
  getAppAppearancePreference: WhiloDesktopApi["getAppAppearancePreference"];
  getAppInterfaceSizePreference: WhiloDesktopApi["getAppInterfaceSizePreference"];
  getAppInterfaceLookPreference: WhiloDesktopApi["getAppInterfaceLookPreference"];
  getAppLanguagePreference: WhiloDesktopApi["getAppLanguagePreference"];
  getAppLogoColorPreference: WhiloDesktopApi["getAppLogoColorPreference"];
  onAppAppearancePreference: WhiloDesktopApi["onAppAppearancePreference"];
  onAppInterfaceSizePreference: WhiloDesktopApi["onAppInterfaceSizePreference"];
  onAppInterfaceLookPreference: WhiloDesktopApi["onAppInterfaceLookPreference"];
  onAppLanguagePreference: WhiloDesktopApi["onAppLanguagePreference"];
  onAppLogoColorPreference: WhiloDesktopApi["onAppLogoColorPreference"];
  openExternal: WhiloDesktopApi["openExternal"];
  openUrl: WhiloDesktopApi["openUrl"];
  openChatWindow: WhiloDesktopApi["openChatWindow"];
  getChatWindows: WhiloDesktopApi["getChatWindows"];
  onChatWindows: WhiloDesktopApi["onChatWindows"];
  onQuitShortcutHint: WhiloDesktopApi["onQuitShortcutHint"];
  setAppAppearancePreference: WhiloDesktopApi["setAppAppearancePreference"];
  setAppInterfaceSizePreference: WhiloDesktopApi["setAppInterfaceSizePreference"];
  setAppInterfaceLookPreference: WhiloDesktopApi["setAppInterfaceLookPreference"];
  setAppLanguagePreference: WhiloDesktopApi["setAppLanguagePreference"];
  setAppLogoColorPreference: WhiloDesktopApi["setAppLogoColorPreference"];
  agent: Pick<
    WhiloDesktopApi["agent"],
    "readConversationPage" | "searchConversationMessages" | "searchConversationFiles" | "listRoutines" | "listAgents"
  >;
  agentTemplates: Pick<WhiloDesktopApi["agentTemplates"], "onOpenLink" | "takePendingLink">;
  acpRegistry: WhiloDesktopApi["acpRegistry"];
  hostedSites: WhiloDesktopApi["hostedSites"];
  billing: WhiloDesktopApi["billing"];
  license: WhiloDesktopApi["license"];
  hostedServers: WhiloDesktopApi["hostedServers"];
  routineFeed: WhiloDesktopApi["routineFeed"];
  events: WhiloDesktopApi["events"];
  plugins: Pick<WhiloDesktopApi["plugins"], "onOpenListing" | "takePendingListing">;
  marketplace: Pick<WhiloDesktopApi["marketplace"], "onOpenListing" | "takePendingListing">;
  servers: Pick<WhiloDesktopApi["servers"], "onInvite" | "takePendingInvite">;
}

/** Read on each call: tests and stories replace `window.whilo` per case. */
export function appPort(): AppPort {
  return window.whilo;
}
