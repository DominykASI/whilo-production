import { routineScheduleState } from "@/lib/routine-display";
import { scheduleLabel, scheduleSentence } from "@/lib/schedule-label";
import { intlLocale } from "@/lib/i18n";
import type { Routine, RoutineSchedule } from "@/lib/routines";

export type { RoutineSchedule };

export type RoutineScheduleKind = RoutineSchedule["type"];

export const ROUTINE_SCHEDULE_KINDS = ["once", "daily", "interval", "cron", "limit_reset"] as const satisfies readonly RoutineScheduleKind[];

export function isRoutineSchedule(value: unknown): value is RoutineSchedule {
  if (typeof value !== "object" || value === null) return false;
  const kind = (value as { type?: unknown }).type;
  return typeof kind === "string" && (ROUTINE_SCHEDULE_KINDS as readonly string[]).includes(kind);
}

/** The schedule in words a person reads on a card: "Every weekday at 9:00". */
export function routineScheduleSummary(schedule: RoutineSchedule, sentence = false): string {
  return sentence ? sentenceLabel(schedule) : scheduleLabel(schedule);
}

function sentenceLabel(schedule: RoutineSchedule): string {
  if (schedule.type === "limit_reset") return scheduleSentence({ type: "once", at: Date.now() });
  return scheduleSentence(schedule);
}

/** The one-line form a chip shows: "9:00 · weekdays". */
export function routineScheduleShort(schedule: RoutineSchedule): string {
  const full = scheduleLabel(schedule);
  const [stem] = full.split(", ");
  return stem ?? full;
}

/** The status word beside the name: Active, Paused or Finished schedule. */
export function routineScheduleStatus(routine: Routine): string {
  return routineScheduleState(routine);
}

export function localDateInput(at: number): string {
  const date = new Date(at);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** When a schedule next fires, as the calendar's day cell wants it: the moment, not a sentence. */
export function scheduleNextAt(routine: Routine): number | null {
  return routine.nextRunAt;
}

export function scheduleWeekdays(schedule: RoutineSchedule): number[] {
  if (schedule.type !== "daily") return [0, 1, 2, 3, 4, 5, 6];
  return schedule.weekdays;
}

export function isCronSchedule(schedule: RoutineSchedule): boolean {
  return schedule.type === "cron";
}

export function formatScheduleDay(at: number): string {
  return new Date(at).toLocaleDateString(intlLocale(), { weekday: "short", month: "short", day: "numeric" });
}
