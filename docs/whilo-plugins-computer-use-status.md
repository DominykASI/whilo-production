# Status: Computer Use (Codex / Rose-Kiwi) em plugins — Openbot

**Data da verificação:** 2026 (workspace local)  
**Escopo:** investigação factual em `/home/ryantheirreal/openbot` (sem alterações de código, sem deploy, sem segredos).  
**Objetivo:** apurar o pedido anterior sobre “computer use de codex/rose kiwi” (Rose/Kiwi + Codex computer use) ainda presente em plugins.

## Resumo executivo

- **Encontrado (ativo/bundled no repositório):** plugin bundled **`computer-use`** em `packages/contracts/src/bundled-plugins.ts` (id `computer-use`, grupo `computer-use`), com skill empacotada em `resources/plugins/computer-use/` e entrada no catálogo de plugins em `resources/plugin-catalog/` e `marketplace/plugin-catalog/`.
- **Encontrado (relacionado a Codex/local):** provider/bridge de chat **`codex-local`** (“Codex via ChatGPT · this computer”) no front-end enterprise/SWAS (`enterprise.js`), com detecção via `whiloNativeCodexBridge()`. Isso é uma integração de chat Codex local no contexto SWAS/enterprise, **não** um plugin “Rose/Kiwi” e **não** a mesma coisa que o bundle `computer-use` do app principal.
- **Não encontrado:** plugins/entradas de catálogo/assets com identificadores **Rose/Kiwi/Rosie** (ex.: `kiwi`, `rose`, `rosie`, `rose-kiwi`) no sistema de plugins do Openbot (bundled plugins, plugin catalog, marketplace plugin catalog, resources de plugins).

## 1) Bundled `computer-use` (presente)

**Definição (bundled):** `packages/contracts/src/bundled-plugins.ts`
- `BundledPluginIcon` inclui `"computer-use"` (linha ~13 no arquivo).
- `BundledPluginGroup` inclui `"computer-use"` (linha ~21).
- Entrada de grupo/ícone do plugin `browser`: `group: "computer-use"` (linha ~63).
- Entrada do plugin: `id: "computer-use"`, `name: "Computer Use"`, `tagline: "Control Windows apps"`, `creatorName: "OpenAI"`, `version: "26.1021.31345"`, `category: "productivity"`, `icon: "computer-use"`, `group: "computer-use"` (linhas ~75–109).
- Skill declarada: slug `computer-use` / `name: "Computer Use"` / descrição de uso de apps desktop no Windows (abrir, operar, screenshot, parar ação).
- Link: OpenAI `https://github.com/openai/openai/tree/master/project/cua/sky_js/plugin`.

**Assets/resources do plugin bundled:** `resources/plugins/computer-use/`
- `resources/plugins/computer-use/skills/computer-use/SKILL.md` (skill “Computer Use — Control Windows apps from ChatGPT”; usa `@oai/sky` / sessão JavaScript; orienta leitura de docs de guidance/api/confirmations).

**Catálogo de plugins (instalável via catálogo):**
- `resources/plugin-catalog/catalog.json` contém slug `computer-use` (versão `1.0.0`, `featured: false`, `detailSha256` presente; evidência por grep: `"slug": "computer-use"`).
- `resources/plugin-catalog/computer-use/1.0.0.json` (manifest detalhado): slug `computer-use`, `name: "Computer Use"`, creator `Whilo`, descreve agregação de Browser automation, desktop via `cua-driver` e **Chrome via DevTools Protocol**; app MCP `chrome-devtools` (stdio, `npx -y chrome-devtools-mcp@1.12.0`). `skills: []` neste manifest de catálogo (diferente do bundle de skill em `resources/plugins/computer-use`).
- `marketplace/plugin-catalog/plugins/computer-use` (diretório presente).

**Interpretação (“ativo/bundled”):** o plugin está **listado/bundled no código e nos recursos/catálogos versionados**. A habilitação efetiva por agente/ambiente depende do fluxo de instalação/uso e capacidades de runtime (fora do escopo desta verificação de presença em plugins).

## 2) Integração de runtime/capacidade “Computer Use” (evidência de suporte)

Presença de contratos/IPC/DB/analytics relacionados (amostra factual, não exaustiva):
- `packages/contracts/src/ipc-mcp-servers.ts:40`: `export const COMPUTER_USE_MCP_SERVER_NAME = "computer_use";`
- `packages/contracts/src/ipc-endpoints.ts`: grupo `computerUse` / mapeamento `"computerUse"` (linhas encontradas por busca: 1027, 2205).
- `packages/contracts/src/ipc-agents.ts`, `ipc-agent-admin.ts`, `ipc-agent-status.ts`, `ipc-desktop-apis.ts`: campos/guards/capability state `computerUse` (ex.: `agentComputerUseEnabled`, capability `computerUse`).
- `src/backend/whilo-database-schema.ts` / migração de nome reservado `computer_use` (conflito com nome salvo do usuário); `src/backend/computer-use-name-migration.test.ts`.
- `src/main/analytics.ts` e `src/main/startup-timing.ts`: referências a `computer_use` / `computer-use`.
- Commit relevante no histórico: `84cbce7db Give routine threads Computer Use again (#5159)` (altera `src/backend/agent-service.ts`, `thread-lifecycle.ts`, `agent-tasks.ts`, docs/scripts relacionados).

