# Builds de produção — Whilo (guia factual, PT-BR)

> **Escopo:** documentação operacional e de referência, **sem deploy e sem builds pesadas** executadas por este agente.  
> **Data da leitura do repositório:** 2026-11-08. Comandos/paths abaixo foram verificados nos arquivos citados; execuções reais dependem de ambiente, credenciais e runners.  
> **Segredos:** **nenhum segredo** incluído. Variáveis/segredos aparecem apenas por nome (ver docs de deploy/auth/hosting).

## Contexto verificado (web/assets e domínios)

- `apps/auth-api/wrangler.jsonc` (Worker “account/auth API + web”, TanStack Start/Cloudflare Vite): rota custom domain **`api.whilo.onerall.com`** (produção). Vars relevantes observadas: `REMOTE_SIGNAL_URL=wss://signal.whilo.onerall.com/v1/signal`, `REMOTE_AUTH_WEBHOOK_URL=https://signal.whilo.onerall.com/internal/auth-events`, emails `@onerall.com`. Não há bloco `assets`/`pages_build_output_dir`/deploy de Cloudflare Pages neste arquivo; o deploy é de Worker (ver abaixo).
- `scripts/deploy-auth-api.ts` e `.github/workflows/ci.yml` (`deploy-production`) usam `https://whilo.onerall.com` como origem para histórico de assets (`apps/auth-api/scripts/keep-previous-assets.ts`, `PRODUCTION_ORIGIN`). O site público/cliente é servido no domínio principal; a API fica em `api.whilo.onerall.com`.
- `apps/site-router/` roteia `*.whilo.site/*` (R2 `SITES`) — **sites hospedados/publicados**, não o export do app web principal.
- **“Dots” (web):** o termo “Dots” aparece no repo como conteúdo/comparações (ex.: `apps/auth-api/src/content/compare/chatgpt-dots.ts`, `docs/business/marketing-posts.md`) e **não** foi encontrado como nome de target de deploy/export web neste monorepo. Onde a solicitação cita “Web/Dots”, este guia documenta o fluxo web **verificável** (auth-api/Worker + cliente) e o export web do `apps/mobile` (Expo) quando aplicável, marcando a ambiguidade.

## (a) Web — fluxo de export/deploy (Cloudflare) e reinjeção PWA

### Fluxo verificado: `apps/auth-api` (Worker + cliente web)

- **Build:** `apps/auth-api/package.json` → `"build": "NODE_OPTIONS=--max-old-space-size=6144 vite build"` (TanStack Start + `@cloudflare/vite-plugin`, `vite.config.ts`, SSR com `strictExecutionOrder`). Saída observada em checkout: `apps/auth-api/dist/client/` (assets hashed em `assets/`, `site.webmanifest`, ícones) e `apps/auth-api/dist/server/` (wrangler gerado para deploy). `apps/auth-api/dist/client/index.html` **não** está presente como arquivo estático no dist observado (SSR/TanStack Start); `index.html` não é o artefato de export estático canônico aqui.
- **Deploy produção (CI, `main`):** `.github/workflows/ci.yml` job `deploy-production` — instala deps, faz checkout do beam privado quando aplicável, `bun run api:build`, `bun apps/auth-api/scripts/keep-previous-assets.ts` (preserva arquivos antigos de `/assets/` para abas abertas; histórico em `asset-history.json` no cliente), aplica migrações D1, deploy do site-router, deploy do email relay (`wrangler.email-relay.jsonc`), e `wrangler deploy --config dist/server/wrangler.json --keep-vars --secrets-file ...` a partir de `apps/auth-api`. Requer secrets/tokens do ambiente Cloudflare (não listados aqui).
- **Deploy local/script:** `scripts/deploy-auth-api.ts` executa passos equivalentes (segredos obrigatórios/opcionais via env, migrações, build, keep-previous-assets em produção, deploy relay+worker). `bun run api:deploy` / `api:deploy:test` (ver `package.json` raiz e `apps/auth-api/package.json`).
- **Cliente web (`/app`):** documentação em `docs/web-client.md`. `scripts/web-client-perf-e2e.ts` mede bundle/load usando `apps/auth-api/dist/client` e `.vite/manifest.json`.

### Export web do `apps/mobile` (Expo) — fluxo esperado

