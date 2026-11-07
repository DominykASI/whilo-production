# Whilo — pricing, packaging, and the path to $1M/month

Status: working document. Not advice. Builds on [whilo-strategy.md](whilo-strategy.md).
Product version: 0.59.0.

This document prices what ships in this repository. It does not price what we plan to build.

## 0. Method and status legend

| Marker | Meaning |
| --- | --- |
| **VERIFIED** | I read the price in a file in this repository, and the file is the price source that Stripe bills from. |
| **A CONFIRMAR** | I did not read the vendor's own live page. The number may come from our own shipped content, which is a secondary source. The URL to check is given. |

### What I tried, and what failed

I tried to read eight vendor pricing pages. Every request returned HTTP 429 (weekly tool quota
exhausted). The pages were: `claude.com/pricing`, `anthropic.com/pricing`, `openai.com/chatgpt/pricing/`,
`openai.com/api/pricing/`, `cursor.com/pricing`, `manus.im/pricing`, `docs.boat.dev/pricing`, and
`openbot.run/pricing`. None loaded.

Thus **no competitor price in this document is marked VERIFIED.** All are A CONFIRMAR. Where a number
appears, it comes from a file in this repository that already publishes it. I name that file. The
number still needs a check against the vendor page before any of it goes into an ad or a comparison
page.

### The one price set that IS verified

Whilo's own prices are not estimates. They are constants that
`scripts/stripe-bootstrap.ts` turns into Stripe Prices, and the app reads the Stripe Prices at
checkout (`packages/contracts/src/billing.ts` `billingListPrices`,
`packages/contracts/src/license.ts` `LICENSE_PLAN_PRICES`). Price changes are code changes.

---

## 1. Inventory of the value surface

Every capability below ships in 0.59.0. "Free" means no gate exists in the code — the app does not
check a plan, a license, or a seat before the feature runs.

### 1.1 Agent runtime

| Capability | Tier | Confirmed at |
| --- | --- | --- |
| 15 provider drivers: codex, claude, grok, opencode, antigravity, cursor, cline, pi, muse, inception, deepseek, openrouter, hermes, acp, kimi | Free | `packages/contracts/src/agent-providers.ts` (`AGENT_PROVIDERS`) |
| Bring-your-own provider account or API key, per agent | Free — and this is the core of the margin story | `docs/architecture/providers.md`, `README.md` §Providers |
| Persistent agent identity, workspace, thread across provider switches and restarts | Free | `src/backend/agent-service.ts` |
| Side threads (tasks) per agent; default 2 concurrent, hard max 4 | Free, **concurrency is an upsell candidate** | `packages/contracts/src/ipc-agent-tasks.ts` (`AGENT_TASK_LIMIT_DEFAULT = 2`, `AGENT_TASK_LIMIT_MAX = 4`) |
| Up to 100 agents per host | Free (wire cap only) | `packages/contracts/src/input-limits.ts` (`agents: 100`) |
| Agent profile tools, avatar generation, sections/folders | Free | `docs/architecture/agents.md` |
| Agent instruction file (`AGENTS.md` / `CLAUDE.md`) with change tracking and Undo | Free | `docs/architecture/agents.md` §Agent instruction file |
| Memory with background review | Free | `docs/architecture/providers.md` §Background memory review |
| Quality guard: continue-until-done (up to 8 self-continues) | Free | `CHANGELOG.md` 0.59.0 |

### 1.2 Execution surfaces

| Capability | Tier | Confirmed at |
| --- | --- | --- |
| Workspace files, shared folder, attachments (100 MB per file, 250 MB per message) | Free | `src/renderer/src/features/files/AgentFilesSettings.tsx`, `packages/contracts/src/input-limits.ts` (`ATTACHMENT_LIMITS`) |
| Embedded browser with named profiles, tab queue per thread, approved signing-in takeover | Free | `src/renderer/src/features/browser/`, `src/backend/browser-profiles/browser-profile-store.ts` |
| Computer Use (screen, accessibility, input) via `cua-driver` | Free | `src/main/cua-driver-runtime.ts`, `docs/architecture/computer-use.md` |
| Remote desktop into a host | Free | `src/renderer/src/features/remote-desktop/remote-desktop-port.ts` |
| Approval gates: Ask first / Full access, per-agent, agents may only narrow it | Free | `docs/architecture/agents.md` §Prompt-driven agent profiles |
| Vault: API keys, logins, cards; agent can request an item, never reads a secret | Free, **card/identity upsell candidate** | `src/renderer/src/features/vault/ServerVaultPanel.tsx`, `src/backend/vault-items.ts` |
| Link wallet: agent asks for a one-time card, user approves in Link | Free, **strongest purchase-loop upsell** | `src/backend/link-wallet.ts`, `CHANGELOG.md` 0.59.0 |
| Speech / voice replies, own voice server | Free | `src/renderer/src/features/speech/voice-server.ts` |

### 1.3 Automation — the retention surface that exists

| Capability | Tier | Confirmed at |
| --- | --- | --- |
| Routines: schedule and webhook triggers, 64 per agent, missed-run and one-time policies | Free — **this is the shipped daily loop** | `src/backend/agent-routine-store.ts`, `packages/contracts/src/input-limits.ts` (`agentRoutines: 64`) |
| Routine flows: hand an agent's answer to other agents, canvas on this host | Free | `src/backend/routine-flows/`, `src/renderer/src/features/routine-flows/RoutineFlowsCanvas.tsx` |
| Workflows: graph of agents, models, conditions, approvals, outputs; schedule, webhook, GitHub, Discord triggers; 50 versions | Free, **team upsell candidate** | `src/backend/workflows/`, `src/renderer/src/features/workflows/WorkflowsPage.tsx` |
| Quiet runs (`routine_no_update`) and failed-run reporting | Free | `docs/architecture/agents.md` §Quiet routine runs |
| Routine calendar feed (ICS) to a local calendar app | Free | `src/main/routine-feed-server.ts` |
| Local scripts automation API on loopback, rotating token | Free, **upsell candidate for teams** | `src/main/automation-server.ts`, `docs/automation.md` |

### 1.4 Integrations and distribution of work

| Capability | Tier | Confirmed at |
| --- | --- | --- |
| MCP servers, host-global, agent-managed with approval | Free | `src/renderer/src/features/servers/mcp-servers.ts`, `docs/architecture/agents.md` |
| Apps / plugin catalog: 31 listings | Free | `marketplace/plugin-catalog/catalog.json` (`order` length 31) |
| Skills marketplace: 40 skills | Free | `marketplace/production-catalog/catalog.json` |
| Agents marketplace, public listing, install | Free, **no creator payout exists — upsell candidate** | `src/main/agent-marketplace-service.ts` |
| Agent templates: public link, share card, 5 published per account | Free, **the "5" is a natural upsell** | `src/main/agent-template-service.ts`, `docs/architecture/agents.md` §Agent templates |
| Channels (shared agent group chats) with lead-agent routing | Free | `src/backend/channel-service.ts` |
| Messaging connectors: Slack, Discord, Telegram | Free | `packages/contracts/src/ipc-messaging.ts` (`MESSAGING_PLATFORMS`) |
| Webhook events API with signed routes | Free | `docs/architecture/events.md` |
| Instance transfer (whole host to another host), agent import | Free | `src/main/instance-transfer-service.ts` |

