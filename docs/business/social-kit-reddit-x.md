# Social kit — Reddit (8) + X/Twitter (12)

Status: draft for review. Scope: Reddit and X only. No other channel.
Owner: marketing. Product repo: `nightly-labs/whilo`. Product name: Whilo.

This file is copy plus the claim rules behind the copy. Read the claim ledger before you edit a
sentence: most of the risk in this kit is not tone, it is a sentence that quietly turns a
*designed* feature into a *shipped* one.

---

## 0. How to use this file

- **Reddit** posts are written as the maker speaking as the maker. Never as a user. No invented
  usage history, no "I've been running this for six months", no fake coworker, no fake benchmark
  that is not in the repo.
- **X** posts are written to be short and to survive being screenshotted without context.
- Every tweet line in this file starts with `TWEET|<id>|`. That prefix exists so a script can count
  characters. Strip the prefix when you post.
- Counts are given per tweet and verified by script (section 3.6). If you edit a tweet, re-run the
  counter. A tweet that grows past 280 characters after an edit is a broken post, not a nitpick.

### Claim tiers — use these words exactly

| Tier | Meaning | Allowed verbs |
| --- | --- | --- |
| **SHIPPED** | In the repo, in the app today | "does", "works", "is" |
| **PREVIEW** | In the repo, explicitly a development preview, or a capability in code that is region-limited / not the named product | "in the preview build", "in the codebase", "currently limited to" |
| **VISION** | Designed on paper only. `Whilo Inbox` and the branded `Minha Carteira` wallet | "not shipped", "designed, not built", "we have not shipped" |

Rule of thumb: if a reader could open the app and fail to find the feature, the sentence needs
VISION or PREVIEW in it.

---

## 1. Verified claim ledger

Checklist built from `README.md`, `AGENTS.md`, `PRIVACY.md`, `docs/architecture/*`,
`docs/plugin-distribution.md`, `docs/self-hosting.md`, `docs/automation.md` and `src/renderer/src/features/`.
Read it before writing a new post.

### 1.1 SHIPPED — safe to claim

- Local-first desktop workspace (Electron) where each agent has a persistent identity, its own
  workspace folder under `~/Whilo/Agents`, and its own conversation. State survives provider
  switches and app restarts (`AGENTS.md`, "Product constraints").
- Nine provider CLIs: Codex App Server, Claude Code, Grok CLI, OpenCode, Gemini (Antigravity ACP),
  Cursor CLI, Cline CLI, Kimi Code CLI, Hermes Agent. Plus Inception, DeepSeek, OpenRouter and Pi
  through the Pi CLI, custom ACP agents, custom OpenAI-compatible endpoints, and local model server
  detection for Ollama (`:11434`) and LM Studio (`:1234`) (`README.md`, `PRIVACY.md`).
- Embedded persistent Chromium browser the agent drives over CDP: snapshot/ref targeting, clicks,
  typing, `fill_fields` for ordinary forms, tabs that outlive the turn and survive a restart, at most
  25 tabs per agent (`docs/architecture/browser.md`).
- Batch browser automation in one call: `run_script` runs a JS script inside a QuickJS WebAssembly
  sandbox — no modules, no network, no files, no timers, 64 MiB memory, 200 steps, 60 s default
  deadline (120 s max) — and returns one final snapshot (`docs/architecture/browser.md`).
- Per-agent browser profiles: Shared, "Only this agent", or a named profile that several agents
  share. Named profile names are labels, never paths (`docs/architecture/browser.md`).
- MCP servers are host-global and stored in local SQLite; skills are per agent and follow the Agent
  Skills spec (`SKILL.md`). Marketplace installs both, skills first (`docs/plugin-distribution.md`).
- Marketplace / plugin catalog: the repo's `marketplace/plugin-catalog/` holds 31 listings
  (count them: `ls marketplace/plugin-catalog/plugins`). Install/uninstall, deep link
  `whilo://plugins/<slug>`, public pages on `openbot.run/plugins/<slug>`. A plugin link never
  installs by itself — the user presses install and picks an agent.
- Routines (schedule / one-time / webhook), routine flows that hand one agent's answer to other
  agents, and a Workflows canvas with agent, model, condition, approval and output nodes, up to 50
  stored graph versions, loops, and GitHub / webhook triggers (`docs/architecture/agents.md`).
- Side threads ("tasks") per agent, "Branch from here" from any finished turn, FIFO queue with
  pause/resume/cancel, and steering a queued message into the running turn.
- Local scripts API: loopback HTTP listener on `127.0.0.1` with a bearer token, plus `whilo-cli`
  (`docs/automation.md`).
- Team surface: join a host from another desktop, the web client at `/app`, or the iPhone/Android
  app; roles and invitations; remote desktop; live browser view of the host's tab on the phone.
- Memory: saved memories with local full-text search, plus background memory review whose interval
  the server owner sets (10 / 20 / 40 turns, or off).
- Vault: logins, cards and contact info encrypted with the OS secret storage. An agent sees card
  label, brand, last four digits and expiry — never the number or the security code. The first card
  fill on a new site needs the server owner's approval; later fills on that site do not.
- Secure secret handoff: passwords and one-time codes go from the user to the page through a
  dedicated path, never into chat, a provider tool argument, or a log.
- Computer Use on macOS, Windows and Linux through the shipped `cua-driver` binary, with the
  vendor's own telemetry and update check forced off.
- Self-hosted control plane: your own account Worker + Signal + TURN, and a Docker image at
  `ghcr.io/nightly-labs/whilo` (`docs/self-hosting.md`, `docs/docker.md`).
- Channels and messaging: shared channel chats, plus Slack, Discord and Telegram connectors.
- Licensing: PolyForm Noncommercial 1.0.0. Source-available, not OSI open source.

### 1.2 PREVIEW — say "preview", "in the codebase", or "currently limited to"

- The whole app: `README.md` calls Whilo a development preview. Say so when a Reddit community
  would otherwise assume GA.
- Default agent access is `danger-full-access` with `approvalPolicy: never`, after one-time
  first-launch consent. There are no per-action confirmation dialogs. Approval exists only on
  specific paths (agent-requested MCP changes, first card fill per site, payment approval, browser
  takeover, tool questions). Do not generalise from those.
- Agent-initiated card payments: `whilo_browser.request_link_payment` asks Link (link.com, by
  Stripe) for one payment, the user approves in Link, the call waits up to 5 minutes, and returns a
  one-time card id for `fill_card`. This is Link's wallet, region-limited (Link = US/Canada per
  `docs/business/whilo-strategy.md`), and it is **not** the branded `Minha Carteira` product.
- Some Workflow node kinds exist in the graph but do not run: a run that reaches an image, asset,
  file-output or message-trigger node fails with `nodeUnsupported`.
- Codex accepts `stdio` MCP servers only, so an `http` MCP app does nothing on a Codex agent, with
  no error shown.
- Serving the plugin catalog JSON from the Worker is not finished (steps 3–5 in
  `docs/plugin-distribution.md`). Public plugin pages and the app's catalog tab work.

### 1.3 VISION — label, do not sell

- **Whilo Inbox** — an agent-owned inbox. `docs/business/whilo-inbox.md` is a design doc, marked
  "não testado". There is no inbox code path in `src/`.
