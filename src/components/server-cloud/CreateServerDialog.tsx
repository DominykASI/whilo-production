import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Cloud, HardDriveDownload, Loader2, MapPin, Users, X, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { randomUuid } from "@/lib/random-uuid";

import { scLabel } from "./copy";
import { formatMoney } from "./format";
import {
  DEFAULT_SERVER_CATALOG,
  DEFAULT_SERVER_REGION,
  SERVER_REGIONS,
  SERVER_SIZES,
  planPriceMinor,
  planSize,
  regionFlag,
  type CreateServerInput,
  type ServerCatalog,
  type ServerCurrency,
  type ServerInterval,
  type ServerPlan,
  type ServerRegion,
} from "./types";

export interface CreateServerDialogProps {
  open: boolean;
  catalog?: ServerCatalog;
  regions?: readonly ServerRegion[];
  currency?: ServerCurrency;
  maxServers?: number | null;
  serverCount?: number;
  available?: boolean;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onCreate?: (input: CreateServerInput) => void | Promise<void>;
}

const PLAN_NAME: Record<ServerPlan, Parameters<typeof scLabel>[0]> = {
  starter: "serverCloud.plan.starter",
  standard: "serverCloud.plan.standard",
  pro: "serverCloud.plan.pro",
};

const SIZE_NAME = { small: "serverCloud.size.small", default: "serverCloud.size.default", large: "serverCloud.size.large" } as const;