### 1.5 Clients

| Capability | Tier | Confirmed at |
| --- | --- | --- |
| Desktop: macOS, Windows, Linux | Free | `README.md`, `electron-builder.yml` |
| Web client at `/app` | Free | `apps/auth-api/src/routes/app.tsx`, `docs/web-client.md` |
| iOS and Android via EAS | Free, **cannot sell — store rules** | `apps/mobile/eas.json`, `apps/mobile/src/app/(app)/hosted-server/_layout.tsx` (comment: store rules forbid an outside purchase) |
| Dynamic Island / Live Activity, push | Free | `docs/architecture/channels-and-messaging.md` |

### 1.6 What is actually gated today

This is the whole monetized surface. It is small, and it is the most important table in this
document.

| Gate | Mechanism | Money | Confirmed at |
| --- | --- | --- | --- |
| **Commercial use is licensed, not sold by feature** | PolyForm Noncommercial 1.0.0. Any commercial use needs a paid Seat. No code check — a legal term. | $12/user/mo Starter; $30 base for 2 + $18/user to 10 (USD) | `LICENSE`, `README.md` §License and attribution, `packages/contracts/src/license.ts` (`LICENSE_STARTER_MONTHLY` = 1_200 usd; `LICENSE_PRICES` base 3_000 + extraUser 1_800), `apps/auth-api/src/content/commercial-license.tsx` (license text only — it has no prices) |
| **Member seats on a self-run host** | 3 active members with no plan and no licence. A licence or a server plan raises it. | Server plan member limits 1 / 5 / 10; licence = user count | `packages/contracts/src/input-limits.ts` (`DEFAULT_TEAM_MEMBER_LIMIT = 3`), `apps/auth-api/src/server/remote-control-plane.ts` (`LICENSE_SEAT_AVAILABLE_SQL`) |
| **Hosted servers** | Managed macOS/Linux sandbox on boat | $25 / $60 / $120 per month. **Starter is sold out.** | `packages/contracts/src/billing.ts` (`BILLING_PLAN_MONTHLY_PRICES`), `apps/auth-api/src/lib/pricing-page.ts` (`SOLD_OUT_PLANS = new Set(["starter"])`) |
| **Hosted sites per server** | Public site publishing from R2 | none 1, Starter 3, Standard 10, Pro 50 | `docs/architecture/servers.md` §Hosted sites per server, `siteLimitForPlan` |
| **Hosted storage** | Per plan | 12 / 50 / 100 GB; relative speed 1 / 2 / 4 | `packages/contracts/src/billing.ts` (`BILLING_PLANS`) |

**Finding.** Whilo does not have a feature paywall. It has a **legal** paywall (commercial use) and a
**seat** paywall (the fourth person on a host). Every product capability is free. That single fact
decides every route in §6.

### 1.7 What is NOT shipped, and must not be priced

| Claimed in the strategy doc | Reality in 0.59.0 | Evidence |
| --- | --- | --- |
| Whilo Inbox: every agent has its own address, an MCP tool set, an inbox tab | **Does not exist.** No Email Worker, no `inbox.*` MCP tools, no mail parser, no inbox UI. The doc is a design sketch that says "não testado". | `docs/business/whilo-inbox.md`; `grep -rn "inbox\." src/backend` returns nothing; `apps/` holds no mail Worker |
| "Minha Carteira" as a Whilo product | **Partly shipped** — as Stripe Link integration, not as a Whilo wallet. Region-limited by Link. | `src/backend/link-wallet.ts` |
| Inbox as the "daily retention loop" | Wrong loop. See §9. | — |

---

## 2. Competitive pricing table

All prices are USD per month unless noted. **Every row is A CONFIRMAR.** The "Our file" column names
the repository file that publishes the number today — that file is where the number will be
maintained, and none of it was checked against the vendor this session.

| Vendor | Plans (published names) | Price/month | What the buyer gets | Status | Vendor URL to check | Our file |
| --- | --- | --- | --- | --- | --- | --- |
| **Claude** | Free, Pro, Max, Team | Free; Pro $20 ($17 yearly); Max $100 or $200; Team $25/seat ($20 yearly) | Model access + Claude Code, 5-hour windows and weekly caps shared between Claude and Claude Code | A CONFIRMAR | `claude.com/pricing` | `apps/auth-api/src/content/compare/cursor-vs-claude-code.ts:97` |
| **ChatGPT / Codex** | Free, Go, Plus, Pro, Business | Plus $20; Pro $100 / $200 / $500; Business $20/seat yearly | Model access + Codex including cloud tasks; API key also works at API prices | A CONFIRMAR | `learn.chatgpt.com/docs/pricing` | `apps/auth-api/src/content/compare/codex-vs-claude-code.ts:119` |
| **Cursor** | Hobby, Pro, Pro+, Ultra, Teams | Free; $20; $60; $200; Teams $40 or $120/user | Editor + agents with an included usage pool; overage at API prices | A CONFIRMAR | `cursor.com/pricing` | `apps/auth-api/src/content/compare/cursor-vs-claude-code.ts:96` |
| **Manus** | Free, Pro, Team | Free 300 credits/day; Pro $20–$200; Team from $20/seat | General agent in Manus's cloud sandbox; no own computer needed | A CONFIRMAR | `manus.im/pricing` | `apps/auth-api/src/content/compare/manus.ts:217` |
| **Grok (xAI)** | Free, SuperGrok, SuperGrok Plus, API | SuperGrok $30; SuperGrok Plus $100 | Grok models, higher limits, Grok Build usage | A CONFIRMAR | `docs.x.ai` / `grok.com` | `apps/auth-api/src/content/providers/grok.ts:45` |
| **Cline** | No subscription; optional ClinePass | $0 + AI usage; ClinePass $9.99 | Open-source (Apache 2.0) client; you pay the model provider; free models with per-model limits | A CONFIRMAR | `cline.bot/pricing` | `apps/auth-api/src/content/providers/cline.ts:51` |
| **OpenCode** | Free models, Go, Go Plus | $0; $10; $40 | Free open models, or a paid pool of open coding models | A CONFIRMAR | `opencode.ai` | `apps/auth-api/src/content/providers/opencode.ts:61` |
| **Devin** | Free, Pro, Max, Teams | Free light quota; $20; $200; Teams $80 + $40/full seat | Autonomous engineer in Cognition's cloud; **does not accept your own API keys** | A CONFIRMAR | `devin.ai/pricing` | `apps/auth-api/src/content/compare/devin.ts:110` |

### 2.1 What the table says about Whilo's price band