- **Minha Carteira** — agent purchases approved on your phone as a named product. The Link one-time
  card flow under 1.2 is the closest shipped thing, and it is Link's UI, not ours.
- "Approve every sensitive step" as a general product property. Designed direction, not current
  behaviour.

### 1.4 Never claim (no data exists)

- Any user count, download count, GitHub star count, revenue, ARR, retention, waitlist size.
- Any competitor's limits, pricing, roadmap, or missing feature, unless you quote their own page.
- Any time-saved or money-saved figure. We have no measurement.
- Any third-party security audit, SOC 2, ISO 27001, HIPAA, GDPR certification.
- Any benchmark other than the internal browser-tool measurement, and that one only with its
  caveats (section 2.1).

---

## 2. Reddit

Reddit is not a distribution channel, it is a place where promotion is a cost you pay for being
useful. Aim: each post is worth reading even if the reader never installs anything. The product
mention is one paragraph, near the end, disclosed.

### 2.0 Rules that apply to all eight posts

- Disclose in the first screen, not the last line. Most subreddits require it and readers punish
  late disclosure harder than they punish promotion.
- No link in the title. One link maximum in the body, and only where the subreddit allows links.
- No "DM me", no "comment WHILO", no lead magnet, no discount code. The Instagram/TikTok trigger in
  `docs/business/marketing-posts.md` does not transfer to Reddit. Do not reuse it here.
- Answer every technical question in the thread for the first 6 hours. A post that the maker
  abandons reads as an ad.
- Never argue with a removal. If a mod removes it, thank them and stop.
- Post from an account with real history in that subreddit. A 3-day-old account posting this is a
  removal with no discussion.
- The `Disclosure line (verbatim, required)` under each post is the same sentence as the
  `**Disclosure:**` paragraph inside the body, with the word `Disclosure:` in front and the Markdown
  backticks removed. That is deliberate: the body paragraph is what makes the post readable, and the
  separate line is what a mod or a reader gets if they ask "are you the maker" in the comments. Copy
  it as one block, no edits, no shortening.

### 2.1 Shared material — the one benchmark we are allowed to cite

The only measured number in this kit, from `docs/architecture/browser.md` (browser tool benchmark):

- 10 public site tasks, 3 repeats, one model (Claude Haiku 5.5).
- `run_script` (batch): 118k median input tokens, 30 of 30 correct answers.
- `run_steps` (fixed step list, since removed): 130k median input tokens.
- Both tools in the catalog at once: agents used both, 198k.
- `run_steps` removed, `run_script` hard to find: 216k.
- `run_script` also returned by a browser search for a single action: 149k.

Always attach these caveats when you use it: internal, one model, 10 tasks, and the runs happened
before input actions started returning a short status instead of a snapshot, so today's counts can
differ. Never present it as an independent benchmark.

### 2.2 Post R1 — r/LocalLLaMA

- **Subreddit:** r/LocalLLaMA
- **Risk flag: HIGH.** r/LocalLLaMA removes most project promotion, and "show us your tool" posts
  need mod approval or a stickied thread. A title that names a product is a removal. This title
  names a measurement.
- **Angle:** the boring, expensive part of an agent loop — snapshot tokens. Useful with zero product
  context.
- **Title:**
  `The browser is the expensive part of an agent loop: snapshot tokens, a 130k -> 118k result, and the catalog change that beat it`
- **Body:**

```markdown
Short version: per-action browser tools burn context on snapshots, not on thinking. Batching the
actions into one call, and returning one snapshot instead of one per step, cut median input tokens
by about 9% (130k -> 118k) on our internal task set, with the same correctness. The bigger win turned
out to be a catalog change, not a code change, and it was not obvious in advance.

Numbers first, then the caveats, then what I want to know from you.

**Setup.** Ten public site tasks (form fill, multi-page read, a search-then-open flow, a checkout
dry run, etc.), three repeats each, one model. Single-action tools: navigate, click, type, press,
hover, scroll, select_option, set_checked, wait_for, evaluate, snapshot. Each of those takes one
model turn and, to be safe, a fresh snapshot afterwards.

Median input tokens:
- 118k — batched script tool, 30 of 30 correct
- 130k — fixed step-list tool (same actions, no script)
- 198k — both tools present at once
- 216k — one tool present, hard to discover
- 149k — one tool present and discoverable from a single-action search

**What actually happened.** The 198k row is the interesting one. With both tools in the catalog,
agents used both, and duplicated work. So we removed one — and it got worse: 216k, because agents
could no longer find the batched tool from a search for a single action name. Making a search for
"click" also return the batched tool took it to 149k. No model change, no prompt change.

That is a catalog design lesson, not a model lesson: if the good tool is hard to find, the agent
falls back to the tool it can find, and pays per step.

**The sandbox, because someone will ask.** The script tool runs in QuickJS compiled to WebAssembly,
not `node:vm` — the host process holds credentials. No modules, no network, no filesystem, no
timers, no process. Limits: 64 MiB memory, 1 MiB stack, 200 steps, 60 s default deadline, 120 s max.
One runtime per script, disposed at the end. Results are capped at 64 KB.

**Caveats, stated up front.** Internal benchmark, one model, ten tasks, three repeats. The runs
predate a later change where input actions return a short status instead of a snapshot, so today's
counts will not match. Not independently reproduced. I have no numbers for other models and I am not
going to pretend I do.

**Disclosure:** I build this — it is a desktop agent workspace called Whilo (openbot.run). The
benchmark and the sandbox limits above are in the public repo, so you can check my numbers instead
of trusting them: the browser tool section of `docs/architecture/browser.md`.

What I want from this thread: your per-step snapshot token counts, and whether you dedupe or diff
snapshots between steps. Ours are full semantic snapshots, and I have no measurement for what diffing
would save — it is the next thing I want to try.
```

- **Disclosure line (verbatim, required):**
  `Disclosure: I build this — it is a desktop agent workspace called Whilo (openbot.run). The benchmark and the sandbox limits above are in the public repo, so you can check my numbers instead of trusting them: the browser tool section of docs/architecture/browser.md.`
- **Why it survives moderation:** the number, the negative result (198k) and the caveats are the
  post. The product appears once, disclosed, with a verification path.
- **Do not:** add "link in comments", a waitlist, or a feature list. That turns this into the post
  the mods remove.

### 2.3 Post R2 — r/selfhosted

- **Subreddit:** r/selfhosted
- **Risk flag: MEDIUM-HIGH.** r/selfhosted bans self-promotion outside its weekly self-promo
  thread, and a first-post project link is commonly removed. The version below leads with a
  limitations table, which is the only thing that reliably keeps it up — and it still may not.
- **Angle:** "what breaks when you self-host the control plane" — a failure list, not a pitch.
- **Title:**
  `Self-hosting the control plane of a desktop agent app: exactly what stops working, and what I'd tell you before you try`
- **Body:**

