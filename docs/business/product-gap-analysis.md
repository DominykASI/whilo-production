# Whilo — product gap analysis

Status: working analysis, not a commitment. Repository version 0.59.0.
Scope: the desktop app (`src/main`, `src/renderer`), the phone app (`apps/mobile`), the plugin and
skill catalogs (`marketplace/`), and the documented subsystems (`docs/architecture/`).

**Rank 1 gap: the approval policy engine and approval audit trail** (section 2, gap 1). It is the
prerequisite of the purchase feature, the inbox send path, and every enterprise sale. It is also the
cheapest row in the table, because `src/main/approval-automation-store.ts` and
`src/main/server-audit-store.ts` already exist.

## 0. Method and evidence limits

- Method: directory listings, file names, and short heads of the business and architecture documents.
  No build ran. No test ran. No git command ran.
- A capability is **shipped** only when both a main-process provider and a renderer or phone surface
  exist, and a test file or an architecture document names it.
- A row marked `A CONFIRMAR` needs one file read before anyone relies on it.
- A claim that is a conclusion from structure, not a read statement, is marked `INFERIDO`.
- Evidence for the strategy frame: `docs/business/whilo-strategy.md`. It names the two vision
  features (agent purchases, agent inbox) and the trust argument (approve each sensitive step).
- No metric in this document is measured. Where a number appears, it is a count of files or
  catalog rows.

## 1. Feature surface

Derived from `ls src/renderer/src/features/`, `ls src/main/*.ts`, `ls apps/mobile/src/features/`,
`ls marketplace/*`, and `ls docs/architecture/`.

