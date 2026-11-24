import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, Bot, CloudCog, Loader2, Power, RotateCw, Settings2, Square, Terminal, Timer, Wallet } from "lucide-react";

import { cn } from "@/lib/cn";

import { scLabel } from "./copy";
import { formatCreatedAt, formatMoney, formatUptime } from "./format";
import { ServerMeters } from "./ServerMeters";
import { ServerStatusBadge, serverStateMoving } from "./ServerStatusBadge";
import {
  SERVER_SIZES,
  regionFlag,
  serverMonthlyMinor,
  serverRegion,
  serverSize,
  type ServerCatalog,
  type ServerRecord,
  type ServerRegion,
} from "./types";

export interface ServerCardProps {
  server: ServerRecord;
  catalog: ServerCatalog;
  regions: readonly ServerRegion[];
  busy?: boolean;
  index?: number;
  /** Milliseconds the page has been open, so a running card's uptime counts on with it. */
  sinceMs?: number;
  onStart?: (server: ServerRecord) => void;
  onStop?: (server: ServerRecord) => void;
  onRestart?: (server: ServerRecord) => void;
  onOpen?: (server: ServerRecord) => void;
  onTerminal?: (server: ServerRecord) => void;
  onSettings?: (server: ServerRecord) => void;
  onResize?: (server: ServerRecord) => void;
  onRenew?: (server: ServerRecord) => void;
}

const PLAN_LABEL = { starter: "serverCloud.plan.starter", standard: "serverCloud.plan.standard", pro: "serverCloud.plan.pro" } as const;
const SIZE_LABEL = { small: "serverCloud.size.small", default: "serverCloud.size.default", large: "serverCloud.size.large" } as const;
const ERROR_LABEL = {
  provider_error: "serverCloud.note.provider_error",
  provider_billing: "serverCloud.note.provider_billing",
  provider_limit: "serverCloud.note.provider_limit",
  start_failed: "serverCloud.note.start_failed",
  plan_ended: "serverCloud.note.plan_ended",
} as const;

/** The accent band each plan paints, so a large server reads as a bigger commitment at a glance. */
const PLAN_TINT: Record<string, string> = {
  starter: "var(--color-accent)",
  standard: "color-mix(in srgb, var(--color-accent) 55%, #a78bfa)",
  pro: "color-mix(in srgb, var(--color-accent) 45%, #f0abfc)",
};

function uptimeOf(server: ServerRecord, sinceMs: number): number {
  if (server.state !== "running") return 0;
  return (server.uptimeMs ?? 0) + Math.max(0, sinceMs);
}

