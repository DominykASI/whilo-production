# Configuração de OAuth (Google e GitHub) — Whilo auth-api

Documento factual para configuração dos provedores OAuth usados pelo login web no `apps/auth-api`. **Não contém segredos nem valores sensíveis.**

## Escopo

- Worker: `whilo-auth-api` (produção), domínio `https://api.whilo.onerall.com` (conforme `apps/auth-api/wrangler.jsonc`).
- Rotas OAuth:
  - `GET /v1/auth/oauth/status` — informa se cada provedor está configurado (ID + segredo presentes).
  - `GET /v1/auth/oauth/{google,github}/start` — inicia o fluxo; responde 503 `oauth_not_configured` se o provedor não estiver configurado.
  - `GET /v1/auth/oauth/{google,github}/callback` — recebe o retorno do provedor e redireciona para o app com a sessão no fragmento da URL.

Implementação de referência:
- `apps/auth-api/src/routes/v1/auth/oauth/status.ts`
- `apps/auth-api/src/routes/v1/auth/oauth/google/start.ts`
- `apps/auth-api/src/routes/v1/auth/oauth/google/callback.ts`
- `apps/auth-api/src/routes/v1/auth/oauth/github/start.ts`
- `apps/auth-api/src/routes/v1/auth/oauth/github/callback.ts`
- `apps/auth-api/src/server/google-oauth.ts` (`CALLBACK_PATH = /v1/auth/oauth/google/callback`, `redirectUri()` usa a URL da requisição)
- `apps/auth-api/src/server/github-oauth.ts` (`CALLBACK_PATH = /v1/auth/oauth/github/callback`, `redirectUri()` usa a URL da requisição)
- `apps/auth-api/src/server/request-auth.ts` (`requestOAuthProviderStatus()` considera configurado quando ID e segredo estão presentes)

## URIs de callback exatas (registrar nos consoles)

O proprietário deve registrar **exatamente** estas URIs nos consoles dos provedores (produção):

### Google (Google Cloud Console → Credentials → OAuth 2.0 Client ID, tipo **Web application** → Authorized redirect URIs)

```text
https://api.whilo.onerall.com/v1/auth/oauth/google/callback
```

### GitHub (GitHub → Settings → Developer settings → OAuth Apps → Authorization callback URL)

```text
https://api.whilo.onerall.com/v1/auth/oauth/github/callback
```

> Observação: o código monta o `redirect_uri` a partir da URL da requisição (`new URL(CALLBACK_PATH, requestUrl)`). Em produção, com o domínio customizado do Worker, isso corresponde às URIs acima. Ambientes de teste/preview com outro hostname exigirão URIs de callback correspondentes registradas no provedor (se aplicável ao ambiente).

## Variáveis/segredos necessários (apenas nomes)

### Variáveis (públicas, no `wrangler.jsonc` / ambiente)

- `GOOGLE_OAUTH_CLIENT_ID` — Client ID do OAuth Google (produção: `vars` em `apps/auth-api/wrangler.jsonc`; atualmente vazio no arquivo, deve ser preenchido quando o cliente for criado).
- `GITHUB_OAUTH_CLIENT_ID` — Client ID do app OAuth GitHub (produção: `vars` em `apps/auth-api/wrangler.jsonc`; atualmente vazio no arquivo).

### Segredos do Worker (definir via `wrangler secret put`, **não** colocar no `wrangler.jsonc`)

Executar a partir do diretório `apps/auth-api` (operação de escrita de segredo, **não** é deploy):

```bash
# Produção
wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET
wrangler secret put GITHUB_OAUTH_CLIENT_SECRET

# Ambiente de teste (se/quando o OAuth for habilitado no env test)
wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET --env test
wrangler secret put GITHUB_OAUTH_CLIENT_SECRET --env test
```

Os comandos acima solicitam o valor interativamente; **não** registrar valores de segredo em arquivos, commits ou documentação.

## Verificação de status

- `GET https://api.whilo.onerall.com/v1/auth/oauth/status` retorna o estado de configuração por provedor (sem expor segredos). O provedor só é considerado configurado quando **Client ID e Client Secret** estão presentes no ambiente do Worker.

## Fora do escopo deste documento

- Não realizar deploy.
- Não definir valores de segredos.
- Não alterar políticas de CORS/contratos além do necessário para documentação.
- Se o app web/disco de login precisar de configuração adicional, validar separadamente; este documento cobre o `auth-api` e o registro nos consoles OAuth.