| Segment | Established price/month | Notes |
| --- | --- | --- |
| Model + agent subscription | $20 | The floor. Claude Pro, ChatGPT Plus, Cursor Pro, Devin Pro, Manus Pro all sit here. |
| Power tier | $60–$200 | Cursor Pro+/Ultra, Claude Max, Devin Max, ChatGPT Pro. |
| Seat-based team | $20–$40 per seat | Claude Team $25, ChatGPT Business $20, Cursor Teams $40, Manus Team $20, Devin Teams $40. |
| Free tier that is genuinely usable | $0 | Cline, OpenCode free models, Cursor Hobby, Manus 300 credits/day, Devin light quota. |

Whilo's shipped prices are **below** the seat band: $12 for one commercial user, $30 for two, $18 for
each further user. A 10-person team pays $174. Compare Cursor Teams at 10 seats: $400. Compare Claude
Team at 10 seats: $250.

That is a deliberate-looking position, but it is also the structural problem: Whilo charges **less
than the tools it orchestrates**, while capturing none of the inference spend that those tools bill.
§4 shows why that is not a mistake in itself, and §6 shows why it caps the revenue.

---

## 3. The cost model (the part that makes the margin real)

### 3.1 Inference

**Whilo pays nothing for inference.** The buyer signs in with their own ChatGPT, Claude, Grok, Gemini,
Cursor, Cline, Kimi, Muse or Hermes account, or pastes an API key. Confirmed at
`docs/architecture/providers.md`, `README.md` §Providers, and enforced by design: Whilo has no
reseller key and no proxy billing path. The onboarding flow offers "Start free — free models, no
subscription needed" and "connect a subscription you already have"
(`src/renderer/src/features/onboarding/FirstRunChoice.tsx`,
`packages/i18n/src/messages/en/onboarding.ts:80`).

Consequences, stated plainly because they invert the normal SaaS model:

| Normal AI SaaS | Whilo |
| --- | --- |
| Inference is COGS. Gross margin 50–75%. | Inference is the customer's cost. Gross margin 90–97%. |
| Usage growth increases revenue and COGS together. | Usage growth increases **neither**. Revenue is flat per seat. |
| The vendor captures the model spend. | The model vendor captures the model spend. Whilo captures only tooling willingness-to-pay. |
| A heavy user is a margin risk. | A heavy user is free. An agent that runs 500 turns a day costs Whilo the same as one that runs 5. |
| The vendor must meter and throttle. | No metering is needed. No usage-based plan is possible without adding a proxy. |

**Read this twice.** High gross margin is real and it is the single best thing about the business.
But the same architecture removes the usual expansion lever. There is no path where a customer's
token growth becomes Whilo revenue, because Whilo never touches the tokens.

### 3.2 Payment fees

Stripe, 2.9% + $0.30 per charge.

| Charge | Fee | Net | Fee % |
| --- | --- | --- | --- |
| $12 / mo | $0.648 | $11.35 | 5.4% |
| $30 / mo | $1.170 | $28.83 | 3.9% |
| $45 / mo | $1.605 | $43.40 | 3.6% |
| $174 / mo | $5.346 | $168.65 | 3.1% |
| $600 / mo | $17.700 | $582.30 | 3.0% |

Small tickets are punished. This is a real argument for annual-only billing below $25.

### 3.3 Hosted servers — the only true COGS

boat charges per second while a sandbox runs. The rates are in this repository, at
`docs/hosted-servers.md` §Production: `small` $0.018/h, `default` $0.036/h, `large` $0.072/h. The
plan decides the size (`HOSTED_PLAN_SIZE` in `packages/contracts/src/hosted-servers.ts`).

| Plan | Size | Price/mo | COGS at 24/7 (730 h) | GM at 24/7 | COGS at 8 h/day (243 h) | GM at 8 h/day |
| --- | --- | --- | --- | --- | --- | --- |
| Starter | small | $25 | $13.14 | 47.4% | $4.37 | 82.5% |
| Standard | default | $60 | $26.28 | 56.2% | $8.75 | 85.4% |
| Pro | large | $120 | $52.56 | 56.2% | $17.50 | 85.4% |

Idle servers stop 15–30 minutes after last use (`docs/hosted-servers.md` §Production). So the 8 h/day
column is the realistic one for a working day in one timezone, and the 24/7 column is the floor for a
customer running routines around the clock. **A routine-heavy customer is the margin risk in the one
place Whilo has margin risk.** A Pro server running 24/7 grosses $67.44. A Pro server running 24/7
*plus* a customer who never lets it idle is $52.56 of COGS and no more revenue. This is the argument
for either a routine-aware plan or a fair-use clause. It is not an argument for usage billing.

### 3.4 The boat capacity ceiling — a hard blocker, found in-file

`docs/hosted-servers.md` states the paid boat account (`box_20`) allows **2,000,000 compute seconds
each month, about 555 hours**, 100 active sandboxes, and 200 starts per day.

| Question | Arithmetic | Answer |
| --- | --- | --- |
| How many always-on `default` servers fit in a month? | 555 h ÷ 730 h | **0.76 servers** |
| How many at 8 h/day? | 555 h ÷ 243 h | **2.28 servers** |
| How many `small` at 8 h/day? | 555 ÷ 243 | 2.28 servers |

**One customer running one Standard server around the clock exceeds the entire monthly compute
allowance of the hosting account.** The hosted-server revenue line cannot grow past a handful of
customers on the current boat plan, whatever the price. This is a purchasing problem, not a pricing
problem, and it must be solved before any route that counts on hosted servers means anything. Marked
A CONFIRMAR against `docs.boat.dev/pricing` because I could not read the live plan table.

---

## 4. Gross profit is not revenue

Restating §3 as one rule for the rest of this document:

| Line | Who pays it | Effect on Whilo |
| --- | --- | --- |
| Model inference | The buyer, to their model vendor | **Zero COGS. Zero revenue.** |
| Whilo licence | The buyer, to Whilo | ~96% gross profit |
| Hosted server | The buyer, to Whilo | 47–85% gross profit, capacity-capped |
| Stripe fee | Whilo | 3–5% of revenue |
| Support | Whilo | 1–3% of revenue at low ARPU, 10%+ at enterprise |

So: **at $1M/month of licence-only revenue, gross profit is about $960k. The more the mix leans on
hosted servers, the lower that falls** — the three routes in §6 land at $904k (90.4%), $922k (92.2%)
and $811k (81.1%). No route reaches $1M of gross profit at $1M of revenue, and the route with the
highest ARPU (C) has the *lowest* gross margin, because hosting and human support are the only two
real costs in this business and enterprise customers buy both.

---

## 5. Three packaging options

Each option is a complete, costed, internally consistent set. Prices are USD per month.

### Option A — "Free tool, licence to work" (the shipped design, made deliberate)

