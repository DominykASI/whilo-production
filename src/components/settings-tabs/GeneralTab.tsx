import { t } from "@/lib/i18n";
import { useAdvancedMode } from "@/lib/interface-mode";
import { AdvancedModeRow, ColorUserBubblesRow, FollowUpRow, LanguageRow, RunCardRow, SendKeyRow, ShowThreadsRow, ToolCallsRow } from "../AppSettingsRows";
import { NotificationRows } from "../NotificationSettingsRows";
import { Card, SettingsGroup, SettingsRows } from "../SettingsPrimitives";
import { SelectRow, SwitchRow } from "./LocalSettingsRow";

export function GeneralTab() {
  const advanced = useAdvancedMode();
  return (
    <>
      <SettingsGroup label={t("settings.tab.general.title")} block="general">
        <SettingsRows>
          <SwitchRow titleKey="settings.interfaceSize.title" descriptionKey="settings.interfaceSize.description" initial />
          <SelectRow
            titleKey="settings.accent.title"
            descriptionKey="settings.accent.description"
            initial="violet"
            options={[
              { value: "blue", labelKey: "settings.accent.blue" },
              { value: "violet", labelKey: "settings.accent.violet" },
              { value: "teal", labelKey: "settings.accent.teal" },
              { value: "amber", labelKey: "settings.accent.amber" },
              { value: "rose", labelKey: "settings.accent.rose" },
              { value: "graphite", labelKey: "settings.accent.graphite" },
              { value: "lagoon", labelKey: "settings.accent.lagoon" },
              { value: "ember", labelKey: "settings.accent.ember" },
            ]}
          />
          <SelectRow
            titleKey="settings.cornerRadius.title"
            descriptionKey="settings.cornerRadius.description"
            initial="default"
            options={[
              { value: "compact", labelKey: "settings.cornerRadius.compact" },
              { value: "default", labelKey: "settings.cornerRadius.default" },
              { value: "round", labelKey: "settings.cornerRadius.round" },
              { value: "pill", labelKey: "settings.cornerRadius.pill" },
            ]}
          />
          <SelectRow
            titleKey="settings.logoColor.title"
            descriptionKey="settings.logoColor.description"
            initial="lavender"
            options={[
              { value: "lavender", labelKey: "settings.logoColor.lavender" },
              { value: "green", labelKey: "settings.logoColor.green" },
              { value: "gold", labelKey: "settings.logoColor.gold" },
              { value: "terracotta", labelKey: "settings.logoColor.terracotta" },
              { value: "blue", labelKey: "settings.logoColor.blue" },
              { value: "rose", labelKey: "settings.logoColor.rose" },
              { value: "pink", labelKey: "settings.logoColor.pink" },
              { value: "beige", labelKey: "settings.logoColor.beige" },
              { value: "gray", labelKey: "settings.logoColor.gray" },
              { value: "white", labelKey: "settings.logoColor.white" },
            ]}
          />
          <SwitchRow titleKey="settings.chatColor.title" descriptionKey="settings.chatColor.description" />
          <LanguageRow />
          <SendKeyRow />
          <FollowUpRow />
          <ColorUserBubblesRow />
          <ShowThreadsRow />
          <ToolCallsRow />
          <RunCardRow />
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup label={t("settings.tab.agents.title")} block="conversations">
        <SettingsRows>
          <SwitchRow titleKey="settings.showAgentSteps.title" descriptionKey="settings.showAgentSteps.description" initial />
          <SwitchRow titleKey="settings.compactMessageActions.title" descriptionKey="settings.compactMessageActions.description" />
          <SelectRow
            titleKey="settings.externalLinks.title"
            descriptionKey="settings.externalLinks.description"
            initial="default"
            options={[
              { value: "default", labelKey: "settings.externalLinks.defaultBrowser" },
              { value: "whilo", labelKey: "settings.externalLinks.whilo" },
            ]}
          />
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup label={t("settings.simple.group.system")} block="system">
        <SettingsRows>
          <SwitchRow titleKey="settings.launchAtLogin.title" descriptionKey="settings.launchAtLogin.description" />
          <SwitchRow titleKey="settings.keepRemoteSessions.title" descriptionKey="settings.keepRemoteSessions.description" />
          <SwitchRow titleKey="settings.keepRunning.title" descriptionKey="settings.keepRunning.description" initial />
          <SwitchRow titleKey="settings.keepAwake.title" descriptionKey="settings.keepAwake.description" />
          <SwitchRow titleKey="settings.keepAwakeOnBattery.title" descriptionKey="settings.keepAwakeOnBattery.description" />
          <SwitchRow titleKey="settings.restoreWorkspace.title" descriptionKey="settings.restoreWorkspace.description" initial />
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup label={t("settings.permissions.title")} block="permissions">
        <SettingsRows>
          <SwitchRow titleKey="settings.analytics.title" descriptionKey="settings.analytics.description" />
        </SettingsRows>
      </SettingsGroup>

      {!advanced && (
        <Card title={t("settings.notifications.thisComputer")}>
          <NotificationRows />
        </Card>
      )}
      <AdvancedModeRow />
    </>
  );
}