| Capability | Implemented where (real path) | Status |
| --- | --- | --- |
| Persistent local agents, workspaces, threads | `src/backend/agent/`, `src/renderer/src/features/agents/`, `src/renderer/src/features/agent-threads/` | shipped |
| Agent side threads ("tasks") | `src/backend/agent-tasks/`, `src/renderer/src/features/agent-tasks/` | shipped |
| Agent templates and publish | `src/main/agent-template-service.ts`, `src/renderer/src/features/agent-templates/PublishAgent.tsx`, `src/main/team-api/route-agent-publish.ts` | shipped |
| Agent memory, instructions, folders | `src/backend/agent-memory-store.ts`, `src/main/agent-instructions-files.ts`, `src/main/agent-folders.ts` | shipped |
| Provider runtimes (Codex, Claude, Gemini, Cursor, Cline, Kimi, Grok, OpenCode, Hermes) | `src/main/provider-runtime-manager.ts`, `src/main/provider-runtime-descriptors.ts`, `docs/architecture/providers.md` | shipped |
| Provider runtime download and update | `src/main/provider-runtime-releases.ts`, `src/renderer/src/features/provider-updates/`, `src/main/team-api/route-host-update.ts` | shipped |
| Custom providers (OpenAI-compatible) | `src/main/custom-provider-store.ts`, `src/renderer/src/features/custom-providers/` | shipped |
| ACP agent registry and install | `src/main/acp-registry.ts`, `src/main/acp-registry-install.ts`, `src/main/ipc/acp-registry-handlers.ts` | shipped |
| Conversations, attachments, files | `src/renderer/src/features/conversation/`, `src/renderer/src/features/files/`, `src/main/file-preview.ts` | shipped |
| Approval prompts inside a conversation | `src/renderer/src/features/conversation/ConversationTimeline.tsx`, `src/backend/agent/tool-catalog.ts` | shipped |
| Approval automation (auto-approve default, per-agent override) | `src/main/approval-automation-store.ts`, `src/main/ipc/` handlers | shipped, narrow |
| Per-tool or per-domain approval policy | none found | missing |
| Approval audit trail (who approved what, when) | `src/main/server-audit-store.ts` covers access and admin changes only | partial |
| Local scripts API (bearer token, loopback) | `src/main/automation-server.ts`, `docs/architecture/agents.md` | shipped |
| Browser control, tab groups, profiles | `src/main/browser-view-gateway.ts`, `src/main/browser-profile-service.ts`, `src/renderer/src/features/browser/` | shipped |
| Browser picture-in-picture, dock overlay | `src/main/browser-picture-in-picture.ts`, `src/main/browser-dock-overlay.ts`, `src/renderer/src/features/browser/BrowserDockSurface.tsx` | shipped |
| Computer Use (input posting, accessibility reads) | `src/main/cua-driver-runtime.ts`, `src/main/computer-use-permission-app.ts`, `src/renderer/src/features/computer-use/` | shipped, platform coverage `A CONFIRMAR` |
| Remote desktop | `src/main/remote-desktop-manager.ts`, `src/main/remote-screen-gateway.ts`, `src/renderer/src/features/remote-desktop/` | shipped |
| Routines and schedules | `src/backend/agent-routine-store.ts`, `src/renderer/src/features/schedule/SchedulePanel.tsx`, `src/main/routine-wake.ts` | shipped |
| Routine calendar feed (ICS) | `src/main/routine-feed-ics.ts`, `src/main/routine-feed-server.ts`, `src/main/local-routine-calendar.ts` | shipped |
| Routine flows (diagram canvas) | `src/renderer/src/features/routine-flows/RoutineFlowsCanvas.tsx`, `src/main/team-api/route-routine-flows.ts` | shipped |
| Workflows (approvals and outputs inside a flow) | `src/renderer/src/features/workflows/WorkflowsPage.tsx`, `src/main/team-api/route-workflows.ts` | shipped |
| Webhooks in and out | `src/main/webhook-relay.ts`, `src/main/webhook-security.ts`, `src/backend/agent/webhook-routine-tool.ts` | shipped |
| MCP servers (add, test, enable, remove by agent request) | `src/backend/agent/mcp-tools.ts`, `src/backend/agent/mcp-gateway.ts`, `src/renderer/src/features/servers/mcp-servers.ts` | shipped |
| MCP OAuth sign-in, including remote hosts | `src/main/mcp-oauth-proxy-store.ts`, `src/main/mcp-oauth-redirect-server.ts`, `src/main/mcp-host-sign-ins.ts` | shipped |
| Connectors (GitHub, 1Password, Bitwarden, messaging) | `src/renderer/src/features/connectors/connector-registry.ts`, `src/main/github-connector-service.ts`, `src/main/onepassword-connector-service.ts`, `src/main/bitwarden-connector-service.ts` | shipped, four connectors |
| Google Workspace or Microsoft 365 connector | none found | missing |
| Channels: Slack, Discord, Telegram | `src/main/team-api/route-channels.ts`, `src/main/slack-dev-callback-server.ts`, `apps/slack-app/`, `apps/discord-app/`, `apps/telegram-app/` | shipped |
| Team API (server to server protocol) | `src/main/team-api-server.ts`, `src/main/team-api/`, `docs/architecture/team-api.md` | shipped |
| Team presence, typing, file transfer over WebRTC | `src/main/team-webrtc-host-peer.ts`, `src/main/team-webrtc-file-transfer.ts`, `src/renderer/src/features/team/team-typing.ts` | shipped |
| Multi-machine remote servers | `src/main/remote-server-manager.ts`, `src/renderer/src/features/servers/`, `docs/architecture/servers.md` | shipped |
| Hosted servers (paid hosting upsell) | `src/main/hosted-server-service.ts`, `src/renderer/src/features/servers/hosted-server-upsell.ts` | shipped |
| Instance transfer between machines | `src/main/instance-transfer-service.ts`, `src/main/instance-transfer-manifest.ts`, `src/main/team-api/route-instance-transfer.ts` | partial |
| User data migration across app versions | `src/main/user-data-migration.ts` | shipped, one-way |
| User-facing backup or export of `openbot.db` | none found | missing |
| Vault (secrets, CSV import) | `src/main/vault-service.ts`, `src/main/vault-csv.ts`, `src/renderer/src/features/vault/ServerVaultPanel.tsx` | shipped |
| Link account (Stripe link.com) sign-in | `src/main/link-account-service.ts`, `src/main/ipc/link-account-handlers.ts`, `src/renderer/src/features/vault/stores/link-account-store.ts` | shipped: `status`, `connect`, `cancel`, `disconnect` |
| Link one-time card request (spend request) | `src/main/link-account-service.ts` has `LinkPaymentRequest`, `LinkPaymentResult`, `LinkCard`; `src/main/ipc/link-account-handlers.ts` exposes no card or spend endpoint | partial: service only, unreachable from any UI |
| Agent-initiated purchase with a card | none found in `src/backend/agent/tool-catalog.ts` | missing |
| Agent-owned email inbox | none found (no IMAP or SMTP path in `src/`) | missing |
| Voice input, speech replies, cloud streaming | `src/main/voice-speech-host-process.ts`, `src/main/voice-cloud-stream.ts`, `src/renderer/src/features/speech/` | shipped |
| Marketplace: Apps tab, install, uninstall | `packages/ui/src/features/marketplace/`, `src/renderer/src/features/settings/MarketplaceModal.tsx`, `src/main/agent-marketplace-service.ts` | shipped |
| Marketplace: served remote plugin catalog | `marketplace/plugin-catalog/catalog.json` is local only; `docs/plugin-distribution.md` says steps 3 to 5 are open | missing |
| Marketplace: plugin submission and review | none found; document says "a plugin is added in the repository" | missing |
| Plugin catalog size | `marketplace/plugin-catalog/plugins/` | 32 plugins |
| Skill catalog | `marketplace/production-catalog/skills/` | 40 skills |
| Bundles | `marketplace/production-catalog/bundles/` | 1 bundle (`pstack`) |
| Skill authoring and publishing from the app | `src/main/skill-marketplace-service.ts` has `submit(input: SubmitSkillInput)` and `listMine()`; no renderer consumer outside `src/renderer/src/preview/mock-skills.ts` | partial: service and wire, no UI |
| Billing and license | `src/main/billing-service.ts`, `src/main/license-service.ts`, `packages/ui/src/features/billing/` | shipped |
| Usage and plan limits | `src/renderer/src/features/usage/`, `src/main/team-api/route-provider-usage-reset.ts` | shipped |
| Analytics (product telemetry, consent, inventory) | `src/main/analytics.ts`, `src/main/analytics-inventory.ts`, `docs/architecture/analytics.md`, `apps/mobile/src/features/analytics/` | shipped; desktop reporting surface `A CONFIRMAR` |
| Server audit log (access and admin changes) | `src/main/server-audit-store.ts`, `src/main/team-api/route-server-audit.ts`, `src/renderer/src/features/servers/ServerAuditSection.tsx` | shipped |
| Desktop global search | `src/renderer/src/global-search-sources.ts`, `packages/ui/src/components/GlobalSearch` | shipped |
| Phone search | `apps/mobile/src/features/search/` | shipped |
| Phone quick actions and app lock | `apps/mobile/src/features/quick-actions/`, `apps/mobile/src/features/app-lock/` | shipped |
| Phone push notifications (APNs, Android) | `src/main/push-notifications.ts`, `src/main/push-notification-store.ts`, `apps/mobile/src/features/push-notifications/` | shipped |
| Phone Live Activity (iOS) | `src/main/live-activity-push.ts`, `src/main/team-api/route-live-activity-push.ts`, `apps/mobile/src/features/live-activity/` | shipped |
| Phone answering of approvals and questions | `apps/mobile/src/features/workspace/model/pending-approvals.ts`, `apps/mobile/src/features/chat/components/chat-approval-card.tsx` | shipped |
| "Needs you" attention list on desktop | `docs/architecture/agents.md` names it; `src/renderer/src/features/sidebar/WorkspaceSidebar.tsx` renders a partial list | partial |
| Attention queue on the phone | `apps/mobile/src/features/chat/components/awaiting-replies-section.tsx` | partial |
| Deep links and share links | `src/main/deep-link-router.ts`, `packages/contracts/src/invite-links.ts` | shipped for five kinds |
| Canonical public share pages | `apps/site-router/`, `marketplace/production-catalog/`; plugin links still point at `https://whilo.app/plugins/<slug>` | partial |
| Web client (app in the browser) | `src/renderer/src/features/web-client/`, `apps/auth-api/`, `docs/architecture/browser.md` | shipped |
| Onboarding and first run | `src/renderer/src/features/onboarding/`, `apps/mobile/src/features/onboarding/` | shipped |
| Updates (signed, host update, idle restart) | `src/main/update-service.ts`, `src/main/host-update-coordinator.ts`, `src/renderer/src/features/updates/` | shipped |
| Trust boundary controls | `src/main/content-security-policy.ts`, `src/main/trusted-ipc.ts`, `src/main/trusted-renderer.ts`, `src/main/renderer-permissions.ts`, plus their `.test.ts` files | shipped |
| Localization | `packages/i18n/`, `src/main/language-service.ts`, `packages/brand/` | shipped |