| Tier | Price | Scope |
| --- | --- | --- |
| Personal | $0 | Everything. Noncommercial use only. Bring your own provider. 3 members max on your own host. 1 hosted site. |
| Starter (Commercial) | **$12 / user** | Removes the noncommercial restriction for 1 person. All features, unchanged. |
| Team (Commercial) | **$30 base for 2, +$18/user to 10** | Same, for 2–10 people. Also raises the member seat limit on the owner's hosts. |
| Hosted add-on | **$60 / server** (Standard), $120 (Pro) | Managed host. Intra-tenant only. Optional bundle: licence 10% off with a server. |
| Enterprise | Contact sales | >10 users, >25 members, multi-tenant hosting, custom integrations, support. |

**Gross margin:** licence 96.1% (after Stripe); hosted 85.4% at 8 h/day.

**Why it fits the architecture:** it is the only option that needs no inference cost, no metering and
no proxy. It monetizes exactly the one thing Whilo controls — the right to use the software at work —
and it never fights the customer's model vendor.

**Weakness:** the gate is legal, not functional. §6 Route A dies here.

### Option B — "Free tool, paid coordination" (recommended shape)

| Tier | Price | Scope |
| --- | --- | --- |
| Free | $0 | 1 agent, 1 routine, 1 side thread, shared browser profile, 3 members, BYO provider, desktop + phone read-only. |
| Solo | **$19** | Unlimited agents, 8 concurrent side threads, routines, workflows, named browser profiles, Computer Use, local scripts API, Link wallet, 1 member. |
| Team | **$39 / seat, 3 seat minimum** | Everything in Solo, plus channels, shared workflows, routine flows, the audit log, unlimited hosted sites on a hosted server, 10 concurrent side threads, and the seat limit raised. |
| Business | **$99 / seat, annual** | Everything in Team, plus multi-tenant hosting (one macOS user per tenant), instance transfer, SSO *(must be built)*, priority support, and a named contact. |
| Hosted server | **$60 / $120** | As today. Free with a Team or Business seat pool above 5 seats. |
| Self-hosted / on-prem | **$18,000 / year** | The right to run the account service yourself (`docs/self-hosting.md`), plus 25 commercial seats. |

**Gross margin:** 93.6% at $19 (Stripe 5.4%), 95.7% at $39, 96.5% at $99. Hosting 85.4%. Self-hosted
is ~99% — no cost but a tarball and a licence key.

**Why it fits the architecture:** it gates *coordination* — concurrency, shared workflows, audit,
multi-tenancy — all of which are local-first features that cost no inference. It keeps the free tier
genuinely good for one person, which is what makes the GitHub/creator funnel work, and it makes the
free→paid moment a *feature* the buyer wants, not a *lawyer* the buyer fears.

**Weakness:** it narrows the free tier, and that costs distribution. Whilo's current free tier is a
marketing asset. Cutting it to 1 agent is a real trade.

### Option C — "Hosted workspace" (the Cursor/Manus shape)

| Tier | Price | Scope |
| --- | --- | --- |
| Free | $0 | 14-day trial of a hosted server, then read-only. |
| Pro | **$40** | One hosted server, unlimited agents, your own provider keys. |
| Team | **$80 / seat** | Shared hosted servers, channels, workflows, audit. |
| Enterprise | **$30,000 / year** | Multi-tenant, SSO, DPA, support, SLA. |

**Gross margin:** 34% at $40 with a 24/7 Standard server ($26.28 COGS) — **and unbounded COGS risk if
the customer runs routines around the clock.** 56% at $80 with a Standard server. The boat capacity
ceiling in §3.4 makes this option impossible today at any scale.

**Why it does not fit the architecture:** it converts a zero-COGS business into a hosting business
with a hard capacity cap, and it makes the customer's inference-free advantage into Whilo's uptime
liability. It also contradicts the local-first promise in `AGENTS.md` §Product constraints.

### 5.1 Which option fits local-first + bring-your-own-provider

**Option B.** The reasoning, in one table:

| Test | A | B | C |
| --- | --- | --- | --- |
| Needs zero inference COGS | Yes | Yes | Yes |
| Needs zero metering | Yes | Yes | No (needs server metering) |
| Gate is a feature, not a lawyer | **No** | Yes | Yes |
| Works with the boat capacity we have | Yes | Yes | **No** |
| Survives the customer already paying $20–$200 to a model vendor | Weakly | Yes (small add-on) | **No** (competes head-on) |
| Keeps the free tier as a distribution asset | Yes | Partly | No |
| Can charge for what is unique here (approval gates, audit, multi-tenancy) | No | Yes | Yes |

Option A is not wrong — it is what ships. It is Option B's licence floor. The recommendation is to
**keep A's prices as the floor and add B's functional ladder above them**, so no existing customer
pays more and new team customers have something to buy.

### 5.2 The three recommended price points

1. **$0 free** — one person, all providers, no time limit. This is the distribution engine.
2. **$19 / month Solo** — one professional, unlimited agents and routines.
3. **$39 / seat / month Team, 3-seat minimum** — the unit that actually reaches $1M.

Plus the existing **$60 Standard hosted server**, unchanged, and **$18,000/year self-hosted** for the
buyer who will never accept a cloud account service.

---

## 6. The $1M/month math, three independent routes

Shared assumptions, stated so they can be attacked:

| Assumption | Value | Basis |
| --- | --- | --- |
| Monthly churn, consumer | 6% | SMB self-serve software band 4–8% |
| Monthly churn, prosumer | 3% | 2–3 person teams, mid band |
| Monthly churn, enterprise | 1.5% | 18-month average life, typical mid-market |
| CAC, consumer | $25 | Creator/UGC and organic, low paid spend |
| CAC, prosumer | $150 | Content, comparison pages, small paid |
| CAC, enterprise | $6,000 | Two AEs, ~$150k/yr fully loaded each, 25 closes/yr/AE |
| Support cost per account | $0.50 / $1.50 / $60 | Allocation, by tier |
| Stripe | 2.9% + $0.30 | — |
| Hosted share of accounts | 40% / 40% / 100% | Route C assumes every account hosts |

These churn and CAC figures are **model inputs, not measurements.** Whilo has no paying cohort to
measure. Marked A CONFIRMAR: `ANALYTICS.md` §Monetization funnel and §Licenses define the events
(`billing_snapshot` with `license_mrr`, `license_accounts`, `licensed_users`; `plan_ended` with
`end_reason`) that would produce real churn. Nothing in the repository shows a value for them.

### 6.1 Route A — pure consumer at low ARPU

