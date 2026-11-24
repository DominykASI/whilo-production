import { useMemo, type CSSProperties } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/cn";
import { whiloText } from "@/lib/whilo-workflow-text";

export interface UsageMeter {
  id: string;
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

export interface UsagePageProps {
  meters?: UsageMeter[];
  planName?: string;
}

const DEFAULT_METERS: UsageMeter[] = [
  { id: "tokens", label: "whiloUsage.tokens", used: 1_240_000, limit: 2_000_000, unit: "tokens" },
  { id: "messages", label: "whiloUsage.messages", used: 8_400, limit: 10_000, unit: "whiloUsage.messages" },
  { id: "runs", label: "whiloUsage.runs", used: 320, limit: 500, unit: "whiloUsage.runs" },
  { id: "storage", label: "whiloUsage.storage", used: 6.2, limit: 10, unit: "GB" },
];

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
}

function fillClass(percent: number): string {
  if (percent > 95) return "bg-gradient-to-r from-red-500 to-red-400";
  if (percent > 80) return "bg-gradient-to-r from-amber-500 to-amber-400";
  return "bg-gradient-to-r from-accent to-accent/50";
}

function MeterRow({ meter }: { meter: UsageMeter }) {
  const ratio = meter.limit <= 0 ? 0 : meter.used / meter.limit;
  const percent = Math.min(100, Math.max(0, ratio * 100));
  const width: CSSProperties = { width: `${percent}%` };
  const unit = meter.unit ? ` ${meter.unit.startsWith("whiloUsage.") ? whiloText(meter.unit) : meter.unit}` : "";

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-hairline bg-card p-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-ink">{whiloText(meter.label)}</span>
        <span className="text-xs text-ink-secondary">
          {formatNumber(meter.used)} / {formatNumber(meter.limit)}
          {unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-inset">
        <div className={cn("h-full rounded-full transition-[width] duration-500", fillClass(percent))} style={width} />
      </div>
    </div>
  );
}

export function UsagePage({ meters, planName = "Plano Pro" }: UsagePageProps) {
  const list = meters ?? DEFAULT_METERS;

  const overall = useMemo(() => {
    let used = 0;
    let limit = 0;
    for (const meter of list) {
      used += meter.used;
      limit += meter.limit;
    }
    const ratio = limit <= 0 ? 0 : used / limit;
    return Math.min(100, Math.max(0, ratio * 100));
  }, [list]);

  const renewalDays = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.max(1, end.getDate() - now.getDate());
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-app text-ink">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight">{whiloText("whiloUsage.title")}</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-hairline bg-inset px-3 py-1 text-xs text-ink-secondary">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
            {planName}
          </span>
        </header>

        <section className="flex flex-col gap-4 rounded-2xl border border-hairline bg-card p-6">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-ink-secondary">{whiloText("whiloUsage.overall")}</span>
              <span className="text-4xl font-semibold tabular-nums">{overall.toFixed(0)}%</span>
            </div>
            <span className="text-sm text-ink-secondary">{whiloText("whiloUsage.renews", { days: renewalDays })}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-inset">
            <div
              className={cn("h-full rounded-full transition-[width] duration-500", fillClass(overall))}
              style={{ width: `${overall}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-ink-secondary">{whiloText("whiloUsage.quotas")}</span>
            <button
              type="button"
              className="cursor-pointer rounded-full border border-hairline bg-inset px-3.5 py-1.5 text-sm text-ink transition-colors hover:bg-white/[0.04]"
            >
              {whiloText("whiloUsage.manage")}
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          {list.map((meter) => (
            <MeterRow key={meter.id} meter={meter} />
          ))}
        </section>
      </div>
    </div>
  );
}
