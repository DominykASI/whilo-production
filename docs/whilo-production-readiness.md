# Whilo — lacunas para “pronto para produção” (factual, PT-BR)

> **Gerado em:** 2026-11-08 (leitura do repositório local + verificações pontuais nesta sessão).  
> **Escopo:** relatório factual. **Nenhum deploy executado. Nenhum segredo lido/exposto.**  
> **Regra:** afirmações marcadas como **verificado** têm evidência citada; itens sem evidência direta são marcados como **não verificado / depende de ambiente**.

## (1) Pets vs Dots (definições confirmadas)

| Conceito | Definição confirmada no código (evidência) | Status |
|---|---|---|
| **Whilo Pets** | Agentes persistentes com papel/memória/política aprovados; o Pet “dono” da missão. Bots são especialistas efêmeros/delegados por tarefa (limitados, não sobrevivem à tarefa). Evidência: `packages/whilo-swas-core/AGENTS-swas.md:16` (“Keep Pets persistent and accountable; Bots are bounded specialists…”); UI/cópia em `packages/whilo-swas-core/web/enterprise.js` (ex.: modos `Whilo Pets`/`Whilo Dots` ~L693, `petsPage()` ~L2159: “Persistent agents…”; marketplace/market: “Industry specialist Pets…”, “Pets own outcomes”). | **Confirmado no código-fonte presente**. |
| **Whilo Dots** | “A Dot is a bot that runs on its own machine, bought per month. Whilo provisions it and your client reaches it over a signed ticket — no IP, no port, no password to keep.” Evidência: `packages/whilo-swas-core/web/enterprise.js` `dotsPage()` ~L2166-2171. A UI declara estado honesto quando máquina/provedor indisponível (“hosting status… does not claim the Dot is provisioned or ready. A Dot only reports ready after its machine is actually running”). | **Confirmado no código-fonte presente** (definição de produto/UI); **provisionamento real/ready fim-a-fim não verificado ao vivo**. |

## (2) O que está pronto/verificado (com evidência e distinção código vs deploy/live)

