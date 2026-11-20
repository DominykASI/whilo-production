# Whilo — credenciais, URLs e registro (consolidado factual)

**Documento gerado para:** `/home/ryantheirreal/openbot/docs/whilo-all-credentials-and-urls.md`  
**Idioma:** PT-BR. **Factual, baseado no código/config/docs do repositório.**  
**Sem valores de segredo. Sem IDs inventados.** Não cole segredos em chat ou Git.

**Contexto operacional (estado observado anteriormente, conforme solicitado):** `GET /v1/auth/oauth/status` retornou `{"google":false,"github":false}`. Os *dots*/hospedagem dependem de Stripe, Boat, template + segredos + deploy corretos.

---

## 1. Stripe — webhook (URL para o Stripe Dashboard → Developers → Webhooks → endpoint)

| Item | Valor exato |
|---|---|
| **URL do endpoint** | `https://api.whilo.onerall.com/v1/stripe/webhook` |

**Evidência no código:**
- `apps/auth-api/src/routes/v1/stripe/webhook.ts`: rota `createFileRoute("/v1/stripe/webhook")` (handler `POST`). A assinatura cobre os bytes exatos do corpo (`Stripe-Signature`); o serviço de billing processa o evento.
- `scripts/hosting/setup-account-server.ts`: `webhookUrl: \`${api}/v1/stripe/webhook\`` (bootstrap Stripe). Target de produção corrigido para `https://api.whilo.onerall.com` (`TARGETS.production.api`).

**Segredo de assinatura (Stripe):**
- O **signing secret** é mostrado **uma única vez** pelo Stripe ao criar o endpoint (ou ao rotacionar). **Não é possível recuperar depois pelo mesmo caminho.**
- Salve como segredo do Worker: **`STRIPE_WEBHOOK_SECRET`** (nunca imprimir/exibir).
- `hosting:setup --target=production` pode fazer bootstrap de webhooks/catálogo do Stripe **quando as chaves são fornecidas de forma segura** (conforme o script: chaves vêm do shell; produção grava no store/GitHub Environment; sem histórico). Veja seção 6.

**Registro do segredo no Worker (produção):** `wrangler secret put STRIPE_WEBHOOK_SECRET --config apps/auth-api/wrangler.jsonc` (interativo; não ecoar valor).

---

## 2. Boat — webhook (URL para colocar na boat.dev)

| Item | Valor exato |
|---|---|
| **URL do webhook** | `https://api.whilo.onerall.com/v2/hosting/boat/webhook` |
| **Eventos** | `sandbox.ready,sandbox.error,sandbox.archived,sandbox.hydrated` |

**Evidência no código:**
- `scripts/hosting/setup-account-server.ts`: `BOAT_EVENTS = ["sandbox.ready","sandbox.error","sandbox.archived","sandbox.hydrated"]`; `ensureBoatWebhook(...)` cria/atualiza o webhook para `${api}/v2/hosting/boat/webhook` com esses eventos e retorna/rotaciona o segredo quando aplicável.
- `apps/auth-api/src/routes/v2/hosting/boat/webhook.ts`: rota `createFileRoute("/v2/hosting/boat/webhook")` (`POST`). A assinatura cobre o corpo bruto; lê `X-Ascii-Delivery`, `X-Ascii-Timestamp`, `X-Ascii-Signature` e passa para `hostedServerService.handleWebhook(...)`.
- `docs/whilo-boat-credentials.md` / `docs/hosted-servers.md`: reforçam URL, eventos e verificação HMAC.

**Segredo de assinatura (Boat):**
- O **signing secret** é mostrado **uma única vez** pela boat ao criar/rotacionar o webhook. Copie no momento da criação/rotação.
- Salve como segredo do Worker: **`BOAT_WEBHOOK_SECRET`** (deve ser o **segredo real** de assinatura da boat para esse webhook).
- **Aviso factual:** um placeholder local em `agentic/secrets/generated-secrets.whilo.values.local.json` (se existir) **NÃO** é válido como segredo de assinatura da boat, **a menos que o mesmo valor tenha sido registrado explicitamente na boat** (citado também em `docs/whilo-boat-credentials.md`).