| Line | Value | Arithmetic |
| --- | --- | --- |
| ARPU | $12 | Starter licence, 1 user |
| **Paying seats needed** | **83,334** | 1,000,000 ÷ 12 |
| Monthly churn | 6% | assumption |
| Paying seats replaced each month | 5,000 | 83,334 × 0.06 |
| Free→paid conversion needed | 2% | assumption for a legal-only gate |
| **Free activations needed per month** | **250,000** | 5,000 ÷ 0.02 |
| Free activations per day | 8,333 | 250,000 ÷ 30.4 |
| CAC | $25 | assumption |
| S&M spend per month | $125,000 | 5,000 × 25 |
| Revenue | **$1,000,000** | — |
| Less Stripe | $54,000 | $0.648 × 83,334 |
| Less support | $41,667 | $0.50 × 83,334 |
| **Gross profit** | **$904,333** (90.4%) | — |
| LTV | $180.80 | (12 − 0.648 − 0.50) ÷ 0.06 |
| LTV / CAC | 7.2 | — |
| Payback | 2.3 months | 25 ÷ 10.85 |

**Verdict: fails.** The unit economics are fine. The distribution is not there. 250,000 free
activations a month is roughly 3 million a year, for a desktop app with no app-store storefront, no
paid channel budget at that scale, and a free tier that is already the complete product. A 2%
conversion from a **legal-only** gate is also optimistic: the buyer who reads PolyForm Noncommercial
and keeps working unpaid is the modal buyer, and there is no code check to stop them (§1.6). The gate
that would make Route A work — a functional free-tier limit — does not exist, and adding it destroys
the funnel that Route A depends on. Route A is circular.

### 6.2 Route B — prosumer at mid ARPU (recommended)

Route B is measured per **paying account**, not per seat, because Solo and Team are different products.
Two price sets are compared, because the difference decides whether the route works at all.

Blend used: 20% Solo, 60% Team of 3, 20% Team of 3 plus one Standard server.

| Price set | Solo | Team of 3 | Team of 3 + Standard | Blended ARPA | Accounts for $1M |
| --- | --- | --- | --- | --- | --- |
| **Shipped today** (Option A) | $12 | $48 (30 + 18) | $108 | 0.2(12) + 0.6(48) + 0.2(108) = **$52.80** | **18,939** |
| **Recommended** (Option B) | $19 | $117 (3 × 39) | $177 | 0.2(19) + 0.6(117) + 0.2(177) = **$109.40** | **9,141** |

The recommended set halves the account count needed. That is the entire value of §5.2, in one row.

Full model at the **recommended** price set:

| Line | Value | Arithmetic |
| --- | --- | --- |
| Blended ARPA | $109.40 | above |
| **Paying accounts needed** | **9,141** | 1,000,000 ÷ 109.40 |
| Paying seats implied | 23,767 | 9,141 × (0.2×1 + 0.6×3 + 0.2×3) = 9,141 × 2.6 |
| Monthly churn (accounts) | 3% | assumption |
| Accounts replaced each month | 274 | 9,141 × 0.03 |
| Free→paid conversion needed | 8% | assumption: the 4th person on a host is forced by the seat limit, and Team has real features |
| **Free activations needed per month** | **3,428** | 274 ÷ 0.08 |
| Free activations per day | 113 | 3,428 ÷ 30.4 |
| CAC | $300 | assumption — a team buyer needs content, a trial and a human |
| S&M spend per month | $82,200 | 274 × 300 |
| Revenue | **$1,000,000** | — |
| Less Stripe | $31,742 | (109.40 × 0.029 + 0.30) × 9,141 |
| Less hosting COGS | $19,196 | 20% × 9,141 servers × $10.50 avg boat cost |
| Less support | $27,423 | $3.00 × 9,141 |
| **Gross profit** | **$921,639** (92.2%) | — |
| Fixed opex (team, infra, G&A) | ~$250,000 | 6–8 people, assumption |
| Contribution after S&M and fixed | ~$589,439 | — |
| LTV | $3,361 | (109.40 − 3.47 − 2.10 − 3.00) ÷ 0.03 |
| LTV / CAC | 11.2 | — |
| Payback | 3.0 months | 300 ÷ 100.83 |
| ARR at this point | **$12,000,000** | 1,000,000 × 12 |

**Verdict: viable, and the only route that is.** 113 free activations a day is a real but reachable
number for a creator/UGC channel plus comparison-page SEO — the repository already ships eleven
comparison pages and fourteen provider pages (`apps/auth-api/src/content/compare/`,
`apps/auth-api/src/content/providers/`), which is exactly the funnel this needs.

8% conversion is high, and it rests on one shipped mechanism: a 4-person team on one host **cannot**
add the fourth person without paying, today, in code (`DEFAULT_TEAM_MEMBER_LIMIT = 3`, enforced by
`LICENSE_SEAT_AVAILABLE_SQL` in `apps/auth-api/src/server/remote-control-plane.ts`). That is the most
credible conversion lever the product has, and Route B is the only route that uses it.

**The caveat that matters:** at today's shipped prices the same route needs **18,939 accounts**, or
roughly double. Route B is viable *at the recommended price set* and marginal at the current one. The
price rise is not a profit optimisation; it is the difference between a viable route and a hard one.
It is also the only reason to narrow the free tier, which is a real cost to the funnel.

### 6.3 Route C — team/enterprise at high ARPU

| Line | Value | Arithmetic |
| --- | --- | --- |
| Licence | $354 | 20 users under the shipped formula: $30 base + 18 extra × $18 (`LICENSE_PRICES.usd`). Above 10 users this needs sales, because self-serve caps at `LICENSE_MAX_USERS = 10`. |
| Hosted servers | $240 | 4 × $60 Standard |
| **ARPU** | **$594** | 354 + 240 |
| **Paying accounts needed** | **1,684** | 1,000,000 ÷ 594 |
| Monthly churn | 1.5% | assumption |
| Accounts replaced each month | 25 | 1,684 × 0.015 |
| Free→paid conversion of qualified trials | 25% | assumption, sales-assisted |
| Qualified enterprise trials per month | 100 | 25 ÷ 0.25 |
| CAC | $6,000 | assumption |
| S&M spend per month | $150,000 | 25 × 6,000 |
| Revenue | **$1,000,000** | — |
| Less Stripe | $29,505 | (594 × 0.029 + 0.30) × 1,684 |
| Less hosting COGS | $58,940 | 1,684 × 4 servers × $8.75 (8 h/day, Standard) |
| Less support | $101,040 | $60.00 × 1,684 |
| **Gross profit** | **$810,515** (81.1%) | — |
| Contribution after S&M | ~$660,515 | before fixed |
| LTV | $32,098 | (594 − 17.23 − 35.00 − 60.00) ÷ 0.015 |
| LTV / CAC | 5.3 | — |
| Payback | 12.5 months | 6,000 ÷ 481.77 |

**Verdict: best per-unit economics, worst capability fit, and blocked.** Three hard blockers, all
in-file:

1. **No SSO.** A search for SAML, OIDC and SCIM across `packages/contracts/src`, `apps/auth-api/src`
   and `docs` found nothing. No enterprise IT buyer signs a $30k contract without SSO. This is a
   build item, not a pricing item.
2. **The boat capacity ceiling (§3.4).** 1,684 accounts × 4 servers is 6,736 sandboxes against a
   100-sandbox and 555-compute-hour monthly allowance. Off by three orders of magnitude.