```markdown
I wrote this after building the thing, so treat it as a warning list from the inside, not a guide
with a happy ending. The short version: you can self-host the account/signaling layer of a
local-first desktop agent app, and several features die the moment you do. Knowing which ones is the
whole decision.

**What the control plane is, and is not.** Two services. One issues account sessions, tickets, host
records, memberships and invitations. One does WebRTC signaling (SDP/ICE) and TURN relaying so a
phone or second desktop can reach a host behind NAT. Neither carries chat, files or commands — those
go peer-to-peer over the data channel. So "self-hosting" here means self-hosting *accounts and
connection setup*, not the data path.

**What you need.** Cloudflare account with Workers, D1 and R2, on a domain you control. A Linux box
with Docker Engine, Docker Compose and a static public IPv4 for signaling. An SMTP account that does
TLS on 465, because sign-in is a one-time code by email. And a clone of the exact release you run.

**What changes the day you self-host (read this part twice):**

- Accounts on your service are separate. Everyone signs in again. No migration path.
- Every desktop and phone that connects to a host must use the *same* service. Mixed setups fail.
- Invitations become `whilo://join` links you copy and send yourself. The app does not email them.
- The hosted browser client does not work with your service. You keep the desktop app and the phone.
- These stay off, permanently: hosted servers, the GitHub App, Slack, the Telegram bot, the iPhone
  Live Activity relay. Each needs a secret only the vendor holds.
- Tickets are signed by the issuing service's key. A ticket from service A cannot be presented to
  service B, which means "point your own signaling server at the vendor's account service" is not a
  supported middle ground. You take both or neither.

**Why the ticket thing matters.** If you were planning to self-host only signaling and keep the
vendor's accounts, this design says no. That is a deliberate choice: a ticket grants access to a
host, so a ticket minted for one service would open the other.

**If you want the deployment anyway.** There is a Docker image (amd64 and arm64) and a Compose file
plus a seccomp profile, and a `login` subcommand to sign the container in. Standard container
compromise: the container is a remote host of your account, driven from your desktop or phone.

**Disclosure:** I build this product — Whilo, a local-first desktop agent workspace. The limitations
above are the honest ones from the deployment doc, not a marketing tease. If you want to read before
you install, the self-hosting and Docker docs are in the repo.

Genuinely interested in the counter-argument: is a two-service split (accounts vs signaling) the
right cut for a local-first tool, or should the account service be optional and the signaling server
be the only shared piece?
```

- **Disclosure line (verbatim, required):**
  `Disclosure: I build this product — Whilo, a local-first desktop agent workspace. The limitations above are the honest ones from the deployment doc, not a marketing tease. If you want to read before you install, the self-hosting and Docker docs are in the repo.`
- **Why it might survive:** the bullet list is the kind of thing r/selfhosted actually upvotes, and
  it argues against the product's own convenience.
- **Flagged risk detail:** post it in the weekly self-promo thread first. If a mod asks you to move
  it, move it without a reply.

### 2.4 Post R3 — r/mcp

- **Subreddit:** r/mcp
- **Risk flag: MEDIUM.** r/mcp tolerates tool-adjacent posts when they are about the protocol's
  design. It does not tolerate "we support MCP" announcements. This post is a design question with
  our failure attached.
- **Angle:** host-global MCP server vs per-agent skill — a scoping problem every MCP client hits.
- **Title:**
  `Design problem: MCP servers are global, skills are per-agent — the install ordering we got wrong, and the stdio/http trap`
- **Body:**

```markdown
Not an announcement. Three concrete things we got wrong or had to decide, offered in case you are
building an MCP client and hitting the same walls. I would like to know how you scoped servers to a
single agent, because I am not sure our answer is right.

**Context.** Local desktop client. MCP server rows live in one table for the whole machine. Skills
(SKILL.md folders) are per agent. A marketplace "app" is one MCP server plus the skills that teach an
agent to use it.

**1. Install order: skills first, server second.** We did it the other way first and the failure mode
is nasty — a server that is connected and answering, with no instructions telling any agent what to
do with it. An agent then invents usage. Now the order is: read the listing and verify its hash,
install the pinned skill versions into the chosen agent, then save the server. On any failure we
unwind the skills we just installed and write no server row. A failure leaves nothing half-present.
The reverse order cannot make that promise.

**2. Host-global servers, per-agent intent.** This is the part I am unsure about. A server row is
shared by every agent on the machine, so an agent can reach a tool a human only meant for one agent.
We mitigated by putting the *choice* in the skill install, and by keeping the second install target
(the agent) out of the marketplace button — but if you go into server settings and disable a row to
stop one agent, you stop every agent. If your client scopes servers per agent, I want to hear how
you handle credentials: per-agent OAuth grants means N token records for one server.

**3. The stdio/http trap.** One provider in our set accepts `stdio` MCP servers only. An `http`
server configured for that provider connects to nothing and reports no error — the tools just are not
there. That is the worst failure shape in this space: silent, and only visible as an agent claiming
it cannot do something. We surface it on the listing now. If your client has per-provider transport
limits, print them at install time, not in a doc.

**Two more, briefly.** A saved server whose name collides with a reserved or user-created row needs a
name check *before* any write, not after — names are unique per host and a user-created row can
shadow a catalog one. And changing the tool set has to invalidate the provider session, or the model
keeps calling a tool that no longer exists; our catalog fingerprint folds tool definitions into the
session key for that reason.

**Disclosure:** I build Whilo, a local-first agent workspace, and this is our MCP client. The
ordering and failure rules above are in our public repo docs, so you can read them rather than take
my word for it.

Question I would most like answered: for a local client, is per-agent server scoping worth N sets of
credentials, or is host-global plus per-agent skill enablement the pragmatic ceiling?
```

- **Disclosure line (verbatim, required):**
  `Disclosure: I build Whilo, a local-first agent workspace, and this is our MCP client. The ordering and failure rules above are in our public repo docs, so you can read them rather than take my word for it.`
- **Why it survives:** three named mistakes, one open question, product named once.

### 2.5 Post R4 — r/AI_Agents

- **Subreddit:** r/AI_Agents
- **Risk flag: LOW-MEDIUM.** Tool announcements are common here but low-effort ones get ignored or
  removed. This post is a requirements list, and the product is explicitly *not* claimed to have it.
- **Angle:** what an agent-owned inbox has to satisfy before anyone should trust it — including the
  privacy cost, which is the interesting part.
- **Title:**
  `What an agent-owned inbox would need before I'd trust it — including the part that breaks local-first`
- **Body:**

```markdown
We designed an agent-owned inbox and did not ship it. This is the requirements list I wish someone
had handed me first, because requirement 6 invalidates the architecture the feature is supposed to
live in.

To be precise about status: this is a design, not a feature. No inbox exists in the product today.

**1. An address per agent, not a shared mailbox.** One address for all agents means every agent can
read every message and the trust boundary is the mailbox. We wanted per-agent aliases resolving to
one agent each, so "which agent saw this" is answerable from the address.

**2. Tools, not a UI.** The agent needs list / read / search / reply as tools. A nice inbox tab that
the agent cannot drive is a mail client, not an agent feature.

**3. The send gate is the whole product.** Reading mail is safe. Sending mail is irreversible and
publicly attributed. Every reply has to be a draft with an explicit approve, and the approval has to
show the recipient, the subject and the body — not "1 action pending".

**4. Inbound needs a policy before the agent sees it.** Allowlist plus a greylist plus simple rules,
applied before the message reaches the model. Otherwise the first thing your agent reads is a
prompt-injection payload with a nice subject line. An agent with a mailbox is an agent with an
untrusted input channel that runs continuously.

**5. Deliverability is product surface, not ops.** SPF, DKIM, DMARC, and a sending reputation you
own. A mailbox that lands in spam is worse than no mailbox: it silently loses the one thing the
feature is for.

**6. The honest one: it breaks local-first.** Mail has to arrive when your laptop is closed, which
means the mailbox lives on someone else's disk — a hosted mail store, a worker, a D1 table. Tier-1
routing is fine, but the stored message and the parsed body are not on your machine. So the feature
costs you the property the rest of the product is built on. That is a real trade, and I would not
ship it without saying it in the feature's own settings page.

**7. Retention and deletion.** If the mailbox is remote, the user needs export and delete that
actually delete, including the parsed copy and any index.

**What we would build, in order.** Start with a *single* agent address and the send gate, no search,
no folders. If the send gate does not feel safe in daily use, nothing later matters.

**Disclosure:** I build Whilo, a local-first desktop agent workspace. Whilo Inbox is designed and not
shipped — I am posting the design because the trade-off in point 6 is the thing I want argued with,
not because there is something to install.

If you have shipped an inbox for an agent: did you put the send gate in the agent loop or in a
separate review queue, and did the review queue actually get used after week two?
```

