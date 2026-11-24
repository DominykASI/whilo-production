import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { SETTINGS_TABS, settingsTab, type SettingsTabId } from "./tabs";
import { GeneralTab } from "./GeneralTab";
import { AgentsTab } from "./AgentsTab";
import { ProfileTab } from "./ProfileTab";
import { NotificationsTab } from "./NotificationsTab";
import { VoiceTab } from "./VoiceTab";
import { DynamicIslandTab } from "./DynamicIslandTab";
import { AgentDockTab } from "./AgentDockTab";
import { ComputerUseTab } from "./ComputerUseTab";
import { BillingTab } from "./BillingTab";
import { MobileConnectTab } from "./MobileConnectTab";
import { UpdatesTab } from "./UpdatesTab";

const PANELS: Record<SettingsTabId, ComponentType> = {
  general: GeneralTab,
  agents: AgentsTab,
  profile: ProfileTab,
  notifications: NotificationsTab,
  voice: VoiceTab,
  "dynamic-island": DynamicIslandTab,
  "agent-dock": AgentDockTab,
  "computer-use": ComputerUseTab,
  billing: BillingTab,
  "mobile-connect": MobileConnectTab,
  updates: UpdatesTab,
};

function tabAvailable(id: SettingsTabId, desktop: boolean): boolean {
  const def = settingsTab(id);
  if (!def.requiresDesktop) return true;
  return desktop;
}

export function SettingsTabsShell({ initialTab = "general" }: { initialTab?: SettingsTabId }) {
  const desktop = typeof window !== "undefined" && Boolean(window.ogb);
  const [active, setActive] = useState<SettingsTabId>(initialTab);
  const tabRefs = useRef(new Map<SettingsTabId, HTMLButtonElement>());

  const visible = SETTINGS_TABS.filter((entry) => tabAvailable(entry.id, desktop));
  const shown = visible.some((entry) => entry.id === active) ? active : (visible[0]?.id ?? "general");
  const Panel = PANELS[shown];
  const def = settingsTab(shown);

  useEffect(() => {
    tabRefs.current.get(shown)?.scrollIntoView({ block: "nearest" });
  }, [shown]);

  const onNavKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const index = visible.findIndex((entry) => entry.id === shown);
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % visible.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + visible.length) % visible.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = visible.length - 1;
    else return;
    event.preventDefault();
    const target = visible[next];
    if (!target) return;
    setActive(target.id);
    tabRefs.current.get(target.id)?.focus();
  };

  return (
    <div data-settings-tabs-shell className="flex min-h-0 gap-4 max-md:flex-col">
      <nav
        aria-label={t("settings.sections.label")}
        data-settings-tabs-nav
        onKeyDown={onNavKeyDown}
        className="flex w-[190px] shrink-0 flex-col gap-0.5 max-md:w-full max-md:flex-row max-md:overflow-x-auto"
      >
        <div role="tablist" aria-orientation="vertical" className="flex flex-col gap-0.5 max-md:flex-row">
          {visible.map((entry) => {
            const Icon = entry.icon;
            const current = entry.id === shown;
            return (
              <button
                key={entry.id}
                ref={(element) => {
                  if (element) tabRefs.current.set(entry.id, element);
                  else tabRefs.current.delete(entry.id);
                }}
                type="button"
                role="tab"
                id={`settings-tab-${entry.id}`}
                data-settings-tab={entry.id}
                aria-selected={current}
                aria-controls={`settings-tabpanel-${entry.id}`}
                tabIndex={current ? 0 : -1}
                onClick={() => setActive(entry.id)}
                className={cn(
                  "flex h-8 shrink-0 cursor-pointer items-center gap-[9px] rounded-lg px-[9px] text-left text-[13px] text-ink transition-colors motion-reduce:transition-none",
                  current ? "bg-ink/[0.08]" : "hover:bg-ink/[0.06]",
                )}
              >
                <Icon size={15} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{t(entry.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div
        role="tabpanel"
        id={`settings-tabpanel-${shown}`}
        aria-labelledby={`settings-tab-${shown}`}
        tabIndex={0}
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-7 overflow-y-auto outline-none"
      >
        <header className="flex flex-col gap-1">
          <h2 className="text-[17px] font-medium leading-6 tracking-[-0.008em] text-ink">{t(def.labelKey)}</h2>
          <p className="text-[13px] leading-[18px] text-ink-secondary">{t(def.descriptionKey)}</p>
        </header>
        <div className="flex flex-col gap-7">
          <Panel />
        </div>
      </div>
    </div>
  );
}