Count from the listings: 32 renderer feature folders, 79 IPC handler modules, 76 Team API route
modules, 22 phone feature folders, 13 documented subsystems (`docs/architecture/`), 32 plugins,
40 skills, 1 bundle.

## 2. The ten highest-leverage gaps

Order is by leverage for the next two quarters, not by size. Gap 1 is the shared prerequisite of
gaps 2, 3 and 5, so it is first.

### 1. Approval policy engine and approval audit trail

**One sentence.** Whilo can auto-approve an agent from one switch, but it cannot say "this agent may
spend up to 20 dollars on `stripe.com` and nothing else", and it cannot prove afterwards who allowed
what.

- **Commercial why.** Retention and moat. `docs/business/whilo-strategy.md` calls trust the answer to
  "I do not trust an agent with a card", and makes governance the sales argument. Without a policy
  layer, every purchase, send, and delete needs a human at the keyboard, so the agent never finishes
  alone.
- **Files it would touch.** `src/main/approval-automation-store.ts` (the preference shape is
  `{ defaultAutoApprove, autoApproveOverrides }` today), `packages/contracts/src/ipc.ts`
  (`ApprovalAutomationPreference`), `src/backend/agent/tool-catalog.ts`,
  `src/backend/agent/tool-operation.ts`, `src/main/server-audit-store.ts`,
  `src/main/team-api/route-server-audit.ts`,
  `src/renderer/src/features/servers/ServerAuditSection.tsx`,
  `src/renderer/src/features/conversation/ConversationTimeline.tsx`.
