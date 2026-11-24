import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Activity, AlertTriangle, Bot, Cloud, CloudOff, Cpu, Plus, RefreshCw, Server, Sparkles, Timer, Wallet,
} from "lucide-react";

import { useCaptionChrome } from "@/components/DesktopCapabilities";
import { cn } from "@/lib/cn";

import { CreateServerDialog } from "./CreateServerDialog";
import { ServerCard, ServerCardSkeleton } from "./ServerCard";
import { scLabel, type ServerCloudCopyKey } from "./copy";
import { formatMoney, formatUptime } from "./format";
import {
  DEFAULT_SERVER_CATALOG,
  SERVER_REGIONS,
  serverMonthlyMinor,
  type CreateServerInput,
  type ServerCloudPageProps,
  type ServerRecord,
} from "./types";

import "./server-cloud.css";

/** A server on its way somewhere counts as active: it will be running in a moment. */
const ACTIVE_STATES: ReadonlySet<ServerRecord["state"]> = new Set(["running", "waking", "starting", "creating"]);

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Realistic defaults, so the page renders standalone with its props left out. */
const MOCK_SERVERS: ServerRecord[] = [
  {
    serverId: "6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f",
    name: "Research server",
    size: "large",
    plan: "pro",
    interval: "month",
    currency: "eur",
    state: "running",
    error: null,
    createdAt: "2025-09-20T09:30:00.000Z",
    updatedAt: "2026-03-14T09:04:11.000Z",
    region: "eu-central",
    meters: { cpu: 0.42, ram: 0.61, disk: 0.34 },
    agentCount: 7,
    uptimeMs: 3 * DAY + 4 * HOUR + 12 * 60_000,
    monthlyPriceMinor: 10000,
  },
  {
    serverId: "0a9b8c7d-6e5f-4a3b-9c2d-1e0f9a8b7c6d",
    name: "Team server",
    size: "default",
    plan: "standard",
    interval: "year",
    currency: "eur",
    state: "running",
    error: null,
    createdAt: "2025-11-02T14:05:00.000Z",
    updatedAt: "2026-03-14T08:58:40.000Z",
    region: "eu-west",
    meters: { cpu: 0.87, ram: 0.72, disk: 0.55 },
    agentCount: 12,
    uptimeMs: 26 * HOUR + 41 * 60_000,
    monthlyPriceMinor: 4000,
  },
  {
    serverId: "b41e7a92-3c8d-4f16-9a5b-7d2e6f8c1a34",
    name: "Nightly jobs",
    size: "small",
    plan: "starter",
    interval: "month",
    currency: "eur",
    state: "stopped",
    error: null,
    createdAt: "2026-01-18T07:12:00.000Z",
    updatedAt: "2026-03-13T22:40:02.000Z",
    region: "us-east",
    agentCount: 2,
    uptimeMs: 0,
    monthlyPriceMinor: 2000,
  },
  {
    serverId: "c77b0f51-8e24-4d93-b6a1-2f5c9e0d7b18",
    name: "São Paulo edge",
    size: "default",
    plan: "standard",
    interval: "month",
    currency: "usd",
    state: "starting",
    error: null,
    createdAt: "2026-03-14T09:09:00.000Z",
    updatedAt: "2026-03-14T09:11:47.000Z",
    region: "sa-east",
    agentCount: 0,
    uptimeMs: 0,
    monthlyPriceMinor: 6000,
  },
];