- **Config verificada:** `apps/mobile/app.json` tem bloco `web` (favicon `./public/favicon-48.png`, `themeColor`/`backgroundColor` `#f5f5f7`, `shortName` Whilo, `display` standalone, `startUrl`/`scope` `./`). Assets PWA em `apps/mobile/public/` (verificados): `site.webmanifest`, `sw.js`, `offline.html`, `apple-touch-icon.png`, `favicon-16.png`, `favicon-32.png`, `favicon-48.png`, `favicon.ico`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`. Plugin `apps/mobile/plugins/with-pwa.js` injeta tags PWA no `dist/index.html` **quando o arquivo existe** durante o fluxo web/export.
- **Scripts:** `apps/mobile/package.json` **não** define `export`/`export:web`. O fluxo de export estático Expo (Metro web) é o padrão do Expo; **comando esperado (não executado aqui):**
  ```bash
  # a partir de apps/mobile (ou com --cwd apps/mobile)
  bunx expo export --platform web
  ```
  Ajustar flags de output conforme a versão do Expo SDK 58 usada no repo; validar o diretório de saída real (`dist/` é o alvo esperado pelo plugin `with-pwa.js`). **Não verificado por build neste ambiente.**

### Comando de reinjeção PWA (após export que gere `index.html`)

Script criado: `scripts/web/reinject-pwa-tags.mjs` (Node stdlib, idempotente). Reinjeta no `<head>` se ausentes: `manifest` (`./site.webmanifest`), `theme-color` (`#f5f5f7`), metas `mobile-web-app-capable`/Apple web app, `apple-touch-icon` (`./apple-touch-icon.png`), favicons (`./favicon-16/32/48.png`, `./favicon.ico`). Garante registro de Service Worker para `./sw.js` (script inline antes de `</body>`) se ainda não houver `serviceWorker.register`/uso equivalente. **Não duplica** em execuções repetidas.

```bash
# da raiz do repo
node scripts/web/reinject-pwa-tags.mjs <caminho/para/index.html>
# ou
bun scripts/web/reinject-pwa-tags.mjs <caminho/para/index.html>
# default: ./index.html (cwd)
```

**Quando usar:** após `expo export --platform web` (ou qualquer export estático que produza `index.html` + assets PWA no mesmo diretório/paths relativos). **Cuidado:** o HTML SSR do auth-api/TanStack Start não é um `index.html` estático no `dist/client` observado; não aplicar cegamente sem confirmar o artefato alvo.

## (b) Desktop

### `whilo-pets` (Electron) em `/openbot/whilo-pets` — **NÃO verificado / NÃO encontrado**

- A solicitação referencia `whilo-pets` Electron em `/openbot/whilo-pets` “já `dist/renderer+dist/main`”. **Busca neste ambiente não encontrou** `/home/ryantheirreal/openbot/whilo-pets`, `/openbot/whilo-pets`, nem `*whilo-pets*package.json`/`electron-builder*` acessíveis fora de vendor/ruído (buscas com timeout em escopos amplos; resultados diretos inexistentes nos paths esperados).
- **O que NÃO foi feito aqui:** nenhuma verificação de `dist/renderer+dist/main`, nenhum build, nenhuma execução. **Comandos exatos de build/empacotamento do `whilo-pets` não podem ser afirmados** sem o diretório/projeto presente.

### Desktop root `@whilo` (`whilo`, Electron) — comandos verificados (`package.json` + `electron-builder.yml`)

Raiz: `/home/ryantheirreal/openbot` (`package.json` name `whilo`, `electron-builder.yml`, `electron.vite.config.ts`).

```bash
# Empacotamento (dir/unpacked, por plataforma-alvo do script)
bun run package            # macOS, identity/notarize desabilitados localmente; prepara voice + remote-desktop-runtime + cua-driver, build, electron-builder --dir
bun run package:linux      # linux x64 dir
bun run package:linux:arm64
bun run package:win        # win x64 dir (--publish never)
bun run package:verify     # package + verify:package (macOS)
bun run package:linux:verify
bun run package:win:verify

# Distribuíveis
bun run dist:mac           # DMG/ZIP; local com identity/notarize null/false
bun run dist:win           # NSIS x64, --publish never
bun run dist:linux         # AppImage x64
bun run dist:linux:arm64   # AppImage arm64
bun run dist:release       # mac release flow (--publish never), ver script
```

- **Assinatura/notarização (requisitos):**
  - **macOS:** `electron-builder.yml` tem `notarize: true`, `hardenedRuntime: true`, entitlements `build/entitlements.mac*.plist`, team/IDs configurados; release CI usa segredos `CSC_*`, `APPLE_*` (ver `docs/RELEASING.md`). `dist:mac`/`package` locais desabilitam identity/notarize — **não** produzem artefato válido para Gatekeeper/auto-update de distribuição. Para distribuição: **codesign + notarização + stapling** (Apple Developer ID / credenciais Apple) no pipeline de release.
  - **Windows:** assinatura via Azure Artifact Signing no release/tag com overlay `electron-builder.windows-signing.yml` (`bun run dist:win --config electron-builder.windows-signing.yml` no CI, ver `docs/RELEASING.md`); `dist:win` local é sem assinatura. Distribuição confiável/SmartScreen requer assinatura.
  - **Linux:** AppImage **não assinado** (ver `RELEASING.md`).
