export type RentalBilling = "hourly" | "monthly";
export type RentalStatus = "available" | "provisioning" | "running" | "paused";

export interface ServerRentalTier {
  id: string;
  nameKey: string;
  vcpu: number;
  ramGb: number;
  diskGb: number;
  hourly: number;
  monthly: number;
  highlight: boolean;
  badgeKey?: string;
}

export interface DomynikModel {
  id: string;
  nameKey: string;
  contextTokens: number;
  inputPerMillion: number;
  outputPerMillion: number;
}

export const RENTAL_TIERS: readonly ServerRentalTier[] = [
  { id: "nano", nameKey: "rentals.tier.nano.name", vcpu: 2, ramGb: 4, diskGb: 40, hourly: 0.05, monthly: 19, highlight: false },
  { id: "standard", nameKey: "rentals.tier.standard.name", vcpu: 4, ramGb: 8, diskGb: 80, hourly: 0.09, monthly: 29, highlight: true, badgeKey: "rentals.badge.popular" },
  { id: "pro", nameKey: "rentals.tier.pro.name", vcpu: 8, ramGb: 16, diskGb: 160, hourly: 0.17, monthly: 59, highlight: false },
  { id: "max", nameKey: "rentals.tier.max.name", vcpu: 16, ramGb: 32, diskGb: 320, hourly: 0.33, monthly: 109, highlight: false, badgeKey: "rentals.badge.bestValue" },
  { id: "dedicated", nameKey: "rentals.tier.dedicated.name", vcpu: 32, ramGb: 64, diskGb: 640, hourly: 0.65, monthly: 199, highlight: false },
];

export const DOMYNIK_MODELS: readonly DomynikModel[] = [
  { id: "domynik-flash", nameKey: "domynik.api.model.flash", contextTokens: 1_000_000, inputPerMillion: 0.28, outputPerMillion: 0.42 },
  { id: "domynik-pro", nameKey: "domynik.api.model.pro", contextTokens: 2_000_000, inputPerMillion: 1.25, outputPerMillion: 10 },
  { id: "domynik-reasoning", nameKey: "domynik.api.model.reasoning", contextTokens: 200_000, inputPerMillion: 3, outputPerMillion: 15 },
];

/** The markup a plan's included credits get over raw API price. */
export const API_CREDIT_MARKUP = 1.35;

export function monthlyFromHours(hours: number, tier: ServerRentalTier): number {
  return Math.round(hours * tier.hourly * 100) / 100;
}

export function annualMonthly(monthly: number): number {
  return Math.round(monthly * 0.8 * 100) / 100;
}

export function formatUsd(value: number): string {
  return value === 0 ? "$0" : `$${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}`;
}

export function estimateApiCost(model: DomynikModel, inputTokens: number, outputTokens: number): number {
  return Math.round(((inputTokens / 1_000_000) * model.inputPerMillion + (outputTokens / 1_000_000) * model.outputPerMillion) * 100) / 100;
}

/** A context window as people say it: 1M, 200K. */
export function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) {
    const millions = tokens / 1_000_000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  return `${Math.round(tokens / 1_000)}K`;
}