export function ServerCloudPage({
  servers = MOCK_SERVERS,
  loading = false,
  error = null,
  available = true,
  lifecycleAvailable = true,
  maxServers = 50,
  catalog = DEFAULT_SERVER_CATALOG,
  regions = SERVER_REGIONS,
  currency = "eur",
  refreshing = false,
  onRefresh,
  onStart,
  onStop,
  onRestart,
  onOpen,
  onTerminal,
  onSettings,
  onResize,
  onRenew,
  onCreate,
}: ServerCloudPageProps = {}) {
  const { dragProps } = useCaptionChrome();
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  /** One action at a time per card; the rest of the grid stays live. */
  const [pending, setPending] = useState<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const openedAt = useRef(now);
  const anyRunning = servers.some((server) => server.state === "running");

  // Uptime counts on while the page is open and a refresh streaks the totals again.
  useEffect(() => { openedAt.current = Date.now(); setNow(openedAt.current); }, [servers]);

  useEffect(() => {
    if (!anyRunning) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setNow(Date.now());
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [anyRunning]);

  const totals = useMemo(() => {
    const active = servers.filter((server) => ACTIVE_STATES.has(server.state)).length;
    const agents = servers.reduce((sum, server) => sum + (server.state === "running" ? server.agentCount ?? 0 : 0), 0);
    const since = Math.max(0, now - openedAt.current);
    const uptime = servers.reduce((sum, server) => sum + (server.state === "running" ? (server.uptimeMs ?? 0) + since : 0), 0);
    const byCurrency = new Map<string, number>();
    for (const server of servers) {
      if (server.state === "deleted") continue;
      const minor = serverMonthlyMinor(server, catalog);
      if (minor === null) continue;
      byCurrency.set(server.currency, (byCurrency.get(server.currency) ?? 0) + minor);
    }
    const ranked = [...byCurrency.entries()].sort((left, right) => right[1] - left[1]);
    return { active, agents, uptime, since, cost: ranked[0] ?? null, others: Math.max(0, ranked.length - 1) };
  }, [servers, catalog, now]);

  const act = useCallback((server: ServerRecord, run: (target: ServerRecord) => void) => {
    if (pendingRef.current) return;
    pendingRef.current = server.serverId;
    setPending(server.serverId);
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      pendingRef.current = null;
      setPending(null);
    };
    try {
      const result: unknown = run(server);
      if (result && typeof (result as PromiseLike<unknown>).then === "function") void Promise.resolve(result).then(done, done);
      else done();
    } catch {
      done();
    }
  }, []);

  const create = useCallback((input: CreateServerInput) => {
    setCreateError(null);
    setCreating(true);
    void Promise.resolve(onCreate?.(input)).then(
      () => { setCreating(false); setCreateOpen(false); },
      (cause: unknown) => {
        setCreating(false);
        setCreateError(cause instanceof Error ? cause.message : String(cause));
      },
    );
  }, [onCreate]);

  const openCreate = useCallback(() => {
    setCreateError(null);
    setCreateOpen(true);
  }, []);

  const atLimit = maxServers !== null && servers.length >= maxServers;
  const canCreate = available && !atLimit;
  const empty = !loading && servers.length === 0;

  return (
    <main data-server-cloud-page className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-app text-ink animate-workspace-in" aria-label={scLabel("serverCloud.title")}>
      <Aurora />

      <header {...dragProps} className="relative z-[1] flex shrink-0 flex-wrap items-start gap-x-4 gap-y-3 px-6 pb-5 pt-5 max-md:pl-12 sm:px-8 sm:pt-7">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2.5">
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-xl border border-hairline/50 bg-card/80 text-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]">
              <Cloud size={17} />
            </span>
            <h1 className="min-w-0 truncate text-[22px] font-semibold leading-7 tracking-[-0.02em] sm:text-[26px] sm:leading-8">
              {scLabel("serverCloud.title")}
            </h1>
          </div>
          <p className="mt-1.5 max-w-[56ch] text-[13px] leading-[18px] text-ink-secondary [text-wrap:pretty]">{scLabel("serverCloud.subtitle")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing || loading}
              aria-label={scLabel("serverCloud.refresh")}
              title={scLabel("serverCloud.refresh")}
              className="ui-button ui-button-md gap-1.5"
            >
              <RefreshCw size={13} className={cn(refreshing && "animate-spin motion-reduce:animate-none")} />
              <span className="max-sm:hidden">{scLabel(refreshing ? "serverCloud.refreshing" : "serverCloud.refresh")}</span>
            </button>
          )}
          <button type="button" disabled={!canCreate} onClick={openCreate} className="ui-button ui-button-primary ui-button-md gap-1.5">
            <Plus size={14} />
            {scLabel("serverCloud.newServer")}
          </button>
        </div>
      </header>

      <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
          {error && (
            <p role="alert" className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-[13px] leading-[18px] text-danger">
              <AlertTriangle size={15} aria-hidden className="shrink-0" />
              <span className="min-w-0 flex-1">{scLabel("serverCloud.error.title")} {error}</span>
              {onRefresh && <button type="button" onClick={onRefresh} className="shrink-0 font-medium underline underline-offset-2">{scLabel("serverCloud.error.retry")}</button>}
            </p>
          )}

          <section aria-label={scLabel("serverCloud.kpi.active")} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              index={0}
              loading={loading}
              icon={<Server size={15} />}
              label="serverCloud.kpi.active"
              value={String(totals.active)}
              hint={servers.length > 0 && totals.active === servers.length
                ? "serverCloud.kpi.activeAllUp"
                : { key: "serverCloud.kpi.activeHint", params: { count: Math.max(0, servers.length - totals.active) } }}
            />
            <Kpi
              index={1}
              loading={loading}
              icon={<Bot size={15} />}
              label="serverCloud.kpi.agents"
              value={String(totals.agents)}
              hint={totals.agents === 0
                ? "serverCloud.kpi.agentsNone"
                : { key: "serverCloud.kpi.agentsHint", params: { count: totals.active } }}
            />
            <Kpi
              index={2}
              loading={loading}
              icon={<Timer size={15} />}
              label="serverCloud.kpi.uptime"
              value={totals.uptime > 0 ? formatUptime(totals.uptime) : "0m"}
              hint={totals.uptime > 0 ? "serverCloud.kpi.uptimeHint" : "serverCloud.kpi.uptimeNone"}
            />
            <Kpi
              index={3}
              loading={loading}
              icon={<Wallet size={15} />}
              label="serverCloud.kpi.cost"
              value={totals.cost ? formatMoney(totals.cost[1], totals.cost[0] as ServerRecord["currency"]) : "—"}
              hint={totals.cost === null
                ? "serverCloud.kpi.costNone"
                : totals.others > 0
                  ? { key: "serverCloud.kpi.costOther", params: { count: totals.others } }
                  : { key: "serverCloud.kpi.costHint", params: { currency: totals.cost[0].toUpperCase() } }}
            />
          </section>

          {empty ? (
            <EmptyState canCreate={canCreate} onCreate={openCreate} />
          ) : (
            <section aria-labelledby="server-cloud-list" className="flex flex-col gap-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 id="server-cloud-list" className="text-[15px] font-semibold leading-5 text-ink">{scLabel("serverCloud.sectionTitle")}</h2>
                <p className="text-[12px] tabular-nums text-ink-secondary">
                  {servers.length === 1 ? scLabel("serverCloud.sectionCountOne") : scLabel("serverCloud.sectionCount", { count: servers.length })}
                  {maxServers !== null && <> · {scLabel("serverCloud.capacity", { used: servers.length, max: maxServers })}</>}
                </p>
              </div>
              <ul data-server-grid className="grid list-none grid-cols-1 items-start gap-3.5 md:grid-cols-2 xl:grid-cols-3">
                {loading
                  ? [0, 1, 2].map((index) => <ServerCardSkeleton key={index} index={index} />)
                  : servers.map((server, index) => (
                    <ServerCard
                      key={server.serverId}
                      server={server}
                      catalog={catalog}
                      regions={regions}
                      index={index}
                      sinceMs={totals.since}
                      busy={pending === server.serverId}
                      onStart={onStart && ((target) => act(target, onStart))}
                      onStop={onStop && ((target) => act(target, onStop))}
                      onRestart={onRestart && ((target) => act(target, onRestart))}
                      onOpen={onOpen && ((target) => act(target, onOpen))}
                      onTerminal={onTerminal && ((target) => act(target, onTerminal))}
                      onSettings={onSettings && ((target) => act(target, onSettings))}
                      onResize={onResize && ((target) => act(target, onResize))}
                      onRenew={onRenew && ((target) => act(target, onRenew))}
                    />
                  ))}
              </ul>
              {!lifecycleAvailable && (
                <p className="flex items-center gap-2 text-[12px] leading-4 text-ink-tertiary">
                  <CloudOff size={13} aria-hidden className="shrink-0" />
                  {scLabel("serverCloud.unavailable")}
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      <CreateServerDialog
        open={createOpen}
        catalog={catalog}
        regions={regions}
        currency={currency}
        maxServers={maxServers}
        serverCount={servers.length}
        available={available}
        busy={creating}
        error={createError}
        onClose={() => { setCreateOpen(false); setCreateError(null); }}
        onCreate={onCreate ? create : undefined}
      />
    </main>
  );
}

type Hint = ServerCloudCopyKey | { key: ServerCloudCopyKey; params: Record<string, string | number> };

function hintText(hint: Hint): string {
  return typeof hint === "string" ? scLabel(hint) : scLabel(hint.key, hint.params);
}

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[340px] overflow-hidden">
      <div className="absolute -left-24 -top-40 size-[420px] rounded-full bg-accent/[0.12] blur-[110px]" />
      <div className="absolute left-1/3 -top-56 size-[380px] rounded-full bg-[color-mix(in_srgb,var(--color-accent)_40%,#a78bfa)]/[0.10] blur-[120px]" />
      <div className="absolute -right-20 -top-32 size-[320px] rounded-full bg-[color-mix(in_srgb,var(--color-accent)_35%,teal)]/[0.09] blur-[100px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-accent)_45%,transparent),transparent)]" />
    </div>
  );
}

