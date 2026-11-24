import { useState } from "react";
import { t } from "@/lib/i18n";
import type { LocaleKey } from "@/locales";
import { SettingRow, SettingsGroup, SettingsRows, Switch } from "../SettingsPrimitives";
import { Select } from "../Select";

type Placement = "screen" | "window";
type Edge = "right" | "left";
type Display = "window" | "primary" | "all";

const DISPLAY_LABEL: Record<Display, LocaleKey> = {
  window: "settings.agentDock.display.window",
  primary: "settings.agentDock.display.primary",
  all: "settings.agentDock.display.all",
};

export function AgentDockTab() {
  const [shown, setShown] = useState(false);
  const [placement, setPlacement] = useState<Placement>("screen");
  const [display, setDisplay] = useState<Display>("primary");
  const [edge, setEdge] = useState<Edge>("right");
  const [autoHide, setAutoHide] = useState(false);
  const [results, setResults] = useState(true);
  const aboveApps = shown && placement === "screen";
  const selectClass = "cursor-pointer rounded-lg border border-hairline/40 bg-inset px-2.5 py-1 text-[13px] text-ink disabled:opacity-50";

  return (
    <>
      <SettingsGroup label={t("settings.agentDock.title")} block="agent-dock">
        <SettingsRows>
          <SettingRow title={t("settings.agentDock.show.title")} subtitle={t("settings.agentDock.show.description")}>
            <Switch checked={shown} aria-label={t("settings.agentDock.show.title")} onClick={() => setShown(!shown)} />
          </SettingRow>
          <SettingRow title={t("settings.agentDock.placement.title")} subtitle={t("settings.agentDock.placement.description")}>
            <Select
              size="sm"
              className="w-full max-w-[240px]"
              value={placement}
              disabled={!shown}
              aria-label={t("settings.agentDock.placement.title")}
              onChange={(event) => setPlacement(event.target.value as Placement)}
            >
              <option value="screen">{t("settings.agentDock.placement.screen")}</option>
              <option value="window">{t("settings.agentDock.placement.window")}</option>
            </Select>
          </SettingRow>
          <SettingRow title={t("settings.agentDock.display.title")} subtitle={t("settings.agentDock.display.description")}>
            <select
              className={selectClass}
              value={display}
              disabled={!aboveApps}
              aria-label={t("settings.agentDock.display.title")}
              onChange={(event) => setDisplay(event.target.value as Display)}
            >
              {(Object.keys(DISPLAY_LABEL) as Display[]).map((key) => (
                <option key={key} value={key}>
                  {t(DISPLAY_LABEL[key])}
                </option>
              ))}
            </select>
          </SettingRow>
          <SettingRow title={t("settings.agentDock.edge.title")} subtitle={t("settings.agentDock.edge.description")}>
            <Select
              size="sm"
              className="w-full max-w-[240px]"
              value={edge}
              disabled={!aboveApps}
              aria-label={t("settings.agentDock.edge.title")}
              onChange={(event) => setEdge(event.target.value as Edge)}
            >
              <option value="right">{t("settings.agentDock.edge.right")}</option>
              <option value="left">{t("settings.agentDock.edge.left")}</option>
            </Select>
          </SettingRow>
          <SettingRow title={t("settings.agentDock.autoHide.title")} subtitle={t("settings.agentDock.autoHide.description")}>
            <Switch checked={autoHide} disabled={!aboveApps} aria-label={t("settings.agentDock.autoHide.title")} onClick={() => setAutoHide(!autoHide)} />
          </SettingRow>
          <SettingRow title={t("settings.agentDock.results.title")} subtitle={t("settings.agentDock.results.description")}>
            <Switch checked={results} disabled={!shown} aria-label={t("settings.agentDock.results.title")} onClick={() => setResults(!results)} />
          </SettingRow>
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup label={t("settings.agentDock.agents.title")} block="agent-dock-agents">
        <SettingsRows>
          <div className="px-4 py-2.5 text-[13px] leading-[18px] text-ink-secondary">{t("settings.agentDock.agents.empty")}</div>
        </SettingsRows>
      </SettingsGroup>
    </>
  );
}
