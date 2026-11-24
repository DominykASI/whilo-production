import { activeLocale, intlLocale } from "@/lib/i18n";

import type { ServerCurrency } from "./types";

const MINOR_PER_UNIT: Record<ServerCurrency, number> = { eur: 100, usd: 100, pln: 100 };

export function formatMoney(minor: number, currency: ServerCurrency, options: { cents?: boolean } = {}): string {
  const value = minor / (MINOR_PER_UNIT[currency] ?? 100);
  const whole = Number.isInteger(value) || options.cents !== true;
  return new Intl.NumberFormat(intlLocale(), {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(value);
}

/** "3d 4h", "5h 12m", "48m": two units at most, so a card's line never wraps. */
export function formatUptime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 60_000) return "";
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const sep = activeLocale() === "en" ? " " : "\u00a0";
  if (days > 0) return `${days}d${sep}${hours % 24}h`;
  if (hours > 0) return `${hours}h${sep}${minutes % 60}m`;
  return `${minutes}m`;
}

export function formatCreatedAt(iso: string): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return iso;
  return new Intl.DateTimeFormat(intlLocale(), { year: "numeric", month: "short", day: "numeric" }).format(at);
}

export function formatResetAt(at: number): string {
  if (!Number.isFinite(at)) return "";
  return new Intl.DateTimeFormat(intlLocale(), { month: "short", day: "numeric" }).format(at);
}
