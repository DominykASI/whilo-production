import { useState } from "react";
import { ArrowRight, Boxes, Check, Cpu, Gauge, Server, ShieldCheck, Sparkles, Terminal, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { DOMYNIK_MODELS, RENTAL_TIERS, estimateApiCost, formatContext, formatUsd } from "@/lib/monetization";
import { PERSONAL_PLANS, TEAM_PLANS, PLAN_CURRENCY, BLACK_FRIDAY_PROMO, isBlackFridayActive, promoMonthlyPrice, isNamedPlanValue, planValueKey, type Plan } from "@/lib/plans";
import { whiloText } from "@/lib/whilo-workflow-text";

type Billing = "monthly" | "annual";

const FAQ = [
  {
    q: "Can I start without paying?",
    a: "Yes. Starter is free forever: one agent, three routines and every local tool on your machine or in your own environment. Upgrade only when you need more throughput, hosted capacity or team controls.",
  },
  {
    q: "What do Agent Pro+ and Max 20x include?",
    a: "Agent Pro+ is the sweet spot for operators shipping daily: 10 agents, 100 routines, 5 concurrent runs, 500 monthly credits and a hosted server — Black Friday: $5/mês (50% OFF de $10) até 30/11. Max 20x raises the ceiling to 40 agents, unlimited routines, 20 concurrent runs, 2,000 credits and three hosted servers.",
  },
  {
    q: "What is a credit?",
    a: "A credit is a unit of agent work — model calls, browser steps and tool runs draw from the same monthly pool. Each plan includes a predictable allowance so teams can budget usage before scaling.",
  },
  {
    q: "How does renting a server work?",
    a: "Choose a size, run it by the hour for burst workloads or keep a monthly cap for always-on swarms, then release it when the job is done. It is the fastest way to add compute without changing plans.",
  },
  {
    q: "What is the Domynik API?",
    a: "Domynik is Whilo's model layer exposed as an API for your own products. One base URL, metered tokens, clear per-million pricing, and volume-friendly economics for Ultra and Enterprise customers.",
  },
  {
    q: "Can I cancel or talk to sales?",
    a: "Paid plans are designed to be flexible: keep Starter data, cancel when you no longer need the extra capacity, and contact sales for Enterprise, custom seats, VPC or procurement requirements.",
  },
];

const HIGHLIGHTS = [
  { icon: Sparkles, title: "Agents that actually run", body: "Workflows, routines, agenda and multi-agent execution in one place — from a solo operator to a full company of agents." },
  { icon: Server, title: "Revenue channel: server rental", body: "Rent compute by the hour for bursts, swarms and heavy jobs. Pay for capacity only when you need it." },
  { icon: Terminal, title: "Revenue channel: Domynik API", body: "Sell intelligence inside your own product with Whilo's Domynik models, metered usage and simple token pricing." },
];

const TRUST_POINTS = [
  "8 plans: 4 personal + 4 team/enterprise",
  "2 extra monetization channels: Servers + Domynik API",
  "Midnight public pricing experience",
  "Whilo branding end-to-end",
];

function WhiloMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="whilo-mark" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#whilo-mark)" />
      <path d="M10 12.5c2.4 0 3.1 5.5 6 5.5s3.6-5.5 6-5.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="11.5" cy="10.5" r="1.4" fill="white" />
      <circle cx="20.5" cy="10.5" r="1.4" fill="white" />
      <path d="M9 21.2c1.9 1.8 4.3 2.8 7 2.8s5.1-1 7-2.8" stroke="white" strokeOpacity="0.9" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function priceLabel(plan: Plan, billing: Billing): string {
  const monthly = billing === "annual" ? plan.priceAnnualMonthly : plan.priceMonthly;
  if (monthly === null) return "Custom";
  if (monthly === 0) return "Free";
  return formatUsd(monthly);
}

function PlanColumn({ plan, billing }: { plan: Plan; billing: Billing }) {
  const monthly = billing === "annual" ? plan.priceAnnualMonthly : plan.priceMonthly;
  return (
    <article
      data-plan={plan.id}
      data-plan-audience={plan.audience}
      data-plan-highlight={plan.highlight ? "true" : "false"}
      className={cn(
        "relative flex flex-col gap-6 rounded-3xl border p-7 transition-all duration-300",
        plan.highlight
          ? "border-accent/60 bg-gradient-to-b from-accent/[0.14] via-white/[0.02] to-transparent shadow-[0_0_60px_-14px] shadow-accent/50 lg:-translate-y-2"
          : "border-white/10 bg-white/[0.02] hover:border-accent/40 hover:bg-white/[0.04]",
      )}
    >
      {plan.highlight && (
        <span aria-hidden className="pointer-events-none absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
      )}
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold tracking-tight text-ink">{whiloText(plan.nameKey)}</h3>
          {plan.badgeKey && (
            <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              {whiloText(plan.badgeKey)}
            </span>
          )}
        </div>
        <p className="text-[13px] leading-5 text-ink-secondary">{whiloText(plan.taglineKey)}</p>
      </header>
      <div className="flex flex-col gap-1.5">
        {(() => {
          const promo = billing === "monthly" ? promoMonthlyPrice(plan) : null;
          if (promo !== null && plan.priceMonthly !== null) {
            return (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    Black Friday 50% OFF · até 30/11
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold tracking-tight text-ink">{formatUsd(promo)}</span>
                  {promo > 0 && <span className="pb-2 text-[12px] text-ink-secondary">{whiloText("plans.perMonth")}</span>}
                  <span className="pb-2 text-lg font-semibold text-ink-secondary/70 line-through decoration-rose-400/70">{formatUsd(plan.priceMonthly)}</span>
                </div>
                <p className="text-[12px] font-medium text-emerald-300">Agent Pro+ por {formatUsd(promo)}/mês (era {formatUsd(plan.priceMonthly)}) na Black Friday — 50% de desconto até o fim de novembro.</p>
              </>
            );
          }
          return (
            <div className="flex items-end gap-1.5">
              <span className="text-5xl font-extrabold tracking-tight text-ink">{priceLabel(plan, billing)}</span>
              {monthly !== null && monthly > 0 && <span className="pb-2 text-[12px] text-ink-secondary">{whiloText("plans.perMonth")}</span>}
            </div>
          );
        })()}
      </div>
      {billing === "annual" && monthly !== null && monthly > 0 && plan.priceMonthly !== null && (
        <p className="text-[11px] font-medium text-accent">Billed annually · save 20% vs monthly ({formatUsd(plan.priceMonthly)}/mo)</p>
      )}
      <ul className="flex flex-col gap-3 border-t border-white/10 pt-6" aria-label={`${whiloText(plan.nameKey)} limits`}>
        {plan.limitKeys.map((limit) => (
          <li key={limit.key} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-ink-secondary">{whiloText(limit.key)}</span>
            <span className="font-semibold tabular-nums text-ink">{isNamedPlanValue(limit.value) ? whiloText(planValueKey(limit.value)) : limit.value}</span>
          </li>
        ))}
      </ul>
      <ul className="flex flex-1 flex-col gap-2.5" aria-label={`${whiloText(plan.nameKey)} benefits`}>
        {plan.benefitKeys.map((benefit) => (
          <li key={benefit.key} className="flex items-start gap-2.5 text-[13px] text-ink-secondary">
            <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
            <span>{whiloText(benefit.key)}</span>
          </li>
        ))}
      </ul>
      <a
        href={plan.id === "enterprise" ? "mailto:sales@onerall.com?subject=Whilo%20Enterprise" : `/app?signup=1&plan=${plan.id}`}
        aria-label={`${whiloText(plan.ctaKey)} — ${whiloText(plan.nameKey)}`}
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
          plan.highlight
            ? "bg-accent text-white shadow-lg shadow-accent/30 hover:brightness-110"
            : "border border-white/15 bg-white/[0.03] text-ink hover:border-accent/50 hover:bg-accent/10",
        )}
      >
        {whiloText(plan.ctaKey)}
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </article>
  );
}

