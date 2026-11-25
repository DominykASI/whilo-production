export type PlanAudience = "personal" | "enterprise";


export type PlanId = "premium" | "agent-pro-plus" | "enterprise";

export interface PlanLimit {
  key: string;
  value: string;
}

export interface PlanBenefit {
  key: string;
}

/** A credit step the buyer picks from inside a plan — like Manus, the price follows the chosen amount. */
export interface PlanCreditTier {
  id: string;
  nameKey: string;
  credits: string;
  priceMonthly: number;
  priceAnnualMonthly: number;
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
  /** Present when the plan lets the buyer choose how much credit they want; priceMonthly is the first tier's. */
  creditTiers?: PlanCreditTier[];
}

export const PLAN_CURRENCY = "USD" as const;

export const PLAN_IDS: readonly PlanId[] = ["premium", "agent-pro-plus", "enterprise"];

// The three cards, in the order they are sold: Premium, the Agent Pro+ ladder
// (Max / Ultra, credit amount chosen by the buyer), and Enterprise with custom pricing.
export const PLANS: readonly Plan[] = [
  {
    id: "premium",
    audience: "personal",
    nameKey: "plans.premium.name",
    taglineKey: "plans.premium.tagline",
    priceMonthly: 29,
    priceAnnualMonthly: 23,
    currency: PLAN_CURRENCY,
    seats: 1,
    highlight: false,
    ctaKey: "plans.cta.startTrial",
    limitKeys: [
      { key: "plans.limit.agents", value: "5" },
      { key: "plans.limit.routines", value: "unlimited" },
      { key: "plans.limit.concurrent", value: "3" },
      { key: "plans.limit.credits", value: "2,000" },
    ],
    benefitKeys: [
      { key: "plans.benefit.everyModel" },
      { key: "plans.benefit.hostedServer" },
      { key: "plans.benefit.voice" },
      { key: "plans.benefit.workflows" },
    ],
  },
  {
    id: "agent-pro-plus",
    audience: "personal",
    nameKey: "plans.proPlus.name",
    taglineKey: "plans.proPlus.tagline",
    priceMonthly: 99,
    priceAnnualMonthly: 79,
    currency: PLAN_CURRENCY,
    seats: 1,
    highlight: true,
    badgeKey: "plans.badge.mostPopular",
    ctaKey: "plans.cta.startTrial",
    limitKeys: [
      { key: "plans.limit.agents", value: "40" },
      { key: "plans.limit.routines", value: "unlimited" },
      { key: "plans.limit.concurrent", value: "20" },
      { key: "plans.limit.credits", value: "20,000" },
    ],
    benefitKeys: [
      { key: "plans.benefit.everyModel" },
      { key: "plans.benefit.hostedServers3" },
      { key: "plans.benefit.computerUse" },
      { key: "plans.benefit.priority" },
    ],
    creditTiers: [
      { id: "max", nameKey: "plans.credit.max.name", credits: "20,000", priceMonthly: 99, priceAnnualMonthly: 79 },
      { id: "ultra", nameKey: "plans.credit.ultra.name", credits: "40,000", priceMonthly: 249, priceAnnualMonthly: 199 },
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
export const TEAM_PLANS: readonly Plan[] = PLANS.filter((plan) => plan.audience === "enterprise");


/** Black Friday: Agent Pro+ 50% off until end of November 2026. */
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

/** The plan as it stands for the credit tier the buyer picked: price and credit limit follow the choice. */
export function planWithCreditTier(plan: Plan, tierId: string | null): Plan {
  const tier = plan.creditTiers?.find((entry) => entry.id === tierId);
  if (!tier) return plan;
  return {
    ...plan,
    priceMonthly: tier.priceMonthly,
    priceAnnualMonthly: tier.priceAnnualMonthly,
    limitKeys: plan.limitKeys.map((limit) => (limit.key === "plans.limit.credits" ? { ...limit, value: tier.credits } : limit)),
  };
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