- **Disclosure line (verbatim, required):**
  `Disclosure: I build Whilo, a local-first desktop agent workspace. Whilo Inbox is designed and not shipped — I am posting the design because the trade-off in point 6 is the thing I want argued with, not because there is something to install.`
- **Note:** point 6 is the reason this post is credible. Do not soften it.

### 2.6 Post R5 — r/SideProject

- **Subreddit:** r/SideProject
- **Risk flag: LOW.** Promotion is the point of the sub. Risk is only that a dev-preview post with no
  numbers gets skipped.
- **Angle:** build log with the constraint that shaped the design.
- **Title:**
  `Built a desktop workspace where each AI agent gets its own folder, browser profile and queue — dev preview, no waitlist`
- **Body:**

```markdown
What it is: a desktop app where an "agent" is a persistent thing, not a chat. Each one gets a folder
on disk, its own conversation, its own browser tabs, and a message queue. It survives restarts and it
survives you changing which model runs it.

Status: development preview. That word is load-bearing — agents currently run with full local access
and no per-action confirmation prompts after a one-time consent screen. Read the warning on the repo
before you run it on a machine you care about.

**The constraint that shaped everything.** Agents run as real local processes: they can read and
write files, run commands, and use the network. Once you accept that, the interesting work stops
being "make it smart" and becomes "make the loop survivable": a queue that survives a crash, a
browser tab that outlives the turn, a work log that does not vanish when the process ends, and a
visible boundary where a secret stops.

**Four things I think are actually different:**

1. **One agent, nine engines.** Codex, Claude Code, Grok, OpenCode, Gemini, Cursor, Cline, Kimi,
   Hermes. Same agent identity, same workspace, same conversation, different backend. Switching
   providers sends a bounded handoff of the conversation, not a reset.

2. **The tab outlives the turn.** Nothing closes a browser tab when a turn ends. The next turn
   continues on the same page. That sounds small until you watch an agent re-login to the same site
   five times in one task.

3. **Secrets go around the model.** Passwords and card numbers go from you to the page through a
   dedicated path — not into chat, not into a tool argument, not into a log. The agent can see a
   card's last four digits. It never sees the number.

4. **Batch browser work.** One call runs a whole script of clicks and reads inside a sandbox with no
   network or filesystem, and returns one snapshot. Per-click tool calls were burning context on
   snapshots.

**What is not there yet:** an agent-owned inbox and an agent wallet you approve from your phone. Both
are designed. Neither is shipped, and neither is in this build.

**Licence, so nobody is surprised:** PolyForm Noncommercial 1.0.0. Source is available, but this is
not OSI open source — no commercial use, no forking it into a product. If that disqualifies it for
you, that is a fair call and I would rather you learn it here than after a `git clone`.

**Disclosure:** I am the builder. This is my project — no affiliation, no sponsor, no team behind the
marketing.

Feedback I would actually use: what do you expect to happen when you switch a running agent from one
model to another? That answer decides how much work the handoff needs.
```

- **Disclosure line (verbatim, required):**
  `Disclosure: I am the builder. This is my project — no affiliation, no sponsor, no team behind the marketing.`
- **Do not:** drop the licence line. r/SideProject readers check licences and will find it.

### 2.7 Post R6 — r/opensource

- **Subreddit:** r/opensource
- **Risk flag: VERY HIGH — most likely post here to be removed.** r/opensource exists to discuss open
  source; a noncommercial-licensed project is off-topic for promotion, and "source available" posts
  are routinely read as licence-washing. There is a real chance of removal and a public pile-on in
  the comments. Post only as a licensing discussion, never as a launch, and expect the top comment to
  be hostile.
- **Angle:** "I chose a non-open licence, here is what it costs me" — a genuine contribution to the
  licence debate.
- **Title:**
  `I shipped under PolyForm Noncommercial. It is not open source, and here is what that decision actually costs — talk me out of it`
- **Body:**

```markdown
I want to be precise, because most posts in this situation are not: **PolyForm Noncommercial 1.0.0
is not an open source licence.** It fails the Open Source Definition on field-of-use restriction — it
forbids commercial use. The correct phrase is "source available" or "noncommercial". If I ever write
"open source" about my own project, I am wrong, and you should correct me.

What the licence permits: read it, run it, modify it, share it with changes, for any noncommercial
purpose. What it forbids: using it commercially, including shipping it inside a paid product or
running it as a paid service.

**What it actually costs me — the list, not the theory:**

1. **No distro packaging.** Debian, Fedora, Homebrew and most package indexes will not take a
   field-of-use-restricted licence. Users install from a release binary instead, which is worse for
   them and worse for my update path.
2. **No OSI badge, no "open source" in any copy.** Every post like this one has to spend a paragraph
   on definitions instead of on the product.
3. **Contributors hesitate, correctly.** Someone deciding whether to send a patch has to ask "can my
   employer be sued for this" — and for most people the answer is "unclear, so no".
4. **Forks cannot be businesses.** That is the point of the licence, and it is also why nobody will
   build an ecosystem on it.
5. **It is a one-way door in perception.** Relicensing to something permissive later is easy;
   recovering the trust you spend explaining the restriction is not.
6. **Dependency hygiene becomes a real constraint.** I cannot add a dependency whose licence is
   incompatible with mine, and I have to say no to code I would otherwise take.

**Why I still chose it.** I do not want a hosted clone of the product sold back to me while I am
still building it, and I do not have the resources to police a trademark instead. That is a business
argument, not an ideological one, and I am aware it is only persuasive to people who already agree.

**Alternatives I looked at, honestly:**
- AGPL-3.0 — actually open source, and the network clause covers the "someone runs it as a service"
  fear much better than people think. Cost: some companies ban AGPL outright.
- BSL 1.1 — time-delayed open source, converts to a real OSS licence. Cost: not open source on the
  day you ship, and the "change date" reads like a countdown to some people.
- Fair-source / delayed-open variants — same problem as BSL, less name recognition.
- Dual licence (noncommercial + commercial) — open source in spirit for hobbyists, but the paid tier
  is the actual licence, and everyone can see that.

**Disclosure:** it is my project — Whilo, a local-first desktop agent workspace. I am posting this
because I would rather have the licence argument here than in a support thread, not because I want
you to install it.

The question I cannot answer alone: has any project you use made the noncommercial → AGPL switch, and
did it recover its contributor base? I am genuinely looking for a counter-example.
```