- **Runners/requisitos:** macOS arm64/x64 runners separados no release (runtimes preparados por arquitetura; ver `docs/RELEASING.md` e `electron-builder.yml` — sem `arch` fixo no target mac para permitir build por máquina). Windows/Linux em runners GitHub conforme release workflow. Runtimes nativos pinados: `prepare:remote-desktop-runtime`/`install:remote-desktop-runtime`, `prepare:cua-driver`, `voice:prepare-runtime`, com `verify:*`.
- **Ressalvas de máquina (3,7 GB RAM total):** **1 build por vez**, evitar concorrência. Executar destacado com log; limitar heap Node (`NODE_OPTIONS=--max-old-space-size=...`, ex.: `2000` em máquina muito pequena, ajustando ao script — `auth-api` usa `6144` no build web; dist desktop pode exigir mais e falhar por OOM). Exemplo operacional (não executado aqui):
  ```bash
  pkill -f "tsc -b" || true
  export NODE_OPTIONS=--max-old-space-size=2000
  cd /home/ryantheirreal/openbot
  setsid nohup bun run dist:linux > /tmp/whilo-dist-linux.log 2>&1 < /dev/null &
  tail -f /tmp/whilo-dist-linux.log
  ```
  Em OOM/falha: usar runner/máquina com mais RAM. **Não declarar sucesso sem log+artefato.**
- **O que NÃO foi construído aqui:** **nenhum** `dist:*`/`package:*` desktop foi executado (build pesada; risco OOM com ~3,6 GB). Artefatos não verificados.

## (c) Mobile iOS/Android (`apps/mobile`, Expo/RN, EAS)

Verificados em `apps/mobile/package.json`, `eas.json`, `app.json`, `apps/mobile/README.md`.

```bash
# Dev (requer solicitação explícita para simulador/emulador/build)
bun run mobile              # expo start
bun run mobile:ios          # scripts/mobile-ios.ts
bun run mobile:android      # scripts/mobile-android.ts

# Builds locais (Mac/Xcode/Android SDK conforme plataforma)
bun run mobile:ios:build:local      # EAS local, profile production, /private/tmp/whilo-testflight.ipa
bun run mobile:android:build:local  # EAS local, profile production, /private/tmp/whilo-play.aab

# Releases CI (dispatch de workflow no main; requer gh auth + setup de secrets/environments)
bun run mobile:ios:release:testflight   # gh workflow run release-ios.yml --ref main
bun run mobile:android:release:play     # gh workflow run release-android.yml --ref main
bun run mobile:release:patch|minor|major  # prepare-release --mobile (versionamento/changelog mobile)

# EAS cloud (a partir de apps/mobile)
cd apps/mobile && bunx eas-cli@latest build --profile production --platform ios|android
```

- **Perfis EAS (`eas.json`):** `development` (dev client, internal), `preview` (internal), `production` (autoIncrement, canais/ambientes `EXPO_PUBLIC_APP_ENV`). `cli.appVersionSource: remote`.
- **Credenciais/perfis necessários:**
  - **iOS:** Apple Developer membership, bundle `run.whilo.mobile` (e targets de extensões: widgets/notification/share com App Group `group.run.whilo.mobile`), certificados/provisioning no EAS (distribuição + perfis por target), App Store Connect API key para upload CI (Fastlane/TestFlight no workflow), `EXPO_TOKEN`. Assinatura tratada pelo fluxo EAS/credenciais — **não gerar/exportar segredos localmente**.
  - **Android:** package `run.whilo.mobile`, upload keystore no EAS (Play App Signing mantém chave de app), Google Cloud service account com acesso ao Play/Android Publisher API no Play Console, `google-services.json` versionado em `apps/mobile/` (identificadores públicos; chave de envio FCM fica no auth-api), `EXPO_TOKEN`.
  - Variáveis `EXPO_PUBLIC_*` (ex.: OpenPanel) configuradas no EAS environment apropriado (ver README mobile); segredos não vão em código.
- **Local vs CI/EAS:** builds locais exigem toolchain nativa completa (Xcode+CocoaPods+Fastlane no Mac para iOS; JDK/Android SDK para Android) e credenciais configuradas. CI usa runners GitHub com `eas build --local`/Fastlane conforme workflows `release-ios.yml`/`release-android.yml` (detalhes e one-time setup em `apps/mobile/README.md`). **Não executar builds/simuladores/EAS sem solicitação explícita.**

## (d) Ponte Dots↔web↔mobile (host/QR envs) — factual