- **Smallest shippable version.** Add a third field to the preference: a list of rules
  `{ toolId, scope, limit }`, where scope is a domain, a path prefix, or an amount. Evaluate it in
  `tool-operation.ts` before the prompt. Write one audit entry per decision with the rule that
  matched. Show both in `ServerAuditSection.tsx`. No new screens.
- **Effort.** S to M. The store, the audit store and the audit UI already exist.
- **Trust boundary.** Risk: a rule that is wider than the user thinks turns a safe default into
  silent full access. Constraint: default stays deny; an invalid or unreadable rule file must fall
  back to "ask" as `approval-automation-store.ts` already does for invalid settings; the audit entry
  is written in the main process, never by the renderer.

### 2. Agent purchases with phone approval

**One sentence.** The Link sign-in and the card request exist in the main process, but no agent tool
reaches them and the approval page opens in a browser instead of on the phone.

- **Commercial why.** Expansion and moat. This is the first of the two vision features in
  `docs/business/whilo-strategy.md`, and it is the clearest "the agent finishes the job" story that
  a competitor does not have closed.
- **Files it would touch.** `src/main/link-account-service.ts` (`LinkPaymentRequest`, `LinkCard`,
  `WAITING_STATES = created | pending_approval`, `POST /spend_requests/{id}/request_approval`),
  `src/main/ipc/link-account-handlers.ts` (today only `status`, `connect`, `cancel`, `disconnect`,
  with the note "no endpoint takes a payload"), `src/backend/agent/tool-catalog.ts`,
  `src/backend/agent/whilo-tool-router.ts`,
  `src/renderer/src/features/vault/stores/link-account-store.ts`,
  `src/renderer/src/features/vault/ServerVaultPanel.tsx`, `src/main/push-notifications.ts`,
  `src/main/team-api/route-push-notifications.ts`,
  `apps/mobile/src/features/chat/components/chat-approval-card.tsx`,
  `apps/mobile/src/features/workspace/model/pending-approvals.ts`.
- **Smallest shippable version.** One tool, `link_request_card`, with a required `reason` and a
  required amount cap. It creates the spend request, then returns a conversation approval card. The
  desktop card approves or rejects. The phone shows the same card through the existing approval
  transport. No card number ever enters a model turn. The first IPC endpoint that takes a payload
  must take a request id only, never a URL or a token.
- **Effort.** M. The provider is done; the tool, the card and the phone affordance are the work.
- **Trust boundary.** Risk: money leaves the user's account on a model-produced value. Constraint:
  the amount cap and the merchant are fields the user sets, not fields the model sets; the approval
  token is bound to one request id and expires; the card number stays in the main process and the
  secret redaction path (`@whilo/logging`) covers the new fields; every attempt writes a
  `server-audit-store.ts` entry.

### 3. Agent-owned inbox (Whilo Inbox)

**One sentence.** Whilo has no mail ingestion path at all, so the daily-retention surface that the
strategy names does not exist yet.

- **Commercial why.** Retention and activation. Mail touches the user every day. The strategy calls
  it the loop that makes the product a habit. It also creates the corpus that skills can act on
  without a new connector per customer.
- **Files it would touch.** New `src/main/mail-account-store.ts` and `src/main/mail-service.ts`
  (pattern: `src/main/messaging-credential-store.ts` for sealed credentials,
  `src/main/onepassword-connector-store.ts` for the store shape), new
  `src/backend/agent/mail-tools.ts` (pattern: `src/backend/agent/memory-tool-inputs.ts` for input
  limits, `src/backend/agent/routine-tools.ts` for the response shape), new
  `src/main/team-api/route-mail.ts`, new `src/renderer/src/features/inbox/`,
  `src/renderer/src/features/sidebar/sidebar-sections-storage.ts`,
  `marketplace/production-catalog/skills/` (one triage skill), `apps/mobile/src/features/`.
- **Smallest shippable version.** Read-only IMAP for one account per host, one folder (INBOX).
  Fetch headers only, store them as agent files. One tool `mail_search`. One skill that summarises
  the day and drafts replies into the conversation. Sending is a later step, behind gap 1.