3. **No sales organisation exists.** 100 qualified trials a month at 25% close is a 4–6 person sales
   team. The product has a `mailto:` contact link
   (`HOSTED_SERVER_CONTACT_URL` in `packages/contracts/src/hosted-servers.ts`) and a
   `sales_contact_clicked` analytics event. That is the entire sales motion.

The genuine enterprise wedge that **is** built, and that nobody else in the comparison table has, is
**multi-tenant hosting on one Mac**: one native Standard user per tenant, `sudo whilo-host setup
--create-user`, `sudo whilo-host verify` (`docs/multi-tenant-hosting.md`, `README.md` §Shared macOS
hosts). That sells to agencies, MSPs and IT departments, at a much smaller account count and a much
smaller ACV than $600. It is the right enterprise motion, and it is not the $600 ARPU motion in the
table above.

### 6.4 Side-by-side

| | Route A | Route B | Route C |
| --- | --- | --- | --- |
| Unit | 1 person, $12 | Blended account, $109.40 | Team of 20 + 4 servers, $594 |
| Paying units at $1M | 83,334 | 9,141 | 1,684 |
| Paying seats implied | 83,334 | 23,767 | 33,680 |
| Free activations per month needed | 250,000 | 3,428 | 100 qualified trials |
| Conversion needed | 2% | 8% | 25% of trials |
| Churn | 6% | 3% | 1.5% |
| CAC | $25 | $300 | $6,000 |
| Gross profit at $1M | $904k (90.4%) | $922k (92.2%) | $811k (81.1%) |
| LTV/CAC | 7.2 | 11.2 | 5.3 |
| Payback | 2.3 months | 3.0 months | 12.5 months |
| Operational blocker | None | None | SSO, boat capacity, sales team |
| Verdict | **Fails — distribution** | **Viable** | **Fails today — capability** |

Route C has the worst gross margin of the three despite the highest ARPU, because it is the only route
where Whilo carries real hosting COGS per account ($35) and real support cost per account ($60). High
ARPU does not mean high margin when the product is local-first and the enterprise buyer pays for
humans, not servers.

### 6.5 Which route the product shape supports

**Route B. It is the only one that fails for reasons Whilo can fix by shipping.** Route A needs
consumer-scale distribution Whilo does not have and cannot buy at $25 CAC. Route C needs SSO, a boat
plan upgrade of roughly three orders of magnitude and a sales team of 4–6 people, none of which exist
and all of which are quarters of work.

Route B needs one thing: **make the free→paid moment a feature instead of a licence term.** The
arithmetic that makes it work is one shipped mechanism, priced two ways:

> The 4th person on a host is already blocked by shipped code
> (`DEFAULT_TEAM_MEMBER_LIMIT = 3`, enforced by `LICENSE_SEAT_AVAILABLE_SQL` in
> `apps/auth-api/src/server/remote-control-plane.ts`). Every team of four or more that likes the
> product must pay, and the amount it pays is already computed by shipped code.
>
> - **At today's prices**, a 3-person team pays $48 (`LICENSE_PRICES.usd`: $30 base + 1 extra at $18).
>   Reaching $1M with a 60% Team / 20% Solo / 20% Team+server mix needs **18,939 accounts**.
> - **At the recommended $39/seat**, the same team pays $117. Reaching $1M needs **9,141 accounts**.
>
> The gap is a factor of 2.07, and it is the whole argument for §5.2.

Stated as building blocks, using only prices that ship today or are recommended in §5.2:

| Building block | Price | Accounts for $1M | Comment |
| --- | --- | --- | --- |
| Solo, shipped price | $12 | 83,334 | Route A. Not the plan. |
| Solo, recommended | $19 | 52,632 | Funnel entry, not the target. |
| Team of 3, shipped price | $48 | 20,834 | Possible, but slow. |
| Team of 3, recommended | $117 | 8,547 | Still a lot of teams. |
| Team of 10, shipped price | $174 | 5,748 | Self-serve ceiling at `LICENSE_MAX_USERS = 10`. |
| Team of 10, recommended (unsupported — needs a new price) | $390 | 2,564 | The realistic ceiling for a category leader here. |
| Team of 10 + 2 servers, recommended | $450 | 2,222 | The blended target. |
| Enterprise, 20 users + 4 servers | $594 | 1,684 | Needs the sales motion. |

**The honest target is roughly 2,200 teams of ten with two hosted servers each**, at $450 blended —
or, if the price set stays as shipped, roughly 5,700 teams of ten at $174. The first number is a
category-defining business. The second is a very good one. Neither is a hockey stick: at 3% monthly
churn, both require a steady acquisition machine, not one launch.

---

## 7. The honest gap list

What must be true for each route. Ordered by how much of it Whilo already has.

### 7.1 Activation — needed by all three routes

The strategy doc asks for "activation < 5 min to first result." What ships today:

| Step | State | Evidence |
| --- | --- | --- |
| Install from a signed DMG/EXE/AppImage | Built | `README.md`, `electron-builder.yml` |
| First-run choice: "Start free" or "connect a plan" | Built | `src/renderer/src/features/onboarding/FirstRunChoice.tsx` |
| Free provider downloads and starts on its own | Built | `src/renderer/src/features/onboarding/FirstRunFlow.tsx` |
| Provider signed in | Built, but depends on the user's browser flow | `docs/architecture/integrations.md` |
| First agent created | Built, prompt-driven or from a template | `src/main/agent-template-service.ts` |
| **First *result* an ordinary buyer would call useful** | **Not built.** The first thing a new agent does is chat. A useful result needs a routine, a workflow or a plugin, and each of those is a second decision. | — |
| Instrumentation to measure all of the above | Built | `ANALYTICS.md` §9 Activation steps |

