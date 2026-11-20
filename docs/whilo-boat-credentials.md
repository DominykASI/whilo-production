# Credenciais da hospedagem Whilo (boat/Stripe) — guia prático

Este documento explica, de forma **factual e baseada no código/docs do repositório**, como obter e registrar as credenciais usadas pelo Worker da API da Whilo para servidores hospedados (boat).

> **Nunca** commite valores de segredo no repositório. Use `wrangler secret put` ou o fluxo de setup descrito abaixo.

## Endpoints e componentes (produção Whilo)

- **API Whilo (Worker):** `https://api.whilo.onerall.com` (rota em `apps/auth-api/wrangler.jsonc`).
- **Webhook boat → Worker:** `https://api.whilo.onerall.com/v2/hosting/boat/webhook`
- **Eventos boat lidos pelo Worker** (`HostedServerService` / `scripts/hosting/setup-account-server.ts`): `sandbox.ready`, `sandbox.error`, `sandbox.archived`, `sandbox.hydrated`.
- **API boat (plataforma Boat/Ascii):** `https://boat.dev/api/v1` (`apps/auth-api/src/server/boat-client.ts` e `scripts/hosting/setup-account-server.ts`).

## 1) `BOAT_API_KEY`

**O que é:** chave da API da sua conta boat.dev, usada pelo Worker para criar/consultar/atualizar/parar/retomar/apagar sandboxes (e renomear/estender lease, conforme o cliente em `boat-client.ts`).

**Como obter:**
1. Acesse sua conta no **painel/dashboard da boat.dev**.
2. Crie uma **API key**.

**Escopo recomendado (importante para segurança):**
- Em **produção**, use uma chave **limitada** a operações de sandbox: **create, get, list, update, stop, resume, delete**.
- **NÃO** conceda acesso a **file, command, prompt ou desktop** à chave usada pelo Worker. O Worker faz `PATCH` (update) para lease/nome; a chave de produção não deve permitir ler dados do usuário dentro da VM (veja `docs/hosted-servers.md`).

**Como registrar:**

```bash
cd /home/ryantheirreal/openbot/apps/auth-api
wrangler secret put BOAT_API_KEY --config wrangler.jsonc
# Ambiente de teste:
# wrangler secret put BOAT_API_KEY --config wrangler.jsonc --env test
```

Alternativa suportada (recomendada quando aplicável): o fluxo `bun run hosting:setup --target=production` (na raiz do repo) exige `BOAT_API_KEY` (e `STRIPE_SECRET_KEY`, conforme o caso) e grava segredos no **store** configurado. Em produção, o store é o **GitHub Environment `cloudflare-production`** e o script usa o `gh` autenticado nesse ambiente; as chaves vêm do shell (veja `scripts/hosting/setup-account-server.ts`). **Não** coloque chaves no histórico do shell.

## 2) `BOAT_WEBHOOK_SECRET`

**O que é:** segredo de assinatura das entregas de webhook da boat para `https://api.whilo.onerall.com/v2/hosting/boat/webhook`. O Worker verifica HMAC com `verifyBoatWebhookSignature` (`apps/auth-api/src/server/boat-client.ts` / `hosted-server-service.ts`). Se o segredo estiver errado ou ausente, as entregas são rejeitadas e a hospedagem pode ficar indisponível/mal configurada (ex.: erro de configuração/503, conforme o estado do Worker).

**Como obter (ponto crítico):**
- A boat mostra o **signing secret apenas quando o webhook é criado ou rotacionado**. Copie-o **no momento da criação/rotação** — não é possível recuperá-lo depois pelo mesmo caminho.

**Caminho suportado/recomendado:**

```bash
# Na raiz do repositório, com gh autenticado no GitHub Environment cloudflare-production (produção)
# e com as chaves necessárias exportadas no shell (sem histórico):
bun run hosting:setup --target=production
```

O script cria/garante o webhook da boat para `<api>/v2/hosting/boat/webhook` com os eventos necessários e grava `BOAT_WEBHOOK_SECRET` (e segredos do Stripe) no store. Se o store já tiver o segredo e você não usar `--replace-webhooks`, ele pode manter o segredo existente.

**Se você criar/rotacionar o webhook diretamente no dashboard da boat.dev:**
1. Configure a URL: `https://api.whilo.onerall.com/v2/hosting/boat/webhook`.
2. Selecione os eventos: `sandbox.ready,sandbox.error,sandbox.archived,sandbox.hydrated`.
3. Copie o **signing secret uma única vez** na criação/rotação.
4. Registre no Worker:

```bash
cd /home/ryantheirreal/openbot/apps/auth-api
wrangler secret put BOAT_WEBHOOK_SECRET --config wrangler.jsonc
# Teste: wrangler secret put BOAT_WEBHOOK_SECRET --config wrangler.jsonc --env test
```