| Item | Evidência verificada | Classificação |
|---|---|---|
| Testes `whilo-swas-core` (shared) **17 pass / 0 fail** | Executado nesta sessão: `cd /home/ryantheirreal/openbot && bun test packages/whilo-swas-core/shared/executor.test.cjs packages/whilo-swas-core/shared/agent-core.test.cjs` → “Ran 17 tests across 2 files… 17 pass 0 fail”. Arquivos: `packages/whilo-swas-core/shared/executor.test.cjs` (6), `packages/whilo-swas-core/shared/agent-core.test.cjs` (11). | **Código testado localmente (verificado)**. Não substitui suíte completa do monorepo/CI. |
| `node --check` em `enterprise.js` (caminho real) | `node --check /home/ryantheirreal/openbot/packages/whilo-swas-core/web/enterprise.js` → exit `0`. Observação: `/home/ryantheirreal/openbot/agentic/secrets/enterprise.js` **não existe** (tentativa retornou `MODULE_NOT_FOUND`). | **Sintaxe OK no arquivo verificado (código)**. |
| Migrações D1 (auth-api) presentes no repo | `apps/auth-api/migrations/` contém `0001`–`0050` (incl. `0047_oauth_sign_in.sql`, `0047_company_sign_in.sql`, `0050_hosted_server_start_requested_at.sql`). | **Código/config de migração presente**. **Aplicação em D1 produção/teste não verificada** nesta sessão (depende de `wrangler d1 migrations apply` remoto/CI). |
| Health endpoints ao vivo (200) | `curl https://signal.whilo.onerall.com/health/live` → 200 `{"service":"whilo-remote-api","status":"live",...}`. `curl https://api.whilo.onerall.com/health/live` → 200 `{"service":"whilo-auth-api","status":"ok"}`. `curl https://api.whilo.onerall.com/.well-known/jwks.json` → 200 (JWKS retornada). `curl https://api.whilo.onerall.com/v1/auth/oauth/status` → 200 `{"google":false,"github":false}`. | **Verificado ao vivo** (apenas estes endpoints/estado; não prova deploy da revisão atual do working tree). |
| Estado de deploy Signal documentado | `agentic/secrets/DEPLOY-STATE.md` (2026-11-04): endereços permanentes `signal.whilo.onerall.com` (WS/health/webhook interno via relay Worker), fluxo `start-signal.sh`, verificações históricas documentadas. | **Documentado/historicamente verificado conforme doc**; working tree atual tem muitas mudanças não commitadas — **não garante** que produção reflita HEAD local. |
| Script de registro de segredos (Worker) presente | `scripts/hosting/register-whilo-worker-secrets.sh` existe; lê valores **exportados no shell** (nunca imprime), usa `wrangler secret put` para nomes em `secrets.required` e trata vars de config separadamente; suporta `--env`/`--only`; inclui aviso sobre `BOAT_WEBHOOK_SECRET` real. `node`/`bash` não executados com segredos aqui. | **Código pronto (script presente)**. **Execução/efeito em Cloudflare não verificado**. |
| `hosting:setup` / setup-boat alinhado ao stack `api.whilo.onerall.com` | `scripts/hosting/setup-account-server.ts` define produção `api: "https://api.whilo.onerall.com"` (L42) e grava segredos Stripe/boat via store/fluxo; cria webhook boat para `<api>/v2/hosting/boat/webhook`. Root `package.json` expõe `hosting:setup` → `bun scripts/hosting/setup-account-server.ts`. | **Código pronto**. **Não executado; segredos/recursos externos não verificados**. |
| Script PWA de reinjeção presente e válido (sintaxe) | `scripts/web/reinject-pwa-tags.mjs` existe (Node stdlib, idempotente). `node --check scripts/web/reinject-pwa-tags.mjs` → exit `0`. Script injeta manifest/theme-color/favicons/apple-touch-icon + registro `./sw.js` quando ausentes (ver doc `docs/whilo-production-builds.md`). | **Código pronto**. **Não executado contra artefato de export/deploy real**. |
| Docs criados/relevantes presentes | `docs/whilo-production-builds.md`, `docs/whilo-boat-credentials.md`, `docs/whilo-pairing.md`, `agentic/secrets/DEPLOY-STATE.md` verificados. | **Presente no repo**. |
| `apps/auth-api` build/deploy pipeline definido | `apps/auth-api/package.json` (`build`: Vite com `NODE_OPTIONS=--max-old-space-size=6144`), `scripts/deploy-auth-api.ts` (segredos/migrações/build/keep-previous-assets/relay+worker deploy com `--keep-vars`), CI deploy-production em `main` (referência em docs). | **Código/pipeline definido**. **Build/deploy não executados nesta sessão**. |

**Itens do pedido não plenamente verificáveis como “pronto/deployado”:** “hardening items merged in code” — há alterações extensas **não commitadas** (`git status` mostra dezenas de arquivos modificados; branch `whilo/consolidation`, commit recente `c1178acaa`). **Não é possível afirmar merge/estado de produção** a partir do working tree sujo. Tratar como **código alterado localmente, não validado em produção/CI por este relatório**.

## (3) Pendente/bloqueado por credencial ou ambiente (nomes exatos)