function PlanBand({
  id,
  title,
  subtitle,
  plans,
  billing,
}: {
  id: string;
  title: string;
  subtitle: string;
  plans: readonly Plan[];
  billing: Billing;
}) {
  return (
    <section id={id} data-plan-band={id} className="scroll-mt-24 flex flex-col gap-7">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
        <p className="max-w-2xl text-[14px] text-ink-secondary">{subtitle}</p>
        <p className="text-[12px] font-medium text-accent/90">{plans.length} plans</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanColumn key={plan.id} plan={plan} billing={billing} />
        ))}
      </div>
    </section>
  );
}

function ServersBand() {
  const [hours, setHours] = useState(160);
  return (
    <section id="servers" data-channel="servers-rental" className="scroll-mt-24 flex flex-col gap-7">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
          <Server size={13} aria-hidden="true" /> Extra channel 1
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Rent servers by the hour</h2>
        <p className="max-w-2xl text-[14px] text-ink-secondary">
          On-demand compute for agent swarms, batch jobs and peak traffic. Slide to estimate cost, then provision through Server Cloud inside Whilo.
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <label htmlFor="pricing-hours" className="text-[13px] font-medium text-ink">Hours / month</label>
        <input
          id="pricing-hours"
          type="range"
          min={1}
          max={744}
          value={hours}
          aria-label="Rental hours estimate"
          onChange={(event) => setHours(Number(event.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
        />
        <span className="w-16 text-right text-[13px] font-semibold tabular-nums text-ink">{hours}h</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {RENTAL_TIERS.map((tier) => (
          <article
            key={tier.id}
            data-rental-tier={tier.id}
            className={cn(
              "flex flex-col gap-4 rounded-3xl border p-5 transition-all",
              tier.highlight ? "border-accent/50 bg-gradient-to-b from-accent/[0.12] to-transparent" : "border-white/10 bg-white/[0.02] hover:border-accent/30",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[14px] font-bold text-ink">{whiloText(tier.nameKey)}</h3>
              {tier.badgeKey && (
                <span className="rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent">
                  {whiloText(tier.badgeKey)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { icon: Cpu, value: `${tier.vcpu} vCPU` },
                { icon: Gauge, value: `${tier.ramGb} GB RAM` },
                { icon: Boxes, value: `${tier.diskGb} GB disk` },
              ].map(({ icon: Icon, value }) => (
                <span key={value} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-ink-secondary">
                  <Icon size={11} aria-hidden="true" />
                  {value}
                </span>
              ))}
            </div>
            <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-ink">{formatUsd(tier.hourly)}</span>
                <span className="text-[10px] text-ink-secondary">{whiloText("rentals.perHour")}</span>
              </div>
              <div className="text-right">
                <span className="block text-[12px] font-semibold text-accent">{formatUsd(Math.round(hours * tier.hourly * 100) / 100)}</span>
                <span className="text-[10px] text-ink-secondary">{whiloText("rentals.forHours", { hours })}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="text-center text-[12px] text-ink-secondary">
        Provision and manage rented machines in-app via <a href="/app" className="font-medium text-accent hover:underline">Server Cloud</a>. Pricing shown is estimate guidance; live billing terms depend on your active checkout/provider integration.
      </p>
    </section>
  );
}

function ApiBand() {
  const model = DOMYNIK_MODELS[0];
  const cost = estimateApiCost(model, 2_000_000, 400_000);
  return (
    <section id="domynik-api" data-channel="domynik-api" className="scroll-mt-24 flex flex-col gap-7">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
          <Terminal size={13} aria-hidden="true" /> Extra channel 2
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Sell the Domynik API</h2>
        <p className="max-w-2xl text-[14px] text-ink-secondary">
          The same intelligence that runs Whilo, exposed behind one base URL. Metered tokens, clear per-model pricing, and room to resell or embed in your own product.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {DOMYNIK_MODELS.map((entry) => (
          <article key={entry.id} data-domynik-model={entry.id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-bold text-ink">{whiloText(entry.nameKey)}</h3>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-ink-secondary">{formatContext(entry.contextTokens)} ctx</span>
            </div>
            <p className="text-[12px] text-ink-secondary">{whiloText("domynik.api.context", { tokens: formatContext(entry.contextTokens) })}</p>
            <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-4 text-[12px]">
              <span className="text-ink-secondary">Input / 1M tokens</span>
              <span className="font-semibold tabular-nums text-ink">{formatUsd(entry.inputPerMillion)}</span>
            </div>
            <div className="flex items-end justify-between text-[12px]">
              <span className="text-ink-secondary">Output / 1M tokens</span>
              <span className="font-semibold tabular-nums text-ink">{formatUsd(entry.outputPerMillion)}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-b from-accent/[0.1] to-transparent p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-ink-secondary">Example: 2M input + 400K output tokens on Domynik Flash</span>
          <span className="text-2xl font-extrabold tracking-tight text-accent">{formatUsd(cost)}</span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[12px] text-ink-secondary">
          <span className="shrink-0 rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent">POST</span>
          <span>https://api.domynik.ai/v1/chat/completions</span>
        </div>
        <a
          href="/app?signup=1&api=1"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-[14px] font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
        >
          <Zap size={16} aria-hidden="true" />
          Get API access
        </a>
        <p className="text-center text-[11px] text-ink-tertiary">API key issuance and live billing depend on your account/backend setup. Use this endpoint as the integration target.</p>
      </div>
    </section>
  );
}

export function PricingSite() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const totalPlans = PERSONAL_PLANS.length + TEAM_PLANS.length;
  return (
    <div data-skin="midnight" data-pricing-page className="min-h-dvh bg-[#08080b] font-sans text-ink antialiased">
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.22),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none fixed right-[-10%] top-[20%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight text-ink">
          <WhiloMark className="size-8 shadow-lg shadow-accent/30" />
          <span>Whilo</span>
        </a>
        <nav className="flex items-center gap-1 text-[13px] sm:gap-2">
          <a href="/pricing" aria-current="page" className="rounded-lg px-3 py-2 font-medium text-ink">Pricing</a>
          <a href="#servers" className="hidden rounded-lg px-3 py-2 text-ink-secondary transition-colors hover:text-ink sm:inline-flex">Servers</a>
          <a href="#domynik-api" className="hidden rounded-lg px-3 py-2 text-ink-secondary transition-colors hover:text-ink sm:inline-flex">Domynik API</a>
          <a href="/apps" className="rounded-lg px-3 py-2 text-ink-secondary transition-colors hover:text-ink">Apps</a>
          <a href="/app" className="ml-1 rounded-lg bg-white/[0.06] px-4 py-2 font-semibold text-ink transition-colors hover:bg-white/[0.1]">Open app</a>
        </nav>
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-28 pt-12">
        <section className="flex flex-col items-center gap-6 text-center">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-ink-secondary">
            <span className="size-1.5 rounded-full bg-emerald-400" /> {totalPlans} plans · 2 extra monetization channels · midnight skin
          </span>
          <h1 className="max-w-4xl bg-gradient-to-b from-ink via-ink to-ink-secondary bg-clip-text text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent sm:text-6xl">
            Start free. Scale to a full company of agents.
          </h1>
          <p className="max-w-2xl text-[15px] leading-6 text-ink-secondary">
            Pick the right plan for one operator or a whole team — including <strong className="font-semibold text-ink">Agent Pro+</strong> and <strong className="font-semibold text-ink">Max 20x</strong> — then add revenue with server rentals and the Domynik API.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TRUST_POINTS.map((point) => (
              <span key={point} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11px] text-ink-secondary">
                <ShieldCheck size={13} aria-hidden="true" className="text-accent" />
                {point}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1" role="group" aria-label="Billing period">
            {(["monthly", "annual"] as Billing[]).map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={billing === period}
                onClick={() => setBilling(period)}
                className={cn(
                  "cursor-pointer rounded-full px-5 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
                  billing === period ? "bg-accent text-white shadow-sm" : "text-ink-secondary hover:text-ink",
                )}
              >
                {period === "annual" ? "Annual (save ~20%)" : "Monthly"}
              </button>
            ))}
          </div>
        </section>

        <PlanBand id="personal-plans" title="For you" subtitle="4 personal plans for solo operators and power users." plans={PERSONAL_PLANS} billing={billing} />
        <PlanBand id="team-plans" title="Teams & Enterprise" subtitle="4 plans for teams, scale and custom procurement." plans={TEAM_PLANS} billing={billing} />
        <ServersBand />
        <ApiBand />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <article key={title} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Icon size={19} aria-hidden="true" />
              </span>
              <h3 className="text-[15px] font-bold text-ink">{title}</h3>
              <p className="text-[13px] leading-5 text-ink-secondary">{body}</p>
            </article>
          ))}
        </section>

        <section id="faq" className="flex flex-col gap-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">Questions, answered</h2>
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
            {FAQ.map((entry) => (
              <details key={entry.q} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 open:border-accent/30">
                <summary className="cursor-pointer list-none text-[14px] font-semibold text-ink marker:hidden">
                  {entry.q}
                </summary>
                <p className="mt-2.5 text-[13px] leading-5 text-ink-secondary">{entry.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-gradient-to-b from-accent/[0.14] to-transparent px-8 py-14 text-center">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Your first agent is free. Grow when the work grows.</h2>
          <p className="max-w-xl text-[14px] text-ink-secondary">
            Start on Starter, move to Agent Pro+ or Max 20x for throughput, and monetize further with hourly servers and the Domynik API.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="/app?signup=1&plan=starter" className="flex h-12 items-center gap-2 rounded-xl bg-accent px-7 text-[15px] font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70">
              Start free <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a href="/app?signup=1&plan=agent-pro-plus" className="flex h-12 items-center rounded-xl border border-white/15 bg-white/[0.03] px-6 text-[15px] font-semibold text-ink transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70">
              Try Agent Pro+
            </a>
            <a href="mailto:sales@onerall.com?subject=Whilo%20Sales" className="flex h-12 items-center rounded-xl border border-white/15 bg-white/[0.03] px-6 text-[15px] font-semibold text-ink transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70">
              Talk to sales
            </a>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-[12px] text-ink-secondary">
          <span>© {new Date().getFullYear()} Whilo · Onerall. Prices in {PLAN_CURRENCY}. Public checkout and live billing require configured payment providers.</span>
          <nav className="flex items-center gap-5">
            <a href="/pricing" className="transition-colors hover:text-ink">Pricing</a>
            <a href="/app" className="transition-colors hover:text-ink">Open app</a>
            <a href="mailto:sales@onerall.com" className="transition-colors hover:text-ink">Sales</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
