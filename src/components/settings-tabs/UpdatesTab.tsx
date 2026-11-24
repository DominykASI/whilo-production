import { t } from "@/lib/i18n";
import { SelectRow, SwitchRow } from "./LocalSettingsRow";
import { SettingsGroup, SettingsRows } from "../SettingsPrimitives";
import { UpdatesRow } from "../AppSettingsRows";

export function UpdatesTab() {
  return (
    <>
      <SettingsGroup label={t("settings.updates.title")} block="updates">
        <SettingsRows>
          <SelectRow
            titleKey="settings.updates.track.title"
            descriptionKey="settings.updates.track.description"
            initial="stable"
            options={[{ value: "stable", labelKey: "settings.updates.track.stable" }]}
          />
          <UpdatesRow />
          <SwitchRow titleKey="settings.updates.idleRestart.title" />
          <SwitchRow
            titleKey="settings.updates.autoDownload.title"
            descriptionKey="settings.updates.autoDownload.description"
            initial
          />
          <SwitchRow
            titleKey="settings.updates.autoInstall.title"
            descriptionKey="settings.updates.autoInstall.description"
          />
          <SwitchRow
            titleKey="settings.updates.allowRemote.title"
            descriptionKey="settings.updates.allowRemote.description"
          />
          <SwitchRow
            titleKey="settings.updates.managed.title"
            descriptionKey="settings.updates.managed.description"
          />
        </SettingsRows>
      </SettingsGroup>
    </>
  );
}