| Área | Bloqueio | Nomes exatos (config/segredos/vars) | Nota factual |
|---|---|---|---|
| **Stripe** | Chaves e webhook reais por ambiente | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (`wrangler.jsonc` `secrets.required` produção; usados por `deploy-auth-api.ts`/`hosting:setup`). Vars relacionadas em fluxos: preços/planos conforme bootstrap. | Sem chaves reais + webhook ativo, cobrança/portal/webhook não verificáveis. |
| **BOAT (hospedagem)** | API key + **signing secret real do webhook** + template | `BOAT_API_KEY`, `BOAT_WEBHOOK_SECRET` (**deve** corresponder ao webhook boat registrado para `https://api.whilo.onerall.com/v2/hosting/boat/webhook`; secret só é mostrado na criação/rotação — ver `docs/whilo-boat-credentials.md`), `HOSTED_SERVER_TEMPLATE`. Vars: `HOSTED_SERVERS_ENABLED`, `HOSTED_SERVERS_ALLOWED_USER_IDS` (produção atual `*` em `wrangler.jsonc`), `HOSTED_SERVERS_MAX_PER_ACCOUNT` (se aplicável). | Placeholder local **não** é signing secret da boat a menos que registrado explicitamente. |
| **OAuth Google/GitHub (web)** | Segredos/clients configurados + callbacks corretos | Vars (produção, `wrangler.jsonc`): `GOOGLE_OAUTH_CLIENT_ID` (atual `""` no arquivo lido), `GITHUB_OAUTH_CLIENT_ID` (atual `""`). Segredos: `GOOGLE_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_CLIENT_SECRET`. Callbacks documentados: `https://api.whilo.onerall.com/v1/auth/oauth/google/callback`, `https://api.whilo.onerall.com/v1/auth/oauth/github/callback`. | Live `/v1/auth/oauth/status` retornou `{"google":false,"github":false}` (verificado) — **providers efetivamente off** no estado observado. |
| **Vercel token (se usado)** | Token/integração de deploy Vercel | `VERCEL_TOKEN` / credenciais do projeto Vercel (nome exato depende do pipeline adotado) | **Não verificado** uso de Vercel no fluxo atual de deploy (auth-api/web principal usa Cloudflare Worker/Vite+wrangler; `api.whilo.onerall.com`). Incluir apenas se houver pipeline Vercel ativo. |
| **Apple** (mobile/mac distrib.) | Assinatura/notarização/TestFlight | Certificados/provisioning, App Store Connect API key, `EXPO_TOKEN` (EAS), segredos de signing/notarização CI (ex.: `CSC_*`, `APPLE_*` conforme release docs) | Builds/distribuição iOS requerem Apple Developer + credenciais; **não verificado**. |
| **Microsoft/Windows** (desktop distrib.) | Assinatura (Azure Artifact Signing/trust) | Credenciais de signing no pipeline (overlay `electron-builder.windows-signing.yml`), ambiente CI | `dist:win` local não assina; SmartScreen/confiança exigem assinatura — **não verificado**. |
| **Runners macOS/Windows/iOS/Android** | Hardware/ambiente CI | Runners GitHub/self-hosted com toolchains (Xcode+CocoaPods+Fastlane, Android SDK/JDK, Electron build deps), macOS para iOS/notarização | **Bloqueio ambiental**; máquina atual tem ~3,7 GB RAM (risco OOM para builds pesadas). |
| **DNS/TURN** | Registros/infra de mídia | `TURN_HOST` (DEPLOY-STATE indica `turn.invalid` na instância observada), DNS/zonas conforme stack, credenciais TURN/coturn | **Sem TURN funcional**, P2P pode falhar atrás de NAT simétrico (STUN-only). **Não verificado** configuração TURN/DNS de produção completa. |
| **Browser E2E** | Ambiente de execução estável + fixtures | Suites/scripts E2E do repo (ex.: refs em `scripts/`, auth-api/CI) com browser/headless, dados de teste, credenciais de teste | **Não executado** nesta sessão. |
| **QR/host pairing real** | Host desktop publicado + conta + Signal + app cliente | `WHILO_AUTH_API_URL`, `WHILO_REMOTE_SIGNAL_URL` (host), sessão de conta, Mobile Connect/QR (ver `docs/whilo-pairing.md`) | `mobile-connect`/QR e pareamento real **não verificados** (sem build/host em execução por este agente). |

## (4) Comandos exatos (registro de segredos, build+deploy, web/PWA, dist/client, verificação)

> Ajuste `--env` quando aplicar a ambiente `test`. **Não** cole segredos em logs/histórico; use `read -rs`/stores aprovados.

### 4.1 Registrar segredos (Wrangler / `hosting:setup` / script novo)

```bash
# Opção A — script novo (repo): registra segredos exportados no shell (nomes em secrets.required)
cd /home/ryantheirreal/openbot
export BOAT_API_KEY BOAT_WEBHOOK_SECRET HOSTED_SERVER_TEMPLATE STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET
# opcionais, se aplicável:
# export GOOGLE_OAUTH_CLIENT_SECRET GITHUB_OAUTH_CLIENT_SECRET
./scripts/hosting/register-whilo-worker-secrets.sh
# ambiente de teste:
# ./scripts/hosting/register-whilo-worker-secrets.sh --env test
# subconjunto:
# ./scripts/hosting/register-whilo-worker-secrets.sh --only BOAT_API_KEY,BOAT_WEBHOOK_SECRET,HOSTED_SERVER_TEMPLATE
```

