export const SERVER_SIZES = {
  small: { vcpu: 2, memoryGb: 4, diskGb: 12 },
  default: { vcpu: 4, memoryGb: 8, diskGb: 50 },
  large: { vcpu: 8, memoryGb: 16, diskGb: 125 },
} as const;

export type ServerSize = keyof typeof SERVER_SIZES;

export const SERVER_PLAN_SIZE: Readonly<Record<ServerPlan, ServerSize>> = {
  starter: "small",
  standard: "default",
  pro: "large",
};

export const SERVER_STATES = [
  "awaiting_payment",
  "creating",
  "starting",
  "running",
  "stopping",
  "stopped",
  "waking",
  "error",
  "deleted",
] as const;

export type ServerState = (typeof SERVER_STATES)[number];

export const SERVER_ERRORS = ["provider_error", "provider_billing", "provider_limit", "start_failed", "plan_ended"] as const;

export type ServerError = (typeof SERVER_ERRORS)[number];

export const SERVER_PLANS = ["starter", "standard", "pro"] as const;

export type ServerPlan = (typeof SERVER_PLANS)[number];

export type ServerInterval = "month" | "year";

export type ServerCurrency = "eur" | "usd" | "pln";

export interface ServerRegion {
  id: string;
  /** The flag the card leads with, from the ISO 3166-1 alpha-2 code. */
  code: string;
  city: string;
  label: string;
}

export interface ServerMeter {
  /** 0 to 1. Absent for a server that is not running. */
  cpu?: number;
  ram?: number;
  disk?: number;
}

export interface ServerRecord {
  serverId: string;
  name: string;
  size: ServerSize;
  plan: ServerPlan;
  interval: ServerInterval;
  currency: ServerCurrency;
  state: ServerState;
  error: ServerError | null;
  createdAt: string;
  updatedAt: string;
  /**
   * Not sent by the account server yet: a server that never chose one falls back to `DEFAULT_SERVER_REGION`.
   * Region is kept optional so wiring real data never needs a migration.
   */
  region?: string;
  deletionScheduledAt?: number | null;
  /** Live figures a provider can report. Absent renders as an unknown meter, never as zero. */
  meters?: ServerMeter;
  agentCount?: number;
  /** Milliseconds this server has been up since it last started. */
  uptimeMs?: number;
  /** The monthly price in minor units of `currency`. */
  monthlyPriceMinor?: number;
}

export interface ServerCatalogPlan {
  id: ServerPlan;
  diskGb: number;
  memberLimit: number;
  relativeSpeed: number;
  prices: Record<ServerCurrency, Record<ServerInterval, number>>;
  soldOut?: boolean;
}

export interface ServerCatalog {
  plans: ServerCatalogPlan[];
}

export interface CreateServerInput {
  name: string;
  plan: ServerPlan;
  interval: ServerInterval;
  currency: ServerCurrency;
  region: string;
  /** One id per opened dialog, so a repeated submit never creates a second server. */
  requestId: string;
}

export interface ServerCloudPageProps {
  servers?: ServerRecord[];
  /** True while the first read is still in flight; the grid shows skeleton cards. */
  loading?: boolean;
  /** A failed read, shown as a banner over whatever is already loaded. */
  error?: string | null;
  /** False when this account cannot create cloud computers at all. */
  available?: boolean;
  lifecycleAvailable?: boolean;
  maxServers?: number | null;
  catalog?: ServerCatalog;
  regions?: readonly ServerRegion[];
  /** The account's billing currency, so the picker and the cost card agree. */
  currency?: ServerCurrency;
  refreshing?: boolean;
  onRefresh?: () => void;
  onStart?: (server: ServerRecord) => void;
  onStop?: (server: ServerRecord) => void;
  onRestart?: (server: ServerRecord) => void;
  onOpen?: (server: ServerRecord) => void;
  onTerminal?: (server: ServerRecord) => void;
  onSettings?: (server: ServerRecord) => void;
  onResize?: (server: ServerRecord) => void;
  onRenew?: (server: ServerRecord) => void;
  onCreate?: (input: CreateServerInput) => void | Promise<void>;
}

export const DEFAULT_SERVER_REGION = "eu-central";