**Aviso sobre placeholders locais:** um valor placeholder gerado localmente (por exemplo, em `agentic/secrets/generated-secrets.whilo.values.local.json`) **NÃO** é o segredo de assinatura da boat, a menos que você registre **explicitamente o mesmo valor** na boat. O segredo real **deve corresponder** ao que a boat usa para assinar os webhooks.

## 3) `HOSTED_SERVER_TEMPLATE`

**O que é:** nome do snapshot/imagem (template) da boat para o servidor Whilo (ex.: `whilo-server-<versão>`), usado ao criar sandboxes.

**Como obter:**
1. Construa/publique o snapshot do template na boat usando o pipeline do repositório:
   - `scripts/hosting/build-boat-template.ts`
   - `scripts/hosting/release-boat-template.sh` (fluxo de release/produção; usa `--auth-api-url` da API Whilo)
2. O **workflow de release** define `HOSTED_SERVER_TEMPLATE` no Worker de produção no fluxo normal (veja `docs/hosted-servers.md` / `RELEASING.md`).

**Como registrar manualmente:**

```bash
cd /home/ryantheirreal/openbot/apps/auth-api
wrangler secret put HOSTED_SERVER_TEMPLATE --config wrangler.jsonc
# Teste:
# wrangler secret put HOSTED_SERVER_TEMPLATE --config wrangler.jsonc --env test
```

**Sem esse valor**, o provisionamento de servidores hospedados fica desabilitado/indisponível (o Worker exige o template e os segredos de boat/Stripe conforme a configuração).

## Segredos e variáveis exigidos pelo Worker (referência)

Em `apps/auth-api/wrangler.jsonc`, `secrets.required` (produção) inclui:
`REMOTE_TICKET_PRIVATE_JWK`, `REMOTE_TICKET_PUBLIC_JWKS`, `REMOTE_AUTH_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BOAT_API_KEY`, `BOAT_WEBHOOK_SECRET`, `HOSTED_SERVER_TEMPLATE`.

Conforme aplicável ao seu deploy, configure também:
- **OAuth (web):** IDs em `vars` e segredos `GOOGLE_OAUTH_CLIENT_SECRET` / `GITHUB_OAUTH_CLIENT_SECRET` via `wrangler secret put` (produção e `--env test`), quando esses provedores forem usados.
- **GitHub App:** `GITHUB_APP_CLIENT_ID` está em `vars`; a chave privada é o segredo opcional `GITHUB_APP_PRIVATE_KEY` (PKCS #8), se aplicável.
- **Hospedagem (vars):** `HOSTED_SERVERS_ENABLED`, `HOSTED_SERVERS_ALLOWED_USER_IDS` (em produção pode ser `*` para permitir todas as contas, conforme configuração atual), `HOSTED_SERVERS_MAX_PER_ACCOUNT` (se usado).

O ambiente de **teste** (`env.test`) tem um conjunto de `secrets.required` diferente e o deploy de teste (`api:deploy:test`) carrega alguns valores do `.env.dev` criptografado — veja `docs/hosted-servers.md` e `scripts/hosting/setup-account-server.ts --target=test`.

## Deploy da API (após configurar segredos)

Faça o deploy a partir do artefato construído, com `--keep-vars` para preservar variáveis/segredos gerenciados no Worker (conforme o pipeline):

```bash
# Exemplo alinhado ao CI (ajuste paths/flags conforme seu ambiente de deploy):
cd /home/ryantheirreal/openbot/apps/auth-api
# build conforme o fluxo do projeto, então:
../../node_modules/.bin/wrangler deploy --config dist/server/wrangler.json --keep-vars
```

O workflow de produção em `.github/workflows/ci.yml` também usa `wrangler deploy ... --keep-vars` (e, no deploy final de produção, `--config dist/server/wrangler.json --keep-vars --secrets-file ...`). **Não** remova `--keep-vars` sem entender o impacto.

## Verificação pós-deploy

- Confirme que a rota `api.whilo.onerall.com` responde (saúde/comportamento esperado da API).
- Verifique que os segredos `BOAT_API_KEY`, `BOAT_WEBHOOK_SECRET` e `HOSTED_SERVER_TEMPLATE` estão presentes no Worker/ambiente correto.
- Teste o fluxo de hospedagem com uma conta permitida (em produção, respeitando `HOSTED_SERVERS_ALLOWED_USER_IDS`).
- Se webhooks da boat falharem, confirme a URL exata, os 4 eventos e a correspondência do signing secret.

## Referências no código

- Setup/automação: `scripts/hosting/setup-account-server.ts`
- Cliente/verificação boat: `apps/auth-api/src/server/boat-client.ts`, `apps/auth-api/src/server/hosted-server-service.ts`
- Configuração Worker/segredos: `apps/auth-api/wrangler.jsonc`
- Template: `scripts/hosting/build-boat-template.ts`, `scripts/hosting/release-boat-template.sh`
- Contexto geral: `docs/hosted-servers.md`
