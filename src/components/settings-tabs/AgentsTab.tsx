import { t } from "@/lib/i18n";
import { SegmentedRow, SwitchRow } from "./LocalSettingsRow";
import { SettingsGroup, SettingsRows } from "../SettingsPrimitives";

export function AgentsTab() {
  return (
    <>
      <SettingsGroup label={t("settings.agentDefaults.title")} block="agents">
        <SettingsRows>
          <SwitchRow titleKey="agentSettings.automation.title" descriptionKey="agentSettings.automation.description" initial />
          <SwitchRow titleKey="agentSettings.agentNewChat.title" descriptionKey="agentSettings.agentNewChat.description" initial />
          <SwitchRow titleKey="agentSettings.quickAcknowledgement.title" descriptionKey="agentSettings.quickAcknowledgement.description" />
          <SegmentedRow
            titleKey="settings.busyMessage.title"
            descriptionKey="settings.busyMessage.description"
            initial="steer"
            options={[
              { value: "steer", labelKey: "settings.followUp.steer" },
              { value: "queue", labelKey: "settings.followUp.queue" },
            ]}
          />
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup label={t("settings.backgroundProcesses.title")} block="background-processes">
        <SettingsRows>
          <SwitchRow
            titleKey="settings.backgroundProcesses.title"
            descriptionKey="settings.backgroundProcesses.description"
            initial
          />
        </SettingsRows>
      </SettingsGroup>
    </>
  );
}
