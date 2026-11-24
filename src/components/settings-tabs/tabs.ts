import {
  Bell,
  Bot,
  CircleArrowDown,
  CreditCard,
  Mic,
  MousePointer2,
  PanelRight,
  PanelTop,
  Settings,
  Smartphone,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { LocaleKey } from "@/locales";

export type SettingsTabId =
  | "general"
  | "agents"
  | "profile"
  | "notifications"
  | "voice"
  | "dynamic-island"
  | "agent-dock"
  | "computer-use"
  | "billing"
  | "mobile-connect"
  | "updates";

export interface SettingsTabRowDef {
  titleKey: LocaleKey;
  descriptionKey?: LocaleKey;
  macOS?: boolean;
}

export interface SettingsTabDef {
  id: SettingsTabId;
  labelKey: LocaleKey;
  descriptionKey: LocaleKey;
  icon: LucideIcon;
  requiresDesktop?: boolean;
  rows: readonly SettingsTabRowDef[];
}

export const SETTINGS_TABS: readonly SettingsTabDef[] = [
  {
    id: "general",
    labelKey: "settings.tab.general.title",
    descriptionKey: "settings.tab.general.description",
    icon: Settings,
    rows: [
      { titleKey: "settings.language.title", descriptionKey: "settings.language.description" },
      { titleKey: "settings.interfaceSize.title", descriptionKey: "settings.interfaceSize.description" },
      { titleKey: "settings.accent.title", descriptionKey: "settings.accent.description" },
      { titleKey: "settings.cornerRadius.title", descriptionKey: "settings.cornerRadius.description" },
      { titleKey: "settings.logoColor.title", descriptionKey: "settings.logoColor.description" },
      { titleKey: "settings.chatColor.title", descriptionKey: "settings.chatColor.description" },
      { titleKey: "settings.sendShortcut.title", descriptionKey: "settings.sendShortcut.description" },
      { titleKey: "settings.showAgentSteps.title", descriptionKey: "settings.showAgentSteps.description" },
      { titleKey: "settings.compactMessageActions.title", descriptionKey: "settings.compactMessageActions.description" },
      { titleKey: "settings.externalLinks.title", descriptionKey: "settings.externalLinks.description" },
      { titleKey: "settings.launchAtLogin.title", descriptionKey: "settings.launchAtLogin.description" },
      { titleKey: "settings.keepRemoteSessions.title", descriptionKey: "settings.keepRemoteSessions.description" },
      { titleKey: "settings.keepRunning.title", descriptionKey: "settings.keepRunning.description", macOS: false },
      { titleKey: "settings.menuBar.title", descriptionKey: "settings.menuBar.description", macOS: true },
      { titleKey: "settings.keepAwake.title", descriptionKey: "settings.keepAwake.description" },
      { titleKey: "settings.keepAwakeOnBattery.title", descriptionKey: "settings.keepAwakeOnBattery.description" },
      { titleKey: "settings.restoreWorkspace.title", descriptionKey: "settings.restoreWorkspace.description" },
      { titleKey: "settings.analytics.title", descriptionKey: "settings.analytics.description" },
    ],
  },
  {
    id: "agents",
    labelKey: "settings.tab.agents.title",
    descriptionKey: "settings.tab.agents.description",
    icon: Bot,
    rows: [
      { titleKey: "agentSettings.automation.title", descriptionKey: "agentSettings.automation.description" },
      { titleKey: "agentSettings.agentNewChat.title", descriptionKey: "agentSettings.agentNewChat.description" },
      { titleKey: "agentSettings.quickAcknowledgement.title", descriptionKey: "agentSettings.quickAcknowledgement.description" },
      { titleKey: "settings.busyMessage.title", descriptionKey: "settings.busyMessage.description" },
      { titleKey: "settings.backgroundProcesses.title", descriptionKey: "settings.backgroundProcesses.description" },
    ],
  },
  {
    id: "profile",
    labelKey: "settings.tab.profile.title",
    descriptionKey: "settings.tab.profile.description",
    icon: UserRound,
    rows: [
      { titleKey: "settings.profile.email.title", descriptionKey: "settings.profile.email.description" },
      { titleKey: "settings.profile.sessions.title", descriptionKey: "settings.profile.sessions.description" },
    ],
  },
  {
    id: "notifications",
    labelKey: "settings.tab.notifications.title",
    descriptionKey: "settings.tab.notifications.description",
    icon: Bell,
    rows: [
      { titleKey: "settings.notifications.whatYouHear" },
      { titleKey: "settings.desktopNotifications.title", descriptionKey: "settings.desktopNotifications.description" },
      { titleKey: "settings.notificationPreview.title", descriptionKey: "settings.notificationPreview.description" },
      { titleKey: "settings.testNotification.title", descriptionKey: "settings.testNotification.description" },
      { titleKey: "settings.taskSound.title", descriptionKey: "settings.taskSound.description" },
      { titleKey: "settings.soundFeedback.title", descriptionKey: "settings.soundFeedback.description" },
    ],
  },
  {
    id: "voice",
    labelKey: "settings.tab.voice.title",
    descriptionKey: "settings.tab.voice.description",
    icon: Mic,
    rows: [
      { titleKey: "settings.voice.dictation.section" },
      { titleKey: "settings.voice.language.section", descriptionKey: "settings.voice.language.description" },
      { titleKey: "settings.voice.speech.readReplies.title", descriptionKey: "settings.voice.speech.readReplies.description" },
      { titleKey: "settings.voice.speech.voice.title" },
      { titleKey: "settings.voice.speech.speed.title" },
      { titleKey: "settings.voice.speech.codexLive.title", descriptionKey: "settings.voice.speech.codexLive.description" },
    ],
  },
  {
    id: "dynamic-island",
    labelKey: "settings.tab.dynamicIsland.title",
    descriptionKey: "settings.tab.dynamicIsland.description",
    icon: PanelTop,
    requiresDesktop: true,
    rows: [
      { titleKey: "settings.notch.show.title", descriptionKey: "settings.notch.show.description" },
      { titleKey: "settings.notch.idle.title", descriptionKey: "settings.notch.idle.description" },
      { titleKey: "settings.notch.displays.title", descriptionKey: "settings.notch.displays.description" },
      { titleKey: "settings.notch.haptics.title", descriptionKey: "settings.notch.haptics.description" },
      { titleKey: "settings.notch.servers.title", descriptionKey: "settings.notch.servers.description" },
      { titleKey: "settings.notch.size.title", descriptionKey: "settings.notch.size.description" },
    ],
  },
  {
    id: "agent-dock",
    labelKey: "settings.tab.agentDock.title",
    descriptionKey: "settings.tab.agentDock.description",
    icon: PanelRight,
    requiresDesktop: true,
    rows: [
      { titleKey: "settings.agentDock.show.title", descriptionKey: "settings.agentDock.show.description" },
      { titleKey: "settings.agentDock.placement.title", descriptionKey: "settings.agentDock.placement.description" },
      { titleKey: "settings.agentDock.display.title", descriptionKey: "settings.agentDock.display.description" },
      { titleKey: "settings.agentDock.agents.title", descriptionKey: "settings.agentDock.agents.description" },
    ],
  },
  {
    id: "computer-use",
    labelKey: "settings.tab.computerUse.title",
    descriptionKey: "settings.tab.computerUse.description",
    icon: MousePointer2,
    requiresDesktop: true,
    rows: [{ titleKey: "computerUse.permissions.title", descriptionKey: "computerUse.permissions.description" }],
  },
  {
    id: "billing",
    labelKey: "settings.tab.billing.title",
    descriptionKey: "settings.tab.billing.description",
    icon: CreditCard,
    rows: [],
  },
  {
    id: "mobile-connect",
    labelKey: "settings.tab.mobileConnect.title",
    descriptionKey: "settings.tab.mobileConnect.description",
    icon: Smartphone,
    requiresDesktop: true,
    rows: [
      { titleKey: "settings.mobileConnect.phones.title", descriptionKey: "settings.mobileConnect.phones.description" },
      { titleKey: "settings.mobileConnect.phones.add", descriptionKey: "settings.mobileConnect.add.question" },
      { titleKey: "settings.mobileConnect.link.title", descriptionKey: "settings.mobileConnect.link.cardHint" },
      { titleKey: "settings.mobileConnect.route.title", descriptionKey: "settings.mobileConnect.route.description" },
    ],
  },
  {
    id: "updates",
    labelKey: "settings.tab.updates.title",
    descriptionKey: "settings.tab.updates.description",
    icon: CircleArrowDown,
    rows: [
      { titleKey: "settings.updates.track.title", descriptionKey: "settings.updates.track.description" },
      { titleKey: "settings.updates.idleRestart.title" },
      { titleKey: "settings.updates.autoDownload.title", descriptionKey: "settings.updates.autoDownload.description" },
      { titleKey: "settings.updates.autoInstall.title", descriptionKey: "settings.updates.autoInstall.description" },
      { titleKey: "settings.updates.allowRemote.title", descriptionKey: "settings.updates.allowRemote.description" },
      { titleKey: "settings.updates.managed.title", descriptionKey: "settings.updates.managed.description" },
    ],
  },
];

export function settingsTab(tab: SettingsTabId): SettingsTabDef {
  const found = SETTINGS_TABS.find((entry) => entry.id === tab);
  if (!found) throw new Error(`Unknown settings tab: ${tab}`);
  return found;
}

export function settingsRowShown(row: SettingsTabRowDef, mac: boolean): boolean {
  return row.macOS === undefined || row.macOS === mac;
}
