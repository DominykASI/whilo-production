# Whilo — Estado de Produção

**Atualizado:** 2026-11-25 · **Repo:** `DominykASI/whilo-production` (público)

Tudo abaixo foi verificado respondendo HTTP 200 em produção, não apenas "publicado".

## No ar

| Superfície | URL | Verificação |
|---|---|---|
| Instalador Windows x64 | https://github.com/DominykASI/whilo-production/releases/latest/download/WhiloPets-setup.exe | HTTP 200, 263.8 MB |
| Pacote Linux `.deb` | https://github.com/DominykASI/whilo-production/releases/latest/download/Whilo-amd64.deb | HTTP 200, 270.4 MB |
| AppImage Linux | https://github.com/DominykASI/whilo-production/releases/latest/download/Whilo.AppImage | HTTP 200, 318.9 MB |
| Feed de auto-update | `latest.yml` (Windows) e `latest-linux.yml` no release `v0.1.146` | presentes |
| Pricing | https://whilo-app.onerall.com | HTTP 200; bundle `pricing-D6lXqdak.js` serve Premium/Max/Ultra |
| Pricing (preview) | https://whilo.pages.dev | HTTP 200 |
| Docs | https://whilo-docs.onerall.com/docs | HTTP 200; `<title>Whilo documentation · Whilo Docs</title>` |
| Docs (preview) | https://whilo-docs.pages.dev/docs | HTTP 200 |
| Docker (amd64 + arm64) | `ghcr.io/dominykasi/whilo-production:latest` | pull anônimo HTTP 200, índice OCI com amd64+arm64 |
| Docker Cloud Home | `ghcr.io/dominykasi/whilo-production-cloud-home:latest` | pull anônimo HTTP 200 |

## Pipelines verdes

- **Whilo Release (Linux)** — publica AppImage + `.deb` + feeds.
- **Whilo Release Windows** — NSIS installer com 6 gates: bundle do navegador, descoberta do browser pelo servidor empacotado, árvore de recursos, servidor sobe em `/api/health`, staging e upload para o release.
- **Docker image** — 3 jobs: build+smoke amd64 (inclui enterprise layer, browser não-root, loopback-only, stack Caddy, Cloud Home), arm64 nativo, publish GHCR.

## Correções de rebrand necessárias (o rename quebrou identidades externas)

1. **Browser vendor Windows** — `0.36.0-omb.1` → `whilo.1`. O binário se auto-reporta `omb.1`, então restaurar a identidade era obrigatório; espelhei o asset verificado (SHA-256 idêntico ao pin) em `browser-engine-v0.36.0-omb.1`.
2. **CUA Driver Windows** — o `Expand-Archive` do PowerShell sai com código 0 sem extrair nada na imagem `windows-2025`. Trocado por `tar.exe` do próprio Windows, com falha explícita e retry no probe de versão.
3. **Magic do backup de workspace** — `OMB-WORKSPACE-1\n` (16 bytes) cresceu para `WHILO-WORKSPACE-1\n` (18 bytes) mas dois verificadores cortavam 16 fixo. Passaram a ler o magic pelo próprio tamanho.
4. **Docker build** — o fork havia perdido `NODE_OPTIONS=--max-old-space-size=6144`; o `vite build` morria por OOM.
5. **Namespace GHCR** — workflow congelado apontava para `ghcr.io/milind-soni/*`; agora `ghcr.io/dominykasi/whilo-production`.
6. **Docs** — branding, `metadataBase`, nav, changelog e links MDX apontavam para `milind-soni/Whilo` e `docs.openmausbot.com`.

## Bloqueado (exige credencial que não existe aqui)

- **macOS** — precisa de `MAC_CERT_P12_BASE64` + `APPLE_API_KEY_*`. Sem eles, o build não assina nem notariza. O docs marca honestamente "Not published yet" em vez de linkar um 404.
- **Cloudflare workers** (`whilo-control-plane`, `whilo-composio`) — o `account_id` alvo (`0c92969a…`) não é o da conta autenticada, e o rename mudou nome de worker e de secrets; um deploy criaria um worker duplicado disputando a rota `accounts.openmausbot.com`.

## Notas de infraestrutura

- `whilo.onerall.com` continua servindo **outro** produto Whilo; não foi tocado.
- Domínios Cloudflare Pages exigem dois tokens diferentes: o token OAuth do Wrangler anexa o domínio ao projeto, e o `CLOUDFLARE_API_TOKEN` de `agents/secrets/cloudflare.env` cria o CNAME no DNS.