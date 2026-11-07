import { BILLING_PLANS } from "@whilo/contracts/billing";
import { LICENSE_MAX_USERS } from "@whilo/contracts/license";
import type { AppTranslate } from "@whilo/i18n";

/*
 * The text of the pricing page around the order form, built from `sitePage.pricing.*` catalog keys. The order form
 * reads its own text from the catalog through `TextProvider`. This module has only a type import of the catalogs.
 */

/** The largest team that the page sells to. A larger team contacts sales. */
const PRICING_MAX_MEMBERS = Math.max(LICENSE_MAX_USERS, ...BILLING_PLANS.map((plan) => plan.memberLimit));

export function pricingPageText(t: AppTranslate) {
  return {
    title: t("sitePage.pricing.title"),
    description: t("sitePage.pricing.description"),
    heading: t("sitePage.pricing.heading"),
    /** While the deployment has no Stripe key, the buy action is disabled with this note instead of opening a dead checkout. */
    unavailable: t("sitePage.pricing.unavailable"),
    enterprise: {
      title: t("sitePage.pricing.enterprise.title"),
      body: t("sitePage.pricing.enterprise.body", { count: PRICING_MAX_MEMBERS }),
      contact: t("sitePage.pricing.enterprise.contact"),
    },
  };
}

export type PricingPageText = ReturnType<typeof pricingPageText>;
