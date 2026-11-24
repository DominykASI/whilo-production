import { t } from "@/lib/i18n";
import { SettingRow, SettingsGroup, SettingsRows, Switch } from "../SettingsPrimitives";
import { useState } from "react";

export function ComputerUseTab() {
  const [granted, setGranted] = useState(false);
  return (
    <SettingsGroup
      label={t("computerUse.permissions.title")}
      block="computer-use"
      footnote={t("computerUse.permissions.description")}
    >
      <SettingsRows>
        <SettingRow title={t("computerUse.permissions.title")} subtitle={t("computerUse.permissions.description")}>
          <Switch checked={granted} aria-label={t("computerUse.permissions.title")} onClick={() => setGranted(!granted)} />
        </SettingRow>
        <SettingRow title={t("settings.tab.computerUse.title")} subtitle={t("settings.tab.computerUse.description")}>
          <span className="text-[12px] text-ink-secondary">{t("computerUse.ready.title")}</span>
        </SettingRow>
      </SettingsRows>
    </SettingsGroup>
  );
}
