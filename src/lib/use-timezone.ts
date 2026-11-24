import { useCallback, useEffect, useMemo, useState } from "react";

export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function zoneLabel(zone: string): string {
  return zone.replaceAll("_", " ");
}

function partsAt(at: number, timeZone: string): { year: number; month: number; day: number; hour: number; minute: number; weekday: string } {
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
  const parts = format.formatToParts(new Date(at));
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(read("year")),
    month: Number(read("month")),
    day: Number(read("day")),
    hour: Number(read("hour")),
    minute: Number(read("minute")),
    weekday: read("weekday"),
  };
}

export function dayKey(at: number, timeZone: string): string {
  const { year, month, day } = partsAt(at, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function dayKeyOfDate(date: Date, timeZone: string): string {
  return dayKey(date.getTime(), timeZone);
}

export function hourOf(at: number, timeZone: string): number {
  return partsAt(at, timeZone).hour;
}

export function minuteOfDay(at: number, timeZone: string): number {
  const { hour, minute } = partsAt(at, timeZone);
  return hour * 60 + minute;
}

export function weekdayOf(at: number, timeZone: string): number {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Math.max(0, names.indexOf(partsAt(at, timeZone).weekday));
}

export function startOfDayInZone(at: number, timeZone: string): number {
  const { year, month, day } = partsAt(at, timeZone);
  const base = Date.UTC(year, month - 1, day);
  let candidate = base;
  for (let step = 0; step < 30; step += 1) {
    const { year: y, month: m, day: d, hour, minute } = partsAt(candidate, timeZone);
    if (y === year && m === month && d === day && hour === 0 && minute === 0) return candidate;
    const deltaMinutes = (hour === 23 ? -60 : hour) * 60 + minute - (hour === 23 ? 0 : 0);
    candidate -= deltaMinutes * 60_000;
    if (step > 2 && Math.abs(deltaMinutes) < 2) return candidate;
  }
  return base;
}

export function addDaysInZone(at: number, days: number, timeZone: string): number {
  const { year, month, day } = partsAt(at, timeZone);
  const base = Date.UTC(year, month - 1, day + days);
  const guess = base - (at - startOfDayInZone(at, timeZone));
  return guess;
}

export function timeText(at: number, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone }).format(new Date(at));
}

export function clockText(at: number, timeZone: string, wholeHour = false): string {
  return new Intl.DateTimeFormat(undefined, wholeHour ? { hour: "numeric", timeZone } : { hour: "numeric", minute: "2-digit", timeZone }).format(new Date(at));
}

export function dayText(at: number, timeZone: string, options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }): string {
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone }).format(new Date(at));
}

export function gmtOffsetLabel(at: number, timeZone: string): string {
  const format = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" });
  const name = format.formatToParts(new Date(at)).find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  return name.replace("GMT+0", "GMT");
}