- **Host desktop (self-hosted/target):** `WHILO_AUTH_API_URL` (HTTPS, ou HTTP loopback; origem) e `WHILO_REMOTE_SIGNAL_URL` (deve ser `wss:` sem credenciais; **requer** `WHILO_AUTH_API_URL` para CSP — ver `src/main/content-security-policy.ts`, `session-configuration.ts`, `application-services.ts`). Opcional relacionado: `WHILO_MOBILE_AUTH_API_URL` (default cai na auth API). Stack alvo documentado: `https://api.whilo.onerall.com` e `wss://signal.whilo.onerall.com/v1/signal` (`docs/whilo-pairing.md`, alinhado a `apps/auth-api/wrangler.jsonc`).
- **Mobile Connect (QR via Signal):** host publica/online e emite ticket efêmero; UI desktop **Configurações → Conectar celular → Adicionar celular → Sim, entrar** (gera QR de uso único, expira ~2 min). Headless/CLI: `whilo mobile-connect` (ver `docs/whilo-pairing.md`, `src/main/mobile-connect-host.ts`, `server-mode.ts`, `scripts/hosting/whilo`). App mobile escaneia QR; convites/links `whilo://join` também existem.
- **Web client:** `/app` no serviço de conta/site (ver `docs/web-client.md`); sessão cookie + conexão ao host via Signal/ticket.
- **“Dots↔web↔mobile”:** não há componente nomeado “Dots bridge” encontrado no código; a ponte operacional verificada é **auth API + Signal + Mobile Connect/QR + Team/host connection** entre desktop host, web client e mobile. Tratar integrações adicionais como **não verificadas** até confirmação no código/infra.

## Gates / estados (factual, com lacunas explícitas)

- **`observed_state` (hosted servers):** usado em `apps/auth-api/src/server/hosted-server-service.ts` (persistido/atualizado; status retorna `state: row.observed_state`). Estados observados no fluxo incluem, entre outros, `awaiting_payment`, `creating`, `starting`, `running`, `stopping`, `stopped`, `waking`, `error`, `deleted` (ver transições SQL/cron/webhooks no serviço e `docs/hosted-servers.md`). O runtime/UI deve tratar o host como utilizável conforme esses estados/capabilities — **não inventar “ready” fora do contrato real**.
- **“17/17 gates, no ready before `observed_state=running`, fail-closed”:** **não encontrado** literalmente como regra “17/17” em docs/código-fonte (busca por `17/17`, `17 gates`; resultados irrelevantes em bundles dist). “Fail-closed” como política geral não foi confirmado em um gate único nomeado na leitura rápida. **Conclusão honesta:** os estados `observed_state`/`desired_state` e checagens de capacidade/licença existem no serviço hospedado, mas a formulação exata “17/17 / no ready before running / fail-closed” **não pôde ser validada** neste repositório com evidência textual direta — requer confirmação com o autor da especificação ou testes/contratos específicos.

## Validações realizadas por este agente

- `node --check scripts/web/reinject-pwa-tags.mjs` → **OK**.
- Dry run em cópia de HTML de amostra em `/tmp` (`/tmp/sample-pwa-index.html`): 1ª execução injetou 11 tags de head + registro SW; 2ª/3ª execuções → `changed:false`, sem duplicatas. Execução com `bun` sobre cópia já injetada também confirmou idempotência.
- Leitura (sem escrita destrutiva): `apps/mobile` (configs/scripts/PWA assets/plugin), `apps/auth-api/wrangler.jsonc` + package/vite/deploy scripts, `apps/site-router`, docs (`RELEASING`, `web-client`, `self-hosting`, `hosted-servers`, `whilo-pairing`), `electron-builder.yml`, workflows relevantes.

## Bloqueadores / itens não realizados (honestos)

- **Nenhum deploy** executado. **Nenhum build pesado** executado (`dist:*`, `package:*`, `eas build`, `expo export`, empacotamentos).
- **`/openbot/whilo-pets` (Electron, “já dist/renderer+dist/main”) não encontrado** neste filesystem — comandos/estado desse desktop **não verificados**.
- **“Web/Dots”**: nomenclatura “Dots” para o fluxo de export/deploy web principal **não confirmada** no código; documentação cobre fluxos web verificáveis.
- **Export web mobile (`expo export --platform web`) não executado**; diretório/`index.html` de saída final dependem da execução real. `with-pwa.js` injeta em `dist/index.html` quando presente.
- Regras **17/17 / no ready before `observed_state=running` / fail-closed** citadas na solicitação **não localizadas textualmente** no repo — tratar como **não validadas** aqui.
- Ambiente com RAM limitada (~3,6 GB) — builds desktop/web/mobile podem falhar por OOM; seguir orientação de 1 build, `nohup`, `NODE_OPTIONS` e runner adequado.
- Verificação de conectividade 200 para `api.whilo.onerall.com`/Signal **não executada** por este agente (somente configuração documentada).
