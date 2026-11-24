import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BarChart3, Bot as BotIcon, ChevronRight, FolderOpen, Gauge, LayoutGrid, Library, ListTodo, Package, Puzzle, Server, Sheet, Sparkles, Store, UsersRound, Workflow, CalendarClock, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useCloudFilesReady } from "@/lib/cloud-files";
import { useStore } from "@/state/store";
import {
  MOBILE_NAV_CATALOG,
  MOBILE_NAV_MAX_ITEMS,
  mobileNavLabelKey,
  moveMobileNav,
  setMobileNav,
  useMobileNav,
  type MobileNavItemId,
} from "@/lib/mobile-nav-preferences";
import { useAutomationsNeedYou } from "./SidebarFooterNav";
import { useWhiloMode, toolAllowedInMode } from "@/lib/whilo-mode";

const ICONS: Record<MobileNavItemId, typeof Store> = {
  chat: BotIcon,
  workflows: Workflow,
  agenda: CalendarClock,
  tasks: ListTodo,
  usage: Gauge,
  library: Library,
  "server-cloud": Server,
  plans: Sparkles,
  automations: Zap,
  "team-map": UsersRound,
  whiteboard: LayoutGrid,
  sheets: Sheet,
  "whilo-data": BarChart3,
  files: FolderOpen,
  apps: Puzzle,
  marketplace: Package,
  store: Store,
};

interface NavAction {
  key: MobileNavItemId;
  label: string;
  icon: ReactNode;
  active: boolean;
  attention?: boolean;
  run: () => void;
}

function useNavActions(): Record<MobileNavItemId, NavAction> {
  const { state, dispatch } = useStore();
  const automationsNeedYou = useAutomationsNeedYou();
  const face = (id: MobileNavItemId): ReactNode => {
    const Icon = ICONS[id];
    return <Icon size={19} aria-hidden="true" />;
  };
  return {
    chat: { key: "chat", label: t(mobileNavLabelKey("chat")), icon: face("chat"), active: state.activeView === "chat", run: () => dispatch({ type: "showChat" }) },
    workflows: { key: "workflows", label: t("sidebar.nav.workflows"), icon: face("workflows"), active: state.activeView === "workflows", run: () => dispatch({ type: "showSurface", surface: "workflows" }) },
    agenda: { key: "agenda", label: t("sidebar.nav.agenda"), icon: face("agenda"), active: state.activeView === "agenda", run: () => dispatch({ type: "showSurface", surface: "agenda" }) },
    tasks: { key: "tasks", label: t("sidebar.nav.tasks"), icon: face("tasks"), active: state.activeView === "tasks", run: () => dispatch({ type: "showSurface", surface: "tasks" }) },
    usage: { key: "usage", label: t("sidebar.nav.usage"), icon: face("usage"), active: state.activeView === "usage", run: () => dispatch({ type: "showSurface", surface: "usage" }) },
    library: { key: "library", label: t("sidebar.nav.library"), icon: face("library"), active: state.activeView === "library", run: () => dispatch({ type: "showSurface", surface: "library" }) },
    "server-cloud": { key: "server-cloud", label: t("sidebar.nav.serverCloud"), icon: face("server-cloud"), active: state.activeView === "server-cloud", run: () => dispatch({ type: "showSurface", surface: "server-cloud" }) },
    plans: { key: "plans", label: t("sidebar.nav.plans"), icon: face("plans"), active: state.activeView === "plans", run: () => dispatch({ type: "showSurface", surface: "plans" }) },
    automations: { key: "automations", label: t("sidebar.nav.automations"), icon: face("automations"), active: state.activeView === "routines", attention: automationsNeedYou, run: () => dispatch({ type: "showRoutines", view: "list" }) },
    "team-map": { key: "team-map", label: t("sidebar.nav.teamMap"), icon: face("team-map"), active: state.activeView === "team-map", run: () => dispatch({ type: "showTeamMap" }) },
    whiteboard: { key: "whiteboard", label: t("sidebar.nav.whiteboard"), icon: face("whiteboard"), active: state.activeView === "whiteboard", run: () => dispatch({ type: "showSurface", surface: "whiteboard" }) },
    sheets: { key: "sheets", label: t("sidebar.nav.sheets"), icon: face("sheets"), active: state.activeView === "sheets", run: () => dispatch({ type: "showSurface", surface: "sheets" }) },
    "whilo-data": { key: "whilo-data", label: t("sidebar.nav.data"), icon: face("whilo-data"), active: state.activeView === "whilo-data", run: () => dispatch({ type: "showSurface", surface: "whilo-data" }) },
    files: { key: "files", label: t("sidebar.nav.files"), icon: face("files"), active: state.activeView === "files", run: () => dispatch({ type: "showFiles" }) },
    apps: { key: "apps", label: t("sidebar.nav.apps"), icon: face("apps"), active: state.pluginsOpen, run: () => dispatch({ type: "togglePlugins", open: true }) },
    marketplace: { key: "marketplace", label: t("sidebar.nav.marketplace"), icon: face("marketplace"), active: state.activeView === "marketplace", run: () => dispatch({ type: "showSurface", surface: "marketplace" }) },
    store: { key: "store", label: t("sidebar.nav.store"), icon: face("store"), active: state.pluginsOpen, run: () => dispatch({ type: "togglePlugins", open: true }) },
  };
}

