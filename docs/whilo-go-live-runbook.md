# Whilo — Runbook de Go-Live (operador)

> **Data de consolidação:** 2026-11-08 (verificações locais/remotas pontuais nesta sessão).  
> **Escopo:** documento operacional factual, **PT-BR**, **sem segredos**. **Nenhum deploy executado** por este agente.  
> **Regra:** itens marcados **[verificado]** têm evidência citada (código, comando, curl ou arquivo). Itens **[não verificado / depende do operador]** exigem ação ou confirmação fora do alcance deste relatório.

## 1) Definições: Pets vs Dots

| Conceito | Definição (evidência no código) |
|---|---|
| **Whilo Pets** | Agentes **persistentes** com papel/memória/política aprovados; o Pet “dono” da missão. Bots são especialistas **efêmeros/delegados** por tarefa (limitados, não sobrevivem à tarefa). Evidência: `packages/whilo-swas-core/AGENTS-swas.md` (“Keep Pets persistent and accountable; Bots are bounded specialists…”); `packages/whilo-swas-core/web/enterprise.js` (modos `Whilo Pets`/`Whilo Dots`, `petsPage()`: “Persistent agents…”; marketplace/mercado: “Industry specialist Pets…”, “Pets own outcomes”). **[verificado no código-fonte]** |
| **Whilo Dots** | “A Dot is a bot that runs on its own machine, bought per month. Whilo provisions it and your client reaches it over a signed ticket — no IP, no port, no password to keep.” Evidência: `packages/whilo-swas-core/web/enterprise.js` (`dotsPage()`). A UI mantém estado honesto: não declara Dot provisionado/ready só por status de hosting indisponível; **Dot só reporta ready após a máquina estar de fato rodando**. **[definição/UI verificada no código; provisionamento/ready fim-a-fim ao vivo não verificado]** |

## 2) Verificado agora (com evidência)