```bash
# Opção B — Wrangler direto (um por vez; valor via stdin, nunca ecoar)
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
# Opção C — fluxo hosting:setup (Stripe + boat webhook + gravação no store; ver docs)
# Produção: requer gh autenticado no GitHub Environment cloudflare-production e chaves no shell.
cd /home/ryantheirreal/openbot
read -rs STRIPE_SECRET_KEY && echo && read -rs BOAT_API_KEY && echo
export STRIPE_SECRET_KEY BOAT_API_KEY
bun run hosting:setup --target=production
# teste (store .env.dev criptografado; requer DOTENV_PRIVATE_KEY_DEV):
# bun run hosting:setup --target=test
```

### 4.2 Build + deploy API (`dist/server` + `--keep-vars`)

```bash
cd /home/ryantheirreal/openbot
bun run api:build
# (produção, conforme CI) opcional/operacional: keep-previous-assets, migrações D1 remotas, deploy relay, deploy worker
cd /home/ryantheirreal/openbot/apps/auth-api
../../node_modules/.bin/wrangler d1 migrations apply DB --remote
../../node_modules/.bin/wrangler deploy --config dist/server/wrangler.json --keep-vars
# teste:
# ../../node_modules/.bin/wrangler deploy --config dist/server/wrangler.json --keep-vars --env test
# pipeline completo/scriptado: bun run api:deploy (usa scripts/deploy-auth-api.ts; requer env/segredos conforme script)
```

### 4.3 Web export + reinjeção PWA + deploy (factual, com ressalva de artefato)

```bash
# Mobile/Expo web export (fluxo esperado; validar saída/dist real — NÃO executado aqui)
cd /home/ryantheirreal/openbot/apps/mobile
bunx expo export --platform web

# Reinjeta tags PWA/SW no index.html estático gerado (idempotente)
cd /home/ryantheirreal/openbot
node scripts/web/reinject-pwa-tags.mjs <caminho/para/index.html-gerado>
# verificar sintaxe (feito nesta sessão): node --check scripts/web/reinject-pwa-tags.mjs
```

**Ressalva:** `apps/auth-api/dist/client` observado **não** contém `index.html` estático (SSR/TanStack Start). O deploy web principal do auth-api segue build+`wrangler deploy` do Worker (ver `docs/whilo-production-builds.md`, CI). **Não** aplicar reinjeção PWA cegamente ao artefato SSR sem confirmar o alvo.

### 4.4 Rebuild `apps/auth-api/dist/client` (ícones/artefatos stale)

Evidência de staleness observada: `apps/auth-api/dist/client/icon-192x192.png` (9826 bytes, 2026-11-06) vs `apps/auth-api/public/icon-192x192.png` (45445 bytes, 2026-11-07) — **dist/client desatualizado em relação a `public/` modificados no working tree**.

```bash
cd /home/ryantheirreal/openbot
bun run api:build
# conferir artefatos atualizados:
ls -l apps/auth-api/dist/client | head
# deploy do worker (dist/server) com --keep-vars após validar build:
# cd apps/auth-api && ../../node_modules/.bin/wrangler deploy --config dist/server/wrangler.json --keep-vars
```

### 4.5 Verificação (health/oauth-status, gates)

```bash
curl -fsS https://api.whilo.onerall.com/health/live
curl -fsS https://api.whilo.onerall.com/.well-known/jwks.json | head -c 200; echo
curl -fsS https://api.whilo.onerall.com/v1/auth/oauth/status
curl -fsS https://signal.whilo.onerall.com/health/live

# Gates/testes verificados localmente (parcial):
cd /home/ryantheirreal/openbot
node --check packages/whilo-swas-core/web/enterprise.js
bun test packages/whilo-swas-core/shared/executor.test.cjs packages/whilo-swas-core/shared/agent-core.test.cjs
# suíte completa/E2E/CI: executar conforme pipelines do repo (não executado aqui)
```

## (5) Rename final `/home/ryantheirreal/openbot` → `/home/ryantheirreal/Whilo-Production` (somente após produção + verificação + confirmação explícita registrada)