- **Effort.** L. New protocol, new credentials, new storage, new UI.
- **Trust boundary.** Risk: a mailbox is the largest private dataset a user owns, and mail content
  becomes model input. Constraint: the product constraint in `AGENTS.md` says workspace data stays on
  the computer that runs Whilo, so mail must land in the local database, never in Cloudflare; the
  credential goes through `registerSecretValue`; the address and the folder are the only network
  targets, so a fixed provider list is required, not a model-chosen host.

### 4. Served plugin catalog and a submission path

**One sentence.** The catalog, the Apps tab, install and deep links exist, but the catalog is only a
file in the repository, so no outside developer can ship a plugin.

- **Commercial why.** Moat and expansion. A catalog that grows without a release is the network
  effect the strategy asks for. Today every new integration is a Whilo commit.
- **Files it would touch.** `marketplace/plugin-catalog/catalog.json`,
  `marketplace/plugin-catalog/plugins/`, `marketplace/production-catalog/catalog.json`,
  `src/renderer/src/features/settings/marketplace-plugin-catalog.ts`,
  `src/main/agent-marketplace-service.ts`, `src/main/skill-marketplace-service.ts`,
  `src/main/analytics-plugin-catalog.ts`, `packages/ui/src/features/marketplace/`,
  `apps/site-router/`, `packages/contracts/src/invite-links.ts`.
- **Smallest shippable version.** Serve `catalog.json` and the plugin folders from `openbot.run`
  with an ETag. The app fetches on start, decodes with a schema, and keeps the bundled copy as the
  fallback. Fix `Copy link` to `https://openbot.run/plugins/<slug>`. Submission stays a pull
  request with a documented schema.
- **Effort.** S. `docs/plugin-distribution.md` states the decisions; the open work is steps 3 to 5.
- **Trust boundary.** Risk: the catalog is remote input that names MCP commands and skill folders.
  Constraint: decode at the boundary with a schema and drop unknown fields; the catalog may not carry
  a shell command, only a registry id that resolves through local validation; the renderer receives
  decoded display data, never a URL it opens by itself.

### 5. A real attention queue ("Needs you")

**One sentence.** Approvals, questions, and browser takeovers are listed per conversation, but no
screen answers "what is waiting for me across all agents and all machines".

- **Commercial why.** Retention. A multi-agent product fails when the user loses track of what is
  blocked. One queue is also the surface that makes the phone useful on a train.
- **Files it would touch.** `src/renderer/src/features/sidebar/WorkspaceSidebar.tsx`,
  `src/renderer/src/features/agent-tasks/agent-tasks-state.ts`,
  `src/renderer/src/features/tasks/TasksPanel.tsx`, `src/main/team-api/route-agent-queue.ts`,
  `src/main/remote-server-manager.ts` (the queue must include remote hosts),
  `apps/mobile/src/features/chat/components/awaiting-replies-section.tsx`,
  `packages/team-client/src/runtime-attention.ts` (the reconciler that already exists).
- **Smallest shippable version.** One page: every pending approval, question and waiting task, from
  every connected server, sorted by age, with approve, reject and open. No bulk actions in v1.
- **Effort.** S to M. The reconciler and the per-host routes exist; the cross-host aggregation and
  the page do not.
- **Trust boundary.** Risk: a cross-host list shows one member the work of another. Constraint: reuse
  the existing per-host visibility filter (`src/main/team-api/provider-visibility.ts`,
  `route-agent-access.ts`); aggregate only after the per-host check, never before.

### 6. First-class Google Workspace and Microsoft 365 connectors

**One sentence.** There are four connectors (GitHub, 1Password, Bitwarden, messaging) against 32 MCP
plugins, so the systems that hold most company work need a per-user MCP sign-in each time.

- **Commercial why.** Activation and expansion. Activation under five minutes is a stated strategy
  requirement; a Google sign-in that brings mail, calendar, and drive in one step is the shortest
  path to a first useful result.
- **Files it would touch.** `src/renderer/src/features/connectors/connector-registry.ts`,
  `src/renderer/src/features/connectors/connector-controller.ts`, new
  `src/main/google-connector-service.ts` (pattern: `src/main/github-connector-service.ts`),
  `src/main/mcp-oauth-proxy-store.ts`, `src/main/mcp-oauth-redirect-server.ts`,
  `src/main/link-auth.ts`, `packages/contracts/src/ipc.ts`.
- **Smallest shippable version.** One Google connector, read-only scopes (calendar and drive
  metadata), signed in through the existing OAuth proxy. It maps to one MCP server entry, so agents
  see it as a normal server.
- **Effort.** M. The OAuth proxy, the relay, and the connector controller are shared already.
- **Trust boundary.** Risk: a broad OAuth scope hands an agent the whole tenant. Constraint: the
  scope list is fixed in code, the refresh token is sealed through `registerSecretValue`, and the
  sign-in callback keeps the existing relay rules in `src/main/sign-in-relay-client.ts` (loopback
  origin check, sender validation).