**Registro do segredo no Worker (produção):** `wrangler secret put BOAT_WEBHOOK_SECRET --config apps/auth-api/wrangler.jsonc` (interativo).

---

## 3. Google OAuth — o que criar/colocar

| Item | Valor exato |
|---|---|
| **Authorized redirect URI** | `https://api.whilo.onerall.com/v1/auth/oauth/google/callback` |

**Onde configurar (Google Cloud Console):**
- Criar um **OAuth 2.0 Client** do tipo **Web application**.
- Registrar a **Authorized redirect URI** exatamente como acima (Google compara com a URI registrada).

**No Worker (Whilo):**
- **Var/ID (público):** `GOOGLE_OAUTH_CLIENT_ID` — var em `apps/auth-api/wrangler.jsonc` (produção). **Observado no config de produção atual:** valor vazio (`""`) com comentário indicando que provider sem ID/secret fica desabilitado (`/v1/auth/oauth/status` retorna `false` para ele; `/start` retorna `503 oauth_not_configured`).
- **Secret:** `GOOGLE_OAUTH_CLIENT_SECRET` — registrar via `wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET --config apps/auth-api/wrangler.jsonc` (produção). Para teste: `wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET --config apps/auth-api/wrangler.jsonc --env test` (conforme comentários em `wrangler.jsonc`).

**Origem dos valores (obrigatório, sem inventar):**
- **O Client ID e o Client Secret são gerados pelo Google.** Eu não posso inventá-los. O owner copia do console e registra (sem colar em chat/Git).

**Evidência no código:**
- `apps/auth-api/src/server/google-oauth.ts`: `CALLBACK_PATH = "/v1/auth/oauth/google/callback"`; `redirectUri(requestUrl)` = `new URL(CALLBACK_PATH, requestUrl)`; lê `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`; fluxo authorization-code + PKCE; `/start` depende de `configured`.
- Rotas: `apps/auth-api/src/routes/v1/auth/oauth/google/start.ts`, `apps/auth-api/src/routes/v1/auth/oauth/google/callback.ts`, `apps/auth-api/src/routes/v1/auth/oauth/status.ts`.
- `apps/auth-api/src/server/request-auth.ts`: `requestOAuthProviderStatus()` considera o par (ID + secret) para `google`.

---

## 4. GitHub OAuth — o que criar/colocar

| Item | Valor exato |
|---|---|
| **Authorization callback URL** | `https://api.whilo.onerall.com/v1/auth/oauth/github/callback` |

**Onde configurar (GitHub Developer Settings):**
- Criar um **OAuth App** (Settings → Developer settings → OAuth Apps).
- Registrar a **Authorization callback URL** exatamente como acima.

**No Worker (Whilo):**
- **Var/ID (público):** `GITHUB_OAUTH_CLIENT_ID` — var em `apps/auth-api/wrangler.jsonc` (produção). **Observado no config de produção atual:** valor vazio (`""`) (mesma lógica de habilitação por par ID+secret).
- **Secret:** `GITHUB_OAUTH_CLIENT_SECRET` — registrar via `wrangler secret put GITHUB_OAUTH_CLIENT_SECRET --config apps/auth-api/wrangler.jsonc` (produção). Para teste: `--env test` (conforme `wrangler.jsonc`).

**Origem dos valores (obrigatório, sem inventar):**
- **O Client ID e o Client Secret são gerados pelo GitHub.** Eu não posso inventá-los. O owner copia e registra (sem colar em chat/Git).

**Evidência no código:**
- `apps/auth-api/src/server/github-oauth.ts`: `CALLBACK_PATH = "/v1/auth/oauth/github/callback"`; `redirectUri(requestUrl)`; lê `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET`.
- Rotas: `apps/auth-api/src/routes/v1/auth/oauth/github/start.ts`, `apps/auth-api/src/routes/v1/auth/oauth/github/callback.ts`, `apps/auth-api/src/routes/v1/auth/oauth/status.ts`.
- `apps/auth-api/src/server/request-auth.ts`: `requestOAuthProviderStatus()` inclui `github`.
- Nota: `GITHUB_APP_CLIENT_ID` / `GITHUB_APP_PRIVATE_KEY` em `wrangler.jsonc` referem-se ao **GitHub App** (outro propósito), não ao OAuth de sign-in web descrito aqui.

