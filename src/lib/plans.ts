export type PlanAudience = "personal" | "team" | "enterprise";

export type PlanId =
  | "starter"
  | "agent-pro-plus"
  | "max-20x"
  | "ultra"
  | "teams-premium"
  | "teams-max-20x"
  | "teams-ultra"
  | "enterprise";

export interface PlanLimit {
  key: string;
  value: string;
}

export interface PlanBenefit {
  key: string;
}

export interface Plan {
  id: PlanId;
  audience: PlanAudience;
  nameKey: string;
  taglineKey: string;
  priceMonthly: number | null;
  priceAnnualMonthly: number | null;
  currency: "USD";
  seats: number | null;
  highlight: boolean;
  badgeKey?: string;
  ctaKey: string;
  limitKeys: PlanLimit[];
  benefitKeys: PlanBenefit[];
}

export const PLAN_CURRENCY = "USD" as const;

export const PLAN_IDS: readonly PlanId[] = [
  "starter",
  "agent-pro-plus",
  "max-20x",
  "ultra",
  "teams-premium",
  "teams-max-20x",
  "teams-ultra",
  "enterprise",
];

export const PLANS: readonly Plan[] = [
  {
    id: "starter",
    audience: "personal",
    nameKey: "plans.starter.name",
    taglineKey: "plans.starter.tagline",
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    currency: PLAN_CURRENCY,
    seats: 1,
    highlight: false,
    ctaKey: "plans.starter.cta",
    limitKeys: [
      { key: "plans.limit.agents", value: "1" },
      { key: "plans.limit.routines", value: "3" },
      { key: "plans.limit.concurrent", value: "1" },
      { key: "plans.limit.credits", value: "5" },
    ],
    benefitKeys: [
      { key: "plans.benefit.localTools" },
      { key: "plans.benefit.selfHosted" },
      { key: "plans.benefit.workflows" },
    ],
  },
  {
    id: "agent-pro-plus",
    audience: "personal",
    nameKey: "plans.proPlus.name",
    taglineKey: "plans.proPlus.tagline",
    priceMonthly: 10,
    priceAnnualMonthly: 8,
    currency: PLAN_CURRENCY,
    seats: 1,
    highlight: true,
    badgeKey: "plans.badge.mostPopular",
    ctaKey: "plans.cta.startTrial",
    limitKeys: [
      { key: "plans.limit.agents", value: "10" },
      { key: "plans.limit.routines", value: "100" },
      { key: "plans.limit.concurrent", value: "5" },
      { key: "plans.limit.credits", value: "500" },
    ],
    benefitKeys: [
      { key: "plans.benefit.everyModel" },
      { key: "plans.benefit.hostedServer" },
      { key: "plans.benefit.voice" },
      { key: "plans.benefit.dynamicIsland" },
    ],
  },
  {
    id: "max-20x",
    audience: "personal",
    nameKey: "plans.max20.name",
    taglineKey: "plans.max20.tagline",
    priceMonthly: 99,
    priceAnnualMonthly: 79,
    currency: PLAN_CURRENCY,
    seats: 1,
    highlight: false,
    badgeKey: "plans.badge.bestValue",
    ctaKey: "plans.cta.startTrial",
    limitKeys: [
      { key: "plans.limit.agents", value: "40" },
      { key: "plans.limit.routines", value: "unlimited" },
      { key: "plans.limit.concurrent", value: "20" },
      { key: "plans.limit.credits", value: "2,000" },
    ],
    benefitKeys: [
      { key: "plans.benefit.everyModel" },
      { key: "plans.benefit.hostedServers3" },
      { key: "plans.benefit.computerUse" },
      { key: "plans.benefit.priority" },
    ],
  },
  {
    id: "ultra",
    audience: "personal",
    nameKey: "plans.ultra.name",
    taglineKey: "plans.ultra.tagline",
    priceMonthly: 249,
    priceAnnualMonthly: 199,
    currency: PLAN_CURRENCY,
    seats: 1,
    highlight: false,
    ctaKey: "plans.cta.startTrial",
    limitKeys: [
      { key: "plans.limit.agents", value: "unlimited" },
      { key: "plans.limit.routines", value: "unlimited" },
      { key: "plans.limit.concurrent", value: "unlimited" },
      { key: "plans.limit.credits", value: "8,000" },
    ],
    benefitKeys: [
      { key: "plans.benefit.everythingMax" },
      { key: "plans.benefit.dedicatedBox" },
      { key: "plans.benefit.earlyAccess" },
      { key: "plans.benefit.whiteGlove" },
    ],
  },
  {
    id: "teams-premium",
    audience: "team",
    nameKey: "plans.teamsPremium.name",
    taglineKey: "plans.teamsPremium.tagline",
    priceMonthly: 19,
    priceAnnualMonthly: 15,
    currency: PLAN_CURRENCY,
    seats: 5,
    highlight: false,
    ctaKey: "plans.cta.startTrial",
    limitKeys: [
      { key: "plans.limit.seats", value: "5" },
      { key: "plans.limit.agentsPerSeat", value: "10" },
      { key: "plans.limit.concurrent", value: "5" },
      { key: "plans.limit.creditsPerSeat", value: "500" },
    ],
    benefitKeys: [
      { key: "plans.benefit.sharedLibrary" },
      { key: "plans.benefit.botAccess" },
      { key: "plans.benefit.activityLog" },
      { key: "plans.benefit.sso" },
    ],
  },
  {
    id: "teams-max-20x",
    audience: "team",
    nameKey: "plans.teamsMax20.name",
    taglineKey: "plans.teamsMax20.tagline",
    priceMonthly: 69,
    priceAnnualMonthly: 55,
    currency: PLAN_CURRENCY,
    seats: 5,
    highlight: true,
    badgeKey: "plans.badge.mostPopular",
    ctaKey: "plans.cta.startTrial",
    limitKeys: [
      { key: "plans.limit.seats", value: "5" },
      { key: "plans.limit.agentsPerSeat", value: "40" },
      { key: "plans.limit.concurrent", value: "20" },
      { key: "plans.limit.creditsPerSeat", value: "2,000" },
    ],
    benefitKeys: [
      { key: "plans.benefit.sharedLibrary" },
      { key: "plans.benefit.hostedServers" },
      { key: "plans.benefit.rolePermissions" },
      { key: "plans.benefit.priority" },
    ],
  },
  {
    id: "teams-ultra",
    audience: "team",
    nameKey: "plans.teamsUltra.name",
    taglineKey: "plans.teamsUltra.tagline",
    priceMonthly: 169,
    priceAnnualMonthly: 139,
    currency: PLAN_CURRENCY,
    seats: 5,
    highlight: false,
    ctaKey: "plans.cta.startTrial",
    limitKeys: [
      { key: "plans.limit.seats", value: "5" },
      { key: "plans.limit.agentsPerSeat", value: "unlimited" },
      { key: "plans.limit.concurrent", value: "unlimited" },
      { key: "plans.limit.creditsPerSeat", value: "8,000" },
    ],
    benefitKeys: [
      { key: "plans.benefit.sharedLibrary" },
      { key: "plans.benefit.dedicatedBox" },
      { key: "plans.benefit.auditExport" },
      { key: "plans.benefit.whiteGlove" },
    ],
  },
  {
    id: "enterprise",
    audience: "enterprise",
    nameKey: "plans.enterprise.name",
    taglineKey: "plans.enterprise.tagline",
    priceMonthly: null,
    priceAnnualMonthly: null,
    currency: PLAN_CURRENCY,
    seats: null,
    highlight: false,
    ctaKey: "plans.cta.talkToSales",
    limitKeys: [
      { key: "plans.limit.seats", value: "custom" },
      { key: "plans.limit.agents", value: "custom" },
      { key: "plans.limit.concurrent", value: "custom" },
      { key: "plans.limit.credits", value: "custom" },
    ],
    benefitKeys: [
      { key: "plans.benefit.scim" },
      { key: "plans.benefit.auditExport" },
      { key: "plans.benefit.vpc" },
      { key: "plans.benefit.dedicatedSupport" },
    ],
  },
];