### 7. One canonical share-link graph

**One sentence.** Five link kinds resolve through one router, but the product advertises plugin links
on a host that does not exist and has no link for a skill, a bundle, or a shared conversation.

- **Commercial why.** Expansion. Every shared link is a distribution event. A dead link is a lost
  signup, and it also fails store review, which checks that advertised URLs resolve.
- **Files it would touch.** `src/main/deep-link-router.ts`, `packages/contracts/src/invite-links.ts`,
  `src/main/deep-link-router.ts` callers in `src/main/index.ts`,
  `marketplace/production-catalog/`, `apps/site-router/`,
  `src/renderer/src/features/settings/MarketplaceModal.tsx`,
  `apps/mobile/src/features/links/`.
- **Smallest shippable version.** Every share button produces `https://openbot.run/<kind>/<id>`.
  `deep-link-router.ts` gains `plugin`, `skill`, `bundle` kinds next to the existing ones. The site
  router serves a public page per kind, with an "Open in Whilo" button.
- **Effort.** S.
- **Trust boundary.** Risk: a link handler that trusts its payload is a remote code path. Constraint:
  unknown kinds stay `null` and are dropped, as the router does today; a link carries an id only, and
  the install still goes through the catalog decode and the local validation of gap 4.

### 8. Skill and bundle authoring, and paid bundles

**One sentence.** Agents can be published from the app, but skills and bundles can only be added in
the repository, and the catalog holds one bundle.

- **Commercial why.** Expansion and margin. A bundle is the unit a team buys. Today `bundles/` has
  `pstack` alone, and `marketplace/production-catalog/licenses/` implies a licence model with no
  authoring tool in front of it.
- **Files it would touch.** `marketplace/production-catalog/skills/`,
  `marketplace/production-catalog/bundles/`, `marketplace/production-catalog/licenses/`,
  `src/main/skill-marketplace-service.ts`, `src/main/skill-package.ts`,
  `src/main/managed-skill-service.ts`, `src/main/local-skill-library.ts`,
  `src/renderer/src/features/agent-templates/PublishAgent.tsx` (pattern to copy),
  `src/main/billing-service.ts`, `src/main/license-service.ts`.
- **Smallest shippable version.** A "Publish skill" screen in the renderer, on top of the
  `submit(SubmitSkillInput)` and `listMine()` methods that
  `src/main/skill-marketplace-service.ts` already provides, and a "My submissions" list beside it.
  Validation stays where it is. No payments in v1.
- **Effort.** S. The service, the validation and the wire contract exist; only the screen is new.
- **Trust boundary.** Risk: a published package can carry scripts. Constraint: a package is data
  only; the validator refuses files outside the skill folder, and install keeps the existing
  per-agent scope rule from `docs/plugin-distribution.md`.

### 9. User-facing backup and restore of the local database

**One sentence.** `AGENTS.md` states that migrations are irreversible and that no backup of
`openbot.db` is made before an upgrade, and the product gives the user no way to make one.

- **Commercial why.** Trust and retention. A local-first product that can lose a year of agent
  history on a bad update cannot be sold to a team. This is also a support-cost item.
- **Files it would touch.** `src/main/user-data-migration.ts`,
  `src/main/instance-transfer-service.ts`, `src/main/instance-transfer-manifest.ts`,
  `src/main/remote-sync-profile-file.ts`, `src/main/vault-service.ts` (key handling),
  `src/renderer/src/features/settings/`, `src/main/team-api/route-instance-transfer.ts`.
- **Smallest shippable version.** One command that writes an encrypted archive of `openbot.db` and
  the attachment folders to a user-chosen path, plus a check that reads the archive manifest back.
  Restore stays manual and documented in v1.
- **Effort.** S to M. The transfer service already builds a manifest.
- **Trust boundary.** Risk: an export is the easiest way to leak every secret on the machine.
  Constraint: the archive is encrypted with a user passphrase, the export path runs the redaction
  rules from `@whilo/logging`, and the file lands only where the user picked it, through the existing
  main-process file permission checks.

### 10. Desktop reporting for the analytics that already exist

**One sentence.** `docs/architecture/analytics.md`, `src/main/analytics-inventory.ts` and a phone
analytics feature exist, but the desktop renderer has no analytics surface, so a team cannot see what
its agents did.

- **Commercial why.** Expansion. The report that proves value is what renews a seat, and the strategy
  asks for a measurable ROI. Today the same data leaves for the vendor console only.
- **Files it would touch.** `src/main/analytics.ts`, `src/main/analytics-inventory.ts`,
  `src/main/analytics-effects.ts`, `src/renderer/src/features/usage/AgentUsagePanel.tsx`,
  `src/renderer/src/features/usage/usage-context.tsx`, new
  `src/renderer/src/features/analytics/`, `src/main/team-api/route-*` (one read route),
  `apps/mobile/src/features/analytics/`.