| Item | Evidência | Observação |
|---|---|---|
| **Gates 17/17 (whilo-swas-core shared)** | `cd /home/ryantheirreal/openbot && bun test packages/whilo-swas-core/shared/executor.test.cjs packages/whilo-swas-core/shared/agent-core.test.cjs` → **17 pass / 0 fail** (2 arquivos) **[verificado 2026-11-08]**. | Cobertura parcial do monorepo; não substitui suíte completa/CI. |
| **`node --check` chave (`enterprise.js`)** | `node --check packages/whilo-swas-core/web/enterprise.js` → exit 0 (`enterprise.js:OK`) **[verificado 2026-11-08]**. | Caminho real: `packages/whilo-swas-core/web/enterprise.js`. |
| **Migrações D1 presentes (0047–0050)** | `apps/auth-api/migrations/` contém `0047_company_sign_in.sql`, `0047_oauth_sign_in.sql`, `0048_server_site_limits.sql`, `0049_user_chat_color.sql`, `0050_hosted_server_start_requested_at.sql` **[verificado no repo]**. | **Aplicação remota em D1 produção/teste não verificada** nesta sessão (requer `wrangler d1 migrations apply DB --remote` conforme pipeline aprovado). |
| **Health/live 200 (whilo, api, signal)** | `curl` → `https://whilo.onerall.com/` **200**, `https://api.whilo.onerall.com/health/live` **200** (`{"service":"whilo-auth-api","status":"ok"}`), `https://signal.whilo.onerall.com/health/live` **200** (`{"service":"whilo-remote-api","status":"live",...}`) **[verificado 2026-11-08]**. Também observados anteriormente: `/.well-known/jwks.json` 200; `/v1/auth/oauth/status` 200 com `{"google":false,"github":false}` (providers off no estado observado). | Prova disponibilidade desses endpoints no momento; **não prova** que produção reflita o working tree/HEAD local. |
| **Hardening de código (hosting) presente** | `apps/auth-api/src/server/hosted-server-service.ts` e `request-auth.ts`: respostas/erros `hosting_unavailable` (fail-closed) em caminhos de indisponibilidade; transições/checagens condicionadas a `observed_state='running'`/`desired_state` (ex.: reconciles, heartbeats, leases, create pós-pagamento só com `awaiting_payment`+`desired_state='running'`); tratamento de webhook/evento `sandbox.hydrated` presente (`payload.type === "sandbox.hydrated"`) **[verificado por inspeção de código]**. | “No ready before `observed_state=running`”: a lógica de servidor hospedado usa `observed_state`/gates; confirmar contrato de UI/cliente “ready” no fluxo Dots real. |
| **URLs boat/setup/webhook alinhadas a `api.whilo.onerall.com`** | `docs/whilo-boat-webhook-url.md`: webhook Boat = `https://api.whilo.onerall.com/v2/hosting/boat/webhook`, eventos `sandbox.ready,error,archived,hydrated`; `setup-account-server.ts` corrigido para produção em `https://api.whilo.onerall.com`. `scripts/hosting/setup-account-server.ts` e `package.json` (`hosting:setup`) presentes **[verificado]**. | Registro real do webhook + signing secret é ação do operador. |
| **Script de reinjeção PWA** | `scripts/web/reinject-pwa-tags.mjs` existe (Node stdlib, idempotente; injeta manifest/theme/favicons/apple-touch-icon + registro `./sw.js` se ausente); `node --check` OK **[verificado 2026-11-08]**. `docs/whilo-production-builds.md` documenta uso. | Aplicar apenas a artefato estático com `index.html` confirmado (ver ressalva SSR). |
| **Script de registro de segredos (Worker)** | `scripts/hosting/register-whilo-worker-secrets.sh` existe; lê valores **exportados no shell** (nunca imprime), usa `wrangler secret put` para nomes em `secrets.required`, trata vars separadamente, suporta `--env`/`--only`; avisa que `BOAT_WEBHOOK_SECRET` deve ser o signing secret real do webhook `https://api.whilo.onerall.com/v2/hosting/boat/webhook` **[verificado]**. | Não executado com segredos. |
| **Persistência/storage (infra declarada)** | `apps/auth-api/wrangler.jsonc` declara binding D1 `DB` (`whilo-auth`, `migrations_dir: migrations`) e, em `env` preview/test, buckets R2 (`AVATARS/SKILLS/SITES`); produção usa serviços/rotas/ratelimits conforme config **[verificado no arquivo]**. | Estado efetivo de bindings/dados em produção **não verificado** remotamente. |
| **Enterprise nav** | `packages/whilo-swas-core/web/enterprise.js` contém navegação enterprise renderizada no painel (marcadores `__whiloEnterpriseNavLoaded`, “First-party enterprise navigation…” ) **[verificado]**. | Validação visual/UX em build/deploy real não executada. |
| **Config OAuth/hosting observada (sem segredos)** | `apps/auth-api/wrangler.jsonc` (produção): `GOOGLE_OAUTH_CLIENT_ID`/`GITHUB_OAUTH_CLIENT_ID` vazios; callbacks documentados nos comentários (`https://api.whilo.onerall.com/v1/auth/oauth/{google,github}/callback`); `HOSTED_SERVERS_ENABLED=true`, `HOSTED_SERVERS_ALLOWED_USER_IDS="*"`; `secrets.required` inclui `BOAT_API_KEY`, `BOAT_WEBHOOK_SECRET`, `HOSTED_SERVER_TEMPLATE`, `STRIPE_*`, etc. **[verificado]**. `/v1/auth/oauth/status` observado como `google:false,github:false`. | Consistente com providers off até configurar IDs/segredos. |

## 3) Exatamente o que **NÃO** está live até o operador agir

