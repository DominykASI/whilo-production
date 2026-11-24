import { Check, ChevronLeft, ChevronRight, CirclePause, Clock3, Globe2, Loader2, Monitor, X } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { routineScheduleSummary } from "@/lib/routine-schedule-text";
import { routineScheduleState } from "@/lib/routine-display";
import {
  addDaysKey,
  addMonthsKey,
  calendarDaysFor,
  clockText,
  dateOfKey,
  dayKey,
  dayText,
  gmtOffsetLabel,
  monthStartKey,
  weekStartKey,
  zoneLabel,
  type CalendarView,
  type UseTimezone,
} from "@/lib/use-timezone";
import { whiloText } from "@/lib/whilo-workflow-text";
import type { Routine, RoutineRun, RoutineRunStatus, RoutineSchedule } from "@/lib/routines";

export type AgendaStatus = "active" | "paused" | "completed" | "failed";

export interface AgendaEntry {
  id: string;
  routineId: string;
  routineName: string;
  botId: string;
  at: string;
  durationMinutes: number;
  status: AgendaStatus;
  scheduleLabel: string;
}

const DAY_MS = 86_400_000;
const DAY_CELL_LIMIT = { week: 4, month: 3 } as const;
const UPCOMING_LIMIT = 6;
const ROUTINE_MARKER_MINUTES = 30;

function calendarStatus(status: RoutineRunStatus, active: boolean): AgendaStatus {
  switch (status) {
    case "queued":
    case "running":
      return "active";
    case "completed":
    case "cancelled":
      return "completed";
    case "failed":
    case "missed":
    case "waiting":
      return "failed";
    default:
      return active ? "active" : "paused";
  }
}

function matchesWeekday(schedule: RoutineSchedule, at: number): boolean {
  const day = new Date(at).getDay();
  if (schedule.type === "daily") return schedule.weekdays.includes(day);
  if (schedule.type === "interval") return !schedule.weekdays || schedule.weekdays.includes(day);
  return true;
}

