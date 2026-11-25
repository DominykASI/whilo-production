import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, Boxes, Check, CheckCircle2, Cloud, Copy, Cpu, Gauge, Server, Sparkles, Terminal } from "lucide-react";

import { cn } from "@/lib/cn";
import {
  DOMYNIK_MODELS,
  RENTAL_TIERS,
  estimateApiCost,
  formatContext,
  formatUsd,
} from "@/lib/monetization";
import {
  PERSONAL_PLANS,
  TEAM_PLANS,
  PLAN_CURRENCY,
  promoMonthlyPrice,
  isNamedPlanValue,
  planValueKey,
  planWithCreditTier,
  type Plan,
} from "@/lib/plans";
import { whiloText } from "@/lib/whilo-workflow-text";

type Billing = "monthly" | "annual";
type Tab = "plans" | "servers" | "api";

const TABS: { id: Tab; labelKey: string; icon: typeof Cloud }[] = [
  { id: "plans", labelKey: "plans.tab.plans", icon: Sparkles },
  { id: "servers", labelKey: "plans.tab.servers", icon: Server },
  { id: "api", labelKey: "plans.tab.api", icon: Terminal },
];

function price(plan: Plan, billing: Billing): string {
  const monthly = billing === "annual" ? plan.priceAnnualMonthly : plan.priceMonthly;
  if (monthly === null) return whiloText("plans.custom");
  if (monthly === 0) return whiloText("plans.free");
  return formatUsd(monthly);
}