- **Smallest shippable version.** One read-only panel: runs per agent, approvals per agent, failed
  runs, and spend per provider, for the last 30 days, from the local database only.
- **Effort.** S. The inventory and the usage panel are the hard parts, and they are done.
- **Trust boundary.** Risk: an aggregate view crosses agent access boundaries in a team. Constraint:
  the panel reads through the same per-agent access filter as the agent list
  (`src/main/team-api/route-agent-access.ts`), and it sends nothing off the machine.

## 3. The two vision features: the real blocker in this codebase

These are inferences from the file surface. Each is marked `INFERIDO`.

### 3.1 Agent-owned inbox

- **What exists.** Nothing for mail. `grep` for `imap` and `smtp` across `src/**/*.ts` returns no
  file. The word "inbox" appears only in projection and preview fixtures
  (`src/renderer/src/app-message-projection.ts`, `src/renderer/src/preview/fixtures.ts`) and in
  catalog text. The closest working subsystems are the sealed credential stores
  (`src/main/messaging-credential-store.ts`, `src/main/onepassword-connector-store.ts`), the routine
  engine (`src/backend/agent-routine-store.ts`, `src/main/routine-wake.ts`), and the Team API route
  pattern (`src/main/team-api/route-channels.ts`).
- **Real blocker.** `INFERIDO` — the blocker is not the model. It is the missing inbound data plane:
  a synchronisation loop that survives the app being closed, a local store for message bodies that
  respect the product constraint (data stays on the computer that runs Whilo), and a send path that
  is safe enough to enable. The routine engine can run a reply loop today, and the credential store
  can hold an app password. The unsatisfied requirement is the durability of the sync and the
  decision of which provider to trust: the strategy document still lists the provider for
  `whilo.bot@onerall.com` as an open decision (Mailgun, Resend, Postmark).
- **Second blocker.** `INFERIDO` — "the inbox replies by itself" needs the approval substrate of gap
  1. Without per-recipient and per-domain rules, every draft is a manual approval, and the retention
  loop stops.
- **Constraint that must hold.** `AGENTS.md` allows an encrypted read-only copy on a signed-in phone
  only for agents, sections and recent chats. Mail bodies are not in that list. Either the list
  changes by an explicit developer decision, or the phone shows a summary that the host renders.

### 3.2 Agent purchases with phone approval

- **What exists.** More than half. `src/main/link-account-service.ts` signs in to Link (link.com by
  Stripe), stores the account, creates spend requests, detects `pending_approval`, and calls
  `POST /spend_requests/{id}/request_approval` to get an `approval_link`. The renderer store and a
  preview mock exist (`src/renderer/src/features/vault/stores/link-account-store.ts`,
  `src/renderer/src/preview/mock-link-account.ts`). Push works for both phone platforms
  (`src/main/push-notifications.ts`, `apps/mobile/src/features/push-notifications/`), and the phone
  can answer approvals (`apps/mobile/src/features/workspace/model/pending-approvals.ts`).
- **Real blocker.** `INFERIDO` — three separate gaps, in this order:
  1. **No tool, and no way to reach the wallet.** `src/backend/agent/tool-catalog.ts` has no
     purchase tool, and a grep for card or spend vocabulary in the agent tool folder returns nothing.
     The wallet is a vault feature, not an agent capability. `src/main/ipc/link-account-handlers.ts`
     confirms the narrowness: it exposes only `status`, `connect`, `cancel`, `disconnect`, and its
     own comment says "No endpoint takes a payload: the renderer cannot name a URL or a token". The
     spend logic in `src/main/link-account-service.ts` is therefore unreachable from any surface.
  2. **Approval happens in a browser.** The service returns `approval_link` and the flow opens Link's
     own page. A phone approval must arrive as an in-product request that the phone can answer, which
     means the spend request has to become a first-class pending approval in the runtime attention
     model (`packages/team-client/src/runtime-attention.ts`), not a URL.
  3. **No spend policy.** `src/main/approval-automation-store.ts` approves by agent, not by amount or
     merchant. A purchase tool without amount caps is a security incident waiting for a user who left
     Full access on.
- **Constraint that must hold.** The card value must never enter a model turn or a log. The existing
  secret handling (`@whilo/logging` redaction, `registerSecretValue`) and the trust boundary rules in
  `AGENTS.md` are the reason this is buildable at all; the new code must extend them, not bypass
  them.
- **Open product decision, not a blocker.** `docs/business/whilo-strategy.md` records that Link
  covers the USA and Canada, and that Brazil needs another provider. Marked as a decision for the
  product owner, not an engineering unknown.