function Kpi({ icon, label, value, hint, loading, index }: {
  icon: ReactNode;
  label: ServerCloudCopyKey;
  value: string;
  hint: Hint;
  loading: boolean;
  index: number;
}) {
  return (
    <div
      data-server-kpi
      style={{ "--i": index } as CSSProperties}
      className="sc-rise group relative flex min-w-0 flex-col gap-1 overflow-hidden rounded-2xl border border-hairline/45 bg-card/85 px-4 py-3.5 transition-[border-color] duration-200 ease-out hover:border-hairline/70 motion-reduce:transition-none"
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-accent)_55%,transparent),transparent)] opacity-60 transition-opacity duration-200 group-hover:opacity-100" />
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.09em] text-ink-secondary">
        <span aria-hidden className="shrink-0 text-accent">{icon}</span>
        <span className="truncate">{scLabel(label)}</span>
      </span>
      {loading
        ? <span aria-hidden className="mt-0.5 h-7 w-20 animate-pulse rounded-lg bg-ink/[0.07] motion-reduce:animate-none" />
        : <span data-server-kpi-value className="text-[26px] font-semibold leading-8 tracking-[-0.02em] tabular-nums text-ink">{value}</span>}
      <span className="truncate text-[12px] leading-4 text-ink-tertiary">{hintText(hint)}</span>
    </div>
  );
}

