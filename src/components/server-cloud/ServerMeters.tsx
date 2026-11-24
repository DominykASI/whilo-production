import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

import { scLabel } from "./copy";
import { SERVER_SIZES, type ServerMeter, type ServerSize, type ServerState } from "./types";

export type MeterKind = "cpu" | "ram" | "disk";

const LABEL = { cpu: "serverCloud.meter.cpu", ram: "serverCloud.meter.ram", disk: "serverCloud.meter.disk" } as const;

/** A ladder of tones: calm under three quarters, a warning past it, a lamp past nine tenths. */
function band(value: number): "ok" | "near" | "full" {
  return value >= 0.9 ? "full" : value >= 0.75 ? "near" : "ok";
}

const TONE: Record<"ok" | "near" | "full", string> = {
  ok: "var(--color-accent)",
  near: "var(--color-warning)",
  full: "var(--color-danger)",
};

/** The hue each meter keeps whatever its band: CPU cool, memory violet, disk teal. */
const HUE: Record<MeterKind, [string, string]> = {
  cpu: ["var(--color-accent)", "color-mix(in srgb, var(--color-accent) 45%, var(--color-accent-text))"],
  ram: ["color-mix(in srgb, var(--color-accent) 45%, #a78bfa)", "#c4b5fd"],
  disk: ["var(--color-accent)", "color-mix(in srgb, var(--color-accent) 40%, teal)"],
};

function amountGb(used: number, totalGb: number): string {
  const usedGb = Math.round(used * totalGb * 10) / 10;
  return `${usedGb} / ${totalGb} GB`;
}

export interface ServerMetersProps {
  meters?: ServerMeter;
  size: ServerSize;
  state: ServerState;
  /** A compact three-column strip for a card; `wide` gives each meter its own line. */
  layout?: "strip" | "rows";
  className?: string;
}

export function ServerMeters({ meters, size, state, layout = "strip", className }: ServerMetersProps) {
  const spec = SERVER_SIZES[size];
  const live = state === "running" && meters !== undefined;
  const rows: Array<{ kind: MeterKind; value: number | undefined; detail: string }> = [
    { kind: "cpu", value: meters?.cpu, detail: scLabel("serverCloud.meter.vcpu", { used: perc(meters?.cpu, spec.vcpu), total: spec.vcpu }) },
    { kind: "ram", value: meters?.ram, detail: amountGb(meters?.ram ?? 0, spec.memoryGb) },
    { kind: "disk", value: meters?.disk, detail: amountGb(meters?.disk ?? 0, spec.diskGb) },
  ];
  return (
    <dl
      data-server-meters={layout}
      data-live={live ? "" : undefined}
      className={cn(layout === "strip" ? "grid grid-cols-3 gap-2.5" : "flex flex-col gap-2.5", className)}
    >
      {rows.map((row) => <MeterRow key={row.kind} kind={row.kind} value={row.value} detail={row.detail} live={live} layout={layout} />)}
    </dl>
  );
}

function perc(value: number | undefined, total: number): number {
  return value === undefined ? 0 : Math.max(1, Math.round(value * total));
}

function MeterRow({ kind, value, detail, live, layout }: { kind: MeterKind; value: number | undefined; detail: string; live: boolean; layout: "strip" | "rows" }) {
  const label = scLabel(LABEL[kind]);
  const known = value !== undefined;
  const percent = known ? Math.round(Math.max(0, Math.min(1, value)) * 100) : 0;
  const tone = TONE[known ? band(percent / 100) : "ok"];
  const [from, to] = HUE[kind];
  const style = { "--sc-meter-from": from, "--sc-meter-to": tone === TONE.ok ? to : tone } as CSSProperties;
  return (
    <div className="min-w-0" data-server-meter={kind}>
      <div className={cn("flex min-w-0 items-baseline gap-1.5", layout === "strip" ? "mb-1 flex-col gap-0" : "mb-1 justify-between")}>
        <dt className="text-[10px] font-medium uppercase tracking-[0.09em] text-ink-secondary">{label}</dt>
        <dd className={cn("truncate tabular-nums", layout === "strip" ? "text-[12px]" : "text-[12px]", known ? "text-ink" : "text-ink-tertiary")}>
          {known ? `${percent}%` : "—"}
        </dd>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} · ${detail}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={known ? percent : undefined}
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-inset"
      >
        <div
          style={{ ...style, width: `${known ? Math.max(percent, 3) : 0}%` }}
          className={cn(
            "relative h-full overflow-hidden rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
            "bg-[linear-gradient(90deg,var(--sc-meter-from),var(--sc-meter-to))]",
            known && live && "sc-sheen",
          )}
        />
      </div>
    </div>
  );
}