- **Disclosure line (verbatim, required):**
  `Disclosure: it is my project — Whilo, a local-first desktop agent workspace. I am posting this because I would rather have the licence argument here than in a support thread, not because I want you to install it.`
- **Flagged risk detail:** the honest move is to *not* post R6 at all unless the licence actually
  changes. Alternative if you want the traffic: post an AGPL/BSL comparison with no project mention.
  That version has a much higher survival rate.

### 2.8 Post R7 — r/automation

- **Subreddit:** r/automation
- **Risk flag: MEDIUM.** Tool posts are allowed but link-drops are removed. Keep the workflow story
  first and the product to one paragraph.
- **Angle:** approval gates as a feature, and the automation steps that should not be automated.
- **Title:**
  `Approval gates are the feature, not the friction: two places we kept a human, one place that still needs one, and one step we deliberately left broken`
- **Body:**

```markdown
Every automation tool sells removing steps. The step that decides whether people actually leave an
automation running unattended is the one where it asks first. Two places we kept a human, one place
that still needs a gate and does not have one yet, and one place where the honest answer is "this does
not run yet".

**1. Money.** An agent filling a checkout with a saved card is a one-way action. Our rule: the first
card fill on a new site waits for the owner's approval; after that, the site is remembered for that
card and later fills go through. Not per-fill, because per-fill approval gets clicked through in a
week — per-site, once, with the site visible in the card's settings so it can be removed later.

**2. Anything that posts as you in a shared space.** An agent that can write to a team chat is
irreversible in the way that matters: the message is public the moment it lands. Our current answer
is scope, not approval — the connectors are limited to the channels the bot is in, optional role
filters decide who can give an agent work at all, and every post is redacted of secrets. The
approval gate belongs here and does not exist yet for chat posts; if you are building this, put the
gate in front of the first post per channel, not per message, because per-message approval gets
clicked through in a week. The rule I would carry over: an approve dialog must show the recipient,
the text and the name it will appear under. "1 action pending" trains people to press yes.

**3. Changing the tool surface.** When an agent wants to add or change the list of tools/tools-servers
it can use, that widens what every agent on the machine can reach. It waits for approval, and the
approval says out loud that the change is machine-wide. The inverse does not need approval: an agent
may narrow its own access, never widen it. Only the human widens.

**The one we left broken.** Our graph editor lets you place image, asset, file-output and
message-trigger nodes. They validate, they save, and a run that reaches one fails with
`unsupported node`. We could have hidden them; instead the run fails loudly and the node stays in the
graph so you can fix it instead of losing the design. Half-built steps that silently pass are the
worst outcome for an automation.

**Two smaller rules that cut support load more than any feature:**

- A scheduled run that has nothing to report should produce no notification at all. Ours can end
  "quiet": no unread marker, no preview change, no sound. The run history keeps the receipt.
- A run that fails must report the failure, even if the agent answered politely. A completed turn
  saying "I could not do this" is a failed run with a reason attached, not a success.

**Disclosure:** I build Whilo, a local agent workspace with scheduled routines and a workflow canvas.
The rules above are how it behaves today, including the unsupported-node one and the missing chat
approval gate — both are real limitations, not teasers.

Counter-question for the room: has anyone made per-first-time approval scale past ~20 sites without
people just clicking through? That is the number where I expect our gate to stop working.
```

- **Disclosure line (verbatim, required):**
  `Disclosure: I build Whilo, a local agent workspace with scheduled routines and a workflow canvas. The rules above are how it behaves today, including the unsupported-node one and the missing chat approval gate — both are real limitations, not teasers.`
- **Why it survives:** the broken-node paragraph is the credibility. Keep it.

### 2.9 Post R8 — r/ClaudeAI

- **Subreddit:** r/ClaudeAI
- **Risk flag: HIGH.** r/ClaudeAI restricts promotion of paid products and third-party tools, and
  requires disclosure. Do not frame the post as "a better client for Claude". Frame it as what
  survives a provider switch.
- **Angle:** the mechanics of moving a live agent between backends — useful to anyone who has hit a
  context limit and wanted to continue elsewhere.
- **Title:**
  `What actually survives when you move a running agent from one model backend to another (and what is lost)`
- **Body:**

```markdown
Not a "which model is better" post. This is about the plumbing: I had to decide, concretely, what
follows an agent when the model behind it changes. Notes and the loss list.

**What is kept.** The agent itself is not the session. Identity, name, workspace folder, files,
memories, settings, and the public conversation thread all live in the app. Swapping the backend
retires one provider session and starts another, and the thread stays. So does the agent's file
tree, which matters more than the chat: a reviewer reading the result does not need the transcript.

**What is handed over.** A bounded handoff, capped at 32,000 characters: about 24k for recent
messages, 4k for older excerpts, 2k for captured work steps, 2k for instructions and references.
Unused space can go to recent text. Large messages keep their start and end. The excerpts are cuts,
not summaries — nobody summarises on the way out, because a summary is a lossy step you cannot audit
later.

**What is lost, and this is the part people underestimate.** Provider-private state: reasoning,
diffs, images, whatever the old backend held internally. We capture work steps per provider and the
fidelity is very uneven:
- One backend returns tool steps from its own rollout: commands with exit code and output tail,
  changed file paths, tool calls, searches, progress notes.
- Another returns only notes.
- An ACP-based one keeps only text and thinking, and only while its process holds the session.

So "I switched backends and it forgot what it did" is usually not the model. It is the capture. If
the old client cannot read the old provider's history, there are no steps to hand over, and the
handoff says so rather than inventing them.

**Design decisions I would defend:**
1. A failed step capture leaves that session's steps out; it does not block the switch. A degraded
   handoff beats a stuck agent.
2. The handoff does not read a provider at switch time except to collect steps, once, with a timeout,
   before the old sessions are retired.
3. Secret redaction runs before truncation, not after. Truncating first can cut a redaction marker in
   half and leave the plaintext tail.
4. A provider whose tool definitions are fixed at session creation needs the *tool set* in the
   session key, or the model keeps calling tools that no longer exist. That one cost me a day.

**Disclosure:** I build Whilo, a local-first agent workspace that runs agents on several backends.
This post is about the cost of that design, from the inside.

What I would like to know: when you move a long task to a different tool mid-flight, do you paste a
summary, a transcript, or the files? I have started to think the answer should be "files only".
```

- **Disclosure line (verbatim, required):**
  `Disclosure: I build Whilo, a local-first agent workspace that runs agents on several backends. This post is about the cost of that design, from the inside.`
- **Flagged risk detail:** if the mods read "runs agents on several backends" as a Claude competitor
  pitch, this gets removed. Mitigation: mention Claude and Codex by name in the comments, never in
  the title, and do not link the download.

### 2.10 Reddit risk summary