## 3) Codex local bridge no enterprise chat (`codex-local`) — encontrado

Arquivos com referências a `codex-local` / `whiloNativeCodexBridge()`:
- `packages/whilo-swas-core/web/enterprise.js` (ex.: provider `['codex-local','Codex via ChatGPT · this computer']` quando `whiloNativeCodexBridge()` disponível; carregamento de modelos/streaming/allowed providers condicionados a `whiloChatProvider === 'codex-local'`; refs por grep em linhas como 1768, 1790, 1817, 1848, 1871–1885, 1957, 3187, 3191).
- `bots & pets - whilo/whilo-swas-main/web/whilo-swas/whilo-enterprise.js` (padrão equivalente; refs por grep em linhas como 1648, 1675, 1706, 1729–1743, 1815, 3036, 3040).

**Observação factual:** isso evidencia uma ponte de chat “Codex via ChatGPT (local)” no UI enterprise/SWAS. Não foi encontrada implementação equivalente sob o nome `codex-local` em `src/` do app Electron principal nesta busca; o app principal possui integração Codex via app-server (`src/backend/app-server-client.ts`, `CodexAppServerClient`) — contexto diferente. Não há evidência, nestes arquivos, de associação a plugins Rose/Kiwi.

## 4) Rose / Kiwi / Rosie — **não encontrados como plugins**

**Buscas realizadas (amostra):**
- `packages/contracts/src/bundled-plugins.ts`, `resources/plugin-catalog/catalog.json`, `resources/plugin-catalog/**`, `marketplace/plugin-catalog/**`, `resources/plugins/**`, `src/**`, `packages/**`, `docs/**`, `plans/**`, `AGENTS.md`, `TASKS.md`: procuras por slugs/IDs `kiwi`, `rose`, `rosie`, `rose-kiwi`/variações em contexto de plugin/catálogo.
- `docs/*AGENTS*swas*` / `*swas*AGENTS*`: **não existe** em `docs/`. Existe `packages/whilo-swas-core/AGENTS-swas.md` (inspecionado; sem menções a Rose/Kiwi/rosie/computer-use/codex-local na busca).
- Histórico git: buscas por termos `kiwi/rose/rosie/swas` em mensagens/corpos não indicaram adição de plugin Rose/Kiwi no sistema de plugins do Openbot (hits de “rose” observados em commits não relacionados, ex.: notificações/RTL/UI, fora do contexto de plugin Rose/Kiwi).

**Ocorrências não-plugin (para evitar falso positivo):**
- “Rose” como **token de cor/acento de UI**: `packages/contracts/src/app-interface-look.ts` (`APP_ACCENTS` inclui `"rose"`), `packages/contracts/src/app-logo-color.ts`.
- “Kiwi” como **nome de bot/fixture em testes/mocks/scripts** no subprojeto `bots & pets - whilo/OpenMausBot-latest/` (ex.: testes `server/lent-mcp.test.ts`, `server/mcp-sign-in-card.test.ts`, `server/routes/*mcp*.test.ts`, `src/components/CallSheet.test.ts`, script `scripts/capture-companion-fixtures.mjs`, mockup MCP em `docs/superpowers/.../mockup.html`). **Não** é um plugin do Openbot nem entrada em `bundled-plugins.ts`/plugin-catalog do Openbot.
- `packages/whilo-swas-core/AGENTS-swas.md` existe, mas não documenta plugins Rose/Kiwi nesta verificação.

**Conclusão factual (Rose/Kiwi):** não foram encontrados plugins Rose/Kiwi/Rosie ativos ou bundled no sistema de plugins do Openbot neste repositório, nos caminhos verificados acima. Se a referência “Rose/Kiwi” existir em outro repositório, branch não presente localmente, build externo, ou ambiente/runtime não versionado, ela **não** aparece nesta árvore de trabalho.

## Evidência de reprodutibilidade (comandos conceituais usados)
- Listagem/inspeção: `packages/contracts/src/bundled-plugins.ts`, `resources/plugins/computer-use/**`, `resources/plugin-catalog/**`, `marketplace/plugin-catalog/**`.
- Buscas: `grep/rg` por `computer-use`, `computer_use`, `codex-local`, `whiloNativeCodexBridge`, `kiwi|rose|rosie` (com exclusões de tokens de cor onde aplicável); `git log --grep`/buscas em histórico local.

