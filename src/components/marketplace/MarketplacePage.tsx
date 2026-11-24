/**
 * Whilo Marketplace: one shelf for everything an agent can use — Apps, Plugins, Experts, Skills and
 * Bancos (the Brazilian banks a person connects through Pluggy). It is a page in the app, on the same
 * session and the same auth as chat: every tab reads the store the rest of the app uses.
 *
 * The Apps tab reuses PluginsPanel's connected-apps machinery by opening the panel itself, so there is
 * one implementation of connecting an app, not two.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Landmark,
  Link2,
  Loader2,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import {
  MARKETPLACE_EXPERTS,
  MARKETPLACE_PLUGINS,
  MARKETPLACE_TABS,
  bankShelf,
  marketplaceTab,
  matchBank,
  type MarketplaceTabId,
} from "@/lib/marketplace";
import {
  createPluggyConnectToken,
  fetchPluggyStatus,
  openPluggyConnect,
  type PluggyStatus,
} from "@/lib/pluggy";
import { pluggyConnectorForCompe } from "@/lib/pluggy-connectors";
import { useStore } from "@/state/store";

import { SkillsSection } from "../SkillsSection";

function TabBar({ active, onPick }: { active: MarketplaceTabId; onPick: (id: MarketplaceTabId) => void }) {
  return (
    <div role="tablist" aria-label={t("marketplace.title")} className="flex flex-wrap items-center gap-1.5">
      {MARKETPLACE_TABS.map((tab) => {
        const Icon = tab.icon;
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={on}
            data-marketplace-tab={tab.id}
            onClick={() => onPick(tab.id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              on ? "bg-ink text-app" : "bg-control/60 text-ink-secondary hover:bg-raised hover:text-ink",
            )}
          >
            <Icon size={14} aria-hidden="true" />
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

function AppsTab({ onOpenApps }: { onOpenApps: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-2xl border border-hairline/50 bg-card p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <Sparkles size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-ink">{t("marketplace.apps.heading")}</h2>
          <p className="mt-1 text-[13px] leading-5 text-ink-secondary">{t("marketplace.apps.body")}</p>
        </div>
        <button
          type="button"
          onClick={onOpenApps}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-ink px-4 py-2 text-[13px] font-semibold text-app transition-opacity hover:opacity-90"
        >
          {t("marketplace.apps.open")}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
      <p className="px-1 text-[12px] text-ink-tertiary">{t("marketplace.apps.note")}</p>
    </div>
  );
}

function PluginsTab() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {MARKETPLACE_PLUGINS.map((plugin) => (
        <article key={plugin.id} data-marketplace-plugin={plugin.id} className="flex flex-col gap-2 rounded-2xl border border-hairline/50 bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[14px] font-semibold text-ink">{plugin.name}</h3>
            <span className="shrink-0 rounded-full bg-control px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-secondary">{plugin.capability}</span>
          </div>
          <p className="flex-1 text-[12.5px] leading-5 text-ink-secondary">{plugin.description}</p>
          <span className={cn("mt-1 flex items-center gap-1.5 text-[12px] font-medium", plugin.included ? "text-emerald-500" : "text-ink-tertiary")}>
            {plugin.included ? <><Check size={13} aria-hidden="true" /> {t("marketplace.included")}</> : <><Plus size={13} aria-hidden="true" /> {t("marketplace.add")}</>}
          </span>
        </article>
      ))}
    </div>
  );
}

function ExpertsTab({ onHire }: { onHire: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {MARKETPLACE_EXPERTS.map((expert) => (
        <article key={expert.id} data-marketplace-expert={expert.id} className="flex flex-col gap-3 rounded-2xl border border-hairline/50 bg-card p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <BadgeCheck size={17} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-ink">{expert.name}</h3>
              <p className="text-[11px] uppercase tracking-wide text-ink-tertiary">{expert.role}</p>
            </div>
          </div>
          <p className="text-[12.5px] leading-5 text-ink-secondary">{expert.description}</p>
          <ul className="flex flex-col gap-1">
            {expert.does.map((task) => (
              <li key={task} className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
                <Check size={12} aria-hidden="true" className="shrink-0 text-accent" />
                {task}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onHire(expert.id)}
            className="mt-1 flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border border-hairline bg-raised text-[13px] font-semibold text-ink transition-colors hover:border-accent/50 hover:bg-accent/10"
          >
            <Plus size={14} aria-hidden="true" />
            {t("marketplace.experts.hire")}
          </button>
        </article>
      ))}
    </div>
  );
}

type BanksKind = "all" | ReturnType<typeof bankShelf>[number]["kind"];

function bankKindKey(kind: BanksKind): Parameters<typeof t>[0] {
  if (kind === "all") return "marketplace.banks.filterAll";
  return `marketplace.bank.kind.${kind}` as Parameters<typeof t>[0];
}

function BanksTab() {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<BanksKind>("all");
  const [status, setStatus] = useState<PluggyStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [connectingBank, setConnectingBank] = useState<string | null>(null);
  const [sessionConnected, setSessionConnected] = useState<Array<{ compe?: string; name?: string; itemId?: string }>>([]);
  const [notice, setNotice] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const mounted = useRef(true);

  const groups = useMemo(() => bankShelf(), []);
  const total = BRAZILIAN_COUNT;

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true);
    const controller = new AbortController();
    try {
      const next = await fetchPluggyStatus(controller.signal);
      if (mounted.current) setStatus(next);
    } catch {
      // aborted/unmounted: ignore
    } finally {
      if (mounted.current) setStatusLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refreshStatus();
    return () => {
      mounted.current = false;
    };
  }, [refreshStatus]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice((current) => (current === notice ? null : current)), notice.tone === "error" ? 7000 : 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const ready = status?.ready === true;
  const unavailable = status?.state === "unavailable";
  const statusError = status?.state === "error";

  const filtered = useMemo(() => {
    const byKind = kindFilter === "all" ? groups : groups.filter((group) => group.kind === kindFilter);
    return byKind
      .map((group) => ({ ...group, banks: group.banks.filter((bank) => matchBank(bank, query)) }))
      .filter((group) => group.banks.length > 0);
  }, [groups, kindFilter, query]);

  const matchedCount = useMemo(() => filtered.reduce((sum, group) => sum + group.banks.length, 0), [filtered]);

  const startConnect = useCallback(async (bank: { compe: string; name: string; short?: string }) => {
    if (!ready || connectingBank) return;
    setNotice(null);
    setConnectingBank(bank.compe);
    const mapped = pluggyConnectorForCompe(bank.compe);
    try {
      const token = await createPluggyConnectToken({
        connectorId: mapped?.connectorId,
        clientUserId: `whilo-bank-${bank.compe}`,
      });
      await openPluggyConnect({
        connectToken: token.accessToken,
        connectorId: mapped?.connectorId,
        sandbox: status?.sandbox,
        onSuccess: (result) => {
          if (!mounted.current) return;
          const itemId = result.item?.id;
          const connectedName = result.item?.connector?.name || bank.short || bank.name;
          setSessionConnected((prev) => {
            if (itemId && prev.some((entry) => entry.itemId === itemId)) return prev;
            return [...prev, { compe: bank.compe, name: connectedName, itemId }];
          });
          setNotice({ tone: "success", text: t("marketplace.banks.connectedSuccess", { name: connectedName }) });
          setConnectingBank(null);
        },
        onError: (message) => {
          if (!mounted.current) return;
          setNotice({ tone: "error", text: t("marketplace.banks.connectError", { reason: message || t("marketplace.banks.errorUnknown") }) });
          setConnectingBank(null);
        },
        onClose: () => {
          if (!mounted.current) return;
          setConnectingBank((current) => (current === bank.compe ? null : current));
        },
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown_error";
      if (mounted.current) {
        setNotice({ tone: "error", text: t("marketplace.banks.connectError", { reason }) });
        setConnectingBank(null);
      }
    }
  }, [connectingBank, ready, status?.sandbox]);

  const statusIcon = statusLoading
    ? <Loader2 size={15} className="animate-spin text-ink-secondary" aria-hidden="true" />
    : ready
      ? <CheckCircle2 size={15} className="text-emerald-500" aria-hidden="true" />
      : statusError
        ? <AlertCircle size={15} className="text-amber-500" aria-hidden="true" />
        : unavailable
          ? <Landmark size={15} className="text-ink-tertiary" aria-hidden="true" />
          : <Plug size={15} className="text-ink-tertiary" aria-hidden="true" />;

  const statusTitle = statusLoading
    ? t("marketplace.banks.statusChecking")
    : ready
      ? t("marketplace.banks.statusReady")
      : statusError
        ? t("marketplace.banks.statusError")
        : unavailable
          ? t("marketplace.banks.statusUnavailable")
          : t("marketplace.banks.statusUnconfigured");

  const statusBody = statusLoading
    ? t("marketplace.banks.statusCheckingBody")
    : ready
      ? t("marketplace.banks.statusReadyBody")
      : statusError
        ? t("marketplace.banks.statusErrorBody")
        : unavailable
          ? t("marketplace.banks.statusUnavailableBody")
          : t("marketplace.banks.pluggyNote");

  const filterKinds = useMemo(() => ["all", ...groups.map((g) => g.kind)] as BanksKind[], [groups]);
  const connectedCount = sessionConnected.length;
  const connectedCompe = useMemo(() => new Set(sessionConnected.map((e) => e.compe).filter(Boolean)), [sessionConnected]);

  return (
    <div className="flex flex-col gap-4" data-marketplace-banks>
      <div className="rounded-2xl border border-hairline/50 bg-card p-4 transition-colors">
        <div className="flex flex-wrap items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-control/70">
            {statusIcon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[14px] font-semibold text-ink">{statusTitle}</h2>
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                ready ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" : "bg-control text-ink-secondary",
              )}>
                <span className={cn("size-1.5 rounded-full", ready ? "bg-emerald-500" : statusLoading ? "bg-ink-tertiary animate-pulse" : "bg-ink-tertiary")} aria-hidden="true" />
                {ready ? t("marketplace.banks.badgeReady") : t("marketplace.banks.badgeCatalog")}
              </span>
              {connectedCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-medium text-accent">
                  <Link2 size={11} aria-hidden="true" />
                  {t("marketplace.banks.connectionsCount", { count: connectedCount })}
                </span>
              )}
            </div>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-secondary">{statusBody}</p>
            {status?.reason && !ready && !statusLoading && status.reason !== "backend_unavailable" && (
              <p className="mt-1 text-[11px] text-ink-tertiary">{t("marketplace.banks.statusReason", { reason: status.reason })}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshStatus()}
              disabled={statusLoading}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-hairline/60 bg-raised px-2.5 py-1.5 text-[12px] font-medium text-ink-secondary transition-colors hover:text-ink disabled:cursor-default disabled:opacity-50"
              aria-label={t("marketplace.banks.refresh")}
            >
              <RefreshCw size={13} className={cn(statusLoading && "animate-spin")} aria-hidden="true" />
              {t("marketplace.banks.refresh")}
            </button>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-tertiary">
          <Plug size={11} aria-hidden="true" />
          {t("marketplace.banks.poweredBy")}
        </p>
      </div>

      {notice && (
        <div
          role="status"
          className={cn(
            "flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] leading-5 transition-all",
            notice.tone === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            notice.tone === "error" && "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
            notice.tone === "info" && "border-hairline/50 bg-control/40 text-ink-secondary",
          )}
        >
          {notice.tone === "success" ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> : notice.tone === "error" ? <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> : <Link2 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />}
          <p className="min-w-0 flex-1">{notice.text}</p>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100" aria-label={t("common.close")}>
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2.5 rounded-full border border-hairline/50 bg-control/60 px-4 transition-colors focus-within:border-focus focus-within:bg-control/80">
            <Search size={15} className="shrink-0 text-ink-secondary" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("marketplace.banks.search")}
              aria-label={t("marketplace.banks.search")}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-secondary focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="cursor-pointer rounded p-0.5 text-ink-tertiary hover:text-ink" aria-label={t("common.close")}>
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </label>
          <span className="text-[12px] text-ink-tertiary">
            {t("marketplace.banks.showing", { shown: matchedCount, total })}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("marketplace.banks.filterLabel")}>
          {filterKinds.map((kind) => {
            const on = kindFilter === kind;
            return (
              <button
                key={kind}
                type="button"
                onClick={() => setKindFilter(kind)}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                  on ? "bg-ink text-app" : "bg-control/60 text-ink-secondary hover:bg-raised hover:text-ink",
                )}
              >
                {t(bankKindKey(kind))}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.map((group) => (
        <section key={group.kind} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-tertiary">{t(group.labelKey)}</h3>
            <span className="text-[11px] text-ink-tertiary/70">{group.banks.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
            {group.banks.map((bank) => {
              const connected = connectedCompe.has(bank.compe);
              const pending = connectingBank === bank.compe;
              const disabled = !ready || (!!connectingBank && !pending);
              return (
                <div
                  key={bank.compe}
                  data-marketplace-bank={bank.compe}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 transition-colors",
                    connected ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-hairline/40 hover:border-hairline/70",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-control text-[10px] font-semibold tabular-nums text-ink-secondary">{bank.compe}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-medium text-ink">{bank.short ?? bank.name}</span>
                      {connected && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={10} aria-hidden="true" />
                          {t("marketplace.banks.badgeConnected")}
                        </span>
                      )}
                    </div>
                    {bank.short && bank.short !== bank.name && (
                      <p className="truncate text-[11px] text-ink-tertiary">{bank.name}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void startConnect(bank)}
                    disabled={disabled}
                    title={!ready ? t("marketplace.banks.connectDisabledHint") : undefined}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all",
                      ready && !connectingBank
                        ? "cursor-pointer bg-accent/10 text-accent hover:bg-accent/18"
                        : pending
                          ? "cursor-wait bg-accent/10 text-accent"
                          : "cursor-not-allowed bg-control/60 text-ink-tertiary",
                    )}
                  >
                    {pending ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : connected ? <Check size={13} aria-hidden="true" /> : <Link2 size={13} aria-hidden="true" />}
                    {pending ? t("marketplace.banks.connecting") : connected ? t("marketplace.banks.connectAgain") : t("marketplace.banks.connect")}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Landmark size={28} className="text-ink-tertiary/40" aria-hidden="true" />
          <p className="text-[13px] text-ink-secondary">{t("marketplace.banks.empty")}</p>
          <button type="button" onClick={() => { setQuery(""); setKindFilter("all"); }} className="cursor-pointer text-[12px] font-medium text-accent hover:underline">
            {t("marketplace.banks.clearFilters")}
          </button>
        </div>
      )}
    </div>
  );
}

/** The catalogue size, read once so the header and the tab agree. */
const BRAZILIAN_COUNT = bankShelf().reduce((sum, group) => sum + group.banks.length, 0);