export function ServerCard({
  server, catalog, regions, busy = false, index = 0, sinceMs = 0,
  onStart, onStop, onRestart, onOpen, onTerminal, onSettings, onResize, onRenew,
}: ServerCardProps) {
  const size = serverSize(server);
  const spec = SERVER_SIZES[size];
  const region = serverRegion(server.region, regions);
  const running = server.state === "running";
  const stopped = server.state === "stopped";
  const moving = serverStateMoving(server.state);
  const ended = server.error === "plan_ended";
  const needsPayment = server.state === "awaiting_payment";
  const cost = serverMonthlyMinor(server, catalog);
  const uptime = uptimeOf(server, sinceMs);
  const agents = server.agentCount ?? 0;
  const note = server.error ? scLabel(ERROR_LABEL[server.error]) : null;
  const busyOrMoving = busy || moving;

  return (
    <li
      data-server-card={server.serverId}
      data-state={server.state}
      style={{ "--i": index, "--sc-plan": PLAN_TINT[server.plan] ?? PLAN_TINT.starter } as CSSProperties}
      className={cn(
        "sc-rise group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-hairline/45 bg-card",
        "transition-[transform,box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none",
        "hover:-translate-y-0.5 hover:border-hairline/70 hover:shadow-xl hover:shadow-black/25 motion-reduce:hover:translate-y-0",
      )}
    >
      <span aria-hidden className={cn(
        "absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--sc-plan),transparent)] transition-opacity duration-200",
        running ? "opacity-90" : "opacity-25 group-hover:opacity-60",
      )} />
      <span aria-hidden className={cn(
        "pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300",
        running && "opacity-100",
      )} style={{ boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--sc-plan) 14%, transparent)" }} />

      <div className="flex min-w-0 flex-col gap-4 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-hairline/40 bg-inset text-ink"
            style={{ background: "linear-gradient(160deg, color-mix(in srgb, var(--sc-plan) 22%, transparent), transparent 70%)" }}
          >
            <ServerGlyph running={running} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold leading-5 text-ink">{server.name}</h3>
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[12px] leading-4 text-ink-secondary">
              <span aria-hidden className="text-[13px] leading-none">{regionFlag(region.code)}</span>
              <span className="truncate">{region.label}</span>
            </p>
          </div>
          <ServerStatusBadge state={server.state} className="mt-0.5" />
        </div>

        <p className="text-[12px] leading-4 text-ink-secondary" title={scLabel("serverCloud.spec", { size: scLabel(SIZE_LABEL[size]), vcpu: spec.vcpu, memory: spec.memoryGb, disk: spec.diskGb })}>
          <span className="font-medium text-ink">{scLabel(PLAN_LABEL[server.plan])}</span>
          <span aria-hidden className="mx-1.5 text-ink-tertiary">·</span>
          {spec.vcpu} vCPU
          <span aria-hidden className="mx-1.5 text-ink-tertiary">·</span>
          {spec.memoryGb} GB RAM
          <span aria-hidden className="mx-1.5 text-ink-tertiary">·</span>
          {spec.diskGb} GB SSD
        </p>

        <ServerMeters meters={server.meters} size={size} state={server.state} />

        <dl className="grid grid-cols-3 gap-2 border-t border-hairline/35 pt-3.5">
          <Stat icon={<Bot size={13} />} label={scLabel("serverCloud.stat.bots")} value={agents === 1 ? scLabel("serverCloud.agentsOne") : scLabel("serverCloud.agents", { count: agents })} muted={agents === 0} />
          <Stat icon={<Timer size={13} />} label={scLabel("serverCloud.stat.uptime")} value={uptime > 0 ? formatUptime(uptime) : scLabel("serverCloud.offline")} muted={uptime === 0} />
          <Stat icon={<Wallet size={13} />} label={scLabel("serverCloud.stat.cost")} value={cost === null ? "—" : formatMoney(cost, server.currency)} muted={cost === null} />
        </dl>

        {note && (
          <p className={cn("rounded-lg px-2.5 py-2 text-[12px] leading-4", ended ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger")}>
            {note}
          </p>
        )}

        <p className="text-[11px] leading-4 text-ink-tertiary">{scLabel("serverCloud.created", { date: formatCreatedAt(server.createdAt) })}</p>
      </div>

      <div className="mt-auto flex min-w-0 items-center gap-1.5 border-t border-hairline/35 px-2.5 py-2.5">
        {needsPayment || ended ? (
          <button type="button" disabled={busy} onClick={() => onRenew?.(server)} className="ui-button ui-button-primary ui-button-md gap-1.5">
            {busy ? <Loader2 size={13} className="animate-spin motion-reduce:animate-none" /> : <ArrowUpRight size={13} />}
            {endsWithLabel(needsPayment)}
          </button>
        ) : stopped ? (
          <button type="button" disabled={busyOrMoving} onClick={() => onStart?.(server)} className="ui-button ui-button-primary ui-button-md gap-1.5">
            {busyOrMoving ? <Loader2 size={13} className="animate-spin motion-reduce:animate-none" /> : <Power size={13} />}
            {scLabel("serverCloud.action.start")}
          </button>
        ) : running ? (
          <>
            <button type="button" disabled={busy} onClick={() => onOpen?.(server)} title={scLabel("serverCloud.action.openNamed", { name: server.name })} className="ui-button ui-button-primary ui-button-md gap-1.5">
              <ArrowUpRight size={13} />
              {scLabel("serverCloud.action.open")}
            </button>
            <button type="button" disabled={busy} onClick={() => onStop?.(server)} title={scLabel("serverCloud.action.stopNamed", { name: server.name })} className="ui-button ui-button-md gap-1.5">
              <Square size={12} />
              {scLabel("serverCloud.action.stop")}
            </button>
          </>
        ) : (
          <button type="button" disabled className="ui-button ui-button-md gap-1.5">
            <Loader2 size={13} className="animate-spin motion-reduce:animate-none" />
            {scLabel("serverCloud.action.working")}
          </button>
        )}

        <div className="ms-auto flex shrink-0 items-center gap-0.5">
          <IconAction label={scLabel("serverCloud.action.restartNamed", { name: server.name })} disabled={busyOrMoving || needsPayment} onClick={() => onRestart?.(server)}>
            <RotateCw size={14} className={cn(moving && "animate-spin motion-reduce:animate-none")} />
          </IconAction>
          <IconAction label={scLabel("serverCloud.action.terminalNamed", { name: server.name })} disabled={!running || busy} onClick={() => onTerminal?.(server)}>
            <Terminal size={14} />
          </IconAction>
          <IconAction label={scLabel("serverCloud.action.resizeNamed", { name: server.name })} disabled={busy || needsPayment} onClick={() => onResize?.(server)}>
            <CloudCog size={14} />
          </IconAction>
          <IconAction label={scLabel("serverCloud.action.settingsNamed", { name: server.name })} disabled={busy} onClick={() => onSettings?.(server)}>
            <Settings2 size={14} />
          </IconAction>
        </div>
      </div>
    </li>
  );
}

function endsWithLabel(paying: boolean): string {
  return scLabel(paying ? "serverCloud.action.pay" : "serverCloud.action.renew");
}

function Stat({ icon, label, value, muted }: { icon: ReactNode; label: string; value: string; muted: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.09em] text-ink-secondary">
        <span aria-hidden className="shrink-0 text-ink-tertiary">{icon}</span>
        <span className="truncate">{label}</span>
      </dt>
      <dd className={cn("mt-1 truncate text-[13px] font-medium tabular-nums", muted ? "text-ink-tertiary" : "text-ink")}>{value}</dd>
    </div>
  );
}

function IconAction({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="ui-icon-button">
      {children}
    </button>
  );
}

/** The tile's mark: a rack light that breathes while the server runs. */
function ServerGlyph({ running }: { running: boolean }) {
  return (
    <span className="relative flex flex-col items-center gap-[3px]">
      {[0, 1, 2].map((row) => (
        <span key={row} className="flex items-center gap-[3px]">
          <span className="size-1 rounded-[1px] bg-ink-secondary/70" />
          <span className={cn("h-1 w-4 rounded-[1px]", row === 0 ? "bg-[var(--sc-plan)]" : "bg-ink-secondary/40")} />
          {row === 0 && running && <span className="sc-pulse size-1 rounded-full bg-success" />}
        </span>
      ))}
    </span>
  );
}

export function ServerCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <li
      aria-hidden
      style={{ "--i": index } as CSSProperties}
      className="sc-rise flex min-w-0 flex-col overflow-hidden rounded-2xl border border-hairline/35 bg-card/60"
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <span className="size-10 shrink-0 animate-pulse rounded-xl bg-ink/[0.06] motion-reduce:animate-none" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="h-3.5 w-2/5 animate-pulse rounded-full bg-ink/[0.07] motion-reduce:animate-none" />
            <span className="h-2.5 w-3/5 animate-pulse rounded-full bg-ink/[0.05] motion-reduce:animate-none" />
          </span>
          <span className="h-5 w-20 shrink-0 animate-pulse rounded-full bg-ink/[0.06] motion-reduce:animate-none" />
        </div>
        <span className="h-2.5 w-4/5 animate-pulse rounded-full bg-ink/[0.05] motion-reduce:animate-none" />
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((meter) => (
            <span key={meter} className="flex flex-col gap-1.5">
              <span className="h-2 w-2/3 animate-pulse rounded-full bg-ink/[0.05] motion-reduce:animate-none" />
              <span className="h-1.5 w-full animate-pulse rounded-full bg-ink/[0.06] motion-reduce:animate-none" />
            </span>
          ))}
        </div>
        <span className="h-8 w-full animate-pulse rounded-lg bg-ink/[0.04] motion-reduce:animate-none" />
      </div>
      <div className="flex items-center gap-1.5 border-t border-hairline/30 px-2.5 py-2.5">
        <span className="h-7 w-20 animate-pulse rounded-lg bg-ink/[0.05] motion-reduce:animate-none" />
        <span className="ms-auto flex gap-1">
          {[0, 1, 2, 3].map((icon) => <span key={icon} className="size-8 animate-pulse rounded-lg bg-ink/[0.04] motion-reduce:animate-none" />)}
        </span>
      </div>
    </li>
  );
}
