/**
 * The plugins that ship inside the app: a downloadless install of skill bundles Whilo vendors
 * under `resources/plugins/`. The marketplace reads this list; the main process installs from it.
 * Adding a plugin means adding its folder to `resources/plugins/` and an entry below, in one or the
 * other. Nothing here reaches the network at runtime.
 */

import type { SkillCategory } from "./ipc-skills";

export type BundledPluginIcon =
  | "browser"
  | "chrome"
  | "computer-use"
  | "latex"
  | "visualize"
  | "mundo-legal-br"
  | "mundo-legal-es"
  | "mundo-legal-desk";

/** Which section of the Plugins tab holds the plugin. */
export type BundledPluginGroup = "computer-use" | "world-legal-desk" | "tools";

export interface BundledPluginSkill {
  /** The folder under `resources/plugins/<plugin>/skills/`. */
  slug: string;
  /** The name for the listing; the SKILL.md frontmatter is the authority on install. */
  name: string;
  description: string;
}

export interface BundledPluginLink {
  /** What the link does, for the row's accessible name. */
  label: string;
  url: string;
}

export interface BundledPlugin {
  id: string;
  name: string;
  tagline: string;
  description: string;
  creatorName: string;
  version: string;
  category: SkillCategory;
  icon: BundledPluginIcon;
  group: BundledPluginGroup;
  prompts: readonly string[];
  links: readonly BundledPluginLink[];
  skills: readonly BundledPluginSkill[];
}

