import { useState } from "react";
import { t } from "@/lib/i18n";
import { RangeRow } from "./LocalSettingsRow";
import { SettingRow, SettingsGroup, SettingsRows, Switch } from "../SettingsPrimitives";

const SIZE_MIN = 60;
const SIZE_MAX = 130;
const SIZE_STEP = 5;
const SIZE_DEFAULT = 100;

export function DynamicIslandTab() {
  const [shown, setShown] = useState(false);
  const [idle, setIdle] = useState(false);
  const [displays, setDisplays] = useState(false);
  const [haptics, setHaptics] = useState(false);
  const [later, setLater] = useState(true);
  const [width, setWidth] = useState(SIZE_DEFAULT);
  const [height, setHeight] = useState(SIZE_DEFAULT);
  const isDefaultSize = width === SIZE_DEFAULT && height === SIZE_DEFAULT;

  return (
    <>
      <SettingsGroup label={t("settings.notch.title")} block="notch">
        <SettingsRows>
          <SettingRow title={t("settings.notch.show.title")} subtitle={t("settings.notch.show.description")}>
            <Switch checked={shown} aria-label={t("settings.notch.show.title")} onClick={() => setShown(!shown)} />
          </SettingRow>
          <SettingRow title={t("settings.notch.idle.title")} subtitle={t("settings.notch.idle.description")}>
            <Switch checked={idle} disabled={!shown} aria-label={t("settings.notch.idle.title")} onClick={() => setIdle(!idle)} />
          </SettingRow>
          <SettingRow title={t("settings.notch.displays.title")} subtitle={t("settings.notch.displays.description")}>
            <Switch checked={displays} disabled={!shown} aria-label={t("settings.notch.displays.title")} onClick={() => setDisplays(!displays)} />
          </SettingRow>
          <SettingRow title={t("settings.notch.haptics.title")} subtitle={t("settings.notch.haptics.description")}>
            <Switch checked={haptics} disabled={!shown} aria-label={t("settings.notch.haptics.title")} onClick={() => setHaptics(!haptics)} />
          </SettingRow>
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup
        label={t("settings.notch.servers.title")}
        block="notch-servers"
        footnote={t("settings.notch.servers.description")}
      >
        <SettingsRows>
          <SettingRow title={t("settings.notch.servers.later")}>
            <Switch checked={later} disabled={!shown} aria-label={t("settings.notch.servers.later")} onClick={() => setLater(!later)} />
          </SettingRow>
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup
        label={t("settings.notch.size.title")}
        block="notch-size"
        actions={
          <button
            type="button"
            className="ui-button ui-button-sm"
            disabled={isDefaultSize}
            onClick={() => {
              setWidth(SIZE_DEFAULT);
              setHeight(SIZE_DEFAULT);
            }}
          >
            {t("settings.notch.size.reset")}
          </button>
        }
        footnote={t("settings.notch.size.description")}
      >
        <SettingsRows>
          <RangeRow labelKey="settings.notch.size.width" value={width} onChange={setWidth} min={SIZE_MIN} max={SIZE_MAX} step={SIZE_STEP} disabled={!shown} />
          <RangeRow labelKey="settings.notch.size.height" value={height} onChange={setHeight} min={SIZE_MIN} max={SIZE_MAX} step={SIZE_STEP} disabled={!shown} />
        </SettingsRows>
      </SettingsGroup>
    </>
  );
}
