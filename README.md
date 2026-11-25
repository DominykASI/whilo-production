# Whilo Production

**Whilo Production** — consolidated production workspace for the Whilo Pets desktop app (Electron + local harness), based on the latest Whilo branding/customizations from `Whilo-main`.

This production bundle keeps the current **Pets desktop flow** intact (core app: `electron/`, `src/`, `server/`, `shared/`, `public/`, `build/`) and includes a preserved reference copy of `whilo-swas-main` for **Architecture A** integration (one Electron shell loading Pets or a unified Dots/Pets surface).

- **EN:** Original pre-production folders/assets from `bots & pets - whilo` were archived outside this directory for safety.
- **PT-BR:** As pastas/arquivos originais pré-produção de `bots & pets - whilo` foram arquivados fora deste diretório por segurança.

## Structure / Estrutura
- Core app: `package.json`, `electron/`, `src/`, `server/`, `shared/`, `public/`, `build/`
- Supporting directories: `apps/`, `cloudflare/`, `companion/`, `connector/`, `deploy/`, `docs/`, `enterprise/`, `evals/`, `relay/`, `scripts/`, `skills/`, `third_party/`, etc.
- Unified surface reference (Architecture A): `unified-surface/whilo-swas-main/` (see `UNIFIED_SURFACE.md`)
- `node_modules/` may be preserved in this copy to reduce reinstall time

## Prerequisites / Pré-requisitos
- **Node.js:** `>= 24` (see `package.json` → `engines`)
- **pnpm:** project uses `pnpm@10.x` (`corepack enable` recommended)
- **Desktop tooling:** platform-specific build tools as required by Electron/Electron Builder (macOS/Windows/Linux)
- If `node_modules` is missing or dependencies need refresh, run `pnpm install`

## Run Dev Desktop / Executar Desktop em Desenvolvimento

### EN
```bash
# 1) Install dependencies (if needed)
pnpm install

# 2) Start UI dev server (Vite) - terminal 1
pnpm dev

# 3) Start local harness/server in dev mode (if needed by your workflow) - terminal 2
pnpm dev:server

# 4) Start Electron desktop app (dev) - terminal 3
pnpm dev:desktop
```
Notes:
- `pnpm dev:desktop` runs: `node scripts/prepare-cloudflared.mjs --current && electron .`
- Electron main entry: `electron/main.mjs` (see `package.json` → `main`)
- Keep local credentials/data secure; this project is designed for local-first operation.

### PT-BR
```bash
# 1) Instalar dependências (se necessário)
pnpm install

# 2) Iniciar servidor de UI em desenvolvimento (Vite) - terminal 1
pnpm dev

# 3) Iniciar harness/servidor local em modo dev (se necessário) - terminal 2
pnpm dev:server

# 4) Iniciar app desktop Electron (dev) - terminal 3
pnpm dev:desktop
```
Notas:
- `pnpm dev:desktop` executa: `node scripts/prepare-cloudflared.mjs --current && electron .`
- Entrada principal do Electron: `electron/main.mjs` (ver `package.json` → `main`)
- Mantenha credenciais/dados locais seguros; o projeto é voltado para operação local-first.

## Build / Compilar

### EN
```bash
# TypeScript checks/builds + Vite UI build
pnpm build
```
Additional useful commands:
```bash
pnpm typecheck
pnpm test
```

### PT-BR
```bash
# Verificações/builds TypeScript + build da UI (Vite)
pnpm build
```
Comandos úteis adicionais:
```bash
pnpm typecheck
pnpm test
```

## Package / Empacotar

### EN
Electron Builder configuration: `electron-builder.yml`  
Common packaging flow:

```bash
# Prepare build artifacts + server bundle + companion + updater + native assets
pnpm package:prepare

# Platform packages (run on the appropriate OS/toolchain)
pnpm package:mac      # macOS
pnpm package:win      # Windows
pnpm package:linux    # Linux (x64)
pnpm package          # alias for macOS package in this project

# Optional variants
pnpm package:linux:dir
pnpm package:linux:offline
```

### PT-BR
Configuração do Electron Builder: `electron-builder.yml`  
Fluxo comum de empacotamento:

```bash
# Preparar artefatos de build + bundle do servidor + companion + updater + recursos nativos
pnpm package:prepare

# Pacotes por plataforma (executar no SO/toolchain apropriado)
pnpm package:mac      # macOS
pnpm package:win      # Windows
pnpm package:linux    # Linux (x64)
pnpm package          # atalho para pacote macOS neste projeto

# Variantes opcionais
pnpm package:linux:dir
pnpm package:linux:offline
```

## Unified Surface (Architecture A) / Superfície Unificada (Arquitetura A)
- `unified-surface/whilo-swas-main/` contains a preserved copy of the `whilo-swas-main` monorepo (web/desktop/shared context) to support future integration into a single Electron shell serving Pets and/or unified Dots/Pets surfaces.
- `UNIFIED_SURFACE.md` documents this reference inclusion.
- **Important:** this is a reference copy; the default runtime/build remains the core Pets app unless explicitly wired.

## Notes / Observações
- Inspect `package.json` for the full script catalog (docs, evals, smoke tests, broker/control-plane tasks, etc.).
- For environment-specific variables, review `.env.example` (if applicable to your workflow) and project docs under `docs/`.
- Source baseline for this production folder: `Whilo-main` (Whilo branding/customizations in progress) + unified surface reference from `whilo-swas-main`.