1. **Definir segredos remotos do Worker (produção, e `--env test` se aplicável)** — nomes exatos (sem valores):
   - `BOAT_API_KEY`
   - `BOAT_WEBHOOK_SECRET` = **segredo real de assinatura do webhook Boat** registrado para `https://api.whilo.onerall.com/v2/hosting/boat/webhook`, eventos `sandbox.ready,error,archived,hydrated` (copiado **uma única vez** na criação/rotação do webhook; placeholder local **não** é válido a menos que registrado na Boat). Ref.: `docs/whilo-boat-webhook-url.md`, `docs/whilo-boat-credentials.md`.
   - `HOSTED_SERVER_TEMPLATE`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - OAuth (quando habilitar web sign-in): `GOOGLE_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_CLIENT_SECRET` e **IDs + callbacks** corretos (`GOOGLE_OAUTH_CLIENT_ID`/`GITHUB_OAUTH_CLIENT_ID` em `vars` ou config conforme fluxo; callbacks acima). Ref.: comentários em `apps/auth-api/wrangler.jsonc`, `docs/whilo-production-readiness.md`.
2. **Rebuild do client da auth-api (PWA, `dist/client`)** a partir de uma revisão limpa, para eliminar artefatos stale vs `apps/auth-api/public/` (ex.: ícones). **[não executado]**
3. **Build + deploy da API** a partir de `apps/auth-api/dist/server` com `--keep-vars` (preservar vars/segredos gerenciados), aplicando migrações D1 remotas conforme pipeline aprovado e sem alterar CORS/invite-links sem necessidade. **[não executado]**
4. **Web export + reinjeção PWA + deploy**: `apps/mobile` `bunx expo export --platform web` (validar saída real), depois `node scripts/web/reinject-pwa-tags.mjs <index.html-gerado>` (idempotente) e deploy do alvo correto. **Ressalva factual:** `apps/auth-api/dist/client` observado pode ser SSR/TanStack Start (sem `index.html` estático) — **não aplicar reinjeção cegamente ao artefato SSR**; confirmar alvo (`docs/whilo-production-builds.md`). **[não executado]**
5. **Verificações pós-deploy**: curls health/JWKS/OAuth status/Signal; fluxo **Dots** apenas com provisionamento real (UI só “ready” com máquina rodando); **QR/Mobile Connect** real com host publicado + conta + Signal (`docs/whilo-pairing.md`).
6. **Runners + assinatura/distribuição** (ambiente): desktop/mobile exigem runners e credenciais — Apple (certs/provisioning/App Store Connect/EAS, notarização), Microsoft/Windows (signing), Android (keystore/Play), macOS/Windows/iOS/Android CI toolchains. **[bloqueio ambiental]**
7. **DNS/TURN**: TURN funcional e DNS conforme stack; sem TURN, P2P pode falhar atrás de NAT simétrico (STUN-only). `docs/whilo-pairing.md`, `agentic/secrets/DEPLOY-STATE.md` (histórico) tratam caveats. **[não verificado]**

## 4) Comandos exatos (sem valores)

> Execute a partir de `/home/ryantheirreal/openbot` salvo indicado. **Nunca** cole segredos em logs/histórico; use `read -rs`/stores aprovados. Ajuste `--env test` quando aplicável.

### 4.1 Registrar segredos do Worker (script / Wrangler / `hosting:setup`)
Refs: `scripts/hosting/register-whilo-worker-secrets.sh`, `docs/whilo-boat-webhook-url.md`, `docs/whilo-boat-credentials.md`, `docs/whilo-production-readiness.md`, `docs/whilo-production-builds.md`.

```bash
# Opção A — script do repo (lê valores EXPORTADOS no shell; nunca imprime)
cd /home/ryantheirreal/openbot
# exporte no shell (sem valores neste doc): BOAT_API_KEY BOAT_WEBHOOK_SECRET HOSTED_SERVER_TEMPLATE STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET
# opcionais: GOOGLE_OAUTH_CLIENT_SECRET GITHUB_OAUTH_CLIENT_SECRET
./scripts/hosting/register-whilo-worker-secrets.sh
# teste: ./scripts/hosting/register-whilo-worker-secrets.sh --env test
# subconjunto: ./scripts/hosting/register-whilo-worker-secrets.sh --only BOAT_API_KEY,BOAT_WEBHOOK_SECRET,HOSTED_SERVER_TEMPLATE
```