---

## 5. `HOSTED_SERVER_TEMPLATE` — como obter

**O que é:** nome do snapshot/template (named snapshot) publicado na boat para o servidor Whilo (ex.: `whilo-server-<versão>` / `whilo-server-production-...`, conforme pipeline). O Worker usa esse nome para criar sandboxes. **Sem inventar nome.**

**Como obter:**
1. Construir/publicar o snapshot na boat via pipeline do repositório:
   - `scripts/hosting/build-boat-template.ts` — cria builder sandbox (sem env de conta), executa provisionamento, valida instalação, salva named snapshot (`whilo-server-<version>` ou `--name=...`; produção usa prefixo/nome conforme opções) e remove builder. Requer `BOAT_TEMPLATE_API_KEY` com acesso a sandbox/files/commands/named snapshots (chave diferente da chave do Worker).
   - `scripts/hosting/release-boat-template.sh` — fluxo de release para tag estável `v<version>`: baixa checksums do release, calcula SHA do AppImage Linux x64, consulta templates em uso no D1, executa `build-boat-template.ts` com `--auth-api-url=https://api.whilo.onerall.com`, e **define `HOSTED_SERVER_TEMPLATE` no Worker de produção** via `wrangler secret put HOSTED_SERVER_TEMPLATE --config apps/auth-api/wrangler.jsonc` (após revalidar que o release ainda é o latest). Requer `BOAT_TEMPLATE_API_KEY`, credenciais Cloudflare, `GH_TOKEN`, etc., sob o lock de deploy de produção.
2. O **workflow de release** normalmente **seta `HOSTED_SERVER_TEMPLATE` no Worker de produção** no fluxo normal (ver `docs/hosted-servers.md`, `docs/RELEASING.md`).

**Registro manual (se necessário):**
```bash
cd /home/ryantheirreal/openbot/apps/auth-api
wrangler secret put HOSTED_SERVER_TEMPLATE --config apps/auth-api/wrangler.jsonc
# Teste:
wrangler secret put HOSTED_SERVER_TEMPLATE --config apps/auth-api/wrangler.jsonc --env test
```

**Evidência/config:** `apps/auth-api/wrangler.jsonc` inclui `HOSTED_SERVER_TEMPLATE` em `secrets.required` (produção). `docs/hosted-servers.md` e `docs/whilo-boat-credentials.md` descrevem obtenção/registro.

---

## 6. Registrar no Worker (nomes, interativo) — evidência e comandos

### Segredos atuais no Worker (produção) — `wrangler secret list` (sem valores)

Executado em `apps/auth-api` com `wrangler secret list --config wrangler.jsonc` (somente nomes/tipos; **sem valores**). Resultado observado:

- `EMAIL_SMTP_PASSWORD` (secret_text)
- `REMOTE_AUTH_WEBHOOK_SECRET` (secret_text)
- `REMOTE_TICKET_PRIVATE_JWK` (secret_text)
- `REMOTE_TICKET_PUBLIC_JWKS` (secret_text)

**Interpretação factual (conforme evidência prévia solicitada):** faltam segredos de hosting/Boat/Stripe/OAuth necessários para o fluxo completo, em comparação com o que a hospedagem e os provedores OAuth exigem (ex.: `secrets.required` em `wrangler.jsonc` inclui `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BOAT_API_KEY`, `BOAT_WEBHOOK_SECRET`, `HOSTED_SERVER_TEMPLATE`; OAuth usa `GOOGLE_OAUTH_CLIENT_SECRET`/`GITHUB_OAUTH_CLIENT_SECRET` como segredos do Worker quando configurados; o script de registro também cobre nomes relacionados).

### Comandos interativos (recomendado; não ecoar valores)

A partir de `apps/auth-api` (ou com `--config` apontando para `apps/auth-api/wrangler.jsonc`):

```bash
cd /home/ryantheirreal/openbot/apps/auth-api
wrangler secret put <NOME> --config wrangler.jsonc
# Para ambiente de teste, quando aplicável:
# wrangler secret put <NOME> --config wrangler.jsonc --env test
```

