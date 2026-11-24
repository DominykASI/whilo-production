import { BarChart3, CalendarClock, Cloud, FolderOpen, Gauge, Globe, LayoutGrid, Library, ListTodo, Package, Puzzle, Sheet, Sparkles, UsersRound, Workflow, Zap } from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { useAppTriggers } from "@/lib/app-triggers";
import { automationsFrom, hasUnseenProblemRun } from "@/lib/automations";
import { cn } from "@/lib/cn";
import { useCloudFilesReady } from "@/lib/cloud-files";
import { t } from "@/lib/i18n";
import { useAdvancedMode } from "@/lib/interface-mode";
import { useWebPanels } from "@/lib/web-panel-preferences";
import { useSidebarToolsLayout, type SidebarDensity } from "@/lib/sidebar-preferences";
import { useStore } from "@/state/store";
import { useWhiloMode, toolAllowedInMode } from "@/lib/whilo-mode";

import { SidebarSectionHeader } from "./SidebarSectionHeader";
import { UpdateIndicator } from "./UpdateIndicator";


function NavRow({
  id,
  label,
  icon,
  active = false,
  attention = false,
  iconsOnly,
  rail = false,
  tourId,
  onClick,
}: {
  id: string;
  label: string;
  icon: (active: boolean) => ReactNode;
  active?: boolean;
  attention?: boolean;
  iconsOnly: boolean;
  rail?: boolean;
  tourId?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-tour={tourId}
      data-sidebar-nav={id}
      onClick={onClick}
      aria-label={iconsOnly ? label : undefined}
      title={iconsOnly ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center rounded-xl transition-colors",
        rail ? "size-9 shrink-0 justify-center" : iconsOnly ? "mx-auto size-[46px] shrink-0 justify-center" : "w-full min-h-9 gap-3 px-3 py-1.5 text-left",
        active ? "bg-raised text-ink" : "text-ink hover:bg-raised/50",
      )}
    >
      {icon(active)}
      {!iconsOnly && <span className="flex-1 truncate text-[14px] font-medium leading-5">{label}</span>}
      {attention && (
        <span
          data-testid="routines-attention"
          className={cn("size-2 shrink-0 rounded-full bg-danger", iconsOnly && (rail ? "absolute right-1 top-1" : "absolute right-2 top-2"))}
        />
      )}
    </button>
  );
}

export function SidebarAppsButton() {
  const { state, dispatch } = useStore();
  const label = t("sidebar.nav.apps");
  return (
    <button
      type="button"
      data-tour="nav-apps"
      data-sidebar-nav="apps"
      onClick={() => dispatch({ type: "togglePlugins", open: true })}
      aria-label={label}
      title={label}
      aria-pressed={state.pluginsOpen}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
        state.pluginsOpen ? "bg-raised text-accent" : "text-ink-secondary hover:bg-raised/50 hover:text-ink",
      )}
    >
      <Puzzle size={18} />
    </button>
  );
}

/** An unseen failed run of an automation the Automations page lists (the same list, so opening it clears the dot), or an app trigger in trouble. */
export function useAutomationsNeedYou(): boolean {
  const { state } = useStore();
  const appTriggers = useAppTriggers();
  const routinesOnly = typeof window !== "undefined" && window.ogb?.remoteClient?.active === true;
  const unseenProblem = useMemo(() => hasUnseenProblemRun(automationsFrom({
    routines: state.routines, webhooks: routinesOnly ? [] : state.webhooks, appTriggers: appTriggers.triggers, runs: state.routineRuns, bots: state.bots,
  })), [state.routines, state.webhooks, appTriggers.triggers, state.routineRuns, state.bots, routinesOnly]);
  return unseenProblem || appTriggers.triggers.some((trigger) => trigger.enabled && trigger.problem);
}

export function SidebarBottomButtons() {
  return (
    <div data-sidebar-bottom-buttons="" className="flex shrink-0 items-center gap-0.5">
      <SidebarAppsButton />
      <UpdateIndicator />
    </div>
  );
}