function PlanCard({ plan, billing, onChoose }: { plan: Plan; billing: Billing; onChoose: (id: string) => void }) {
  const [creditTier, setCreditTier] = useState<string | null>(plan.creditTiers?.[0]?.id ?? null);
  const shown = planWithCreditTier(plan, creditTier);
  const badge = shown.badgeKey ? whiloText(shown.badgeKey) : null;
  const monthly = billing === "annual" ? shown.priceAnnualMonthly : shown.priceMonthly;
  return (
    <article
      data-plan={plan.id}
      data-plan-audience={plan.audience}
      data-plan-highlight={plan.highlight ? "true" : "false"}
      className={cn(
        "group relative flex flex-col gap-5 overflow-hidden rounded-3xl border p-6 transition-all duration-300",
        plan.highlight
          ? "border-accent/60 bg-gradient-to-b from-accent/[0.12] via-card to-card shadow-[0_0_50px_-12px] shadow-accent/40"
          : "border-hairline bg-card hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-2xl hover:shadow-black/30",
      )}
    >
      {plan.highlight && (
        <span aria-hidden className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
      )}
      {badge && (
        <span className="absolute right-5 top-5 rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
          {badge}
        </span>
      )}
      <header className="flex flex-col gap-1.5">
        <h3 className="text-lg font-bold tracking-tight text-ink">{whiloText(plan.nameKey)}</h3>
        <p className="min-h-[2.5rem] text-[13px] leading-5 text-ink-secondary">{whiloText(plan.taglineKey)}</p>
      </header>
      {plan.creditTiers && (
        <label className="flex flex-col gap-1.5 text-[12px] text-ink-secondary">
          {whiloText("plans.credit.label")}
          <select
            value={creditTier ?? ""}
            onChange={(event) => setCreditTier(event.target.value)}
            aria-label={whiloText("plans.credit.label")}
            className="h-11 cursor-pointer rounded-xl border border-hairline bg-inset px-3 text-[13px] font-medium text-ink focus:border-focus focus:outline-none"
          >
            {plan.creditTiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {whiloText(tier.nameKey)} · {tier.credits} credits
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="flex flex-col gap-1">
        {(() => {
          const promo = billing === "monthly" ? promoMonthlyPrice(shown) : null;
          if (promo !== null && shown.priceMonthly !== null) {
            return (
              <>
                <span className="inline-flex w-fit items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">Black Friday 50% OFF · até 30/11</span>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-ink">{formatUsd(promo)}</span>
                  <span className="pb-1.5 text-[12px] text-ink-secondary">{whiloText("plans.perMonth")}</span>
                  <span className="pb-1.5 text-base font-medium text-ink-tertiary line-through">{formatUsd(shown.priceMonthly)}</span>
                </div>
                <p className="text-[11px] text-emerald-500">De {formatUsd(shown.priceMonthly)} por {formatUsd(promo)}/mês até 30/11</p>
              </>
            );
          }
          return (
            <>
              <div className="flex items-end gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-ink">{price(shown, billing)}</span>
                {monthly !== null && monthly > 0 && (
                  <span className="pb-1.5 text-[12px] text-ink-secondary">
                    {whiloText("plans.perMonth")}
                    {billing === "annual" && <span className="ml-1 text-accent">{whiloText("plans.billedAnnual")}</span>}
                  </span>
                )}
              </div>
              {billing === "annual" && monthly !== null && monthly > 0 && shown.priceMonthly !== null && (
                <p className="text-[11px] text-accent">Save ~20% vs monthly ({formatUsd(shown.priceMonthly)}/mo)</p>
              )}
            </>
          );
        })()}
      </div>
      <ul className="flex flex-col gap-2.5 border-t border-hairline pt-5">
        {shown.limitKeys.map((limit) => (
          <li key={limit.key} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-ink-secondary">{whiloText(limit.key)}</span>
            <span className="font-semibold text-ink">{isNamedPlanValue(limit.value) ? whiloText(planValueKey(limit.value)) : limit.value}</span>
          </li>
        ))}
      </ul>
      <ul className="flex flex-1 flex-col gap-2">
        {plan.benefitKeys.map((benefit) => (
          <li key={benefit.key} className="flex items-start gap-2 text-[13px] text-ink-secondary">
            <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
            <span>{whiloText(benefit.key)}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChoose(plan.id)}
        aria-label={`${whiloText(plan.ctaKey)} — ${whiloText(plan.nameKey)}`}
        className={cn(
          "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
          plan.highlight
            ? "bg-accent text-white shadow-lg shadow-accent/30 hover:brightness-110"
            : "border border-hairline bg-raised text-ink hover:border-accent/50 hover:bg-accent/10",
        )}
      >
        {whiloText(plan.ctaKey)}
        <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </article>
  );
}

function PlanGrid({ title, subtitle, plans, billing, onChoose }: {
  title: string;
  subtitle: string;
  plans: readonly Plan[];
  billing: Billing;
  onChoose: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
        <p className="text-[13px] text-ink-secondary">{subtitle}</p>
        <p className="text-[11px] font-medium text-accent/90">{plans.length} plans</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} billing={billing} onChoose={onChoose} />
        ))}
      </div>
    </section>
  );
}

function ServersPanel({ onRent }: { onRent?: () => void }) {
  const [hours, setHours] = useState(160);
  const [rentFeedback, setRentFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!rentFeedback) return;
    const t = setTimeout(() => setRentFeedback(null), 2200);
    return () => clearTimeout(t);
  }, [rentFeedback]);

  const handleRent = (tierName: string) => {
    if (onRent) {
      onRent();
      return;
    }
    setRentFeedback(`${tierName}: open Server Cloud to provision.`);
  };

  return (
    <div className="flex flex-col gap-6" data-channel="servers-rental">
      <div className="flex flex-col gap-1">
        <span className="w-fit rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">Extra channel 1</span>
        <h2 className="text-xl font-bold tracking-tight text-ink">{whiloText("rentals.title")}</h2>
        <p className="text-[13px] text-ink-secondary">{whiloText("rentals.subtitle")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-hairline bg-card p-4">
        <label htmlFor="rental-hours" className="text-[13px] font-medium text-ink">{whiloText("rentals.hours")}</label>
        <input
          id="rental-hours"
          type="range"
          min={1}
          max={744}
          value={hours}
          aria-label="Rental hours estimate"
          onChange={(event) => setHours(Number(event.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-inset accent-accent"
        />
        <span className="w-20 text-right text-[13px] font-semibold tabular-nums text-ink">{hours}h</span>
      </div>
      {rentFeedback && (
        <p className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-[12px] text-accent">{rentFeedback}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {RENTAL_TIERS.map((tier) => {
          const hourCost = Math.round(hours * tier.hourly * 100) / 100;
          const saved = hours >= 720;
          return (
            <article
              key={tier.id}
              data-rental-tier={tier.id}
              className={cn(
                "flex flex-col gap-4 rounded-3xl border p-5 transition-all",
                tier.highlight ? "border-accent/50 bg-gradient-to-b from-accent/[0.1] to-card" : "border-hairline bg-card hover:border-accent/30",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-bold text-ink">{whiloText(tier.nameKey)}</h3>
                {tier.badgeKey && (
                  <span className="rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                    {whiloText(tier.badgeKey)}
                  </span>
                )}
              </div>
              <dl className="grid grid-cols-3 gap-2">
                {[
                  { icon: Cpu, value: `${tier.vcpu} vCPU` },
                  { icon: Gauge, value: `${tier.ramGb} GB` },
                  { icon: Boxes, value: `${tier.diskGb} GB` },
                ].map(({ icon: Icon, value }) => (
                  <div key={value} className="flex flex-col items-center gap-1 rounded-xl border border-hairline bg-inset/50 py-2">
                    <Icon size={15} aria-hidden="true" className="text-ink-secondary" />
                    <dd className="text-[11px] font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-end justify-between border-t border-hairline pt-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold tracking-tight text-ink">{formatUsd(tier.hourly)}</span>
                  <span className="text-[11px] text-ink-secondary">{whiloText("rentals.perHour")}</span>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-semibold text-accent">{formatUsd(hourCost)}</p>
                  <p className="text-[11px] text-ink-secondary">
                    {whiloText("rentals.forHours", { hours: saved ? 720 : hours })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRent(whiloText(tier.nameKey))}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-raised text-[13px] font-semibold text-ink transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <Cloud size={15} aria-hidden="true" />
                {onRent ? `${whiloText("rentals.rent")} · Server Cloud` : whiloText("rentals.rent")}
              </button>
            </article>
          );
        })}
      </div>
      <p className="text-[12px] text-ink-secondary">
        Rental provisioning and live billing are managed in Server Cloud. This panel provides transparent estimates and a direct path to provision capacity.
      </p>
    </div>
  );
}

function ApiPanel({ baseUrl }: { baseUrl: string }) {
  const [modelId, setModelId] = useState(DOMYNIK_MODELS[0].id);
  const [input, setInput] = useState(2_000_000);
  const [output, setOutput] = useState(400_000);
  const [copied, setCopied] = useState(false);
  const model = DOMYNIK_MODELS.find((entry) => entry.id === modelId) ?? DOMYNIK_MODELS[0];
  const cost = useMemo(() => estimateApiCost(model, input, output), [model, input, output]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copyBaseUrl = async () => {
    try {
      await navigator.clipboard.writeText(baseUrl);
      setCopied(true);
    } catch {
      // Fallback: select text is available below; keep honest feedback minimal.
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-6" data-channel="domynik-api">
      <div className="flex flex-col gap-1">
        <span className="w-fit rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">Extra channel 2</span>
        <h2 className="text-xl font-bold tracking-tight text-ink">{whiloText("domynik.api.title")}</h2>
        <p className="text-[13px] text-ink-secondary">{whiloText("domynik.api.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-3 rounded-3xl border border-hairline bg-card p-5">
          {DOMYNIK_MODELS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              data-domynik-model={entry.id}
              onClick={() => setModelId(entry.id)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                entry.id === modelId ? "border-accent/60 bg-accent/10" : "border-hairline hover:border-accent/30 hover:bg-raised/50",
              )}
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold text-ink">{whiloText(entry.nameKey)}</span>
                <span className="text-[11px] text-ink-secondary">
                  {whiloText("domynik.api.context", { tokens: formatContext(entry.contextTokens) })}
                </span>
              </span>
              <span className="flex flex-col items-end text-[11px] text-ink-secondary">
                <span className="font-semibold text-ink">{formatUsd(entry.inputPerMillion)} / 1M in</span>
                <span>{formatUsd(entry.outputPerMillion)} / 1M out</span>
              </span>
            </button>
          ))}
        </div>
        <aside className="flex flex-col gap-4 rounded-3xl border border-hairline bg-gradient-to-b from-accent/[0.08] to-card p-5">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-secondary">{whiloText("domynik.api.estimate")}</h3>
          <label className="flex flex-col gap-1.5 text-[12px] text-ink-secondary">
            {whiloText("domynik.api.inputTokens")}
            <input
              type="number"
              min={0}
              step={100_000}
              value={input}
              onChange={(event) => setInput(Math.max(0, Number(event.target.value)))}
              className="h-10 rounded-xl border border-hairline bg-inset px-3 text-[13px] tabular-nums text-ink focus:border-focus focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[12px] text-ink-secondary">
            {whiloText("domynik.api.outputTokens")}
            <input
              type="number"
              min={0}
              step={100_000}
              value={output}
              onChange={(event) => setOutput(Math.max(0, Number(event.target.value)))}
              className="h-10 rounded-xl border border-hairline bg-inset px-3 text-[13px] tabular-nums text-ink focus:border-focus focus:outline-none"
            />
          </label>
          <div className="flex items-end justify-between border-t border-hairline pt-4">
            <span className="text-[12px] text-ink-secondary">{whiloText("domynik.api.perCall")}</span>
            <span className="text-3xl font-extrabold tracking-tight text-accent">{formatUsd(cost)}</span>
          </div>
          <button
            type="button"
            onClick={() => void copyBaseUrl()}
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent text-[14px] font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {copied ? <CheckCircle2 size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied ? "Base URL copied" : `${whiloText("domynik.api.getKey")} (copy endpoint)`}
          </button>
          <p className="text-[11px] leading-4 text-ink-tertiary">
            {whiloText("domynik.api.note")} Key issuance and live metering require account/backend setup; the copied endpoint is the integration target.
          </p>
        </aside>
      </div>
    </div>
  );
}

export function PlansPage({ onChoose, onOpenServerCloud }: {
  onChoose?: (planId: string) => void;
  onOpenServerCloud?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("plans");
  const [billing, setBilling] = useState<Billing>("monthly");
  const [deepLink, setDeepLink] = useState("https://api.domynik.ai/v1");
  const [urlCopied, setUrlCopied] = useState(false);
  const choose = (id: string) => (onChoose ? onChoose(id) : undefined);
  const style: CSSProperties = { WebkitAppRegion: "no-drag" } as CSSProperties;
  const totalPlans = PERSONAL_PLANS.length + TEAM_PLANS.length;

  useEffect(() => {
    if (!urlCopied) return;
    const t = setTimeout(() => setUrlCopied(false), 1600);
    return () => clearTimeout(t);
  }, [urlCopied]);

  const copyDeepLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
      setUrlCopied(true);
    } catch {
      setUrlCopied(false);
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-app" data-plans-page>
      <header style={style} className="relative overflow-hidden border-b border-hairline px-6 py-7">
        <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-accent/20 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 size-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="bg-gradient-to-r from-ink via-ink to-accent bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              {whiloText("plans.title")}
            </h1>
            <p className="max-w-2xl text-[13px] text-ink-secondary">
              {whiloText("plans.subtitle")} <span className="font-medium text-accent">{totalPlans} plans · 2 extra channels</span>.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-hairline bg-card p-1" role="group" aria-label="Billing period">
            {(["monthly", "annual"] as Billing[]).map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={billing === period}
                onClick={() => setBilling(period)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                  billing === period ? "bg-accent text-white shadow-sm" : "text-ink-secondary hover:text-ink",
                )}
              >
                {whiloText(period === "annual" ? "plans.billing.annual" : "plans.billing.monthly")}
                {period === "annual" && <span className="ml-1.5 text-[10px] opacity-90">-20%</span>}
              </button>
            ))}
          </div>
        </div>
        <nav className="relative mt-6 flex flex-wrap items-center gap-1" aria-label={whiloText("plans.title")}>
          {TABS.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                tab === id ? "bg-raised text-ink shadow-sm" : "text-ink-secondary hover:bg-raised/50 hover:text-ink",
              )}
            >
              <Icon size={15} aria-hidden="true" />
              {whiloText(labelKey)}
            </button>
          ))}
        </nav>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-7">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          {tab === "plans" && (
            <>
              <PlanGrid
                title={whiloText("plans.personal.title")}
                subtitle={`${whiloText("plans.personal.subtitle")} Includes Agent Pro+ (Max / Ultra).`}
                plans={PERSONAL_PLANS}
                billing={billing}
                onChoose={choose}
              />
              <PlanGrid
                title={whiloText("plans.team.title")}
                subtitle={whiloText("plans.team.subtitle")}
                plans={TEAM_PLANS}
                billing={billing}
                onChoose={choose}
              />
              <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-hairline bg-card p-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[15px] font-bold text-ink">{whiloText("plans.extra.title")}</h2>
                  <p className="text-[13px] text-ink-secondary">{whiloText("plans.extra.subtitle")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTab("servers")}
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-hairline bg-raised px-4 text-[13px] font-semibold text-ink transition-colors hover:border-accent/50 hover:bg-accent/10"
                  >
                    <Cloud size={15} aria-hidden="true" />
                    {whiloText("plans.tab.servers")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("api")}
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-hairline bg-raised px-4 text-[13px] font-semibold text-ink transition-colors hover:border-accent/50 hover:bg-accent/10"
                  >
                    <Terminal size={15} aria-hidden="true" />
                    {whiloText("plans.tab.api")}
                  </button>
                  <button
                    type="button"
                    onClick={onOpenServerCloud}
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/15"
                  >
                    <Server size={15} aria-hidden="true" />
                    {whiloText("plans.extra.serverCloud")}
                  </button>
                </div>
              </section>
              <p className="text-center text-[11px] text-ink-tertiary">
                {whiloText("plans.currencyNote", { currency: PLAN_CURRENCY })} Live checkout/billing requires configured payment providers.
              </p>
            </>
          )}
          {tab === "servers" && <ServersPanel onRent={onOpenServerCloud} />}
          {tab === "api" && (
            <div className="flex flex-col gap-6">
              <ApiPanel baseUrl={deepLink} />
              <div className="rounded-3xl border border-hairline bg-card p-5">
                <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-secondary">{whiloText("domynik.api.baseUrl")}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    readOnly
                    value={deepLink}
                    onFocus={(event) => event.currentTarget.select()}
                    onChange={(event) => setDeepLink(event.target.value)}
                    className="h-10 min-w-[220px] flex-1 rounded-xl border border-hairline bg-inset px-3 font-mono text-[12px] text-ink focus:border-focus focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void copyDeepLink()}
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 text-[12px] font-semibold text-accent hover:bg-accent/15"
                  >
                    {urlCopied ? <CheckCircle2 size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                    {urlCopied ? "Copied" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeepLink("https://api.domynik.ai/v1")}
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-hairline bg-raised px-4 text-[12px] font-semibold text-ink hover:border-accent/50"
                  >
                    {whiloText("domynik.api.reset")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
