import { AlertTriangle, ArrowUpRight, CalendarClock, CircleAlert, Loader2, Monitor, Pause, Play, Repeat2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BotAvatar } from "@/components/Avatar";
import { Switch } from "@/components/SettingsPrimitives";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { useRuntimeCapabilities } from "@/lib/runtime-capability";
import { routineScheduleSummary } from "@/lib/routine-schedule-text";
import { latestRoutineRun, partlyDone, routineHeldNote, routineRunLabel, routineRunText, routineRunTime } from "@/lib/routine-display";
import { whiloText } from "@/lib/whilo-workflow-text";
import type { Routine, RoutineRun } from "@/lib/routines";
import { useStore, type Bot } from "@/state/store";

type Filter = "all" | "active" | "paused" | "problems";

function statusKey(routine: Routine, latest: RoutineRun | undefined): { key: string; tone: string } {
  if (!routine.enabled) return { key: "whiloRoutines.paused", tone: "text-ink-secondary" };
  if (latest && (latest.status === "failed" || latest.status === "missed")) return { key: partlyDone(latest) ? "whiloRoutines.statusPartial" : "whiloRoutines.statusFailed", tone: "text-danger" };
  if (latest && latest.status === "running") return { key: "whiloRoutines.statusRunning", tone: "text-accent" };
  if (routine.schedule.type === "once" && routine.nextRunAt === null && routine.schedule.at <= Date.now()) {
    return { key: "whiloRoutines.finished", tone: "text-ink-secondary" };
  }
  return { key: "whiloRoutines.enabled", tone: "text-success" };
}

function runTone(latest: RoutineRun | undefined): string {
  if (!latest) return "text-ink-secondary";
  if (latest.status === "completed") return "text-success";
  if (latest.status === "failed" || latest.status === "missed") return partlyDone(latest) ? "text-warning" : "text-danger";
  if (latest.status === "running") return "text-accent";
  if (latest.status === "waiting") return "text-warning";
  return "text-ink-secondary";
}

