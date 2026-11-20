# Pareamento Whilo (host desktop ↔ app web)

Guia operacional, **baseado no código deste repositório** (leitura em 2026-11-07), para parear um host desktop Whilo com o app web ao vivo via **Mobile Connect (QR / Signal)**.

> **Estado honesto desta máquina:** **não** executei `dist:linux` nem gerei/obtive um QR aqui (build pesada, risco de OOM com ~3,6 GiB de RAM total / ~1,4 GiB disponível; ambiente possivelmente sem display para fluxo interativo). Nenhum QR foi gerado por este agente. A seção [Comandos manuais (dono da máquina)](#comandos-manuais-dono-da-máquina) lista o que rodar localmente.

## O que é

- O host desktop se **pareia por QR (Mobile Connect) via Signal**. O servidor publica o host, emite um ticket/código efêmero e o cliente consome o código para estabelecer a sessão remota.
  - No código: `src/main/mobile-connect-host.ts` (`createHostedMobileConnect` / `createHostedMobileConnectLink`) garante que o host esteja configurado e publicado (`host.configure` → `host.start`), valida fase `online` + `apiOnline` + `apiUrl` `ws:`/`wss:`, e pede o ticket à conta (`centralAuth.createMobileConnect(binding)`).
  - No modo servidor/headless Linux: `src/main/server-mode.ts` expõe `POST /v1/mobile-connect` e o CLI `whilo mobile-connect` gera o QR no terminal (`scripts/hosting/whilo`, usa `/v1/mobile-connect`, QR em base64; “funciona para um login e expira em 2 minutos”).
  - No desktop com UI: o código do QR é criado via IPC de conta (`src/main/ipc/account-handlers.ts`: `auth.createMobileConnect` → `createHostedMobileConnect`; também `createMobileConnectLink` para link permanente). O store de UI chama `accountPort().auth.createMobileConnect()` (`src/renderer/src/features/account/account-context.tsx` / store `packages/ui/src/features/settings/stores/mobile-connect-store.ts`).
- **Sessão web/email sem host pareado → workspace vazio.** Sem um host publicado/pareado acessível, não há servidor remoto para abrir o workspace. (Comportamento operacional esperado; valide no app alvo.)
- **Stack alvo (informado):**
  - `WHILO_AUTH_API_URL=https://api.whilo.onerall.com`
  - `WHILO_REMOTE_SIGNAL_URL=wss://signal.whilo.onerall.com/v1/signal`
  - Ambos reportados como **200** pelo solicitante (não verificado por este agente). Os mesmos endpoints aparecem na config de produção do worker de auth: `apps/auth-api/wrangler.jsonc` define `REMOTE_SIGNAL_URL` `wss://signal.whilo.onerall.com/v1/signal` e rota `api.whilo.onerall.com`.

## Pré-requisitos

- Conta/serviço de autenticação acessível no `WHILO_AUTH_API_URL` alvo e Signal acessível no `WHILO_REMOTE_SIGNAL_URL` alvo.
- Para build local: `bun` + dependências do projeto; toolchain de empacotamento Electron (Linux: ambiente para AppImage/x64 conforme `electron-builder`). Rede para baixar runtimes/preparações dos scripts de `dist:*`.
- Para pareamento remoto: conectividade entre os pares. **Sem TURN configurado, a conexão usa apenas STUN e pode falhar atrás de NAT simétrico** (ver [Caveats](#caveats-rede--nat)).

## Variáveis de ambiente do host (confirmadas no código)

| Variável | Onde é lida | Regras/efeito |
|---|---|---|
| `WHILO_AUTH_API_URL` | `src/main/application-services.ts` (`readCentralAuthApiUrl(process.env.WHILO_AUTH_API_URL, ...)`, passado ao `CentralAuthManager` e à config de sessão) | Base da API de conta. `src/main/central-auth-manager.ts` `readCentralAuthApiUrl`: faz `new URL(value ?? fallback)`; **exige HTTPS** ou **HTTP apenas para loopback** (`127.0.0.1`/`localhost`) e `pathname === "/"`; retorna `url.origin`. (O texto da exceção no código menciona `OPENBOT_AUTH_API_URL`, mas a variável lida é `WHILO_AUTH_API_URL`.) |
| `WHILO_REMOTE_SIGNAL_URL` | `src/main/session-configuration.ts` → `readSelfHostedSignalOrigin(process.env.WHILO_AUTH_API_URL, process.env.WHILO_REMOTE_SIGNAL_URL)`; origem permitida na CSP | URL do Signal do host self-hosted/alvo. **Se definida sem `WHILO_AUTH_API_URL`, o CSP lança erro**: `"WHILO_REMOTE_SIGNAL_URL needs WHILO_AUTH_API_URL."` (`src/main/content-security-policy.ts` ~`readSelfHostedSignalOrigin`, linhas ~31-47). **Deve ser `wss:` e sem credenciais** (usuário/senha): caso contrário lança `"WHILO_REMOTE_SIGNAL_URL must be a wss: URL without credentials."`. A origem (`url.origin`) é adicionada ao `connect-src` da CSP. |
| `WHILO_MOBILE_AUTH_API_URL` (relacionada) | `src/main/application-services.ts` → `readMobileConnectApiUrl(process.env.WHILO_MOBILE_AUTH_API_URL, centralAuthApiUrl)` | Opcional; por padrão cai no `centralAuthApiUrl`. Não é uma das duas variáveis obrigatórias do par principal, mas afeta a URL de Mobile Connect. |

Referências exatas: `src/main/content-security-policy.ts` (`buildContentSecurityPolicy`, `readSelfHostedSignalOrigin`), `src/main/session-configuration.ts` (`configureContentSecurityPolicy`, lê `REMOTE_SIGNAL_URL` de dev e o par `WHILO_AUTH_API_URL`/`WHILO_REMOTE_SIGNAL_URL`), `src/main/application-services.ts` (~1100-1112).

## Build do host desktop

Scripts em `package.json` (confirmados):

- **Linux x64 (AppImage):** `bun run dist:linux`
  - Expande para: `voice:prepare-runtime` → `prepare-remote-desktop-runtime` (linux x64) → `verify-remote-desktop-runtime --linux` → `install-cua-driver` (linux x64) → `build` → `electron-builder --linux AppImage --x64 --publish never`.
- **Linux arm64:** `bun run dist:linux:arm64` (AppImage arm64, sem os mesmos passos de remote-desktop-runtime x64 do script x64; ver `package.json`).
- **macOS (referência):** `bun run dist:mac` — `electron-builder --mac --config.mac.identity=null --config.mac.notarize=false` (build de dev/sem assinatura/notarização). **Pode exigir runner macOS e, para distribuição, assinatura/notarização. Declarar/ajustar conforme ambiente.**
- **Windows (referência):** `bun run dist:win` — `electron-builder --win nsis --x64 --publish never`. **Pode exigir runner Windows e assinatura conforme política de distribuição. Declarar/ajustar conforme ambiente.**

### Restrições de máquina (3,7 GiB) — orientação operacional

Em máquina com pouca RAM (~3,6 GiB), **faça 1 build por vez** e reduza pressão de memória/concorrência:

```bash
# Pare compilações TypeScript concorrentes (se houver)
pkill -f "tsc -b" || true

# Limite heap do Node usado no build
export NODE_OPTIONS=--max-old-space-size=2000

# Rode destacado, com log
cd /home/ryantheirreal/openbot
setsid nohup bun run dist:linux > /tmp/whilo-dist-linux.log 2>&1 < /dev/null &
echo $!
tail -f /tmp/whilo-dist-linux.log
```

Se houver OOM/falha, libere memória, feche apps e tente novamente (ou use máquina/runner com mais RAM). **Não assuma que o build concluiu sem verificar o log e o artefato gerado.**

## Como iniciar o host com as 2 env vars

Defina **as duas** variáveis antes de iniciar o app (exigência do `readSelfHostedSignalOrigin`/CSP). Exemplos alinhados com `docs/self-hosting.md` §4, adaptados ao stack alvo:

### macOS

```sh
WHILO_AUTH_API_URL=https://api.whilo.onerall.com \
WHILO_REMOTE_SIGNAL_URL=wss://signal.whilo.onerall.com/v1/signal \
/Applications/Whilo.app/Contents/MacOS/Whilo
```

### Linux (AppImage empacotado)

```sh
WHILO_AUTH_API_URL=https://api.whilo.onerall.com \
WHILO_REMOTE_SIGNAL_URL=wss://signal.whilo.onerall.com/v1/signal \
./Whilo-<versão>-x86_64.AppImage
```

Ajuste o nome/versão do AppImage ao artefato real gerado pelo `dist:linux`.

### Windows (PowerShell)

```powershell
$env:WHILO_AUTH_API_URL = "https://api.whilo.onerall.com"
$env:WHILO_REMOTE_SIGNAL_URL = "wss://signal.whilo.onerall.com/v1/signal"
& "$env:LOCALAPPDATA\Programs\Whilo\Whilo.exe"
```

Ajuste o caminho se a instalação não estiver no local padrão.

### O que confirma que está ok

- O app **inicia sem erro de CSP/configuração**. Falhas típicas (lançadas no main): falta `WHILO_AUTH_API_URL` com signal definido, ou `WHILO_REMOTE_SIGNAL_URL` que não seja `wss:`/tenha credenciais (`src/main/content-security-policy.ts`).
- A conta consegue autenticar no `WHILO_AUTH_API_URL` alvo (fluxo de login do app; storage em `CentralAuthManager` com `apiUrl` lido de `WHILO_AUTH_API_URL`).
- O host consegue **publicar/ficar online** para emitir o código Mobile Connect: a emissão exige host configurado e status publicado (`online`, `apiOnline`, `apiUrl` `ws:`/`wss:`) — `mobile-connect-host.ts` `publishMobileConnectHost` / `isPublishedHost`. Erros de UI/IPC indicarão falha de publicação.
- Para servidor headless Linux (CLI): `whilo status` mostra conta/servidor e `whilo mobile-connect` retorna um QR (código de uso único, ~2 min) — `scripts/hosting/whilo`, `src/main/server-mode.ts`.
- Verificação de rede (manual, fora do app): `curl -fsS -o /dev/null -w "%{http_code}\n" https://api.whilo.onerall.com/...` conforme endpoint disponível; conectividade WSS ao Signal. **Não executei verificação de 200 aqui.**

## Como gerar o QR (caminho exato no menu/UI) e escanear

### Desktop (UI) — caminho exato (confirmado em i18n + componentes)

As strings de onboarding descrevem o caminho como:
- EN (`packages/i18n/src/messages/en/mobile/onboarding.ts`): *“open Whilo on your computer, go to **Settings → Mobile Connect**, choose **Generate QR code** and scan it…”*
- PT (`packages/i18n/src/messages/pt/mobile/onboarding.ts`): *“abra o Whilo no seu computador, acesse **Configurações → Conectar celular**, escolha **Gerar código QR** e leia o código…”*

Fluxo real na UI (confirmado em código):
1. Abra **Configurações / Settings** → aba **Conectar celular / Mobile Connect** (`settings.tab.mobileConnect.*`; `src/renderer/src/features/settings/SettingsModal.tsx` registra `value="mobile-connect"`, `packages/ui/src/features/settings/SettingsMobileConnectTab.tsx`).
2. Clique em **Adicionar celular / Add phone** (`settings.mobileConnect.phones.add`, botão em `SettingsMobileConnectTab.tsx`), que abre `MobileConnectAddPhoneDialog`.
3. Escolha **Sim, entrar / Yes, sign in** (`settings.mobileConnect.add.signIn.title`) para exibir um **código QR de uso único** (`settings.mobileConnect.qr.signIn` / `settings.mobileConnect.qrLabel`; `MobileConnectDialogs.tsx` cria o ticket via store → `createMobileConnect`). O passo na UI orienta: *“Tap Scan QR code / Toque em Ler código QR”* (`settings.mobileConnect.step.scan`) e apontar a câmera.

O ticket QR é de **uso único e expira** (UI mostra contagem; backend/CLI indica ~2 minutos no modo servidor).

### Servidor Linux self-hosted/headless (CLI)

- `sudo whilo login` (conta) e, com o host publicado, `whilo mobile-connect` imprime o QR no terminal (base64 → terminal), funciona para um login e expira em ~2 minutos (`scripts/hosting/whilo`, `src/main/server-mode.ts` `POST /v1/mobile-connect`).

### Onde escanear

- Escaneie com o **app Whilo** (ação **“Scan QR code” / “Ler código QR” / “Escanear código QR”**, conforme locale — strings `mobile.auth.scanQrCode`, `mobile.app.route.scanQrCode`, `settings.mobileConnect.step.scan` em `packages/i18n/src/messages/*`).
- Alvo operacional informado pelo solicitante: **`https://whilo.onerall.com`** (ação “Scan QR code”). **Não validei a UI do web app ao vivo**; confirme no produto em `https://whilo.onerall.com` que o fluxo de leitura de QR/Mobile Connect está disponível no cliente usado (app mobile ou web app, conforme o build/entrypoint atual).

## Caveats (rede / NAT)

- **Sem TURN (`turn.invalid`) — STUN only.** Na ausência de um relay TURN utilizável, o estabelecimento de mídia/dados P2P depende de STUN e pode falhar. (Caveat operacional informado; diagnósticos exatos como `turn.invalid` dependem do stack de sinalização/WebRTC em runtime — **não confirmei a emissão dessa string específica** em uma execução local nesta análise.)
- **Funciona melhor na mesma LAN; pode falhar atrás de NAT simétrico.** NAT simétrico frequentemente impede furos de NAT apenas com STUN; nesses casos é necessário TURN (relay) corretamente exposto e anunciado.
- O stack `remote/`/docs de self-hosting tratam de Signal/TURN para infraestrutura própria (`docs/self-hosting.md`, `remote/README.md`); para o stack gerenciado `*.whilo.onerall.com`, a disponibilidade/qualidade de TURN é do serviço alvo — validar com o operador do ambiente.

## Falhas comuns e diagnóstico

| Sintoma | Causa provável (grounded) | Como diagnosticar |
|---|---|---|
| App recusa iniciar / erro ao configurar CSP/sinal | `WHILO_REMOTE_SIGNAL_URL` definido sem `WHILO_AUTH_API_URL`, ou signal não-`wss:` / com credenciais | Conferir as 2 env vars; regras em `src/main/content-security-policy.ts` `readSelfHostedSignalOrigin`. Ver logs do main/Electron. |
| `createMobileConnect` falha (“host não publicado”, identidade mudou) | Host não configurado/publicado, ou `hostId` divergente do `serverId` publicado; `apiUrl` não `ws:`/`wss:` | `mobile-connect-host.ts`: checar fase `online`, `apiOnline`, `apiUrl`; garantir login/conta e publicação do host. No CLI: `whilo status`. |
| QR gerado mas pareamento não conecta | NAT simétrico / sem TURN, firewall, Signal inacessível, relógio/expiração do ticket | Testar na **mesma LAN**; validar alcance a `api.whilo.onerall.com` (HTTPS) e `signal.whilo.onerall.com` (WSS); gerar novo QR (efêmero). Ver [Caveats](#caveats-rede--nat). |
| `401/unauthorized` ou falha na conta | Sessão inválida/expirada ou URL de auth incorreta | Conferir `WHILO_AUTH_API_URL` (origem HTTPS correta, `pathname /`); reautenticar. |
| Build falha (OOM/tsc morto) | RAM insuficiente, builds concorrentes | `pkill -f "tsc -b"`, `NODE_OPTIONS=--max-old-space-size=2000`, 1 build por vez, `setsid nohup`→log (ver acima). |
| QR no desktop não aparece | Falta permissão/capacidade de criar ticket, host offline, ou erro IPC | Checar handlers `src/main/ipc/account-handlers.ts` (`createMobileConnect`/`createHostedMobileConnect`), estado da conta e status do host; abrir DevTools/logs do renderer/main. |

## Comandos manuais (dono da máquina)

Execute no host com recursos suficientes (substitua caminhos/versões conforme seu ambiente):

```bash
# 0) Preparar ambiente de build (máquina com pouca RAM)
cd /home/ryantheirreal/openbot
pkill -f "tsc -b" || true
export NODE_OPTIONS=--max-old-space-size=2000

# 1) Build Linux (1 por vez, com log)
setsid nohup bun run dist:linux > /tmp/whilo-dist-linux.log 2>&1 < /dev/null &
tail -f /tmp/whilo-dist-linux.log
# Ao final: localizar o AppImage gerado (dist/ ou saída do electron-builder) e anotar o caminho.

# 2) (Opcional) Smoke de conectividade — NÃO executado por este agente
curl -fsS -o /dev/null -w "api=%{http_code}\n" https://api.whilo.onerall.com/ || true
# WSS: usar uma ferramenta de websocket (ex.: websocat/wscat) contra
# wss://signal.whilo.onerall.com/v1/signal

# 3) Iniciar o host com o stack alvo
WHILO_AUTH_API_URL=https://api.whilo.onerall.com \
WHILO_REMOTE_SIGNAL_URL=wss://signal.whilo.onerall.com/v1/signal \
/caminho/para/Whilo-<versão>-x86_64.AppImage

# 4) Gerar o QR no desktop (UI)
# Configurações / Settings → Conectar celular / Mobile Connect → Adicionar celular / Add phone
# → "Sim, entrar" / "Yes, sign in" (gera QR de uso único). Escanear no app Whilo (Scan QR code / Ler código QR).
# Confirmar também o fluxo em https://whilo.onerall.com, se aplicável ao cliente usado.

# 5) Servidor Linux headless (alternativa, se usar o modo self-hosted/CLI deste repo)
# sudo whilo login
# whilo status
# whilo mobile-connect
```

## Referências de código (âncoras)

- Env/CSP/sinal: `src/main/content-security-policy.ts` (`readSelfHostedSignalOrigin`, `buildContentSecurityPolicy`), `src/main/session-configuration.ts`, `src/main/application-services.ts` (`WHILO_AUTH_API_URL`, `WHILO_REMOTE_SIGNAL_URL`, `WHILO_MOBILE_AUTH_API_URL`).
- Mobile Connect (main): `src/main/mobile-connect-host.ts`, `src/main/ipc/account-handlers.ts`, `src/main/central-auth-manager.ts` (`readCentralAuthApiUrl`, `createMobileConnect`/link).
- Headless/CLI: `src/main/server-mode.ts` (`/v1/mobile-connect`), `scripts/hosting/whilo` (`whilo mobile-connect`).
- UI: `src/renderer/src/features/settings/SettingsModal.tsx`, `packages/ui/src/features/settings/SettingsMobileConnectTab.tsx`, `packages/ui/src/features/settings/MobileConnectDialogs.tsx`, `packages/ui/src/features/settings/stores/mobile-connect-store.ts`; i18n `packages/i18n/src/messages/{en,pt}/settings.ts`, `*/mobile/{onboarding,auth,app,server}.ts`.
- Docs relacionadas: `docs/self-hosting.md`, `docs/self-hosted-server.md`, `docs/web-client.md`, `remote/README.md`.
- Config alvo em prod (worker): `apps/auth-api/wrangler.jsonc` (`api.whilo.onerall.com`, `wss://signal.whilo.onerall.com/v1/signal`).