export const SERVER_REGIONS: readonly ServerRegion[] = [
  { id: "eu-central", code: "DE", city: "Frankfurt", label: "Europe · Frankfurt" },
  { id: "eu-west", code: "IE", city: "Dublin", label: "Europe · Dublin" },
  { id: "us-east", code: "US", city: "N. Virginia", label: "US East · N. Virginia" },
  { id: "us-west", code: "US", city: "Oregon", label: "US West · Oregon" },
  { id: "sa-east", code: "BR", city: "São Paulo", label: "South America · São Paulo" },
  { id: "ap-south", code: "IN", city: "Mumbai", label: "Asia Pacific · Mumbai" },
  { id: "ap-northeast", code: "JP", city: "Tokyo", label: "Asia Pacific · Tokyo" },
  { id: "ap-southeast", code: "SG", city: "Singapore", label: "Asia Pacific · Singapore" },
  { id: "af-south", code: "ZA", city: "Cape Town", label: "Africa · Cape Town" },
  { id: "me-central", code: "AE", city: "Dubai", label: "Middle East · Dubai" },
];

export function serverRegion(id: string | undefined, regions: readonly ServerRegion[] = SERVER_REGIONS): ServerRegion {
  return regions.find((region) => region.id === id) ?? regions[0] ?? SERVER_REGIONS[0]!;
}

/** Every region's flag, as the two letters the card shows beside the city. */
export function regionFlag(code: string): string {
  return [...code.toUpperCase()].map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65)).join("");
}

const PLAN_MONTHLY_MINOR: Readonly<Record<ServerPlan, Record<ServerCurrency, number>>> = {
  starter: { eur: 2000, usd: 2500, pln: 8000 },
  standard: { eur: 5000, usd: 6000, pln: 20000 },
  pro: { eur: 10000, usd: 12000, pln: 40000 },
};

const PLAN_DISK: Readonly<Record<ServerPlan, number>> = { starter: 12, standard: 50, pro: 100 };
const PLAN_MEMBERS: Readonly<Record<ServerPlan, number>> = { starter: 1, standard: 5, pro: 10 };
const PLAN_SPEED: Readonly<Record<ServerPlan, number>> = { starter: 1, standard: 2, pro: 4 };

export const DEFAULT_SERVER_CATALOG: ServerCatalog = {
  plans: SERVER_PLANS.map((id) => ({
    id,
    diskGb: PLAN_DISK[id],
    memberLimit: PLAN_MEMBERS[id],
    relativeSpeed: PLAN_SPEED[id],
    prices: pricesFor(PLAN_MONTHLY_MINOR[id]),
  })),
};

/** Yearly is twenty months' worth, per currency, so a partial catalog still prices coherently. */
function pricesFor(monthly: Record<ServerCurrency, number>): Record<ServerCurrency, Record<ServerInterval, number>> {
  const year = (amount: number) => Math.round((amount * 12 * 4) / 5);
  return {
    eur: { month: monthly.eur, year: year(monthly.eur) },
    usd: { month: monthly.usd, year: year(monthly.usd) },
    pln: { month: monthly.pln, year: year(monthly.pln) },
  };
}

/** Null for a plan or a currency the catalog does not carry, so a partial catalog still renders. */
export function planPriceMinor(catalog: ServerCatalog, plan: ServerPlan, interval: ServerInterval, currency: ServerCurrency): number | null {
  const entry = catalog.plans.find((candidate) => candidate.id === plan);
  const amount = entry?.prices?.[currency]?.[interval];
  return typeof amount === "number" && Number.isFinite(amount) ? amount : null;
}

export function planMonthlyMinor(catalog: ServerCatalog, plan: ServerPlan, interval: ServerInterval, currency: ServerCurrency): number | null {
  const amount = planPriceMinor(catalog, plan, interval, currency);
  if (amount === null) return null;
  return interval === "month" ? amount : Math.round(amount / 12);
}

export function serverMonthlyMinor(server: Pick<ServerRecord, "plan" | "interval" | "currency" | "monthlyPriceMinor">, catalog: ServerCatalog): number | null {
  if (typeof server.monthlyPriceMinor === "number") return server.monthlyPriceMinor;
  return planMonthlyMinor(catalog, server.plan, server.interval, server.currency);
}

export function serverSize(server: Pick<ServerRecord, "plan" | "size">): ServerSize {
  return SERVER_SIZES[server.size] ? server.size : SERVER_PLAN_SIZE[server.plan] ?? "default";
}

/** A plan a newer account server added: it still bills and lists, drawn as the default size. */
export function planSize(plan: ServerPlan): ServerSize {
  return SERVER_PLAN_SIZE[plan] ?? "default";
}