function timeText(at: number | null | undefined): string {
  if (at === null || at === undefined) return "—";
  return new Date(at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export interface RoutinesListProps {
  isDesktop?: boolean;
  onOpenRoutine?: ((routine: Routine) => void) | undefined;
  onOpenLogs?: ((routine: Routine) => void) | undefined;
  onCreate?: (() => void) | undefined;
}

export function RoutinesList({ isDesktop, onOpenRoutine, onOpenLogs, onCreate }: RoutinesListProps) {
  const { state, dispatch } = useStore();
  const capabilities = useRuntimeCapabilities();
  const desktop = isDesktop ?? capabilities.isDesktop;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const bots = state.bots;
  const botOf = (botId: string): Bot | undefined => bots.find((bot) => bot.id === botId);

  const rows = useMemo(() => {
    const withRun = state.routines.map((routine) => ({ routine, latest: latestRoutineRun(routine.id, state.routineRuns) }));
    const wanted = query.trim().toLocaleLowerCase();
    const filtered = withRun.filter(({ routine, latest }) => {
      if (wanted && !`${routine.name} ${botOf(routine.botId)?.name ?? ""}`.toLocaleLowerCase().includes(wanted)) return false;
      if (filter === "active" && !routine.enabled) return false;
      if (filter === "paused" && routine.enabled) return false;
      if (filter === "problems" && !(latest && (latest.status === "failed" || latest.status === "missed" || latest.status === "waiting"))) return false;
      return true;
    });
    return filtered.sort((left, right) => Number(right.routine.enabled) - Number(left.routine.enabled) || (left.routine.nextRunAt ?? Number.POSITIVE_INFINITY) - (right.routine.nextRunAt ?? Number.POSITIVE_INFINITY) || left.routine.name.localeCompare(right.routine.name));
  }, [botOf, filter, query, state.routineRuns, state.routines]);

  const toggle = (routine: Routine) => {
    dispatch({ type: "updateRoutine", routineId: routine.id, patch: { enabled: !routine.enabled } });
  };

  const runNow = (routine: Routine) => {
    if (!desktop) {
      setNotice(whiloText("whiloRoutines.desktopOnly"));
      return;
    }
    setBusyId(routine.id);
    dispatch({
      type: "runRoutine",
      routineId: routine.id,
      onSettled: () => setBusyId(null),
    });
  };

  const loading = state.routinesLoadState === "loading" && state.routines.length === 0;

  return (
    <section className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1100px] p-4 sm:p-6">
        <header className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[19px] font-semibold tracking-tight text-ink">{whiloText("whiloRoutines.title")}</h1>
            <p className="mt-0.5 text-[12.5px] text-ink-secondary">
              {whiloText("whiloRoutines.subtitle", { count: state.routines.length, bots: new Set(state.routines.map((routine) => routine.botId)).size })}
            </p>
          </div>
          <label className="relative flex h-8 items-center rounded-lg border border-hairline/45 bg-inset pl-8 pr-2.5">
            <span className="sr-only">{whiloText("whiloRoutines.search")}</span>
            <Search size={13} className="pointer-events-none absolute left-2.5 text-ink-tertiary" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={whiloText("whiloRoutines.search")}
              type="search"
              className="w-[180px] bg-transparent text-[12px] text-ink outline-none placeholder:text-ink-tertiary"
            />
          </label>
          <div role="group" aria-label={whiloText("whiloRoutines.title")} className="flex items-center rounded-lg border border-hairline/50 bg-panel p-0.5">
            {(["all", "active", "paused", "problems"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={filter === option}
                onClick={() => setFilter(option)}
                className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium", filter === option ? "bg-raised text-ink shadow-sm" : "text-ink-secondary hover:text-ink")}
              >
                {whiloText(option === "all" ? "whiloRoutines.filterAll" : option === "active" ? "whiloRoutines.filterActive" : option === "paused" ? "whiloRoutines.filterPaused" : "whiloRoutines.filterProblems")}
              </button>
            ))}
          </div>
          {onCreate && (
            <button type="button" onClick={onCreate} className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[12.5px] font-semibold text-accent-ink hover:brightness-110">
              <Repeat2 size={14} aria-hidden />
              {whiloText("whiloRoutines.newRoutine")}
            </button>
          )}
        </header>

        {!desktop && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-hairline/40 bg-inset px-3 py-2 text-[12px] leading-relaxed text-ink-secondary">
            <Monitor size={13} className="mt-0.5 shrink-0" aria-hidden />
            {whiloText("whiloRoutines.desktopOnly")}
          </p>
        )}

        {notice && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-hairline/40 bg-inset px-3 py-2 text-[12px] text-ink-secondary">
            <AlertTriangle size={13} className="shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">{notice}</span>
            <button type="button" onClick={() => setNotice(null)} className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] hover:bg-raised">
              {t("common.close")}
            </button>
          </p>
        )}

        {loading && (
          <p role="status" className="mt-4 flex items-center gap-2 text-[12.5px] text-ink-secondary">
            <Loader2 size={14} className="animate-spin" aria-hidden />
            {whiloText("whiloRoutines.loading")}
          </p>
        )}
        {state.routinesLoadState === "error" && (
          <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            <CircleAlert size={14} className="shrink-0" aria-hidden />
            {whiloText("whiloRoutines.loadError")}
          </p>
        )}

        {!loading && rows.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-hairline/50 p-10 text-center">
            <Repeat2 size={22} className="mx-auto mb-3 text-ink-tertiary" aria-hidden />
            <h2 className="text-[15px] font-semibold text-ink">{whiloText("whiloRoutines.emptyTitle")}</h2>
            <p className="mx-auto mt-1 max-w-[420px] text-[12.5px] leading-relaxed text-ink-secondary">{whiloText("whiloRoutines.emptyBody")}</p>
            {onCreate && (
              <button type="button" onClick={onCreate} className="mt-5 rounded-xl bg-accent px-4 py-2.5 text-[12.5px] font-semibold text-accent-ink hover:brightness-110">
                {whiloText("whiloRoutines.newRoutine")}
              </button>
            )}
          </div>
        )}

        <ul aria-label={whiloText("whiloRoutines.title")} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ routine, latest }) => {
            const bot = botOf(routine.botId);
            const status = statusKey(routine, latest);
            const asked = latest && (latest.attention ? "attention" : latest.error ? "error" : latest.output ? "output" : null);
            return (
              <li key={routine.id} className="flex flex-col rounded-2xl border border-hairline/40 bg-card p-3.5">
                <div className="flex items-start gap-2.5">
                  {bot ? <BotAvatar bot={bot} size={34} animated={latest?.status === "running"} state={latest?.status === "running" ? "working" : routine.enabled ? "idle" : "sleeping"} /> : <span aria-hidden className="size-[34px] shrink-0 rounded-full bg-inset" />}
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: "showRoutines", section: "schedule", botId: routine.botId, routineId: routine.id });
                        onOpenRoutine?.(routine);
                      }}
                      className="block w-full truncate text-left text-[14px] font-semibold text-ink hover:text-accent-text"
                    >
                      {routine.name}
                    </button>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-secondary">{bot?.name ?? t("routines.unavailableBot")}</p>
                  </div>
                  <Switch
                    checked={routine.enabled}
                    aria-label={whiloText(routine.enabled ? "whiloRoutines.disable" : "whiloRoutines.enable", { name: routine.name })}
                    onClick={() => toggle(routine)}
                    className="mt-0.5 shrink-0"
                  />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11.5px]">
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloRoutines.card.schedule")}</dt>
                    <dd className="mt-0.5 flex items-start gap-1 text-ink">
                      <CalendarClock size={12} className="mt-[3px] shrink-0 text-ink-tertiary" aria-hidden />
                      <span className="line-clamp-2">{routineScheduleSummary(routine.schedule, false)}</span>
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloRoutines.card.status")}</dt>
                    <dd className={cn("mt-0.5 font-medium", status.tone)}>{whiloText(status.key)}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloRoutines.card.lastRun")}</dt>
                    <dd className="mt-0.5">
                      {latest ? (
                        <span className={cn("font-medium", runTone(latest))}>{routineRunLabel(latest)}</span>
                      ) : (
                        <span className="text-ink-secondary">{whiloText("whiloRoutines.never")}</span>
                      )}
                      {latest && <span className="mt-0.5 block text-[11px] text-ink-tertiary">{timeText(routineRunTime(latest))}</span>}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">{whiloText("whiloRoutines.card.nextRun")}</dt>
                    <dd className="mt-0.5">
                      {routine.enabled && routine.nextRunAt !== null ? (
                        <span className="text-ink">{whiloText("whiloRoutines.nextAt", { time: timeText(routine.nextRunAt) })}</span>
                      ) : (
                        <span className="text-ink-secondary">{whiloText(routine.enabled ? "whiloRoutines.noNext" : "whiloRoutines.paused")}</span>
                      )}
                    </dd>
                  </div>
                </dl>

                {asked && latest && (
                  <p className={cn("mt-2.5 line-clamp-3 whitespace-pre-wrap text-[11.5px] leading-relaxed", latest.error ? "text-danger" : latest.attention ? "text-warning" : "text-ink-secondary")}>
                    {routineRunText(latest, asked)}
                  </p>
                )}
                {routine.heldFor && <p className="mt-2 text-[11.5px] leading-relaxed text-ink-secondary">{routineHeldNote(routine)}</p>}
                {!!routine.failureStreak && <p className="mt-2 text-[11.5px] text-danger">{t("routines.failureStreak", { count: routine.failureStreak })}</p>}

                <div className="mt-3 flex items-center gap-1.5 border-t border-hairline/30 pt-3">
                  <button
                    type="button"
                    onClick={() => runNow(routine)}
                    disabled={busyId === routine.id}
                    className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-[11.5px] font-semibold text-accent-ink hover:brightness-110 disabled:opacity-50"
                  >
                    {busyId === routine.id ? <Loader2 size={12} className="animate-spin" aria-hidden /> : <Play size={12} aria-hidden />}
                    {whiloText(busyId === routine.id ? "whiloRoutines.starting" : "whiloRoutines.runNow")}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(routine)}
                    className="flex items-center gap-1.5 rounded-lg border border-hairline/50 bg-control px-2.5 py-1.5 text-[11.5px] font-medium text-ink hover:bg-raised-hover"
                  >
                    {routine.enabled ? <Pause size={12} aria-hidden /> : <Play size={12} aria-hidden />}
                    {t(routine.enabled ? "routines.pause" : "routines.resume")}
                  </button>
                  {onOpenLogs && (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: "showRoutines", section: "logs", botId: routine.botId, routineId: routine.id });
                        onOpenLogs(routine);
                      }}
                      aria-label={whiloText("whiloRoutines.openLogs", { name: routine.name })}
                      className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11.5px] text-ink-secondary hover:bg-raised hover:text-ink"
                    >
                      {t("routines.logs")}
                      <ArrowUpRight size={12} aria-hidden />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