function atWallClock(day: number, time: string): number {
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  const date = new Date(day);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

export function buildAgendaEntries(
  input: { routines: readonly Routine[]; runs: readonly RoutineRun[]; now: number },
  from: number,
  to: number,
): AgendaEntry[] {
  const { routines, runs, now } = input;
  const byId = new Map(routines.map((routine) => [routine.id, routine]));
  const entries: AgendaEntry[] = [];
  for (const run of runs) {
    const at = run.startedAt ?? run.scheduledFor;
    if (at < from || at >= to) continue;
    const routine = byId.get(run.routineId);
    entries.push({
      id: `run-${run.id}`,
      routineId: run.routineId,
      routineName: run.routineName,
      botId: run.botId,
      at: new Date(at).toISOString(),
      durationMinutes: run.durationMinutes ?? ROUTINE_MARKER_MINUTES,
      status: calendarStatus(run.status, routine?.enabled ?? false),
      scheduleLabel: routine ? routineScheduleSummary(routine.schedule, false) : "",
    });
  }
  const hasReceipt = (routineId: string, at: number) =>
    runs.some((run) => run.routineId === routineId && Math.abs(run.scheduledFor - at) < 60_000);
  const push = (routine: Routine, at: number) => {
    entries.push({
      id: `next-${routine.id}-${at}`,
      routineId: routine.id,
      routineName: routine.name,
      botId: routine.botId,
      at: new Date(at).toISOString(),
      durationMinutes: ROUTINE_MARKER_MINUTES,
      status: "active",
      scheduleLabel: routineScheduleSummary(routine.schedule, false),
    });
  };
  for (const routine of routines) {
    if (!routine.enabled) continue;
    const first = Math.max(from, routine.createdAt, now);
    const schedule = routine.schedule;
    if (schedule.type === "once") {
      const at = schedule.at;
      if (at >= first && at < to && !hasReceipt(routine.id, at)) push(routine, at);
      continue;
    }
    if (schedule.type === "cron" || schedule.type === "limit_reset" || schedule.type === "interval") {
      const at = routine.nextRunAt;
      if (at !== null && at >= first && at < to && !hasReceipt(routine.id, at)) push(routine, at);
      continue;
    }
    const startOfWindow = new Date(first);
    startOfWindow.setHours(0, 0, 0, 0);
    for (let day = startOfWindow.getTime(); day < to; day += DAY_MS) {
      const at = atWallClock(day, schedule.time);
      if (at >= first && at < to && matchesWeekday(schedule, at) && !hasReceipt(routine.id, at)) push(routine, at);
    }
  }
  return entries.sort((left, right) => Date.parse(left.at) - Date.parse(right.at));
}

function statusKeyOf(status: AgendaStatus): string {
  if (status === "paused") return "whiloRoutines.paused";
  if (status === "failed") return "whiloRoutines.statusFailed";
  if (status === "completed") return "whiloAgenda.completed";
  return "whiloRoutines.enabled";
}

function StatusMark({ status }: { status: AgendaStatus }) {
  if (status === "paused") return <CirclePause size={13} className="shrink-0 text-ink-tertiary" aria-hidden />;
  if (status === "failed") return <X size={13} className="shrink-0 text-danger" aria-hidden />;
  if (status === "completed") return <Check size={13} className="shrink-0 text-success" aria-hidden />;
  return <span aria-hidden className="mt-[5px] size-2 shrink-0 rounded-full bg-accent" />;
}

function AgendaChip({ entry, timezone, onOpenRoutine }: { entry: AgendaEntry; timezone: UseTimezone; onOpenRoutine: (routineId: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpenRoutine(entry.routineId)}
      aria-label={whiloText("whiloAgenda.runLabel", {
        name: entry.routineName,
        time: clockText(Date.parse(entry.at), timezone.timeZone),
        status: whiloText(statusKeyOf(entry.status)),
      })}
      className="flex w-full items-center gap-1.5 rounded-md border border-hairline/35 bg-inset px-1.5 py-1 text-left hover:bg-raised"
    >
      <StatusMark status={entry.status} />
      <span className="shrink-0 text-[10px] tabular-nums text-ink-secondary">{clockText(Date.parse(entry.at), timezone.timeZone)}</span>
      <span className="min-w-0 flex-1 truncate text-[11px] text-ink">{entry.routineName}</span>
    </button>
  );
}

function AgendaRow({ entry, timezone, when, onOpenRoutine }: { entry: AgendaEntry; timezone: UseTimezone; when?: string; onOpenRoutine: (routineId: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-hairline/35 bg-inset px-2.5 py-2">
      <button type="button" onClick={() => onOpenRoutine(entry.routineId)} className="flex min-w-0 flex-1 items-start gap-2 text-left hover:text-accent-text">
        <StatusMark status={entry.status} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">{entry.routineName}</span>
          <span className="mt-0.5 block truncate text-[11px] text-ink-secondary">
            {when ?? clockText(Date.parse(entry.at), timezone.timeZone)} · {entry.scheduleLabel} · {whiloText(statusKeyOf(entry.status))}
          </span>
        </span>
      </button>
    </div>
  );
}

export interface AgendaPlannerProps {
  timezone: UseTimezone;
  routines: readonly Routine[];
  runs: readonly RoutineRun[];
  anchor: number;
  view: CalendarView;
  onOpenRoutine: (routineId: string) => void;
  onOpenDay: (anchor: number) => void;
}

export function AgendaPlanner({ timezone, routines, runs, anchor, view, onOpenRoutine, onOpenDay }: AgendaPlannerProps) {
  const anchorKey = dayKey(anchor, timezone.timeZone);
  const days = useMemo(() => calendarDaysFor(anchorKey, view), [anchorKey, view]);
  const firstKey = days[0] ?? anchorKey;
  const lastKey = days[days.length - 1] ?? anchorKey;
  const from = dateOfKey(firstKey).getTime() - 12 * 3_600_000;
  const to = dateOfKey(lastKey).getTime() + 36 * 3_600_000;

  const entries = useMemo(
    () => buildAgendaEntries({ routines, runs, now: timezone.now }, from, to),
    [from, routines, runs, timezone.now, to],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, AgendaEntry[]>();
    for (const entry of entries) {
      const key = dayKey(Date.parse(entry.at), timezone.timeZone);
      const list = map.get(key);
      if (list) list.push(entry);
      else map.set(key, [entry]);
    }
    return map;
  }, [entries, timezone.timeZone]);

  const upcoming = useMemo(
    () => entries.filter((entry) => entry.status === "active" && Date.parse(entry.at) >= timezone.now).slice(0, UPCOMING_LIMIT),
    [entries, timezone.now],
  );

  const todayKey = dayKey(timezone.now, timezone.timeZone);
  const tomorrow = addDaysKey(todayKey, 1);

  if (view === "day") {
    const dayEntries = byDay.get(anchorKey) ?? [];
    const hours = new Map<number, AgendaEntry[]>();
    for (const entry of dayEntries) {
      const hour = new Date(Date.parse(entry.at)).getHours();
      const list = hours.get(hour);
      if (list) list.push(entry);
      else hours.set(hour, [entry]);
    }
    return (
      <div className="grid gap-4" data-agenda-view="day">
        {dayEntries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-hairline/50 p-6 text-center text-[12.5px] text-ink-secondary">{whiloText("whiloAgenda.dayEmpty")}</p>
        ) : (
          [...hours.entries()].map(([hour, group]) => (
            <section key={hour} className="grid gap-1.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">{clockText(Date.parse(group[0]!.at), timezone.timeZone, true)}</h3>
              <ul className="grid gap-1.5">
                {group.map((entry) => (
                  <li key={entry.id}>
                    <AgendaRow entry={entry} timezone={timezone} onOpenRoutine={onOpenRoutine} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4" data-agenda-view={view}>
      {view === "month" && (
        <div className="grid grid-cols-7 gap-1 text-center" aria-hidden>
          {days.slice(0, 7).map((key) => (
            <span key={key} className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">
              {dayText(dateOfKey(key).getTime(), "UTC", { weekday: "short" })}
            </span>
          ))}
        </div>
      )}
      <ol className={cn("grid list-none gap-1 p-0", view === "week" ? "grid-cols-1 sm:grid-cols-7" : "grid-cols-2 sm:grid-cols-7")}>
        {days.map((key) => {
          const dayEntries = byDay.get(key) ?? [];
          const limit = view === "month" ? DAY_CELL_LIMIT.month : DAY_CELL_LIMIT.week;
          const hidden = Math.max(0, dayEntries.length - limit);
          const outside = view === "month" && monthStartKey(key) !== monthStartKey(anchorKey);
          return (
            <li
              key={key}
              className={cn("flow-day-cell rounded-lg border border-hairline/35 bg-card/60 p-1.5", outside && "opacity-55")}
              data-today={key === todayKey ? "" : undefined}
              data-outside={outside ? "" : undefined}
              aria-current={key === todayKey ? "date" : undefined}
            >
              <h3 className="flex items-baseline justify-between px-0.5">
                <button
                  type="button"
                  onClick={() => onOpenDay(dateOfKey(key).getTime() + 12 * 3_600_000)}
                  aria-label={whiloText("whiloAgenda.openDay", { day: dayText(dateOfKey(key).getTime(), "UTC", { weekday: "long", month: "long", day: "numeric" }) })}
                  className={cn("flex items-baseline gap-1 rounded-md px-1 py-0.5 text-[11px] hover:bg-raised", key === todayKey ? "font-semibold text-accent-text" : "text-ink-secondary")}
                >
                  <span>{dayText(dateOfKey(key).getTime(), "UTC", { weekday: "short" })}</span>
                  <strong className="text-ink">{dateOfKey(key).getUTCDate()}</strong>
                </button>
              </h3>
              {dayEntries.length > 0 && (
                <ul className="mt-1 grid list-none gap-1 p-0">
                  {dayEntries.slice(0, limit).map((entry) => (
                    <li key={entry.id}>
                      <AgendaChip entry={entry} timezone={timezone} onOpenRoutine={onOpenRoutine} />
                    </li>
                  ))}
                </ul>
              )}
              {hidden > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenDay(dateOfKey(key).getTime() + 12 * 3_600_000)}
                  className="mt-1 w-full rounded-md px-1 py-0.5 text-[10.5px] text-ink-secondary hover:bg-raised"
                >
                  {whiloText("whiloAgenda.more", { count: hidden })}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <aside aria-labelledby="agenda-upcoming" className="rounded-xl border border-hairline/40 bg-card p-3">
        <h3 id="agenda-upcoming" className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
          {whiloText("whiloAgenda.upcoming")}
        </h3>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-[12.5px] text-ink-secondary">{whiloText("whiloAgenda.upcomingEmpty")}</p>
        ) : (
          <ul className="mt-2 grid list-none gap-1.5 p-0">
            {upcoming.map((entry) => {
              const key = dayKey(Date.parse(entry.at), timezone.timeZone);
              const time = clockText(Date.parse(entry.at), timezone.timeZone);
              const when =
                key === todayKey
                  ? whiloText("whiloAgenda.todayAt", { time })
                  : key === tomorrow
                    ? whiloText("whiloAgenda.tomorrowAt", { time })
                    : whiloText("whiloAgenda.atDay", { day: dayText(Date.parse(entry.at), timezone.timeZone, { weekday: "short", month: "short", day: "numeric" }), time });
              return (
                <li key={entry.id}>
                  <AgendaRow entry={entry} timezone={timezone} when={when} onOpenRoutine={onOpenRoutine} />
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}

export function AgendaToolbar({
  view,
  onChangeView,
  anchor,
  onMove,
  onToday,
  timezone,
  onOpenFeed,
  desktop,
}: {
  view: CalendarView;
  onChangeView: (view: CalendarView) => void;
  anchor: number;
  onMove: (direction: -1 | 1) => void;
  onToday: () => void;
  timezone: UseTimezone;
  onOpenFeed?: (() => void) | undefined;
  desktop: boolean;
}) {
  const rangeLabel = useMemo(() => {
    const days = calendarDaysFor(dayKey(anchor, timezone.timeZone), view);
    const first = days[0]!;
    const last = days[days.length - 1]!;
    if (view === "day") return dayText(dateOfKey(first).getTime(), "UTC", { weekday: "long", month: "long", day: "numeric" });
    if (view === "month") return dayText(dateOfKey(first).getTime(), "UTC", { month: "long", year: "numeric" });
    return whiloText("whiloAgenda.range", {
      start: dayText(dateOfKey(first).getTime(), "UTC", { month: "short", day: "numeric" }),
      end: dayText(dateOfKey(last).getTime(), "UTC", { month: "short", day: "numeric", year: "numeric" }),
    });
  }, [anchor, timezone.timeZone, view]);
  const previousLabel = view === "day" ? "whiloAgenda.previousDay" : view === "week" ? "whiloAgenda.previousWeek" : "whiloAgenda.previousMonth";
  const nextLabel = view === "day" ? "whiloAgenda.nextDay" : view === "week" ? "whiloAgenda.nextWeek" : "whiloAgenda.nextMonth";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => onMove(-1)} aria-label={whiloText(previousLabel)} className="rounded-md p-1.5 text-ink-secondary hover:bg-raised hover:text-ink">
        <ChevronLeft size={16} />
      </button>
      <button type="button" onClick={() => onMove(1)} aria-label={whiloText(nextLabel)} className="rounded-md p-1.5 text-ink-secondary hover:bg-raised hover:text-ink">
        <ChevronRight size={16} />
      </button>
      <button type="button" onClick={onToday} className="flex items-center gap-1.5 rounded-lg border border-hairline/50 px-2.5 py-1.5 text-[12px] font-medium text-ink hover:bg-raised">
        <Clock3 size={13} aria-hidden />
        {whiloText("whiloAgenda.today")}
      </button>
      <p className="min-w-0 truncate px-1 text-[14px] font-medium text-ink" aria-live="polite">
        {rangeLabel}
      </p>
      <span className="hidden items-center gap-1.5 text-[11.5px] text-ink-tertiary lg:flex">
        <Globe2 size={12} aria-hidden />
        {whiloText("whiloAgenda.timeZone", { zone: timezone.label })} · {timezone.offsetLabel}
      </span>
      <div role="group" aria-label={whiloText("whiloAgenda.view")} className="ml-auto flex items-center rounded-lg border border-hairline/50 bg-panel p-0.5">
        {(["day", "week", "month"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={view === option}
            onClick={() => onChangeView(option)}
            className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium", view === option ? "bg-raised text-ink shadow-sm" : "text-ink-secondary hover:text-ink")}
          >
            {whiloText(option === "day" ? "whiloAgenda.viewDay" : option === "week" ? "whiloAgenda.viewWeek" : "whiloAgenda.viewMonth")}
          </button>
        ))}
      </div>
      {!desktop && (
        <span className="flex items-center gap-1.5 rounded-full border border-hairline/50 bg-inset px-2.5 py-1 text-[11px] text-ink-secondary">
          <Monitor size={12} aria-hidden />
          {whiloText("whiloAgenda.desktopOnly")}
        </span>
      )}
      {onOpenFeed && (
        <button type="button" onClick={onOpenFeed} className="rounded-lg border border-hairline/50 px-2.5 py-1.5 text-[12px] font-medium text-ink hover:bg-raised">
          {t("routines.logs")}
        </button>
      )}
    </div>
  );
}

export interface AgendaTimezonePromptProps {
  from: string;
  to: string;
  count: number;
  scope: string;
  onAccept: () => void;
  onKeep: () => void;
}

export function AgendaTimezonePrompt({ from, to, count, scope, onAccept, onKeep }: AgendaTimezonePromptProps) {
  return (
    <div role="alertdialog" aria-label={whiloText("whiloAgenda.zoneTitle", { zone: zoneLabel(to) })} className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/35 bg-accent/[0.07] px-3.5 py-3">
      <Globe2 size={17} className="shrink-0 text-accent" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink">{whiloText("whiloAgenda.zoneTitle", { zone: zoneLabel(to) })}</p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-secondary">
          {whiloText("whiloAgenda.zoneBody", { count, scope, from: zoneLabel(from), zone: zoneLabel(to) })}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onKeep} className="rounded-lg border border-hairline/50 bg-control px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-raised-hover">
          {whiloText("whiloAgenda.zoneKeep")}
        </button>
        <button type="button" onClick={onAccept} className="rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-accent-ink hover:brightness-110">
          {whiloText("whiloAgenda.zoneMove")}
        </button>
      </div>
    </div>
  );
}

export function AgendaLegend({ counts }: { counts: Record<AgendaStatus, number> }) {
  const rows: Array<{ status: AgendaStatus; key: string; tone: string }> = [
    { status: "active", key: "whiloAgenda.legendActive", tone: "bg-accent" },
    { status: "completed", key: "whiloAgenda.legendDone", tone: "bg-success" },
    { status: "failed", key: "whiloAgenda.legendFailed", tone: "bg-danger" },
    { status: "paused", key: "whiloAgenda.legendPaused", tone: "bg-ink-tertiary" },
  ];
  return (
    <ul aria-label={whiloText("whiloAgenda.legend")} className="flex list-none flex-wrap items-center gap-3 p-0 text-[11.5px] text-ink-secondary">
      {rows.map((row) => (
        <li key={row.status} className="flex items-center gap-1.5">
          <span aria-hidden className={cn("size-2 rounded-full", row.tone)} />
          {whiloText(row.key)}
          <span className="tabular-nums text-ink-tertiary">{counts[row.status]}</span>
        </li>
      ))}
    </ul>
  );
}

export function entryCounts(entries: readonly { status: AgendaStatus }[]): Record<AgendaStatus, number> {
  return entries.reduce<Record<AgendaStatus, number>>(
    (counts, entry) => ({ ...counts, [entry.status]: counts[entry.status] + 1 }),
    { active: 0, paused: 0, completed: 0, failed: 0 },
  );
}

export function AgendaSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div role="status" className="grid gap-2" aria-busy="true">
      <p className="sr-only">{whiloText("whiloAgenda.loading")}</p>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-lg bg-inset" />
      ))}
    </div>
  );
}

export function AgendaEmpty({ onCreate }: { onCreate?: (() => void) | undefined }) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-hairline/50 p-10 text-center">
      <Clock3 size={22} className="text-ink-tertiary" aria-hidden />
      <h2 className="text-[15px] font-semibold text-ink">{whiloText("whiloRoutines.emptyTitle")}</h2>
      <p className="max-w-[420px] text-[12.5px] leading-relaxed text-ink-secondary">{whiloText("whiloRoutines.emptyBody")}</p>
      {onCreate && (
        <button type="button" onClick={onCreate} className="rounded-xl bg-accent px-4 py-2.5 text-[12.5px] font-semibold text-accent-ink hover:brightness-110">
          {whiloText("whiloRoutines.newRoutine")}
        </button>
      )}
    </div>
  );
}

export function AgendaNotice({ onRetry, message }: { onRetry: () => void; message: string }) {
  return (
    <p role="alert" className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
      <span className="min-w-0 flex-1">{message}</span>
      <button type="button" onClick={onRetry} className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium hover:bg-raised">
        {whiloText("whiloAgenda.retry")}
      </button>
    </p>
  );
}

export function routineScheduleTextFor(routine: Routine): string {
  return `${routineScheduleState(routine)} · ${routineScheduleSummary(routine.schedule, false)}`;
}

export function gmtLabelFor(anchor: number, timeZone: string): string {
  return `${gmtOffsetLabel(anchor, timeZone)} · ${weekStartKey(dayKey(anchor, timeZone))}`;
}

export function anchorMonthKey(anchor: number, timeZone: string): string {
  return addMonthsKey(monthStartKey(dayKey(anchor, timeZone)), 0);
}

export function AgendaLoadMore({ onMore }: { onMore: () => void }) {
  return (
    <button type="button" onClick={onMore} className="flex items-center gap-1.5 rounded-lg border border-hairline/50 px-3 py-1.5 text-[12px] text-ink hover:bg-raised">
      <Loader2 size={13} aria-hidden />
      {t("routines.loadMore")}
    </button>
  );
}