function availableCatalog(filesReady: boolean): MobileNavItemId[] {
  return MOBILE_NAV_CATALOG.filter((id) => id !== "files" || filesReady);
}

export function MobileNavBar() {
  const rawItems = useMobileNav();
  const mode = useWhiloMode();
  const actions = useNavActions();
  const filesReady = useCloudFilesReady();
  const [picking, setPicking] = useState(false);
  const [dragId, setDragId] = useState<MobileNavItemId | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const visibleForMode = useCallback((id: MobileNavItemId) => {
    if (id === "chat" || id === "store" || id === "apps") return true;
    if (id === "automations") return toolAllowedInMode("automations", mode);
    if (id === "files") return toolAllowedInMode("files", mode) && filesReady;
    if (id === "agenda" || id === "workflows" || id === "tasks" || id === "usage" || id === "library" || id === "server-cloud" || id === "plans" || id === "marketplace" || id === "whiteboard" || id === "sheets" || id === "whilo-data" || id === "team-map") {
      return toolAllowedInMode(id, mode);
    }
    return mode === "dots";
  }, [filesReady, mode]);
  const slotsBase = rawItems.filter(visibleForMode);
  const slots = (slotsBase.length ? slotsBase : rawItems.filter((id) => id === "chat" || id === "marketplace" || id === "plans" || id === "store")).slice(0, MOBILE_NAV_MAX_ITEMS);
  const catalog = availableCatalog(filesReady).filter(visibleForMode);

  const apply = useCallback((next: readonly MobileNavItemId[]) => {
    const hidden = rawItems.filter((id) => !visibleForMode(id) && !next.includes(id));
    setMobileNav([...next, ...hidden]);
  }, [rawItems, visibleForMode]);

  const onSlotDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (!dragId) return;
    const next = moveMobileNav(slots, dragId, index);
    if (next.join() !== slots.join()) apply(next);
  };

  return (
    <nav
      ref={barRef}
      data-mobile-nav
      aria-label={t("mobileNav.aria")}
      className="relative flex shrink-0 items-stretch gap-1 border-t border-hairline bg-app/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl md:hidden"
    >
      <div className="flex min-w-0 flex-1 items-stretch justify-around gap-1">
        {slots.map((id, index) => {
          const action = actions[id];
          return (
            <button
              key={id}
              type="button"
              data-mobile-nav-item={id}
              aria-current={action.active ? "page" : undefined}
              aria-label={action.label}
              title={action.label}
              draggable
              onDragStart={() => setDragId(id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(event) => onSlotDragOver(event, index)}
              onDragLeave={() => undefined}
              onClick={() => action.run()}
              className={cn(
                "relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 transition-colors",
                action.active ? "bg-raised text-ink" : "text-ink-secondary hover:bg-raised/60 hover:text-ink",
                dragId === id && "opacity-50",
              )}
            >
              <span className="relative flex size-6 items-center justify-center">
                {action.icon}
                {action.attention && <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-danger ring-2 ring-app" />}
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium leading-4">{action.label}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        data-mobile-nav-edit
        aria-expanded={picking}
        aria-controls="mobile-nav-picker"
        aria-label={t("mobileNav.customize")}
        title={t("mobileNav.customize")}
        onClick={() => setPicking((open) => !open)}
        className={cn(
          "flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl transition-colors",
          picking ? "bg-accent/15 text-accent" : "text-ink-secondary hover:bg-raised/60 hover:text-ink",
        )}
      >
        <ChevronRight size={20} aria-hidden="true" className={cn("transition-transform motion-reduce:transition-none", picking && "rotate-180")} />
      </button>
      {picking && (
        <NavPicker
          catalog={catalog}
          actions={actions}
          slots={slots}
          onSlot={(id) => apply([...slots.slice(0, -1), id])}
          onSwap={(id, index) => {
            const next = [...slots];
            next[index] = id;
            apply(next);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </nav>
  );
}

function NavPicker({
  catalog,
  actions,
  slots,
  onSlot,
  onSwap,
  onClose,
}: {
  catalog: readonly MobileNavItemId[];
  actions: Record<MobileNavItemId, NavAction>;
  slots: readonly MobileNavItemId[];
  onSlot: (id: MobileNavItemId) => void;
  onSwap: (id: MobileNavItemId, index: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [target, setTarget] = useState(0);
  return (
    <div
      id="mobile-nav-picker"
      ref={ref}
      role="dialog"
      aria-label={t("mobileNav.customize")}
      className="absolute bottom-full left-2 right-2 z-50 mb-2 overflow-hidden rounded-2xl border border-hairline bg-menu p-3 shadow-2xl shadow-black/50"
    >
      <p className="px-1 pb-2 text-[12px] font-medium text-ink-secondary">{t("mobileNav.pickHint", { count: MOBILE_NAV_MAX_ITEMS })}</p>
      <div role="radiogroup" aria-label={t("mobileNav.slotAria")} className="mb-2 flex items-center gap-1.5 px-0.5">
        {Array.from({ length: MOBILE_NAV_MAX_ITEMS }, (_, index) => {
          const id = slots[index];
          const action = id ? actions[id] : null;
          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={target === index}
              aria-label={action ? action.label : t("mobileNav.slotEmpty", { number: index + 1 })}
              onClick={() => setTarget(index)}
              className={cn(
                "flex size-9 items-center justify-center rounded-xl border text-ink transition-colors",
                target === index ? "border-accent bg-accent/10" : "border-hairline hover:bg-raised",
              )}
            >
              {action ? action.icon : <span className="text-[11px] text-ink-tertiary">{index + 1}</span>}
            </button>
          );
        })}
      </div>
      <div className="grid max-h-[52vh] grid-cols-4 gap-1.5 overflow-y-auto">
        {catalog.map((id) => {
          const action = actions[id];
          const usedAt = slots.indexOf(id);
          return (
            <button
              key={id}
              type="button"
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/whilo-nav", id)}
              onDragEnd={() => undefined}
              onClick={() => (usedAt === -1 ? onSwap(id, target) : onSlot(id))}
              aria-pressed={usedAt !== -1}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition-colors",
                usedAt !== -1 ? "bg-raised text-ink" : "text-ink-secondary hover:bg-raised/60 hover:text-ink",
              )}
            >
              <span className="flex size-6 items-center justify-center">{action.icon}</span>
              <span className="w-full truncate text-[10px] leading-3">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
