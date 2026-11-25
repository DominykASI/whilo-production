import { describe, expect, it } from "vitest";

import { DOMYNIK_MODELS, RENTAL_TIERS, annualMonthly, estimateApiCost, formatContext, formatUsd, monthlyFromHours } from "@/lib/monetization";
import { PERSONAL_PLANS, PLAN_IDS, PLANS, TEAM_PLANS, isNamedPlanValue, plan, planForTier, planTier, planValueKey, planWithCreditTier } from "@/lib/plans";

describe("plans", () => {
  it("has a unique id per plan, covering the requested ladder", () => {
    const ids = PLANS.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...PLAN_IDS]);
    expect(ids).toEqual(["premium", "agent-pro-plus", "enterprise"]);
  });

  it("splits personal from enterprise without losing the enterprise tier", () => {
    expect(PERSONAL_PLANS.map((entry) => entry.id)).toEqual(["premium", "agent-pro-plus"]);
    expect(TEAM_PLANS.map((entry) => entry.id)).toEqual(["enterprise"]);
    expect(PERSONAL_PLANS.length + TEAM_PLANS.length).toBe(PLANS.length);
  });

  it("keeps Premium priced above zero and the paid tiers priced above it", () => {
    expect(plan("premium").priceMonthly).toBeGreaterThan(0);
    for (const entry of PLANS.filter((candidate) => candidate.priceMonthly !== null)) {
      expect(entry.priceMonthly).toBeGreaterThan(0);
    }
  });

  it("charges less per month on the annual billing", () => {
    for (const entry of PLANS) {
      if (entry.priceMonthly === null || entry.priceMonthly === 0) continue;
      expect(entry.priceAnnualMonthly).toBeLessThan(entry.priceMonthly);
    }
  });

  it("highlights exactly one plan per audience", () => {
    expect(PERSONAL_PLANS.filter((entry) => entry.highlight)).toHaveLength(1);
    expect(TEAM_PLANS.filter((entry) => entry.highlight)).toHaveLength(0);
  });

  it("maps the Agent Pro+ plan to the server's stored pro tier", () => {
    expect(planTier("agent-pro-plus")).toBe("pro");
    expect(planTier("premium")).toBe("premium");
    expect(planForTier("pro")?.id).toBe("agent-pro-plus");
    expect(planForTier(undefined)).toBeUndefined();
    expect(planForTier("nope")).toBeUndefined();
  });

  it("throws on an unknown plan id", () => {
    // @ts-expect-error deliberately outside the union
    expect(() => plan("free")).toThrow();
  });

  it("treats only unlimited and custom as named values", () => {
    expect(isNamedPlanValue("unlimited")).toBe(true);
    expect(isNamedPlanValue("custom")).toBe(true);
    expect(isNamedPlanValue("500")).toBe(false);
    expect(planValueKey("unlimited")).toBe("plans.value.unlimited");
  });

  it("lets Agent Pro+ pick Max or Ultra, with the price and credit following the choice", () => {
    const proPlus = plan("agent-pro-plus");
    expect(proPlus.creditTiers?.map((tier) => tier.id)).toEqual(["max", "ultra"]);
    const max = planWithCreditTier(proPlus, "max");
    const ultra = planWithCreditTier(proPlus, "ultra");
    expect(max.priceMonthly).toBe(99);
    expect(ultra.priceMonthly).toBe(249);
    expect(ultra.priceMonthly!).toBeGreaterThan(max.priceMonthly!);
    const credits = (entry: typeof proPlus) => entry.limitKeys.find((limit) => limit.key === "plans.limit.credits")?.value;
    expect(credits(max)).toBe("20,000");
    expect(credits(ultra)).toBe("40,000");
  });

  it("returns the plan untouched when no credit tier matches", () => {
    expect(planWithCreditTier(plan("premium"), "whatever")).toEqual(plan("premium"));
    expect(planWithCreditTier(plan("agent-pro-plus"), null).priceMonthly).toBe(99);
  });
});

describe("monetization", () => {
  it("prices rental tiers in ascending monthly order", () => {
    const monthly = RENTAL_TIERS.map((tier) => tier.monthly);
    expect(monthly).toEqual([...monthly].sort((a, b) => a - b));
    expect(RENTAL_TIERS.filter((tier) => tier.highlight)).toHaveLength(1);
  });

  it("bills hourly usage and caps the monthly equivalent", () => {
    const tier = RENTAL_TIERS[1];
    expect(monthlyFromHours(1, tier)).toBe(Math.round(tier.hourly * 100) / 100);
    expect(monthlyFromHours(720, tier)).toBe(Math.round(720 * tier.hourly * 100) / 100);
  });

  it("computes twenty percent off for annual", () => {
    expect(annualMonthly(100)).toBe(80);
  });

  it("formats zero, whole and fractional dollars", () => {
    expect(formatUsd(0)).toBe("$0");
    expect(formatUsd(29)).toBe("$29");
    expect(formatUsd(0.28)).toBe("$0.28");
  });

  it("estimates API cost from the model's per-million rates", () => {
    const model = DOMYNIK_MODELS[0];
    expect(estimateApiCost(model, 1_000_000, 1_000_000)).toBe(Math.round((model.inputPerMillion + model.outputPerMillion) * 100) / 100);
    expect(estimateApiCost(model, 0, 0)).toBe(0);
  });

  it("reads context windows as people say them", () => {
    expect(formatContext(1_000_000)).toBe("1M");
    expect(formatContext(2_000_000)).toBe("2M");
    expect(formatContext(1_500_000)).toBe("1.5M");
    expect(formatContext(200_000)).toBe("200K");
  });
});