| # | Subreddit | Risk | Most likely outcome | Mitigation |
| --- | --- | --- | --- | --- |
| R1 | r/LocalLLaMA | HIGH | Removed as promotion, or ignored | Post in the approved self-promo / weekly thread; keep the product to the disclosure |
| R2 | r/selfhosted | MEDIUM-HIGH | Removed outside the self-promo thread | Post in the weekly thread first; limitations list is the whole post |
| R3 | r/mcp | MEDIUM | Allowed if it stays a design question | No link in the title or first comment |
| R4 | r/AI_Agents | LOW-MEDIUM | Ignored, or allowed | Leads with "not shipped"; never add a CTA |
| R5 | r/SideProject | LOW | Allowed | Keep the licence line |
| R6 | r/opensource | VERY HIGH | Removed, or hostile comments | Do not post as a launch; consider skipping entirely |
| R7 | r/automation | MEDIUM | Allowed if no link-drop | Keep the broken-node paragraph |
| R8 | r/ClaudeAI | HIGH | Removed as third-party promotion | No download link; answer questions for 6 h |

---

## 3. X / Twitter

Voice: short sentences, one idea per tweet, no thread that needs the previous tweet to parse. Never
open with "🧵" alone. Numbers only where they are checkable. The counter (`1/7`) counts toward the
280.

### 3.1 Single tweets (4)

Each of these is a complete post on its own. Post at most one per day; two product singles in a day
is the point where the timeline decides you are an ad account.

**S1 — provider switch / identity**

```tweets
TWEET|S1|Your agent should not lose its workspace when you change the model behind it. In Whilo one agent keeps its folder, thread and identity across Codex, Claude, Grok, Gemini, Cursor, Cline, Kimi, OpenCode and Hermes. Same agent, different engine.
```

**S2 — the tab that outlives the turn**

```tweets
TWEET|S2|Design decision in Whilo: nothing closes a browser tab when a turn ends. close_tab is the only cleanup path. So the tab survives the turn, survives a restart, and the next turn continues on the same page instead of re-authenticating to the same site.
```

**S3 — secrets never reach the model**

```tweets
TWEET|S3|The agent can see your card's last four digits. It never sees the number. Card fills go straight from the vault to the page, and the first fill on a new site waits for your approval. That boundary is the product.
```

**S4 — the honesty post about unshipped vision**

```tweets
TWEET|S4|Two things we have not shipped: an agent-owned inbox, and an agent wallet you approve from your phone. Both are designed. Neither is released. I would rather write that sentence than put them in a launch thread and hope nobody checks.
```

### 3.2 Threads (3)

#### T1 — "your agent cannot finish anything" (7 tweets)

Builder thread. The strongest of the three; use the A/B openings in section 3.5.

```tweets
TWEET|T1.1|1/7 Everyone says their agent "works". Then you watch it for a day and the work is still in your hands. The gap is almost never intelligence. It is that five boring things were never built.
TWEET|T1.2|2/7 One: a queue. Not a chat box. Messages wait, retry, survive a crash, and can be steered into the running turn instead of stacking up behind it. Without this, "run these five tasks" means "sit there and babysit".
TWEET|T1.3|3/7 Two: a thread per task. One agent, several work streams, each with its own conversation and progress. Breadth-first agent work does not fit in one linear chat, and pretending it does is why long tasks get dumber as they get longer.
TWEET|T1.4|4/7 Three: a real workspace on disk. Files the next turn can read, a work log you can open, and a folder that does not evaporate when the process restarts. Memory in a vector store is not the same as a file on your disk.
TWEET|T1.5|5/7 Four: a browser that outlives the turn. Tabs stay open across turns and restarts, up to 25 per agent, and an agent can have its own browser profile so its sessions are not the shared ones. Re-authenticating every turn is the silent tax on agent speed.
TWEET|T1.6|6/7 Five: a place to stop. Approval on the irreversible steps — the first card fill on a new site, an agent adding a tool every agent on the machine can then reach, a payment. Everything else runs without asking, or the gate becomes a rubber stamp.
TWEET|T1.7|7/7 None of that is model work. It is plumbing, and it is why two agents on the same model feel different. Whilo is a desktop workspace built around those five — dev preview, unshipped inbox and wallet clearly labelled.
```

#### T2 — "the browser is the expensive part" (6 tweets)

Data thread. Only thread allowed to carry numbers, and only these numbers.

```tweets
TWEET|T2.1|1/6 The most expensive part of an agent task is usually not thinking. It is reading pages. Every browser action ends with a fresh snapshot, and snapshots are input tokens.
TWEET|T2.2|2/6 We measured it: 10 public site tasks, 3 repeats, one model. Fixed per-action step list: 130k median input tokens. One batched script call: 118k, and 30 of 30 answers correct.
TWEET|T2.3|3/6 Then a worse number. With both the batched tool and the per-step tool in the catalog, agents used both and duplicated work: 198k. Two tools that do the same thing is worse than one tool.
TWEET|T2.4|4/6 So we removed one. That alone went the wrong way: 216k, because agents could not find the batched tool. Making a search for "click" return it too: 149k. No model change, no prompt change. A catalog fix.
TWEET|T2.5|5/6 The batch runs in a QuickJS sandbox with no network, no filesystem, no timers: 64 MiB, 200 steps, 60 s default deadline. It returns one snapshot instead of one per step.
TWEET|T2.6|6/6 Caveats: internal benchmark, one model, ten tasks, and the runs predate a change where input actions return a short status instead of a snapshot. Not independently reproduced. Whilo, dev preview. Counts are in our public docs.
```

#### T3 — "what we refuse to claim" (5 tweets)

Differentiation without competitor claims. This thread is the one that survives quote-tweets.

```tweets
TWEET|T3.1|1/5 A list of things about our own product that I will not say, because they are false today. Three of these were in our own drafts.
TWEET|T3.2|2/5 "Everything stays on your machine." No. Chats, files and commands stay local. The model provider still sees your prompt, the browser still visits the network, and analytics is a thing you can turn off.
TWEET|T3.3|3/5 "Your agent asks before every sensitive action." No. The default is full local access with no per-action prompts. Approval exists on specific paths — a card on a new site, the tool surface — not everywhere.
TWEET|T3.4|4/5 "Open source." No. PolyForm Noncommercial 1.0.0: you can read it, run it, change it, for noncommercial use. Source available is not open source and the difference is not a technicality.
TWEET|T3.5|5/5 "Coming soon" is not a feature either. The agent inbox and the phone-approved wallet are designed, not released. Whilo is a local-first desktop agent workspace; this thread is the product page I would want to read.
```

### 3.3 Reply-bait / engagement posts (3)

Honest question, real answer expected, no incentive, no "RT". Each is designed so the replies are
usable research.

**E1 — failure taxonomy**

```tweets
TWEET|E1|Genuine question for people running agents daily: which failure costs you more — the agent stops halfway, or it finishes and the result is silently wrong? We keep designing for the first. I suspect the second is more expensive.
```

**E2 — spend approval**

```tweets
TWEET|E2|If an agent could spend your money: what would you need before you let it pay $50 without asking? A per-transaction cap, a merchant allowlist, a receipt, or a notification you can reverse?
```

**E3 — workspace topology**

```tweets
TWEET|E3|Agent workspaces: one folder per agent, or one shared folder everyone writes to? We went per-agent plus a shared drop folder, and file collisions are the part I still do not have a good answer for.
```