Nomes relevantes (conforme config/código/fluxo de hospedagem e OAuth; **registrar apenas os que se aplicam ao deploy**): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BOAT_API_KEY`, `BOAT_WEBHOOK_SECRET`, `HOSTED_SERVER_TEMPLATE`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_CLIENT_SECRET` (e outros segredos exigidos pelo Worker, ex. chaves/tokens remotos, GitHub App private key se usado, etc., conforme `wrangler.jsonc`/docs).

### Script auxiliar (lê env exportado, não ecoa valores)

`scripts/hosting/register-whilo-worker-secrets.sh`:
- Lê valores de variáveis de ambiente **exportadas e não vazias** no shell atual; **nunca imprime valores**.
- Põe via `wrangler secret put` apenas nomes detectados como **`secrets.required`** para o alvo (top-level/produção por padrão ou `--env`); nomes que são vars de config (ex.: `HOSTED_SERVERS_ALLOWED_USER_IDS` está no conjunto padrão do script, mas **não** está em `secrets.required` de produção) são **pulados** com mensagem factual (“config var, não enviado via secret put”).
- Uso: `./scripts/hosting/register-whilo-worker-secrets.sh [--env <name>] [--only <NAME,...>]` (executar do repo root ou `apps/auth-api`, conforme resolução do script).
- O script também imprime aviso: `BOAT_WEBHOOK_SECRET` deve ser o segredo real de assinatura da boat para `https://api.whilo.onerall.com/v2/hosting/boat/webhook`; placeholder local não é válido a menos que registrado identicamente na boat.

### Deploy da API após segredos

- Fazer deploy a partir de **`apps/auth-api/dist/server`** com **`--keep-vars`** (preserva vars/segredos gerenciados no Worker), conforme prática do projeto/CI.
- Exemplo alinhado ao script/CI (ajustar conforme ambiente): `cd apps/auth-api && ../../node_modules/.bin/wrangler deploy --config dist/server/wrangler.json --keep-vars` (adicionar `--env <name>` se aplicável).
- **Sem deploy, as mudanças de segredo/var não entram em efeito como esperado no runtime do Worker.** **Sem segredos corretos, os recursos dependentes não funcionam.**

---

## 7. Status real de Stripe/OAuth e dependências dos dots

- **OAuth status observado anteriormente:** `/v1/auth/oauth/status` retornou `{"google":false,"github":false}`. Isso é consistente com a exigência de par ID+secret configurado para cada provedor (`apps/auth-api/src/server/request-auth.ts`) e com IDs vazios observados em `wrangler.jsonc` para produção; segredos OAuth ausentes ou IDs vazios mantêm o provedor desabilitado.
- **Dependências dos dots/hospedagem:** dependem de **Stripe + Boat + `HOSTED_SERVER_TEMPLATE` + segredos + deploy** corretos (conforme solicitado e suportado por `wrangler.jsonc` `secrets.required`/`HOSTED_SERVERS_ENABLED`, `hosted-servers.md`, rotas/webhooks e serviços).

---

## Checklist rápido (sem valores)

- [ ] Stripe webhook: `https://api.whilo.onerall.com/v1/stripe/webhook` + `STRIPE_WEBHOOK_SECRET` registrado no Worker.
- [ ] Boat webhook: `https://api.whilo.onerall.com/v2/hosting/boat/webhook` + eventos `sandbox.ready,sandbox.error,sandbox.archived,sandbox.hydrated` + `BOAT_WEBHOOK_SECRET` real registrado.
- [ ] Google OAuth: redirect `https://api.whilo.onerall.com/v1/auth/oauth/google/callback`, `GOOGLE_OAUTH_CLIENT_ID` (var) + `GOOGLE_OAUTH_CLIENT_SECRET` (secret) — valores do Google Console.
- [ ] GitHub OAuth: callback `https://api.whilo.onerall.com/v1/auth/oauth/github/callback`, `GITHUB_OAUTH_CLIENT_ID` (var) + `GITHUB_OAUTH_CLIENT_SECRET` (secret) — valores do GitHub.
- [ ] `HOSTED_SERVER_TEMPLATE` obtido/publicado (build/release) e registrado no Worker.
- [ ] Deploy de `apps/auth-api/dist/server` com `--keep-vars`.
- [ ] Verificar `/health/live` e `/v1/auth/oauth/status` após deploy/configuração.

*Fim do documento.*