**Pré-condições obrigatórias (todas):** (a) produção implantada a partir de uma revisão **identificada/commitada** (não do working tree sujo atual), (b) verificações críticas passando ao vivo (health, auth/OAuth quando aplicável, webhooks Stripe/boat com secrets reais, migrações D1 aplicadas, pairing/QR se no escopo), (c) **confirmação explícita registrada** (ticket/issue/ata/log aprovado) autorizando o rename. **Não executar rename antes disso.**

### Referências a ajustar (lista factual para revisão; localizar antes do rename)

- **Paths absolutos** em scripts/docs/logs/estado local: `grep -RIn "/home/ryantheirreal/openbot" /home/ryantheirreal/openbot --exclude-dir=node_modules --exclude-dir=.git` (revisar resultados; muitos podem ser históricos ou gerados).
- **`agentic/secrets/*`**: paths absolutos em docs (`DEPLOY-STATE.md`, scripts como `start-signal.sh` podem conter caminhos absolutos), logs em `agentic/secrets/*.log`, PIDs/artefatos em `agentic/secrets/run/`.
- **CI/CD e ambientes**: workflows `.github/workflows/*`, GitHub Environments/secrets, caches que assumem caminho do checkout (normalmente relativos no runner, mas verificar self-hosted).
- **Config local de ferramentas**: symlinks, serviços systemd/launchd, cron, `pm2`, env files externos, IDE workspace settings, clones espelhados.
- **Documentação operacional** com comandos `cd /home/ryantheirreal/openbot` (`docs/*.md`, este relatório, guias).
- **Wrangler/CWD assumptions**: scripts que fazem `cd` para paths absolutos (raro, mas verificar `scripts/hosting/*`, deploy scripts).
- **Node/Electron caches/build outputs**: `node_modules`, `dist`, `out*`, `.vite` — podem conter paths embutidos; normalmente recriados após move + reinstall/build.

**Ação segura (após aprovação):** mover diretório, atualizar symlinks/serviços, revalidar `git -C <novo> status`, reexecutar builds/deploys a partir do novo path, e registrar a confirmação explícita + evidências de verificação.

## (6) Riscos conhecidos

1. **RAM ~3,7 GB / OOM:** builds pesadas (`api:build` já usa `NODE_OPTIONS=--max-old-space-size=6144` em `apps/auth-api`; desktop/mobile/export podem exceder memória). Risco de falha/OOM e builds concorrentes (`tsc` paralelos). Mitigar com 1 build por vez, `nohup`+logs, ajuste de heap onde viável, ou runner/máquina com mais RAM.
2. **`apps/auth-api/dist/client` stale vs `public/`:** evidência de ícones/artefatos defasados (timestamps/tamanhos diferentes). Deploy sem rebuild pode publicar assets antigos; rebuild necessário antes de deploy web/worker conforme pipeline.
3. **Branch com muitas mudanças não commitadas / estado ambíguo:** `git status` mostra dezenas de modificações em `whilo/consolidation` (commit recente `c1178acaa`). “Código pronto” local **não equivale** a revisão revisada/mergeada/deployada. Risco de drift entre working tree, CI e produção.
4. **Mobile/desktop builds exigem runners e assinatura:** iOS (Apple certs/provisioning/notarização/TestFlight), Android (keystore/Play/Firebase), Windows (signing), macOS (codesign/notarize) — dependem de runners/credenciais. Artefatos locais não assinados não são distribuíveis com confiança.
5. **NAT sem TURN:** `TURN_HOST=turn.invalid` documentado em `DEPLOY-STATE.md` (observação histórica da instância); sem TURN funcional, conexões P2P podem falhar atrás de NAT simétrico (STUN-only). Afeta confiabilidade de pairing/mídia remota conforme topologia.
6. **OAuth efetivamente off (estado live observado):** `/v1/auth/oauth/status` retornou `google:false,github:false`; IDs em `wrangler.jsonc` produção aparecem vazios no arquivo lido — login social web bloqueado até configurar clients/segredos/callbacks.
7. **BOAT webhook signing secret crítico:** `BOAT_WEBHOOK_SECRET` deve ser o segredo real da boat (criação/rotação mostra uma vez). Placeholder local inválido quebra verificação de webhooks → estado de hospedagem inconsistente.

