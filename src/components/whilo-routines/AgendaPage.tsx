import { Globe2, Monitor } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useRuntimeCapabilities } from "@/lib/runtime-capability";
import { useTimezone, useZoneMovePrompt, type CalendarView } from "@/lib/use-timezone";
import { whiloText } from "@/lib/whilo-workflow-text";
import { useStore } from "@/state/store";
import { AgendaEmpty, AgendaLegend, AgendaPlanner, AgendaSkeleton, AgendaTimezonePrompt, AgendaToolbar, entryCounts, type AgendaStatus } from "./AgendaPlanner";

export interface AgendaPageProps {
  /** Whether the desktop-only parts of this screen render. Defaults to what the runtime detects. */
  isDesktop?: boolean;
}

export function AgendaPage({ isDesktop }: AgendaPageProps) {
  const { state, dispatch } = useStore();
  const capabilities = useRuntimeCapabilities();
  const desktop = isDesktop ?? capabilities.isDesktop;
  const timezone = useTimezone();
  const [view, setView] = useState<CalendarView>("week");
  const [anchor, setAnchor] = useState(() => Date.now());
  const [movedCount, setMovedCount] = useState<number | null>(null);

  const routinesInZone = useCallback(
    (zone: string) => {
      const zoneName = zone.replaceAll("_", " ");
      return state.routines.filter((routine) => zoneName.length > 0 && (routine.warning ?? "").includes(zoneName)).length;
    },
    [state.routines],
  );
  const prompt = useZoneMovePrompt("this-computer", routinesInZone);

  const counts = useMemo(
    () =>
      entryCounts(
        state.routines.flatMap<{ status: AgendaStatus }>((routine) => {
          const latest = state.routineRuns.find((run) => run.routineId === routine.id);
          if (!routine.enabled) return [{ status: "paused" }];
          if (!latest) return [{ status: "active" }];
          if (latest.status === "failed" || latest.status === "missed" || latest.status === "waiting") return [{ status: "failed" }];
          if (latest.status === "completed") return [{ status: "completed" }];
          return [{ status: "active" }];
        }),
      ),
    [state.routineRuns, state.routines],
  );

  const move = useCallback(
    (direction: -1 | 1) => {
      setAnchor((current) => {
        const date = new Date(current);
        if (view === "month") date.setMonth(date.getMonth() + direction);
        else if (view === "week") date.setDate(date.getDate() + direction * 7);
        else date.setDate(date.getDate() + direction);
        return date.getTime();
      });
    },
    [view],
  );

  const openRoutine = useCallback(
    (routineId: string) => {
      const routine = state.routines.find((candidate) => candidate.id === routineId);
      if (!routine) return;
      dispatch({ type: "showRoutines", section: "schedule", botId: routine.botId, routineId: routine.id });
    },
    [dispatch, state.routines],
  );

  const hasRoutines = state.routines.length > 0;
  const loading = state.routinesLoadState === "loading" && !hasRoutines;

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-app text-ink animate-workspace-in">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-hairline/35 px-6 py-3 max-md:pl-12">
        <h1 className="text-[17px] font-semibold">{whiloText("whiloAgenda.title")}</h1>
        <span className="hidden items-center gap-1.5 text-[12px] text-ink-secondary lg:flex">
          <Globe2 size={12} aria-hidden />
          {whiloText("whiloAgenda.subtitle", { zone: timezone.label })}
        </span>
        {!desktop && (
          <span className="flex items-center gap-1.5 rounded-full border border-hairline/50 bg-inset px-2.5 py-1 text-[11px] text-ink-secondary">
            <Monitor size={12} aria-hidden />
            {whiloText("whiloAgenda.desktopOnly")}
          </span>
        )}
        <div className="ml-auto flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto">
          <AgendaToolbar
            view={view}
            onChangeView={(next) => {
              setView(next);
              setAnchor((current) => current);
            }}
            anchor={anchor}
            onMove={move}
            onToday={() => setAnchor(Date.now())}
            timezone={timezone}
            onOpenFeed={() => dispatch({ type: "showRoutines", section: "logs" })}
            desktop={desktop}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {movedCount !== null && (
          <p role="status" className="mb-3 rounded-xl border border-hairline/40 bg-inset px-3 py-2 text-[12px] text-ink-secondary">
            {whiloText("whiloAgenda.zoneMoved", { count: movedCount, zone: timezone.label })}
          </p>
        )}
        {prompt.request && (
          <div className="mb-3">
            <AgendaTimezonePrompt
              from={prompt.request.from}
              to={prompt.request.to}
              count={prompt.request.count}
              scope={desktop ? "this computer" : "this server"}
              onAccept={() => {
                setMovedCount(prompt.request?.count ?? 0);
                prompt.accept();
              }}
              onKeep={prompt.dismiss}
            />
          </div>
        )}
        {loading ? (
          <AgendaSkeleton />
        ) : !hasRoutines ? (
          <AgendaEmpty onCreate={() => dispatch({ type: "showRoutines", section: "schedule", view: "list" })} />
        ) : (
          <div className="grid gap-4">
            <AgendaPlanner
              timezone={timezone}
              routines={state.routines}
              runs={state.routineRuns}
              anchor={anchor}
              view={view}
              onOpenRoutine={openRoutine}
              onOpenDay={(at) => {
                setAnchor(at);
                setView("day");
              }}
            />
            <div className={cn("rounded-xl border border-hairline/40 bg-card px-3 py-2.5")}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{t("routines.logsHint")}</p>
              <AgendaLegend counts={counts} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