```bash
# Opção B — Wrangler direto (um por vez; valor via stdin)
cd /home/ryantheirreal/openbot/apps/auth-api
wrangler secret put BOAT_API_KEY --config wrangler.jsonc
wrangler secret put BOAT_WEBHOOK_SECRET --config wrangler.jsonc
wrangler secret put HOSTED_SERVER_TEMPLATE --config wrangler.jsonc
wrangler secret put STRIPE_SECRET_KEY --config wrangler.jsonc
wrangler secret put STRIPE_WEBHOOK_SECRET --config wrangler.jsonc
wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET --config wrangler.jsonc
wrangler secret put GITHUB_OAUTH_CLIENT_SECRET --config wrangler.jsonc
# teste: adicionar --env test
```

```bash
# Opção C — hosting:setup (Stripe + boat webhook + store; requer gh/env conforme alvo)
cd /home/ryantheirreal/openbot
read -rs STRIPE_SECRET_KEY && echo && read -rs BOAT_API_KEY && echo
export STRIPE_SECRET_KEY BOAT_API_KEY
bun run hosting:setup --target=production
# teste: bun run hosting:setup --target=test (ver docs/credenciais)
```

### 4.2 Build + deploy API (`apps/auth-api/dist/server`, `--keep-vars`)
Refs: `apps/auth-api/package.json`, `apps/auth-api/wrangler.jsonc`, `scripts/deploy-auth-api.ts`, `docs/whilo-production-readiness.md`.

```bash
cd /home/ryantheirreal/openbot
bun run api:build

# Migrações D1 remotas (pipeline aprovado; não executar sem validação do operador)
cd /home/ryantheirreal/openbot/apps/auth-api
../../node_modules/.bin/wrangler d1 migrations apply DB --remote

# Deploy Worker a partir do dist/server, preservando vars/segredos
../../node_modules/.bin/wrangler deploy --config dist/server/wrangler.json --keep-vars
# teste: adicionar --env test conforme wrangler/env
# pipeline completo (requer env/segredos): bun run api:deploy
```

### 4.3 Rebuild `apps/auth-api/dist/client` (PWA/ícones)
```bash
cd /home/ryantheirreal/openbot
bun run api:build
ls -l apps/auth-api/dist/client | head
# comparar com apps/auth-api/public/ antes do deploy
```

### 4.4 Web export + reinjeção PWA + deploy (alvo estático confirmado)
Refs: `docs/whilo-production-builds.md`, `scripts/web/reinject-pwa-tags.mjs`, `apps/mobile` (Expo).

```bash
cd /home/ryantheirreal/openbot/apps/mobile
bunx expo export --platform web

# Reinjeta tags PWA/SW no index.html estático gerado (idempotente)
cd /home/ryantheirreal/openbot
node scripts/web/reinject-pwa-tags.mjs <caminho/para/index.html-gerado>
# conferir: node --check scripts/web/reinject-pwa-tags.mjs
# publicar o artefato conforme pipeline do alvo (confirmar que não é SSR sem index.html estático)
```

### 4.5 Verificações (curls, OAuth status, gates locais)
Refs: `docs/whilo-pairing.md`, `docs/whilo-production-readiness.md`.

```bash
curl -fsS https://whilo.onerall.com/ -o /dev/null -w "whilo=%{http_code}\n"
curl -fsS https://api.whilo.onerall.com/health/live
curl -fsS https://api.whilo.onerall.com/.well-known/jwks.json | head -c 200; echo
curl -fsS https://api.whilo.onerall.com/v1/auth/oauth/status
curl -fsS https://signal.whilo.onerall.com/health/live

# Gates locais (parcial, verificado)
cd /home/ryantheirreal/openbot
node --check packages/whilo-swas-core/web/enterprise.js
bun test packages/whilo-swas-core/shared/executor.test.cjs packages/whilo-swas-core/shared/agent-core.test.cjs
# QR/Mobile Connect e Dots: validar manualmente com host publicado + provisionamento real (docs/whilo-pairing.md)
```