## 4. Sequenced roadmap

The order makes each step cheaper than it would be alone.

### Wave 0 — foundations that never get cheaper (2 to 3 weeks of work, small items)

1. **Approval policy engine and approval audit** (gap 1). Nothing else in this list is safe before
   it. It touches `src/main/approval-automation-store.ts`, `src/main/server-audit-store.ts`, and
   `src/backend/agent/tool-operation.ts` only.
2. **Served plugin catalog and link fix** (gaps 4 and 7, the link part). Cheapest distribution win.
   It creates the JSON decode path that every later remote-content feature reuses.
3. **Backup and restore** (gap 9). It removes the worst failure mode before more users depend on
   local data.

### Wave 1 — the money loop (4 to 6 weeks)

4. **Purchase tool with amount cap, approved on the desktop** (gap 2, first half). One tool, one card,
   one audit entry. The Link service already returns what is needed.
5. **Phone approval for the same request** (gap 2, second half). Reuse
   `apps/mobile/src/features/chat/components/chat-approval-card.tsx` and the existing push path. This
   is the first feature that is better on the phone than on the desktop, which is the reason to
   install the phone app.

### Wave 2 — the daily surface (8 to 12 weeks)

6. **Attention queue across hosts** (gap 5). It is the screen that the purchase approvals and later
   the inbox both land in.
7. **Inbox, read-only** (gap 3, first half). One provider, one folder, headers only, one search tool,
   one triage skill. No sending.
8. **Inbox send with policy** (gap 3, second half). Only after wave 0 item 1 and wave 2 item 6 exist.

### Wave 3 — distribution and depth

9. **Google connector** (gap 6). It shortens activation to one sign-in.
10. **Skill and bundle publishing** (gap 8). It turns the catalog into a marketplace rather than a
    list.
11. **Analytics panel on the desktop** (gap 10). It is the renewal argument, and it is small because
    the data already exists.

### Prerequisites for App Store and Play Store review

These are inferred from the platform rules and from what the code already contains. `INFERIDO` where
a store rule is the reason.

- **Working canonical URLs for every advertised link.** Gap 7. Store review opens the links in the
  listing and in the app. `docs/plugin-distribution.md` records that `https://whilo.app/plugins/<slug>`
  does not exist; the canonical site is `https://openbot.run`
  (`packages/contracts/src/invite-links.ts`).
- **In-app purchase rules for anything sold to the phone user.** `src/main/billing-service.ts` and
  `src/main/license-service.ts` sell through a web portal. A purchase that a phone approves is a
  financial transaction with a review consequence: the store must see that the phone only approves a
  request the host created, and that the store's own payment rules are respected. `INFERIDO`.
- **Account deletion and data export.** `src/main/account-service-platform.ts` and
  `src/main/instance-transfer-service.ts` are the parts to extend; gap 9 gives the export half.
  `INFERIDO`.
- **Permission explanations before the system prompt.** `src/renderer/src/features/computer-use/ComputerUsePermissionHelp.tsx`
  and `src/main/computer-use-permission-help-window.ts` already do this for Computer Use. The same
  pattern is required for mail and for money. `INFERIDO`.
- **Privacy disclosure that matches the constraint in `AGENTS.md`.** The rule that content stays on
  the host and Cloudflare holds only accounts and memberships has to appear in the store listing, and
  any new data plane (gap 3, gap 6) changes the disclosure.
- **No store-visible dead feature.** A tab that installs plugins from a catalog the reviewer cannot
  reach is a rejection risk. Gap 4 closes it.

## 5. What I did not verify

- Whether the desktop renderer has an analytics screen outside `features/usage/`. `A CONFIRMAR`.
  A grep found no `analytics` IPC group in `src/main/ipc/`, so a desktop analytics read route does
  not exist yet; a reporting screen built inside `features/usage/` was not ruled out.
- The real platform coverage of Computer Use. `src/main/cua-driver-runtime.ts` has a `win32` socket
  branch and `src/main/linux-gpu-mode.ts` exists, so more than macOS is supported, but only macOS
  permission helpers are named. `A CONFIRMAR`.
- Whether `src/main/skill-marketplace-service.ts` reaches a remote catalog over the network. The
  import list is `node:fs`, `node:crypto` and contracts; the network client is `A CONFIRMAR`.
- Whether the phone can already answer an approval that needs a file or a browser takeover, beyond a
  yes or no. `A CONFIRMAR`.
- Whether any shipped installer makes a database backup. `AGENTS.md` says no backup is made; the
  installer code was not read. Treat the statement as authoritative.
- Any market size, price, conversion, or revenue figure. None is measured here, and none should be
  quoted from this document.
