import { Briefcase, Landmark, Package, Puzzle, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { LocaleKey } from "@/locales";
import { BRAZILIAN_BANKS, banksByKind, matchBank, type BrazilianBank } from "./brazilian-banks";
import { HOSTED_MCP_APPS } from "./hosted-mcp-apps";

/**
 * The Marketplace's five shelves, in the order the tab bar shows them.
 *
 * Each shelf is a catalogue the app already trusts, put side by side so a person finds everything
 * an agent can use in one place instead of hunting through settings. Nothing here is a second
 * auth or a second session: every tab reads and writes the same store the rest of the app uses.
 */
export type MarketplaceTabId = "apps" | "plugins" | "experts" | "skills" | "banks";

export interface MarketplaceTabDef {
  id: MarketplaceTabId;
  labelKey: LocaleKey;
  descriptionKey: LocaleKey;
  icon: LucideIcon;
}

export const MARKETPLACE_TABS: readonly MarketplaceTabDef[] = [
  { id: "apps", labelKey: "marketplace.tab.apps", descriptionKey: "marketplace.tab.appsNote", icon: Puzzle },
  { id: "plugins", labelKey: "marketplace.tab.plugins", descriptionKey: "marketplace.tab.pluginsNote", icon: Package },
  { id: "experts", labelKey: "marketplace.tab.experts", descriptionKey: "marketplace.tab.expertsNote", icon: Briefcase },
  { id: "skills", labelKey: "marketplace.tab.skills", descriptionKey: "marketplace.tab.skillsNote", icon: Sparkles },
  { id: "banks", labelKey: "marketplace.tab.banks", descriptionKey: "marketplace.tab.banksNote", icon: Landmark },
];

export function marketplaceTab(id: MarketplaceTabId): MarketplaceTabDef {
  const found = MARKETPLACE_TABS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown marketplace tab: ${id}`);
  return found;
}

/** One card in the Plugins shelf: a capability an agent gains, not a connector it signs into. */
export interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  /** The skill or tool the plugin adds, shown as a chip. */
  capability: string;
  /** True when the app already ships it, so the card reads "Included" instead of "Add". */
  included: boolean;
}

/**
 * The plugins shelf. These are the working surfaces already in the app plus the ones an agent can
 * pick up, so the tab is honest today: everything listed exists somewhere in the build.
 */
export const MARKETPLACE_PLUGINS: readonly MarketplacePlugin[] = [
  { id: "workflows", name: "Workflows", description: "Give the agent a board of steps it runs end to end.", capability: "Canvas", included: true },
  { id: "routines", name: "Routines", description: "Wake an agent on a schedule, an interval or a cron line.", capability: "Scheduling", included: true },
  { id: "browser", name: "Browser", description: "Let the agent open pages, click and read them back.", capability: "Web", included: true },
  { id: "computer", name: "Computer use", description: "Drive the machine's own screen, keyboard and mouse.", capability: "Desktop", included: true },
  { id: "voice", name: "Voice", description: "Dictate to the agent and have it read replies out loud.", capability: "Audio", included: true },
  { id: "sheets", name: "Sheets", description: "A shared grid the agent reads and writes with you.", capability: "Data", included: true },
  { id: "github", name: "GitHub", description: "Open issues, review diffs and push branches from chat.", capability: "Code", included: false },
  { id: "calendar", name: "Calendar", description: "Read the week and book time without leaving the app.", capability: "Time", included: false },
];

/** One expert: a named role with the instructions and tools an agent takes on. */
export interface MarketplaceExpert {
  id: string;
  name: string;
  role: string;
  description: string;
  /** The tasks it is sold to do, shown as a short list on the card. */
  does: readonly string[];
}

/**
 * The experts shelf. Each entry is a role a person hires in one click, and each maps onto a bot the
 * app can already create — the same mascot, chat and tools, with a head start on how to behave.
 */
export const MARKETPLACE_EXPERTS: readonly MarketplaceExpert[] = [
  { id: "sdr", name: "SDR", role: "Sales", description: "Qualifies leads, books meetings and keeps the CRM current.", does: ["Qualify inbound", "Book meetings", "Draft follow-ups"] },
  { id: "support", name: "Suporte 24/7", role: "Support", description: "Answers tickets, escalates the hard ones and tracks first response.", does: ["Answer tickets", "Escalate", "Track SLA"] },
  { id: "copy", name: "Copywriter", role: "Marketing", description: "Writes ads, emails and pages in the brand's own voice.", does: ["Write ads", "Write emails", "Rewrite pages"] },
  { id: "research", name: "Pesquisador de mercado", role: "Growth", description: "Watches competitors, prices and launches every week.", does: ["Track rivals", "Watch prices", "Weekly brief"] },
  { id: "analyst", name: "Analista de dados", role: "Data", description: "Connects to the sources and answers in plain language.", does: ["Query data", "Explain results", "Build reports"] },
  { id: "ops", name: "Ops", role: "Operations", description: "Keeps routine work moving and flags what is stuck.", does: ["Run routines", "Flag blockers", "Keep notes"] },
];

export interface BankShelfGroup {
  kind: BrazilianBank["kind"];
  labelKey: LocaleKey;
  banks: readonly BrazilianBank[];
}

/** The banks shelf, grouped the way the tab shows it: real banks first, then the rest. */
export function bankShelf(): BankShelfGroup[] {
  const keys: Record<BrazilianBank["kind"], LocaleKey> = {
    banco: "marketplace.bank.kind.banco",
    digital: "marketplace.bank.kind.digital",
    cooperativa: "marketplace.bank.kind.cooperativa",
    financeira: "marketplace.bank.kind.financeira",
    pagamento: "marketplace.bank.kind.pagamento",
    investimento: "marketplace.bank.kind.investimento",
    cambio: "marketplace.bank.kind.cambio",
  };
  return banksByKind().map((group) => ({ kind: group.kind, labelKey: keys[group.kind], banks: group.banks }));
}

export { BRAZILIAN_BANKS, matchBank };
export type { BrazilianBank };

export const MARKETPLACE_APPS = HOSTED_MCP_APPS;