export const PERSONAL_PLANS: readonly Plan[] = PLANS.filter((plan) => plan.audience === "personal");
export const TEAM_PLANS: readonly Plan[] = PLANS.filter((plan) => plan.audience === "team" || plan.audience === "enterprise");


/** Black Friday: Agent Pro+ 50% off ($10 -> $5/mo) until end of November 2026. */
export const BLACK_FRIDAY_PROMO = {
  planId: "agent-pro-plus" as const,
  discountPercent: 50,
  endsAt: "2026-11-30T23:59:59-03:00",
  label: "Black Friday 50% OFF",
} as const;

export function isBlackFridayActive(now = new Date()): boolean {
  return now.getTime() <= Date.parse(BLACK_FRIDAY_PROMO.endsAt);
}

export function promoMonthlyPrice(plan: Plan, now = new Date()): number | null {
  if (plan.id !== BLACK_FRIDAY_PROMO.planId) return null;
  if (!isBlackFridayActive(now)) return null;
  if (plan.priceMonthly === null) return null;
  return Math.round(plan.priceMonthly * (1 - BLACK_FRIDAY_PROMO.discountPercent / 100) * 100) / 100;
}

export function plan(id: PlanId): Plan {
  const found = PLANS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown plan: ${id}`);
  return found;
}

/** The tier name the server's cloud-plan-tier host stores for a plan id. */
export function planTier(id: PlanId): string {
  return id === "agent-pro-plus" ? "pro" : id;
}

/** A limit's display value: a raw number stays as written, the two named values are translated by the caller. */
export function isNamedPlanValue(value: string): boolean {
  return value === "unlimited" || value === "custom";
}

export function planValueKey(value: string): string {
  return `plans.value.${value}`;
}

export function planForTier(tier: string | undefined): Plan | undefined {
  if (!tier) return undefined;
  return PLANS.find((entry) => planTier(entry.id) === tier);
}