export function MarketplacePage() {
  const { state, dispatch } = useStore();
  const [active, setActive] = useState<MarketplaceTabId>("apps");
  const def = marketplaceTab(active);
  const skillsOn = state.config?.features?.skillsLibrary === true;

  return (
    <main data-marketplace className="flex min-w-0 flex-1 flex-col overflow-hidden bg-app text-ink animate-workspace-in">
      <header className="flex shrink-0 flex-col gap-3 border-b border-hairline/40 px-6 py-4 max-md:pl-12">
        <div className="flex items-center gap-2.5">
          <Sparkles size={18} className="text-accent" aria-hidden="true" />
          <h1 className="text-[17px] font-semibold">{t("marketplace.title")}</h1>
        </div>
        <p className="max-w-3xl text-[13px] leading-5 text-ink-secondary">{t("marketplace.subtitle")}</p>
        <TabBar active={active} onPick={setActive} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <p className="mb-4 text-[12.5px] text-ink-tertiary">{t(def.descriptionKey)}</p>
        {active === "apps" && <AppsTab onOpenApps={() => dispatch({ type: "togglePlugins", open: true })} />}
        {active === "plugins" && <PluginsTab />}
        {active === "experts" && <ExpertsTab onHire={() => dispatch({ type: "newBot" })} />}
        {active === "skills" && (
          skillsOn
            ? <SkillsSection />
            : <p data-marketplace-skills-off className="rounded-2xl border border-hairline/50 bg-card p-6 text-[13px] text-ink-secondary">{t("marketplace.skills.disabled")}</p>
        )}
        {active === "banks" && <BanksTab />}
      </div>
    </main>
  );
}