Note on E3: the product has a per-agent workspace folder plus one shared `Shared` folder for managed
transfers between agents, so the honest answer is "both" — but the collision problem in the tweet is
real and still unsolved. Do not reply to your own tweet with the link.

### 3.4 Quote-tweet templates (2)

Fill the slots, keep the structure, always add a real opinion. Never quote-tweet with just the
template text and a link — that reads as automated and gets ratioed.

**Q1 — reacting to a new model or agent launch**

```tweets
TWEET|Q1|New model, same bottleneck. {MODEL_OR_PRODUCT} does nothing for the agent that lost its browser session, its queue or its files overnight. Better reasoning on top of missing plumbing is still a day you have to redo. {OPTIONAL_LINK}
```

Slots: `{MODEL_OR_PRODUCT}` = the exact name from the announcement, never a paraphrase.
`{OPTIONAL_LINK}` = omit unless the announcement is directly about harnesses/agents.
Rules: do not compare benchmarks. Do not say the new thing is worse. One specific claim about what a
model cannot fix.

**Q2 — reacting to a shutdown, price change, acquisition or API deprecation**

```tweets
TWEET|Q2|{EVENT} is the argument for local-first in one screenshot. Not because your data is safer — because your workspace, threads and browser sessions should outlive a vendor's bad quarter. Local-first is not offline. It is: still yours when the terms change. {OPTIONAL_LINK}
```

Slots: `{EVENT}` = a neutral description of what happened, with no motive attributed.
Rules: never gloat, never name a competitor's failure as a marketing win, never claim Whilo is
unaffected by the same risk — the model backend can still change under you.

### 3.5 A/B opening variants

Use one variant per run, at least 48 h apart, on the same account and the same time of day. Judge on
replies and profile visits, not likes. Variant A is always the tweet as written above, so the count
in section 3.6 covers it; variants B and C are replacements for that opening sentence only and their
whole-tweet length must be re-counted once you paste them in.

**T1 opening (thread hook) — three variants**

- A (current): `Everyone says their agent "works". Then you watch it for a day and the work is still in your hands. The gap is almost never intelligence. It is that five boring things were never built.`
- B (concrete loss): `Your agent is not bad at the task. It is bad at remembering the tab. Re-authenticating, re-reading, re-deriving — that is where the work goes, and no model upgrade fixes it.`
- C (contrarian): `Most "agent" products are a chat box with a browser attached. That is why the work ends up back in your hands. Five boring things are missing, and none of them are model work.`

**S1 opening (single) — three variants**

- A (current): `Your agent should not lose its workspace when you change the model behind it.`
- B (identity): `An agent is not a session. Change the model, keep the agent — same folder, same thread, same history, nine different engines.`
- C (loss framing): `Switch models mid-project and most tools give you a new assistant that has never met your files. Ours keeps the agent and swaps the engine.`

**T3 opening (the refusal thread) — two variants**

- A (current): `A list of things about our own product that I will not say, because they are false today. Three of these were in our own drafts.`
- B (direct): `Three lies this category tells, including the one on our own old landing copy: "everything stays local", "it asks before anything risky", "it's open source".`

### 3.6 Character count verification

Every `TWEET|` line above was counted programmatically. The prefix (`TWEET|<id>|`) is not counted.
Numbering such as `1/7` **is** inside the counted text.

**Result (counter run against this file, `TWEET|<id>|` prefix excluded):**

- 27 tweet strings counted: 4 singles, 18 thread tweets, 3 engagement, 2 quote templates.
- **0 tweets exceed 280 characters.** Longest is 269 (`Q2`, which carries two template slots).
- Shortest is 132 (`T3.1`).
- The 8 A/B opening variants in section 3.5 also fit when substituted into their tweet: longest is
  189 characters (`T1.1` with variant A, which is 185 + the `1/7 ` counter). The other full-tweet
  results are `T1.1` 177 (B) / 179 (C), `T3.1` 132 (A) / 161 (B), and the `S1` openings are sentence
  fragments that continue into the rest of that 242-character tweet.
- A first draft of `Q2` was 294 characters — over the limit. It was rewritten, not truncated with an
  ellipsis, so the sentence still ends properly. This is the failure mode to watch when you edit a
  template: the slots `{EVENT}` and `{MODEL_OR_PRODUCT}` get longer than the placeholder you measured
  with. It is the only string in this file that ever failed the check, and it is recorded here rather
  than quietly fixed.

| tweet | chars | ≤280 |
| --- | --- | --- |
| `S1` | 242 | PASS |
| `S2` | 250 | PASS |
| `S3` | 212 | PASS |
| `S4` | 234 | PASS |
| `T1.1` | 189 | PASS |
| `T1.2` | 215 | PASS |
| `T1.3` | 235 | PASS |
| `T1.4` | 220 | PASS |
| `T1.5` | 255 | PASS |
| `T1.6` | 248 | PASS |
| `T1.7` | 219 | PASS |
| `T2.1` | 171 | PASS |
| `T2.2` | 178 | PASS |
| `T2.3` | 190 | PASS |
| `T2.4` | 206 | PASS |
| `T2.5` | 173 | PASS |
| `T2.6` | 230 | PASS |
| `T3.1` | 132 | PASS |
| `T3.2` | 205 | PASS |
| `T3.3` | 210 | PASS |
| `T3.4` | 189 | PASS |
| `T3.5` | 218 | PASS |
| `E1` | 227 | PASS |
| `E2` | 188 | PASS |
| `E3` | 197 | PASS |
| `Q1` | 231 | PASS |
| `Q2` | 269 | PASS |

Counting rules used:
- Every character counts, including the `1/7` counter, em dashes, and curly-vs-straight quotes as
  written.
- `{EVENT}`, `{MODEL_OR_PRODUCT}` and `{OPTIONAL_LINK}` are counted as the literal placeholder
  text. **Re-count after you fill them.** A t.co link costs 23 characters on X regardless of length,
  so `{OPTIONAL_LINK}` (15 characters as written) grows by up to 8 when you paste a real URL.
- `Q2` has 269 characters with `{OPTIONAL_LINK}` present. Filling
  `{EVENT}` with a 40-character event description and adding a real link can push it over: drop the
  last sentence before you drop a word from the middle.
- Re-run any counter after an edit. Do not eyeball this. A tweet posted at 285 characters is posted
  truncated, and the truncation lands wherever X decides.

---

## 4. What NOT to post

Five claims that are false or legally risky for this product. Each one has appeared in a draft, or is
one sentence away from appearing. Do not post them, and remove them from any asset that already has
them.

### 4.1 "Everything stays on your computer"

**Why it is false.** Whilo is local-first, not offline-only, and `PRIVACY.md` says so in its first
paragraph. What stays local: workspaces, conversations, attachments, browser data, team data. What
leaves: every prompt goes to the selected provider (OpenAI, Anthropic, xAI, Google, Cursor, Cline,
Moonshot, Nous, or your own endpoint); visited pages use the network; a plugin connects to its own
vendor; the optional account service on Cloudflare holds account, avatar, host configuration,
memberships, invitations and logical sessions; a signed-in phone keeps an encrypted read-only cache
of agents, sections and recent chats; product analytics exists (self-hosted OpenPanel) and is on by
default in some regions, and even with analytics off the clients send anonymous install-ID events and
error reports.