export function SidebarFooterNav({
  density,
  rail = false,
  collapsed = false,
  onToggleCollapsed,
}: {
  density: SidebarDensity;
  rail?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const { state, dispatch } = useStore();
  const advanced = useAdvancedMode();
  const whiloMode = useWhiloMode();
  const showTool = (id: string) => toolAllowedInMode(id, whiloMode);
  const webPanels = useWebPanels();
  const iconsOnly = density === "icons";
  const toolsLayout = useSidebarToolsLayout();
  const toolbar = advanced && !iconsOnly && toolsLayout === "toolbar";
  const iconSize = iconsOnly && !rail ? 20 : 18;
  const tone = (active: boolean) => (active ? "text-accent" : "text-ink-secondary");
  const automationsNeedYou = useAutomationsNeedYou();
  const automationsRow = <NavRow
    id="automations"
    label={t("sidebar.nav.automations")}
    tourId="nav-automations"
    iconsOnly={iconsOnly || toolbar}
    active={state.activeView === "routines"}
    attention={automationsNeedYou}
    icon={(active) => <Zap size={iconSize} className={tone(active)} />}
    onClick={() => dispatch({ type: "showRoutines", view: "list" })}
  />;
  const filesRow = useCloudFilesReady() && showTool("files") && <NavRow
    id="files"
    label={t("sidebar.nav.files")}
    iconsOnly={iconsOnly}
    rail={rail}
    active={state.activeView === "files"}
    icon={(active) => <FolderOpen size={iconSize} className={tone(active)} />}
    onClick={() => dispatch({ type: "showFiles" })}
  />;
  if (!advanced && !iconsOnly) return null;
  const appsRow = iconsOnly && <NavRow
    id="apps"
    label={t("sidebar.nav.apps")}
    tourId="nav-apps"
    iconsOnly={iconsOnly}
    rail={rail}
    active={state.pluginsOpen}
    icon={(active) => <Puzzle size={iconSize} className={tone(active)} />}
    onClick={() => dispatch({ type: "togglePlugins", open: true })}
  />;
  if (rail) return <nav data-tour="tools" aria-label={t("sidebar.tools")} className="flex flex-col items-center gap-0.5">{appsRow}</nav>;

  const rows = (
    <>
      {showTool("automations") && automationsRow}
      {appsRow}
      {(advanced || iconsOnly) && showTool("team-map") && (
        <NavRow
          id="team-map"
          label={t("sidebar.nav.teamMap")}
          tourId="team-tools"
          iconsOnly={iconsOnly || toolbar}
          active={state.activeView === "team-map"}
          icon={(active) => <UsersRound size={iconSize} className={tone(active)} />}
          onClick={() => dispatch({ type: "showTeamMap" })}
        />
      )}
      {advanced && (
        <>
          {showTool("whiteboard") && <NavRow
            id="whiteboard"
            label={t("sidebar.nav.whiteboard")}
            tourId="whilo-whiteboard"
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "whiteboard"}
            icon={(active) => <LayoutGrid size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "whiteboard" })}
          />}
          {showTool("workflows") && <NavRow
            id="workflows"
            label={t("sidebar.nav.workflows")}
            tourId="whilo-workflows"
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "workflows"}
            icon={(active) => <Workflow size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "workflows" })}
          />}
          {showTool("agenda") && <NavRow
            id="agenda"
            label={t("sidebar.nav.agenda")}
            tourId="whilo-agenda"
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "agenda"}
            icon={(active) => <CalendarClock size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "agenda" })}
          />}
          {showTool("tasks") && <NavRow
            id="tasks"
            label={t("sidebar.nav.tasks")}
            tourId="whilo-tasks"
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "tasks"}
            icon={(active) => <ListTodo size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "tasks" })}
          />}
          {showTool("usage") && <NavRow
            id="usage"
            label={t("sidebar.nav.usage")}
            tourId="whilo-usage"
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "usage"}
            icon={(active) => <Gauge size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "usage" })}
          />}
          {showTool("library") && <NavRow
            id="library"
            label={t("sidebar.nav.library")}
            tourId="whilo-library"
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "library"}
            icon={(active) => <Library size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "library" })}
          />}
          {showTool("sheets") && <NavRow
            id="sheets"
            label={t("sidebar.nav.sheets")}
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "sheets"}
            icon={(active) => <Sheet size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "sheets" })}
          />}
          {showTool("whilo-data") && <NavRow
            id="whilo-data"
            label={t("sidebar.nav.data")}
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "whilo-data"}
            icon={(active) => <BarChart3 size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "whilo-data" })}
          />}
          {showTool("plans") && <NavRow
            id="plans"
            label={t("sidebar.nav.plans")}
            tourId="whilo-plans"
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "plans"}
            icon={(active) => <Sparkles size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "plans" })}
          />}
          {showTool("marketplace") && <NavRow
            id="marketplace"
            label={t("sidebar.nav.marketplace")}
            tourId="whilo-marketplace"
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "marketplace"}
            icon={(active) => <Package size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "marketplace" })}
          />}
          {showTool("server-cloud") && <NavRow
            id="server-cloud"
            label={t("sidebar.nav.serverCloud")}
            tourId="whilo-server-cloud"
            iconsOnly={iconsOnly || toolbar}
            active={state.activeView === "server-cloud"}
            icon={(active) => <Cloud size={iconSize} className={tone(active)} />}
            onClick={() => dispatch({ type: "showSurface", surface: "server-cloud" })}
          />}
        </>
      )}
      {filesRow}
      {advanced && webPanels.map((panel) => (
        <NavRow
          key={panel.id}
          id={`web-panel-${panel.id}`}
          label={panel.name}
          iconsOnly={iconsOnly || toolbar}
          active={state.activeView === "web-panel" && state.webPanelId === panel.id}
          icon={(active) => <Globe size={iconSize} className={tone(active)} />}
          onClick={() => dispatch({ type: "showWebPanel", id: panel.id })}
        />
      ))}
    </>
  );

  if (iconsOnly) {
    return <nav data-tour="tools" aria-label={t("sidebar.tools")} className="flex flex-col items-center gap-1">{rows}</nav>;
  }
  return (
    <div data-tour="tools">
      <SidebarSectionHeader
        name={t("sidebar.tools")}
        collapsed={collapsed}
        alert={collapsed && automationsNeedYou}
        onToggle={onToggleCollapsed}
        reorderable={false}
        dragging={false}
      />
      {!collapsed && <nav aria-label={t("sidebar.tools")} className={toolbar ? "flex flex-row gap-1" : "flex flex-col gap-0.5"}>{rows}</nav>}
    </div>
  );
}