**Gap A1.** There is no "first win" preset. A new user lands in an empty chat. The marketplace has 31
Apps, 40 skills and public agent templates, but nothing assembles them into one obvious first job.
**This is the highest-leverage gap and the cheapest to close**: ship three named one-click first jobs
(e.g. "triage my GitHub notifications", "draft a weekly client update", "watch this page and message
me on Slack") that install a template + plugin + routine in one press.

### 7.2 Retention loop — the loop that exists vs the loop the strategy claims

| Loop | Shipped? | Daily touch? | Evidence |
| --- | --- | --- | --- |
| **Routines / scheduler** | Yes | Yes, if the user set one | `src/backend/agent-routine-store.ts`, `docs/architecture/agents.md` |
| Webhook and GitHub and Discord triggers | Yes | Yes, event-driven | `docs/architecture/events.md` |
| Channels (Slack / Discord / Telegram) | Yes | Yes, other people bring the user back | `src/backend/channel-service.ts`, `packages/contracts/src/ipc-messaging.ts` |
| Mobile push, Live Activity, Dynamic Island | Yes | Yes | `docs/architecture/channels-and-messaging.md` |
| **Whilo Inbox** | **No** | Would be | §9 |

**Gap B1.** Routines are the real retention loop and they are **off by default and hard to discover**.
Routine setup lives in agent settings, not in onboarding. A user who never opens the Routines panel has
a chat app, and a chat app churns. The fix is a first-run step that offers one routine, not a new
product.

**Gap B2.** No routine-health signal. `docs/architecture/agents.md` documents quiet runs and failed
runs in detail, and there is a `routine_report_failure` tool — but nothing in the product tells the
user "your routine has failed four times this week, here is the one thing to fix." That is the
churn-causing moment and it is silent.

### 7.3 A wedge that makes churn low

Churn falls when leaving costs something the customer cannot rebuild elsewhere. Ranked by how real
each is here:

| Wedge | Real? | Why | Evidence |
| --- | --- | --- | --- |
| Local data ownership (the SQLite DB is the source of truth) | Weak — it is also a lock-in *against* trust, not for it | Copying out is trivially possible, and that is a selling point, not a moat | `AGENTS.md` §Product constraints |
| Approval gates and the audit log | **Medium** | A team that has audited approvals will not go back to unattended agents. Enterprises buy this. | `server-audit-v1`, `docs/architecture/servers.md` §Audit log |
| Multi-tenant hosting on one Mac | **Strong, and unmatched** | An agency managing 20 client tenants rebuilds a whole practice to leave | `docs/multi-tenant-hosting.md`, `README.md` §Shared macOS hosts |
| Workflows and routine flows already wired to real triggers | **Medium** | Switching cost rises with each graph | `src/backend/workflows/` |
| Marketplace + skills in the workspace | Weak | Portable by design | `marketplace/` |
| Link wallet and the purchase loop | Weak today — region-limited, Stripe-owned | Differentiator, not a moat | `src/backend/link-wallet.ts` |

**Gap C1.** The strongest wedge (multi-tenant hosting) has no product surface: no admin console, no
tenant list, no per-tenant billing view. Today it is a shell script and a document. It is the single
most defensible thing in the repository and it is not packaged.

**Gap C2.** The audit log is read-only and buried in Server settings. It should be the Team tier's
headline feature, exportable, with a retention window.

### 7.4 Route-specific gaps

| Route | Must be true | Status |
| --- | --- | --- |
| A | A functional free-tier limit exists | **Missing, and adding it breaks the funnel.** Do not build. |
| A | Consumer-scale channel (app stores, paid social) | Missing. The phone apps cannot sell (§1.5). |
| A | 2% conversion from a legal-only gate | Unproven, and the modal buyer ignores the gate. |
| B | Free→paid moment is a feature | **Partly there** — the seat gate works; the Solo feature ladder does not exist |
| B | 8% conversion | Needs the Solo ladder and 3 named first jobs |
| B | 3% churn | Needs routine discovery and routine-health alerts |
| B | 274 activations/day | Needs the comparison/creator funnel to produce downloads, not just page views |
| C | SSO (SAML/OIDC) | **Missing entirely** |
| C | Boat capacity ≥ 6,600 sandboxes | Missing by 3 orders of magnitude (§3.4) |
| C | A sales team | Missing (a `mailto:` link) |
| C | SOC 2 or an equivalent security package | A CONFIRMAR — no evidence in the repository either way |

---

## 8. Evaluating the strategy doc's central claim: "the inbox is the daily-retention loop"

The claim in [whilo-strategy.md](whilo-strategy.md): *"Quem fecha 1+2 primeiro tem um loop de retenção
diária (o inbox toca o usuário todo dia)."*

My assessment: **not credible as written, and the claim is unnecessary because a better loop already
ships.**

| Test | Finding |
| --- | --- |
| Does it exist? | No. `docs/business/whilo-inbox.md` opens with "desenho técnico (não testado; para revisão)". `grep -rn "inbox\." src/backend` finds nothing. There is no Email Worker under `apps/` — the apps are `auth-api`, `discord-app`, `mobile`, `site-router`, `slack-app`, `status`, `telegram-app`. |
| Does it fit the product constraints? | **No.** `AGENTS.md` §Product constraints says workspaces, conversations, attachments, browser data and team data stay on the computer that runs Whilo, and that Cloudflare holds accounts but "does not hold chats, files, or commands". The inbox design stores every email body in Cloudflare D1 and serves it from a REST API. That is a direct contradiction of a non-negotiable-adjacent product constraint, and it needs a DPA with Cloudflare for personal data — which the design doc itself admits. |
| Does it have a cost model? | It targets "~R$0" using Mailrelay's 80k sends/month free tier. 80k sends/month is 2,600/day. A business with 2,200 teams (the §6.5 target) doing any real email triage exceeds that in a week, and the design doc itself says to switch provider "para volume alto". There is no COGS line, and this would be the third true COGS in the business. |
| Is email a wedge? | **No.** Email triage is the most crowded, most commoditised agent use case in the market. Every agent product, every mail client and every assistant does it. It does not differentiate. It also *weakens* the local-first promise, which is the one thing that does. |
| Is it a daily touch? | Only if the user routes their real work email through it. That requires domain-level MX changes and trust. A user who will not change their MX record gets nothing. |
| Is there a shipped substitute? | **Yes, and it is stronger.** Routines run on a schedule with the computer's own clock (`src/main/routine-feed-server.ts` publishes them as a calendar feed — the user literally sees them in their calendar). Webhook, GitHub and Discord triggers fire on real events. Channels bring *other people* back into the product. Mobile push carries it to the phone. This loop touches the user daily, it is already built, and it costs nothing to run. |

**Recommendation.** Drop the inbox as the retention thesis. State the shipped loop as the thesis:
**"an agent that runs on a schedule, on a real event, or in a channel with your team is a daily
touch."** Then close Gap B1 and Gap B2, which are cheap. Revisit the inbox only if it can be built
local-first — an IMAP/SMTP client that stays on the user's own machine, with no Cloudflare email
storage at all. That version would fit the constraints, but it would still not be a wedge, so it
should be an integration, not a product.

---

## 9. What to do next, in order

| # | Action | Cost | Effect on the model |
| --- | --- | --- | --- |
| 1 | Re-check every competitor price in §2 against the vendor page, and fix `apps/auth-api/src/content/` where it is wrong | 1 day | Removes the A CONFIRMAR flags. Marketing claims become defensible. |
| 2 | Ship the Solo tier at $19 with a real feature ladder | 2–3 weeks | Creates the free→paid moment. Route B becomes reachable. |
| 3 | Ship three named one-click first jobs | 2 weeks | Closes Gap A1. Highest leverage per day of work. |
| 4 | Move routine setup into first run; add routine-health alerts | 3 weeks | Closes Gap B1 and B2. Attacks the 3% churn assumption directly. |
| 5 | Package multi-tenant hosting: tenant list, per-tenant view, licence key | 4 weeks | Turns the strongest wedge into a product and a $18k/yr SKU. |
| 6 | Buy a boat plan that supports 200+ sandboxes; publish the per-hour COGS floor | 1 day of purchasing | Makes hosted-server revenue possible at all (§3.4). |
| 7 | Decide SSO: build it, or stop quoting enterprise | 1 quarter or 0 | Route C is blocked until this is decided. |
| 8 | Instrument `license_mrr`, `license_accounts`, `plan_ended` per cohort and publish the real churn | ongoing | Replaces every assumption in §6 with a measurement. Until then, all of §6 is a model. |

---

## 10. A CONFIRMAR register

Every price I could not verify, and where I looked. This is the complete list.

### Competitor prices

| # | Vendor | Price claimed | Where I looked | URL to verify |
| --- | --- | --- | --- | --- |
| 1 | Claude | Pro $20 ($17 yearly), Max $100/$200, Team $25/seat ($20 yearly) | `apps/auth-api/src/content/compare/cursor-vs-claude-code.ts:97`, `codex-vs-claude-code.ts:120`, `best-ai-agent-apps.ts:37`. Live fetch of `claude.com/pricing` and `anthropic.com/pricing` returned HTTP 429. | `claude.com/pricing` |
| 2 | ChatGPT / Codex | Plus $20, Pro $100/$200/$500, Business $20/seat yearly | `apps/auth-api/src/content/compare/codex-vs-claude-code.ts:119`, `best-ai-agent-apps.ts:48`. Live fetch of `openai.com/chatgpt/pricing/` and `openai.com/api/pricing/` returned HTTP 429. | `learn.chatgpt.com/docs/pricing` |
| 3 | Cursor | Pro $20, Pro+ $60, Ultra $200, Teams $40 or $120/user, Hobby free | `apps/auth-api/src/content/compare/cursor-vs-claude-code.ts:96`, `apps/auth-api/src/content/providers/cursor.ts`. Live fetch of `cursor.com/pricing` returned HTTP 429. | `cursor.com/pricing` |
| 4 | Manus | Free 300 credits/day, Pro $20–$200, Team from $20/seat | `apps/auth-api/src/content/compare/manus.ts:217`. Live fetch of `manus.im/pricing` returned HTTP 429. | `manus.im/pricing` |
| 5 | Grok (xAI) | SuperGrok $30, SuperGrok Plus $100 | `apps/auth-api/src/content/providers/grok.ts:45`. No vendor page read. | `docs.x.ai` / `grok.com` |
| 6 | Cline | No subscription, ClinePass $9.99 optional | `apps/auth-api/src/content/providers/cline.ts:51`. `cline.bot/pricing` not read. | `cline.bot/pricing` |
| 7 | OpenCode | Free models, Go $10, Go Plus $40 | `apps/auth-api/src/content/providers/opencode.ts:61`. `opencode.ai` not read. | `opencode.ai` |
| 8 | Devin | Free light quota, Pro $20, Max $200, Teams $80 + $40/full seat | `apps/auth-api/src/content/compare/devin.ts:110`. Live fetch not attempted on `devin.ai/pricing`. | `devin.ai/pricing` |

### Infrastructure and cost inputs

| # | Item | Value used | Where I looked | URL to verify |
| --- | --- | --- | --- | --- |
| 9 | boat compute rates | small $0.018/h, default $0.036/h, large $0.072/h | `docs/hosted-servers.md` §Production, quoted from boat pricing. Live fetch of `docs.boat.dev/pricing` returned HTTP 429. | `docs.boat.dev/pricing` |
| 10 | boat plan allowance | 2,000,000 compute seconds/month, 100 sandboxes, 200 starts/day, plan `box_20` | `docs/hosted-servers.md` §Testing. Not checked against the live plan. | `docs.boat.dev/pricing` |
| 11 | Mailrelay free tier (inbox design only) | 80,000 sends/month | `docs/business/whilo-inbox.md`. Not checked. | `mailrelay.com` |
| 12 | Stripe fee | 2.9% + $0.30 | Industry default. Not checked for Whilo's actual negotiated rate. | Stripe account |
| 13 | OpenPanel, Cloudflare, Signal/TURN costs | Not priced | I found no cost figure in the repository. These are missing COGS lines. | — |

### Model inputs with no measurement

| # | Input | Value used | Where a real value would come from |
| --- | --- | --- | --- |
| 14 | Free→paid conversion | 2% / 8% / 25% | `ANALYTICS.md` §9 activation steps cross-joined with `billing_action` `plan_started` |
| 15 | Monthly churn | 6% / 3% / 1.5% | `billing_snapshot` (`license_accounts`) and `plan_ended` per monthly cohort |
| 16 | CAC | $25 / $300 / $6,000 | No ad-spend or campaign attribution table exists in the repository |
| 17 | Current paying customers and MRR | **Unknown** | `billing_snapshot` emits `license_mrr`, `license_accounts`, `licensed_users` (`ANALYTICS.md` §185). I have no access to the OpenPanel data. This document assumes zero. |
| 18 | Support cost per account | $0.50 / $3.00 / $60.00 | No support-ticket system or cost allocation found in the repository |
| 19 | SSO status | Absent | Searched SAML, OIDC, SCIM across `packages/contracts/src`, `apps/auth-api/src`, `docs`. No matches. Not confirmed with the product owner. |
| 20 | SOC 2 / security certification | Unknown | No evidence either way in the repository |

---

## 11. One-paragraph summary

Whilo's prices are already defined in code and they are defensible: $12 for one commercial user, $30
for two plus $18 each to ten, $60 or $120 for a hosted server, and $0 for personal use. The margin
structure is exceptional because inference is the buyer's cost — 90–97% gross profit on licence
revenue, 85% on hosting — and that is also the ceiling, because Whilo captures none of the model spend
that its customers are already paying to Anthropic, OpenAI, xAI and Cursor. Three routes to
$1M/month were costed. A consumer route needs 83,334 seats at $12 and 250,000 free activations a
month, and it dies because the free tier is the complete product and the paywall is a licence term,
not a product limit. An enterprise route needs 1,684 accounts at $594 and dies on three missing
capabilities: no SSO, a boat plan that cannot host more than one always-on server, and no sales team.
The prosumer route survives at a blended $109.40 per paying account — 9,141 accounts, 23,767 seats —
needing 3,428 free activations a month and $82k of S&M to hold. At today's shipped prices the same
route needs 18,939 accounts, so the recommended $19 Solo and $39/seat Team prices are not a profit
optimisation; they are what makes the route viable at all. The reason it survives is the one gate that
already ships and already works: a fourth person cannot join a host without paying. The work is
therefore not pricing work. It is three small product changes — a $19 Solo tier, three named one-click
first jobs, and routines moved into first run — plus one purchasing decision on boat capacity, plus a
decision on whether SSO gets built. And the strategy doc's thesis should be corrected: the inbox is not
shipped, it contradicts the local-first constraint, and it would be the third true COGS in a business
with two already; the daily loop that exists is scheduled routines, real events and team channels, and
it is already better than the one being proposed.