## 5) Operação contínua e rename final

- **Cron 30/30 “marcha contínua”:** **relatado como existente e com auto-expiração em 7 dias** (estado operacional informado; **ID/detalhes do agendador não verificáveis no repositório por este agente**). Confirmar no sistema de agendamento que registrou o job e renovar/ajustar antes da expiração, se necessário.
- **Rename de diretório:** renomear `/home/ryantheirreal/openbot` → `/home/ryantheirreal/Whilo-Production` **somente após** (a) produção implantada a partir de revisão **identificada/commitada e verificada** (não de working tree sujo), (b) verificações críticas passando ao vivo (health, auth/OAuth quando aplicável, webhooks Stripe/Boat com segredos reais, migrações D1 aplicadas, pairing/QR/Dots conforme escopo), e (c) **confirmação explícita registrada** autorizando o rename. Após o rename: atualizar paths absolutos/symlinks/serviços/CI local, revalidar `git`, rebuild/deploy a partir do novo path. Ref. de riscos/paths: `docs/whilo-production-readiness.md` (seção rename).

## 6) URLs e credenciais — referência rápida (2026-11)

> **Factual, sem segredos, sem deploy.** Distingue estado **code-ready** (rotas/contratos presentes no código/docs) de estado **live** (segredos remotos reais, webhooks registrados nos painéis e deploy/fluxo validados em produção). **Valores de segredo nunca são inventáveis**; registre apenas via canais aprovados (`wrangler secret put`, store/pipeline autorizado).

| Integração | URL / eventos (produção) | Segredo/credencial (nome) — **sem valor** | Estado / ação do operador |
|---|---|---|---|
| **Stripe webhook** | `https://api.whilo.onerall.com/v1/stripe/webhook` (handler: `apps/auth-api/src/routes/v1/stripe/webhook.ts`; registrado por `scripts/hosting/setup-account-server.ts` com eventos `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`) | `STRIPE_WEBHOOK_SECRET` (assinatura Stripe); faturamento também requer `STRIPE_SECRET_KEY` (`wrangler.jsonc` `secrets.required`) | **Code-ready.** Não live até registrar o endpoint no Stripe com os eventos corretos, definir `STRIPE_*` no Worker remoto e validar recebimento/assinatura após deploy. |
| **Boat webhook** | `https://api.whilo.onerall.com/v2/hosting/boat/webhook` — eventos `sandbox.ready`, `sandbox.error`, `sandbox.archived`, `sandbox.hydrated` | `BOAT_WEBHOOK_SECRET` = **signing secret real** do webhook registrado na boat.dev (exibido **uma única vez** na criação/rotação; placeholder local **não** é válido a menos que registrado na Boat). Hosting boat também requer `BOAT_API_KEY`. | **Code-ready.** Não live até criar/rotacionar webhook na boat para a URL/eventos exatos, copiar o signing secret real, definir `BOAT_API_KEY`/`BOAT_WEBHOOK_SECRET` remotos e confirmar entregas aceitas. Ref.: `docs/whilo-boat-webhook-url.md`, `docs/whilo-boat-credentials.md`. |
| **OAuth Google (callback)** | `https://api.whilo.onerall.com/v1/auth/oauth/google/callback` (start: `/v1/auth/oauth/google/start`; status: `/v1/auth/oauth/status`) | `GOOGLE_OAUTH_CLIENT_ID` (var, `wrangler.jsonc`) + `GOOGLE_OAUTH_CLIENT_SECRET` (segredo Worker). **O proprietário deve criar o OAuth client no Google Cloud Console** e registrar a callback exata; **IDs/segredos não são inventáveis**. | **Code-ready; provider off até configuração.** Produção observada com `GOOGLE_OAUTH_CLIENT_ID` vazio e `/v1/auth/oauth/status` sem provider ativo (evidência deste runbook). Configurar console + var/segredo, depois validar status/fluxo. Ref.: `docs/whilo-oauth-setup.md`. |
| **OAuth GitHub (callback)** | `https://api.whilo.onerall.com/v1/auth/oauth/github/callback` (start: `/v1/auth/oauth/github/start`; status: `/v1/auth/oauth/status`) | `GITHUB_OAUTH_CLIENT_ID` (var, `wrangler.jsonc`) + `GITHUB_OAUTH_CLIENT_SECRET` (segredo Worker). **O proprietário deve criar o OAuth App no GitHub** e registrar a callback exata; **IDs/segredos não são inventáveis**. | **Code-ready; provider off até configuração.** Produção observada com `GITHUB_OAUTH_CLIENT_ID` vazio (e provider inativo no status observado). Configurar console + var/segredo, depois validar status/fluxo. Ref.: `docs/whilo-oauth-setup.md`. |
| **Template de servidor hospedado** | n/a (nome de snapshot/template usado na criação do sandbox boat) | `HOSTED_SERVER_TEMPLATE` (segredo/valor gerenciado no Worker, `wrangler.jsonc` `secrets.required`) | Definido via **pipeline de build/release do template boat** (`scripts/hosting/build-boat-template.ts`, `scripts/hosting/release-boat-template.sh`; fluxo de release conforme `docs/hosted-servers.md`/`RELEASING.md`) ou manualmente com `wrangler secret put HOSTED_SERVER_TEMPLATE`. **Sem template + segredos boat/Stripe, provisionamento hospedado permanece indisponível.** |