const POINTS: ReadonlyArray<{ icon: ReactNode; title: ServerCloudCopyKey; body: ServerCloudCopyKey }> = [
  { icon: <Activity size={16} />, title: "serverCloud.empty.alwaysOn", body: "serverCloud.empty.alwaysOnBody" },
  { icon: <Cpu size={16} />, title: "serverCloud.empty.private", body: "serverCloud.empty.privateBody" },
  { icon: <Sparkles size={16} />, title: "serverCloud.empty.anywhere", body: "serverCloud.empty.anywhereBody" },
];

function EmptyState({ canCreate, onCreate }: { canCreate: boolean; onCreate: () => void }) {
  return (
    <section data-server-empty className="sc-rise relative overflow-hidden rounded-3xl border border-hairline/45 bg-card/70 px-6 py-12 text-center sm:px-12 sm:py-16">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.14] blur-[90px]" />
      <div className="relative mx-auto flex max-w-[620px] flex-col items-center gap-4">
        <span aria-hidden className="grid size-16 place-items-center rounded-2xl border border-hairline/50 bg-inset text-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]">
          <Server size={26} />
        </span>
        <h2 className="text-[19px] font-semibold leading-6 tracking-[-0.015em] text-ink">{scLabel("serverCloud.empty.title")}</h2>
        <p className="max-w-[48ch] text-[13px] leading-[19px] text-ink-secondary [text-wrap:pretty]">{scLabel("serverCloud.empty.body")}</p>
        <button type="button" disabled={!canCreate} onClick={onCreate} className="ui-button ui-button-primary ui-button-lg mt-1 gap-2">
          <Plus size={15} />
          {scLabel("serverCloud.empty.action")}
        </button>
        <ul className="mt-6 grid w-full list-none grid-cols-1 gap-x-6 gap-y-5 text-left sm:grid-cols-3">
          {POINTS.map((point) => (
            <li key={point.title} className="flex min-w-0 flex-col gap-1.5">
              <span aria-hidden className="grid size-8 place-items-center rounded-lg border border-hairline/40 bg-inset text-ink-secondary">{point.icon}</span>
              <span className="text-[13px] font-medium leading-[18px] text-ink">{scLabel(point.title)}</span>
              <span className="text-[12px] leading-4 text-ink-secondary [text-wrap:pretty]">{scLabel(point.body)}</span>
            </li>
          ))}
        </ul>
        {!canCreate && <p className="mt-2 text-[12px] leading-4 text-warning">{scLabel("serverCloud.unavailable")}</p>}
      </div>
    </section>
  );
}

/** Left out of the page on purpose: a caller that wants realistic data can pass it as the `servers` prop. */
export const MOCK_SERVERS_FOR_STANDALONE_RENDER = MOCK_SERVERS;