export function zoneAbbreviation(at: number, timeZone: string): string {
  const format = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" });
  return format.formatToParts(new Date(at)).find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export interface UseTimezone {
  timeZone: string;
  label: string;
  offsetLabel: string;
  now: number;
  at: (at: number) => { key: string; hour: number; minute: number; time: string; day: string };
}

export function useTimezone(override?: string): UseTimezone {
  const [zone, setZone] = useState(() => override ?? deviceTimeZone());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (override) {
      setZone(override);
      return;
    }
    const sync = () => setZone(deviceTimeZone());
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [override]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const at = useCallback(
    (value: number) => ({
      key: dayKey(value, zone),
      hour: hourOf(value, zone),
      minute: minuteOfDay(value, zone),
      time: timeText(value, zone),
      day: dayText(value, zone, { weekday: "short", month: "short", day: "numeric" }),
    }),
    [zone],
  );
  return useMemo(
    () => ({ timeZone: zone, label: zoneLabel(zone), offsetLabel: gmtOffsetLabel(now, zone), now, at }),
    [zone, now, at],
  );
}

const ANSWERS_KEY = (scope: string) => `whilo:routine-timezone-answers:${scope}`;

export function answeredZones(scope: string, zone: string): string[] {
  try {
    const [stored, ...answered] = (window.localStorage.getItem(ANSWERS_KEY(scope)) ?? "").split("\n");
    return stored === zone ? answered.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function writeZoneAnswer(scope: string, zone: string, from: string): void {
  try {
    window.localStorage.setItem(ANSWERS_KEY(scope), [zone, ...answeredZones(scope, zone), from].join("\n"));
  } catch {
    return;
  }
}

export interface ZoneMoveRequest {
  from: string;
  to: string;
  count: number;
}

export interface UseZoneMovePrompt {
  request: ZoneMoveRequest | null;
  accept: () => void;
  dismiss: () => void;
}

export function useZoneMovePrompt(scope: string, routinesIn: (zone: string) => number): UseZoneMovePrompt {
  const [request, setRequest] = useState<ZoneMoveRequest | null>(null);
  const [checkedZone, setCheckedZone] = useState(() => deviceTimeZone());
  const check = useCallback(() => {
    const zone = deviceTimeZone();
    const zones = new Set<string>();
    for (const candidate of [checkedZone, zone]) {
      const count = routinesIn(candidate);
      if (count > 0 && candidate !== zone && !answeredZones(scope, zone).includes(candidate)) zones.add(candidate);
    }
    if (zones.size === 0) {
      setRequest(null);
      return;
    }
    const from = [...zones][0]!;
    setRequest({ from, to: zone, count: routinesIn(from) });
  }, [checkedZone, routinesIn, scope]);
  useEffect(() => {
    check();
  }, [check]);
  useEffect(() => {
    const recheck = () => {
      if (document.visibilityState !== "visible") return;
      const zone = deviceTimeZone();
      setCheckedZone((current) => {
        if (zone !== current) {
          setRequest(null);
          return zone;
        }
        check();
        return current;
      });
    };
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [check]);
  return {
    request,
    accept: () => {
      if (request) writeZoneAnswer(scope, request.to, request.from);
      setRequest(null);
    },
    dismiss: () => {
      if (request) writeZoneAnswer(scope, request.to, request.from);
      setRequest(null);
    },
  };
}

export type CalendarView = "day" | "week" | "month";

export function weekStartKey(key: string, weekStartsOn = 1): string {
  const date = new Date(`${key}T12:00:00Z`);
  const shift = (((date.getUTCDay() - weekStartsOn) % 7) + 7) % 7;
  date.setUTCDate(date.getUTCDate() - shift);
  return date.toISOString().slice(0, 10);
}

export function addDaysKey(key: string, days: number): string {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function addMonthsKey(key: string, months: number): string {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months, 1);
  return date.toISOString().slice(0, 10);
}

export function monthStartKey(key: string): string {
  return `${key.slice(0, 7)}-01`;
}

export function dayKeysBetween(firstKey: string, lastKey: string): string[] {
  const days: string[] = [];
  let cursor = firstKey;
  for (let guard = 0; guard < 400; guard += 1) {
    days.push(cursor);
    if (cursor >= lastKey) break;
    cursor = addDaysKey(cursor, 1);
  }
  return days;
}

export function calendarDaysFor(anchorKey: string, view: CalendarView, weekStartsOn = 1): string[] {
  if (view === "day") return [anchorKey];
  if (view === "week") return dayKeysBetween(weekStartKey(anchorKey, weekStartsOn), addDaysKey(weekStartKey(anchorKey, weekStartsOn), 6));
  const first = weekStartKey(monthStartKey(anchorKey), weekStartsOn);
  const nextMonth = addMonthsKey(monthStartKey(anchorKey), 1);
  const last = addDaysKey(weekStartKey(addDaysKey(nextMonth, -1), weekStartsOn), 6);
  return dayKeysBetween(first, last);
}

export function dayKeyForLocalParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function localPartsOfKey(key: string): { year: number; month: number; day: number } {
  const [year = 1970, month = 1, day = 1] = key.split("-").map(Number);
  return { year, month, day };
}

export function dateOfKey(key: string): Date {
  const { year, month, day } = localPartsOfKey(key);
  return new Date(Date.UTC(year, month - 1, day, 12));
}