**Why it is risky.** It is a data-protection misrepresentation, not a copy quibble. In the EU/UK it
is the kind of statement a regulator reads as a misleading commercial practice, and it is trivially
disproved by the privacy policy shipping beside it.

**Say instead:** "Your chats, files and commands stay on your computer. Prompts go to the model you
chose. The account service never holds your chats."

### 4.2 "End-to-end encrypted" / "we can't see your data"

**Why it is false.** There is no end-to-end claim anywhere in the architecture. Remote sessions use
WebRTC with a TURN relay; the relay carries encrypted traffic it does not read, but that is transport
encryption, not E2E between two parties the service cannot see. Beyond that: agents run with
`danger-full-access`, so anything on the machine is reachable by them; crash dumps can contain
conversation text and cannot be redacted; browser secure-input protection explicitly does not isolate
credentials from the operating system or from agents with unrestricted machine access.

**Why it is risky.** A false security claim is the fastest route to a regulatory complaint and to a
security researcher's timeline. It also invites "so prove it" — and there is no audit, no
certification, no threat model published as a product claim.

**Say instead:** "Sensitive values go from you to the page through a path the model never sees, and
they are redacted from logs, exports and diagnostics. We are not a security boundary — read the
access section before you run an agent."

### 4.3 "Open source"

**Why it is false.** The licence is PolyForm Noncommercial 1.0.0. It restricts the field of use, so it
fails the Open Source Definition. Saying "open source" is a licensing claim with a settled meaning,
and it is wrong here. So is "free" (noncommercial ≠ free of charge for a business) and "fork it and
build on it" (a commercial fork is exactly what the licence forbids).

**Why it is risky.** Wrong licence claims get a project delisted, get DMCA-adjacent complaints from
users who relied on them, and are the one mistake the developer community does not forgive. It also
creates a compatibility problem inside the repo: dependencies must stay compatible with the licence,
and copy that promises permissive reuse invites contributions the project cannot accept.

**Say instead:** "Source available under PolyForm Noncommercial 1.0.0. Read it, run it, change it for
noncommercial use. Not OSI open source, and not open for commercial forks."

### 4.4 "It asks for your approval before every sensitive action"

**Why it is false.** The shipped default is `danger-full-access` with `approvalPolicy: never`, after a
one-time first-launch consent. Agents read and modify files, run programs, use the network and drive
the browser with no per-action confirmation. Approval gates exist on specific paths — agent-requested
MCP server changes, the first card fill on a new site, a Link payment approval, browser takeover, and
tool questions — and those are the exception, not the rule. This claim is already in the internal
carousel draft `docs/business/marketing-posts.md` slide 4 ("Permissão e aprovação na sua mão — cada
passo sensível com o seu OK"). That slide describes a direction, not the build, and it must be
rewritten before it ships.

**Why it is risky.** It is a safety claim about software that will run unattended on someone's
machine. A user who believes it and loses data has a documented misrepresentation to point at.

**Say instead:** "Agents run with full local access by default — that is the product's design and its
biggest risk. Approval gates exist on specific paths: money, the tool surface, browser takeover. Read
the warning before you install."

### 4.5 "Agents can already buy things and run their own inbox"

**Why it is false.** Whilo Inbox does not exist in the codebase; it is a design document explicitly
marked untested. The branded `Minha Carteira` wallet does not exist. The nearest shipped capability is
an agent requesting a single Link payment: the user approves in Link, the call waits up to five
minutes, and the agent gets a one-time card id for a card fill — Link's wallet, Link's UI, and
region-limited (Link operates in the US and Canada per the internal strategy note). None of that is a
wallet you approve from our app on your phone.

**Why it is risky.** Shipping-status claims are the easiest thing for a reader to falsify in thirty
seconds, and this one also drags in a payment-network partner whose brand rules apply to how you
describe their product. "Approved on your phone" additionally implies a mobile approval flow we have
not built.

**Say instead:** "Card payments go through Link, with the approval inside Link — Link operates in the
US and Canada only. An agent-owned inbox and a wallet approved from your phone are designed, not
shipped." Check the `[DADO A CONFIRMAR]` in section 6 about whether that flow is enabled in the public
release build before this sentence goes anywhere near a paid asset.

### 4.6 Borderline — do not use without legal review

- "Private by default." Analytics defaults differ by region and even with it off, anonymous events
  and error reports are sent. Use "local-first" and describe the exception.
- "Works with any model." It works with the providers and endpoints listed in the README, plus local
  Ollama/LM Studio endpoints. "Any" is a compatibility promise nobody has tested.
- "Your data, your rules / delete everything with one click." Deletion is documented as manual
  folder removal plus per-surface controls, and provider-side retention is outside our control.
- Any competitor comparison. The internal strategy doc names the closest competitors and credits them
  with brand and distribution; we have no verified data about their internals, their limits or their
  roadmaps. Compare published designs and quote their own pages, never compare products.

---

## 5. Posting order (so the accounts do not look automated)

1. Week 1: R1 (r/LocalLLaMA, weekly thread) + S3. Answer every comment.
2. Week 1: T2 (data thread) two days after R1.
3. Week 2: R5 (r/SideProject) + S1.
4. Week 2: T1 (plumbing thread), best-performing opening variant.
5. Week 3: R7 (r/automation) + R3 (r/mcp) — the two design posts.
6. Week 3: S2 + E1 (engagement).
7. Week 4: R2 (r/selfhosted weekly thread) + T3 (the refusal thread).
8. Week 4: S4 (the unshipped-vision post), then E2 (spend approval) as a reply-bait follow-up.
9. Hold R4 (r/AI_Agents) and R8 (r/ClaudeAI) until the earlier posts have comment history on the
   account. Hold R6 (r/opensource) indefinitely unless the licence changes.
10. Q1/Q2 quote-tweets are reactive — use them only when the news actually lands, never pre-scheduled.

Do not run two Reddit posts in the same subreddit within 30 days. Do not post the same link twice in
a week on X.

---

## 6. Open items

- `[DADO A CONFIRMAR]` — pricing for the paid tiers. No post in this kit states a price, and none
  should: a price in a Reddit body goes stale and cannot be edited. If a post ever must name one, take
  it from the shipped constants (`packages/contracts/src/billing.ts`, `packages/contracts/src/license.ts`),
  not from a marketing doc, and re-check it on the day you post.
- `[DADO A CONFIRMAR]` — whether the Link payment flow is enabled in the release build the public
  downloads, or gated. Until confirmed, every mention stays at PREVIEW with "in the codebase".
- `[DADO A CONFIRMAR]` — public user / install / star counts, if any exist. No post may cite one.
- `[DADO A CONFIRMAR]` — the 31 plugin listings: confirm the served catalog on `openbot.run` matches
  the repo count before any post says "31 listings".
- `[DADO A CONFIRMAR]` — the rename / naming decision that `whilo-strategy.md` lists as pending (app
  name, domain, store listings). All copy here uses the repo's `Whilo` spelling and the `openbot.run`
  host; if either changes, every post and every disclosure line in this file needs a find-and-replace.
- `[DADO A CONFIRMAR]` — whether the Windows/Linux preview builds are considered safe to recommend to
  strangers, or whether posts should point at macOS only.
- `[DADO A CONFIRMAR]` — legal review of section 4 before any of those sentences appear in a paid
  asset.