export const BUNDLED_PLUGINS: readonly BundledPlugin[] = [
  {
    id: "browser",
    name: "Browser",
    tagline: "Control the in-app browser",
    description:
      "Browser lets Whilo open and control the in-app browser, mainly for local development pages and files. Use it to navigate, inspect, click, type, and take screenshots while testing pages.",
    creatorName: "OpenAI",
    version: "26.1021.31345",
    category: "coding",
    icon: "browser",
    group: "computer-use",
    prompts: ["Test my checkout flow on localhost"],
    links: [{ label: "OpenAI", url: "https://github.com/openai/openai/tree/master/lib/oai_browser_use/plugin" }],
    skills: [
      {
        slug: "control-in-app-browser",
        name: "Control in-app Browser",
        description: "Navigate, inspect and click through pages in the in-app browser, for local testing.",
      },
    ],
  },
  {
    id: "computer-use",
    name: "Computer Use",
    tagline: "Control Windows apps",
    description:
      "Windows Computer Use lets ChatGPT use any app on your computer, including your web browsers and files you allow it to access. It may take screenshots or page content while working. You stay in control: you choose which apps to allow it to access, you can stop actions at any time.",
    creatorName: "OpenAI",
    version: "26.1021.31345",
    category: "productivity",
    icon: "computer-use",
    group: "computer-use",
    prompts: [
      "Play a playlist to help me lock in",
      "Build and run the project I already have open in Visual Studio",
      "Open Notepad and turn these bullets into a clean draft",
    ],
    links: [{ label: "OpenAI", url: "https://github.com/openai/openai/tree/master/project/cua/sky_js/plugin" }],
    skills: [
      {
        slug: "computer-use",
        name: "Computer Use",
        description: "Use desktop apps on Windows: open, operate, screenshot and stop any action.",
      },
    ],
  },
  {
    id: "chrome",
    name: "Chrome",
    tagline: "Control Chrome with ChatGPT",
    description:
      "Chrome lets ChatGPT use your Chrome browser for tasks that need your existing browser state, including open tabs, page content, and websites you're already signed into. It can navigate, view, click, type, and take screenshots while working. ChatGPT asks before interacting with new sites, and you can stop actions at any time.",
    creatorName: "OpenAI",
    version: "26.1021.31345",
    category: "productivity",
    icon: "chrome",
    group: "computer-use",
    prompts: [
      "File my expenses for me",
      "Review my messages on social media",
      "Put in a PTO request in Workday",
    ],
    links: [
      { label: "OpenAI", url: "https://github.com/openai/openai/tree/master/lib/oai_browser_use/plugin" },
      { label: "Chrome DevTools", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp" },
    ],
    skills: [
      {
        slug: "control-chrome",
        name: "Control Chrome",
        description: "Use your existing Chrome state: tabs, logged-in sessions and extensions.",
      },
    ],
  },
  {
    id: "mundo-legal-br",
    name: "Mundo Legal BR",
    tagline: "Leis brasileiras, direto da fonte",
    description:
      "Consulta a legislação federal brasileira no repositório público ctresb/leis — leis consolidadas em Markdown, cada reforma um commit. O agente lê pela web sob demanda; nada é baixado para o computador. Cite artigos com o link da fonte, sempre.",
    creatorName: "ctresb/leis",
    version: "2026.10",
    category: "research",
    icon: "mundo-legal-br",
    group: "world-legal-desk",
    prompts: [
      "Quais são os requisitos da LGPD para o tratamento de dados pessoais?",
      "Resuma o artigo 5º da Constituição.",
      "O que a CLT diz sobre aviso prévio?",
    ],
    links: [{ label: "ctresb/leis", url: "https://github.com/ctresb/leis" }],
    skills: [
      {
        slug: "mundo-legal-br",
        name: "Mundo Legal BR",
        description: "Consulte leis brasileiras no ctresb/leis pela web, citando artigo e fonte.",
      },
    ],
  },
  {
    id: "mundo-legal-es",
    name: "Mundo Legal ES",
    tagline: "Leyes españolas, directo de la fuente",
    description:
      "Consulta la legislación del Estado español en el repositorio público legalize-dev/legalize-es — leyes en Markdown, versionadas con Git, texto consolidado. El agente lee por la web bajo demanda; nada se descarga al ordenador. Cita artículos con el enlace a la fuente, siempre.",
    creatorName: "legalize-dev",
    version: "2026.10",
    category: "research",
    icon: "mundo-legal-es",
    group: "world-legal-desk",
    prompts: [
      "¿Qué dice el Estatuto de los Trabajadores sobre el despido improcedente?",
      "Resume el artículo 14 de la Constitución Española.",
      "¿Cuáles son los derechos de los consumidores según el TRLGDCU?",
    ],
    links: [{ label: "legalize-dev/legalize-es", url: "https://github.com/legalize-dev/legalize-es" }],
    skills: [
      {
        slug: "mundo-legal-es",
        name: "Mundo Legal ES",
        description: "Consulte leyes españolas en legalize-es por la web, citando artículo y fuente.",
      },
    ],
  },
  {
    id: "mundo-legal-desk",
    name: "World Legal Desk",
    tagline: "Leis de 27 países em Markdown, lidas na web",
    description:
      "Todo o corpus do legalize-dev e do ctresb/leis ao alcance de um prompt: Brasil, União Europeia e mais 24 países (Espanha, Alemanha, Itália, Portugal, Reino Unido, EUA, Argentina, Colômbia, Uruguai e outros). Nada é baixado; o agente abre o Markdown bruto na web e cita artigo, parágrafo e link.",
    creatorName: "legalize-dev + ctresb",
    version: "2026.10",
    category: "research",
    icon: "mundo-legal-desk",
    group: "world-legal-desk",
    prompts: [
      "Compare a proteção de dados na LGPD (Brasil) e no RGPD (UE).",
      "Qual é a pena para furto simples no Código Penal espanhol?",
      "Resuma o artigo 1º da Constituição da Alemanha.",
    ],
    links: [
      { label: "legalize-dev (27 repositórios)", url: "https://github.com/orgs/legalize-dev/repositories?type=all" },
      { label: "ctresb/leis", url: "https://github.com/ctresb/leis" },
    ],
    skills: [
      {
        slug: "mundo-legal-desk",
        name: "World Legal Desk",
        description: "Leia leis de 27 países pela web, com URL bruta e citação de artigo.",
      },
    ],
  },
  {
    id: "latex",
    name: "LaTeX",
    tagline: "Compile LaTeX with bundled Tectonic",
    description:
      "LaTeX workflows for Whilo that use bundled Tectonic first for simple projects, fall back to detected TeX Live or MacTeX for fuller projects, validate local LaTeX readiness, and optionally install a managed full TeX Live runtime only when no usable system installation is present.",
    creatorName: "OpenAI",
    version: "0.2.8",
    category: "documents",
    icon: "latex",
    group: "tools",
    prompts: [
      "Use latex-doctor to check whether this machine can compile LaTeX.",
      "Use latex-compile to build the main TeX file in this project, trying Tectonic first.",
      "Use texlive-runtime-installer to install a managed full TeX Live runtime.",
    ],
    links: [{ label: "OpenAI", url: "https://github.com/openai/openai/tree/master/plugins/latex" }],
    skills: [
      {
        slug: "latex-doctor",
        name: "LaTeX Doctor",
        description: "Check whether this machine can compile LaTeX, and what is missing.",
      },
      {
        slug: "latex-compile",
        name: "LaTeX Compile",
        description: "Compile a TeX project, Tectonic first, then local TeX Live or MacTeX.",
      },
      {
        slug: "texlive-runtime-installer",
        name: "TeX Live Runtime Installer",
        description: "Install a managed full TeX Live runtime when no system install exists.",
      },
    ],
  },
  {
    id: "visualize",
    name: "Visualize",
    tagline: "Interactive charts, maps and simulations",
    description:
      "Create interactive charts, maps, diagrams, simulations, 3D models, data explorers, and UI previews directly in conversation. Filter data, select details, compare scenarios, and adjust inputs to see how the result changes.",
    creatorName: "OpenAI",
    version: "1.0.55",
    category: "data-analytics",
    icon: "visualize",
    group: "tools",
    prompts: [
      "Turn this dataset into an interactive explorer with filters and selectable details.",
      "Show how a spinning gyroscope works in an adjustable 3D simulation.",
      "Visualize this database schema as an interactive relationship graph.",
    ],
    links: [{ label: "OpenAI", url: "https://openai.com/" }],
    skills: [
      {
        slug: "visualize",
        name: "Visualize",
        description: "Interactive charts, maps, diagrams, simulators and data explorers inline.",
      },
    ],
  },
] as const satisfies readonly BundledPlugin[];