### Evidência remota de segredos (produção, `wrangler secret list`, 2026-11-08)
Comando (sem expor valores): `cd /home/ryantheirreal/openbot/apps/auth-api && ../../node_modules/.bin/wrangler secret list --config wrangler.jsonc`. Resultado observado: apenas `EMAIL_SMTP_PASSWORD`, `REMOTE_AUTH_WEBHOOK_SECRET`, `REMOTE_TICKET_PRIVATE_JWK`, `REMOTE_TICKET_PUBLIC_JWKS`. **Ausentes no remoto (conforme essa evidência):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BOAT_API_KEY`, `BOAT_WEBHOOK_SECRET`, `HOSTED_SERVER_TEMPLATE` (e segredos OAuth não presentes). Portanto, **registro de segredos + deploy/release aplicável devem ocorrer antes de considerar Dots/hosting Stripe+Boat go-live**.

### Cross-links
- Credenciais/URLs consolidadas (se existir): `docs/whilo-all-credentials-and-urls.md` — **não encontrado no repositório em 2026-11-08**; usar como referência futura quando criado.
- Boat/webhook: `docs/whilo-boat-webhook-url.md`, `docs/whilo-boat-credentials.md`
- OAuth: `docs/whilo-oauth-setup.md`
- Setup/registro: `scripts/hosting/register-whilo-worker-secrets.sh`, `scripts/hosting/setup-account-server.ts`

## Referências (docs existentes)
- `docs/whilo-production-readiness.md`
- `docs/whilo-production-builds.md`
- `docs/whilo-boat-credentials.md`
- `docs/whilo-boat-webhook-url.md`
- `docs/whilo-oauth-setup.md`
- `docs/whilo-pairing.md`
- `docs/hosted-servers.md` / `docs/self-hosting.md` (contexto adicional)
- `agentic/secrets/DEPLOY-STATE.md` (estado operacional local, pode conter paths; **não copiar segredos**)
- Scripts: `scripts/hosting/register-whilo-worker-secrets.sh`, `scripts/hosting/setup-account-server.ts`, `scripts/web/reinject-pwa-tags.mjs`, `scripts/deploy-auth-api.ts`
