import type { WhiloDesktopApi } from "@whilo/contracts/ipc";

/**
 * What the settings context reaches in main: the app-wide preferences, the switches for updates,
 * notifications and the Dynamic Island, the local agents and their background processes of the
 * Agents tab, and the agents and the user's own notification levels of each server for the
 * Notifications tab.
 */
export interface SettingsPort {
  getAgentDefaults: WhiloDesktopApi["getAgentDefaults"];
  getAgentMemoryLimitPreference: WhiloDesktopApi["getAgentMemoryLimitPreference"];
  getAnalyticsPreference: WhiloDesktopApi["getAnalyticsPreference"];
  getAppBehaviorPreference: WhiloDesktopApi["getAppBehaviorPreference"];
  getApprovalAutomation: WhiloDesktopApi["getApprovalAutomation"];
  getBusyMessageModePreference: WhiloDesktopApi["getBusyMessageModePreference"];
  getExternalLinkPreference: WhiloDesktopApi["getExternalLinkPreference"];
  listExternalLinkBrowsers: WhiloDesktopApi["listExternalLinkBrowsers"];
  chooseExternalLinkApp: WhiloDesktopApi["chooseExternalLinkApp"];
  onExternalLinkFallback: WhiloDesktopApi["onExternalLinkFallback"];
  getRemoteNetworkRoute: WhiloDesktopApi["getRemoteNetworkRoute"];
  getRemoteSessionReusePreference: WhiloDesktopApi["getRemoteSessionReusePreference"];
  onAgentMemoryLimitPreference: WhiloDesktopApi["onAgentMemoryLimitPreference"];
  onAnalyticsPreference: WhiloDesktopApi["onAnalyticsPreference"];
  onApprovalAutomation: WhiloDesktopApi["onApprovalAutomation"];
  onOpenSettings: WhiloDesktopApi["onOpenSettings"];
  onOpenUpdateSettings: WhiloDesktopApi["onOpenUpdateSettings"];
  setAgentDefaults: WhiloDesktopApi["setAgentDefaults"];
  setAnalyticsPreference: WhiloDesktopApi["setAnalyticsPreference"];
  setAppBehaviorPreference: WhiloDesktopApi["setAppBehaviorPreference"];
  setBusyMessageModePreference: WhiloDesktopApi["setBusyMessageModePreference"];
  setExternalLinkPreference: WhiloDesktopApi["setExternalLinkPreference"];
  setRemoteNetworkRoute: WhiloDesktopApi["setRemoteNetworkRoute"];
  setRemoteSessionReusePreference: WhiloDesktopApi["setRemoteSessionReusePreference"];
  agent: Pick<
    WhiloDesktopApi["agent"],
    "listAgents" | "updateAgent" | "listAgentNotificationLevels" | "setAgentNotificationLevel" | "onScopedEvent"
  >;
  backgroundProcesses: WhiloDesktopApi["backgroundProcesses"];
  dynamicIsland: Pick<
    WhiloDesktopApi["dynamicIsland"],
    "getBuiltInDisplayGeometry" | "getPreference" | "setPreference"
  >;
  notifications: Pick<WhiloDesktopApi["notifications"], "getPreference" | "openSettings" | "setPreference" | "test">;
  update: Pick<WhiloDesktopApi["update"], "getPreference" | "onPreference" | "setPreference">;
}

/** Read on each call: tests and stories replace `window.whilo` per case. */
export function settingsPort(): SettingsPort {
  return window.whilo;
}