---
**Arquivo:** `docs/whilo-production-readiness.md` (este relatório). **Principais lacunas:** credenciais/segredos reais (Stripe, BOAT key+webhook+template, OAuth), rebuild/deploy de uma revisão limpa e verificada, runners+assinaturas (Apple/MS/mobile/desktop), TURN/DNS, E2E e pairing real, e confirmação explícita antes do rename.
## Handoff operacional (sessão atual — snapshot seguro)

> **Data/hora (UTC):** 2026-11-08. **Branch:** `whilo/consolidation`. **Working tree:** sujo (1573 entradas em `git status --short`; NÃO commitar, NÃO stage cego, NÃO push). **Sem deploy. Sem segredos. Sem tocar CORS, invite-links ou migrações.**

### Gates re-executados (código local verificado)
- `node packages/whilo-swas-core/shared/agent-core.test.cjs` → **11 pass / 0 fail**.
- `node packages/whilo-swas-core/shared/executor.test.cjs` → **6 pass / 0 fail** (total **17/17**).
- `node --check packages/whilo-swas-core/web/enterprise.js scripts/web/reinject-pwa-tags.mjs` → **OK** (exit 0, sem saída).

### Próximos passos do operador (para BOAT/Stripe/OAuth live) — **SEM valores**
1. **Registrar segredos (Worker/Cloudflare)** — exporte valores **apenas no shell** (nunca em logs/commits) e execute um dos fluxos:
   - Script do repo: `./scripts/hosting/register-whilo-worker-secrets.sh` (suporta `--env test` / `--only ...`). Referência de nomes/boas práticas: `agentic/secrets/WHILO-SET-BOAT-SECRETS.md`.
   - Wrangler direto (um por vez, stdin): `wrangler secret put <NOME> --config apps/auth-api/wrangler.jsonc` (ex.: `BOAT_API_KEY`, `BOAT_WEBHOOK_SECRET` — segredo real do webhook boat para `https://api.whilo.onerall.com/v2/hosting/boat/webhook`, `HOSTED_SERVER_TEMPLATE`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_CLIENT_SECRET` conforme aplicável; `--env test` quando for teste).
2. **Build + deploy da API** (a partir de `apps/auth-api/dist/server`, mantendo vars existentes): `cd /home/ryantheirreal/openbot && bun run api:build` e então `cd apps/auth-api && ../../node_modules/.bin/wrangler deploy --config dist/server/wrangler.json --keep-vars` (ajustar `--env`/migrações remotas D1 conforme pipeline aprovado; **não executar migrações/invite-links/CORS aqui**).
3. **Rebuild do client dist (ícones PWA)** para corrigir artefatos stale: `cd /home/ryantheirreal/openbot && bun run api:build` e conferir `apps/auth-api/dist/client` vs `apps/auth-api/public/` (ícones atualizados no working tree).
4. **Web export + reinjeção PWA + deploy** (confirmar o alvo/artefato real antes): `cd apps/mobile && bunx expo export --platform web`; depois `node scripts/web/reinject-pwa-tags.mjs <index.html-gerado>` (idempotente) e publicar conforme o pipeline do alvo. **Ressalva:** `apps/auth-api/dist/client` atual é SSR/TanStack Start (sem `index.html` estático) — não aplicar reinjeção cegamente ao SSR.
5. **Verificação pós-deploy (curls e Dots):**
   - `curl -fsS https://api.whilo.onerall.com/health/live`
   - `curl -fsS https://api.whilo.onerall.com/.well-known/jwks.json | head -c 200; echo`
   - `curl -fsS https://api.whilo.onerall.com/v1/auth/oauth/status` (confirmar providers quando segredos/callbacks estiverem configurados)
   - `curl -fsS https://signal.whilo.onerall.com/health/live`
   - **Whilo Dots:** validar apenas após provisionamento real — a UI só deve reportar “ready” quando a máquina estiver de fato rodando; não assumir ready por status/hosting indisponível.

### Cron “marcha contínua”
- **Cron 30/30 recorrente criado nesta sessão, auto-expira em 7 dias.** (ID não recuperável neste contexto; confirmar no agendador/sistema que registrou o job.)