const NAME_MIN = 6;
const NAME_MAX = 32;
const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function CreateServerDialog({
  open, catalog = DEFAULT_SERVER_CATALOG, regions = SERVER_REGIONS, currency = "eur",
  maxServers = null, serverCount = 0, available = true, busy = false, error = null, onClose, onCreate,
}: CreateServerDialogProps) {
  const titleId = useId();
  const nameId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<ServerPlan>("standard");
  const [region, setRegion] = useState(DEFAULT_SERVER_REGION);
  const [interval, setInterval] = useState<ServerInterval>("month");
  const requestId = useRef(randomUuid());
  const trimmed = name.trim();
  const nameValid = trimmed.length >= NAME_MIN && trimmed.length <= NAME_MAX;
  const soldOut = catalog.plans.find((entry) => entry.id === plan)?.soldOut === true;
  const atLimit = maxServers !== null && serverCount >= maxServers;
  const known = useMemo(() => new Set(catalog.plans.map((entry) => entry.id)), [catalog]);
  const chosenPlan = useMemo(() => (known.has(plan) ? plan : catalog.plans[0]?.id ?? "standard"), [known, plan, catalog.plans]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    requestId.current = randomUuid();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
      if (!controls.length) return;
      event.preventDefault();
      const at = controls.indexOf(document.activeElement as HTMLElement);
      controls[at === -1 ? 0 : (at + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]!.focus();
    };
    window.addEventListener("keydown", onKey, true);
    const timer = window.setTimeout(() => {
      const field = dialogRef.current?.querySelector<HTMLInputElement>("[data-server-name]");
      (field ?? dialogRef.current)?.focus();
    }, 40);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey, true);
      if (opener?.isConnected) opener.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  const disabled = !available || atLimit || !nameValid || soldOut || busy;

  const submit = () => {
    if (disabled) return;
    void onCreate?.({ name: trimmed, plan: chosenPlan, interval, currency, region, requestId: requestId.current });
  };

  return createPortal(
    <div
      data-server-create-dialog
      className="ui-scrim fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-pop-in my-auto flex max-h-[100dvh] w-full max-w-[720px] flex-col overflow-hidden rounded-t-3xl border border-hairline/50 bg-panel text-ink shadow-2xl outline-none sm:max-h-[min(88dvh,860px)] sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-hairline/40 px-5 py-4">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl border border-hairline/40 bg-inset text-accent">
            <Cloud size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[17px] font-semibold leading-6 tracking-[-0.01em]">{scLabel("serverCloud.dialog.title")}</h2>
            <p className="mt-0.5 text-[13px] leading-[18px] text-ink-secondary">{scLabel("serverCloud.dialog.subtitle")}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label={scLabel("serverCloud.dialog.close")} className="ui-icon-button -me-1 -mt-0.5 shrink-0">
            <X size={16} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 py-5">
          {!available && <p role="alert" className="rounded-xl bg-warning/10 px-3.5 py-2.5 text-[13px] leading-[18px] text-warning">{scLabel("serverCloud.unavailable")}</p>}
          {atLimit && <p role="alert" className="rounded-xl bg-warning/10 px-3.5 py-2.5 text-[13px] leading-[18px] text-warning">{scLabel("serverCloud.dialog.limit", { count: maxServers ?? 0 })}</p>}
          {error && <p role="alert" className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-[13px] leading-[18px] text-danger">{error}</p>}

          <section className="flex flex-col gap-2">
            <label htmlFor={nameId} className="text-[13px] font-medium leading-[18px] text-ink">{scLabel("serverCloud.dialog.name")}</label>
            <input
              id={nameId}
              data-server-name
              value={name}
              maxLength={NAME_MAX}
              disabled={busy}
              autoComplete="off"
              spellCheck={false}
              placeholder={scLabel("serverCloud.dialog.namePlaceholder")}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
              className="h-10 w-full rounded-xl border border-hairline/50 bg-inset px-3.5 text-[14px] text-ink outline-none transition-colors duration-150 placeholder:text-ink-tertiary focus:border-accent/70 focus-visible:ring-[1.5px] focus-visible:ring-focus motion-reduce:transition-none disabled:opacity-60"
            />
            <p className={cn("text-[12px] leading-4", trimmed.length > 0 && !nameValid ? "text-warning" : "text-ink-tertiary")}>
              {trimmed.length > 0 && !nameValid ? scLabel("serverCloud.dialog.nameInvalid") : scLabel("serverCloud.dialog.nameHint")}
            </p>
          </section>

          <section className="flex flex-col gap-2.5" aria-labelledby={`${titleId}-region`}>
            <SectionHeading id={`${titleId}-region`} icon={<MapPin size={14} />} title={scLabel("serverCloud.dialog.chooseRegion")} hint={scLabel("serverCloud.dialog.regionHint")} />
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {regions.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  disabled={busy}
                  aria-pressed={entry.id === region}
                  data-region={entry.id}
                  onClick={() => setRegion(entry.id)}
                  className={cn(
                    "flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors duration-150 motion-reduce:transition-none",
                    entry.id === region ? "border-accent/60 bg-accent/10 text-ink" : "border-hairline/40 bg-inset text-ink-secondary hover:border-hairline/70 hover:text-ink",
                  )}
                >
                  <span aria-hidden className="shrink-0 text-[15px] leading-none">{regionFlag(entry.code)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium leading-4 text-ink">{entry.city}</span>
                    <span className="block truncate text-[11px] leading-4 text-ink-secondary">{entry.label.split(" · ")[0]}</span>
                  </span>
                  {entry.id === region && <Check size={14} aria-hidden className="shrink-0 text-accent" />}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2.5" aria-labelledby={`${titleId}-plan`}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHeading id={`${titleId}-plan`} icon={<Zap size={14} />} title={scLabel("serverCloud.dialog.choosePlan")} hint={scLabel("serverCloud.dialog.planHint")} />
              <div role="radiogroup" aria-label={scLabel("serverCloud.dialog.choosePlan")} className="flex overflow-hidden rounded-full border border-hairline/50">
                {(["month", "year"] as const).map((entry, index) => (
                  <button
                    key={entry}
                    type="button"
                    role="radio"
                    aria-checked={entry === interval}
                    disabled={busy}
                    onClick={() => setInterval(entry)}
                    className={cn(
                      "px-3 py-1 text-[12px] font-medium transition-colors duration-150 motion-reduce:transition-none",
                      index > 0 && "border-l border-hairline/50",
                      entry === interval ? "bg-raised text-ink" : "text-ink-secondary hover:bg-raised/50 hover:text-ink",
                    )}
                  >
                    {scLabel(entry === "month" ? "serverCloud.dialog.interval.month" : "serverCloud.dialog.interval.year")}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {catalog.plans.map((entry) => {
                const size = planSize(entry.id);
                const spec = SERVER_SIZES[size];
                const price = planPriceMinor(catalog, entry.id, interval, currency);
                const selected = entry.id === chosenPlan;
                const out = entry.soldOut === true;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    disabled={busy || out}
                    aria-pressed={selected}
                    data-plan={entry.id}
                    onClick={() => setPlan(entry.id)}
                    className={cn(
                      "flex min-w-0 flex-col gap-2 rounded-2xl border p-3.5 text-left transition-[border-color,background-color,transform] duration-200 motion-reduce:transition-none",
                      selected ? "border-accent/60 bg-accent/[0.08]" : "border-hairline/40 bg-inset hover:border-hairline/70",
                      out && "cursor-not-allowed opacity-55",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[14px] font-semibold leading-5 text-ink">{scLabel(PLAN_NAME[entry.id])}</span>
                      {selected ? <Check size={15} aria-hidden className="shrink-0 text-accent" /> : out ? <span className="shrink-0 text-[11px] text-ink-secondary">{scLabel("serverCloud.dialog.soldOut")}</span> : null}
                    </span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-[20px] font-semibold leading-6 tabular-nums tracking-[-0.015em] text-ink">{price === null ? "—" : formatMoney(price, currency)}</span>
                      <span className="text-[12px] text-ink-tertiary">{scLabel(interval === "month" ? "serverCloud.dialog.perMonth" : "serverCloud.dialog.perYear")}</span>
                    </span>
                    <span className="flex flex-col gap-1.5 text-[12px] leading-4 text-ink-secondary">
                      <span className="flex items-center gap-1.5"><ServerStack /> {scLabel("serverCloud.spec", { size: scLabel(SIZE_NAME[size]), vcpu: spec.vcpu, memory: spec.memoryGb, disk: spec.diskGb })}</span>
                      <span className="flex items-center gap-1.5"><HardDriveDownload size={13} aria-hidden className="shrink-0 text-ink-tertiary" /> {entry.diskGb} GB storage</span>
                      <span className="flex items-center gap-1.5"><Users size={13} aria-hidden className="shrink-0 text-ink-tertiary" /> {scLabel("serverCloud.dialog.members", { count: entry.memberLimit })}</span>
                      <span className="flex items-center gap-1.5"><Zap size={13} aria-hidden className="shrink-0 text-ink-tertiary" /> {scLabel("serverCloud.dialog.speed", { count: entry.relativeSpeed })}</span>
                    </span>
                    {interval === "year" && <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success">{scLabel("serverCloud.dialog.yearlySave")}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-hairline/40 px-5 py-3.5">
          <p className="min-w-0 flex-1 truncate text-[12px] leading-4 text-ink-secondary">
            {priceLine(catalog, chosenPlan, interval, currency)}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={onClose} disabled={busy} className="ui-button ui-button-md">{scLabel("serverCloud.dialog.cancel")}</button>
            <button type="button" onClick={submit} disabled={disabled} className="ui-button ui-button-primary ui-button-md gap-1.5">
              {busy && <Loader2 size={13} className="animate-spin motion-reduce:animate-none" />}
              {busy ? scLabel("serverCloud.dialog.creating") : scLabel("serverCloud.dialog.create")}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function priceLine(catalog: ServerCatalog, plan: ServerPlan, interval: ServerInterval, currency: ServerCurrency): string {
  const price = planPriceMinor(catalog, plan, interval, currency);
  if (price === null) return "";
  if (interval === "month") return `${formatMoney(price, currency)}${scLabel("serverCloud.dialog.perMonth")}`;
  const monthly = formatMoney(Math.round(price / 12), currency);
  return `${formatMoney(price, currency)}${scLabel("serverCloud.dialog.perYear")} · ${scLabel("serverCloud.dialog.billedMonthly", { amount: monthly })}`;
}

function SectionHeading({ id, icon, title, hint }: { id: string; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="min-w-0">
      <span id={id} className="flex items-center gap-1.5 text-[13px] font-medium leading-[18px] text-ink">
        <span aria-hidden className="shrink-0 text-ink-tertiary">{icon}</span>
        {title}
      </span>
      <span className="mt-0.5 block text-[12px] leading-4 text-ink-tertiary">{hint}</span>
    </div>
  );
}

/** A miniature rack, so a plan's row carries the same mark as the card that follows it. */
function ServerStack() {
  return (
    <span aria-hidden className="flex shrink-0 flex-col gap-[2px]">
      {[0, 1].map((row) => <span key={row} className={cn("h-1 w-3 rounded-[1px]", row === 0 ? "bg-accent" : "bg-ink-secondary/40")} />)}
    </span>
  );
}
