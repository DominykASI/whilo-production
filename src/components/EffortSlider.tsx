import { useMemo, useRef, useState } from "react";
import type { EffortLevel } from "../../shared/wire";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";

/**
 * A draggable effort track. It reads like a physical control: a glowing fill grows with the level,
 * a thumb travels along it, and the marks that the thumb has passed light up. The track snaps to the
 * levels the engine offers, so a drag always lands on a value the provider will accept.
 *
 * The visual scale is the engine's own order (`EFFORT_LEVELS`), so an engine that offers only
 * `low`/`high` gets two stops spread across the same track.
 */

/** The share of the track each level sits at, in the engine's ascending order. */
const STOP_PERCENT: Record<EffortLevel, number> = {
  none: 6,
  low: 22,
  medium: 40,
  high: 62,
  xhigh: 82,
  max: 100,
};

/** The intensity of the fill at each level: the track warms up as the effort grows. */
const LEVEL_STRENGTH: Record<EffortLevel, number> = {
  none: 0.18,
  low: 0.34,
  medium: 0.52,
  high: 0.72,
  xhigh: 0.86,
  max: 1,
};

function stopOf(level: EffortLevel): number {
  return STOP_PERCENT[level];
}

export function EffortSlider({
  levels,
  current,
  onPick,
  onReset,
  className,
  compact = false,
}: {
  levels: readonly EffortLevel[];
  current: EffortLevel | undefined;
  onPick: (level: EffortLevel) => void;
  onReset: () => void;
  className?: string;
  compact?: boolean;
}) {
  const sorted = useMemo(
    () => [...levels].sort((left, right) => stopOf(left) - stopOf(right)),
    [levels],
  );
  const activeIndex = current === undefined ? -1 : sorted.indexOf(current);
  const [dragPercent, setDragPercent] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const labelId = useRef(`effort-${Math.random().toString(36).slice(2, 9)}`).current;

  if (sorted.length === 0) return null;

  const restingPercent = activeIndex >= 0 ? stopOf(sorted[activeIndex]!) : 0;
  const percent = dragPercent ?? restingPercent;
  const previewLevel = nearestLevel(sorted, percent);
  const shownLevel = dragPercent === null ? current : previewLevel;
  const strength = shownLevel ? LEVEL_STRENGTH[shownLevel] : 0;

  const percentAt = (clientX: number): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  };

  const commit = (value: number) => {
    setDragPercent(null);
    const level = nearestLevel(sorted, value);
    if (level !== current) onPick(level);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragPercent(percentAt(event.clientX));
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragPercent === null) return;
    setDragPercent(percentAt(event.clientX));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragPercent === null) return;
    const value = percentAt(event.clientX);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
    commit(value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1
      : 0;
    if (step === 0) return;
    event.preventDefault();
    const from = activeIndex >= 0 ? activeIndex : 0;
    const next = sorted[Math.min(sorted.length - 1, Math.max(0, from + step))];
    if (next && next !== current) onPick(next);
  };

  return (
    <div data-effort-slider className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span id={labelId} className="text-[11px] font-medium uppercase tracking-[0.13em] text-ink-tertiary">
          {t("model.section.effort")}
        </span>
        {current === undefined ? (
          <button
            type="button"
            data-effort-slider-reset
            onClick={onReset}
            disabled
            className="text-[11.5px] text-ink-tertiary"
          >
            {t("model.effort.default")}
          </button>
        ) : (
          <button
            type="button"
            data-effort-slider-reset
            onClick={onReset}
            title={t("model.effort.noLevel")}
            className="rounded-[5px] px-1 text-[11.5px] text-ink-secondary transition-colors hover:bg-ink/[0.06] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {t("model.effort.default")}
          </button>
        )}
      </div>

      <div
        ref={trackRef}
        data-effort-slider-track
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={sorted.length - 1}
        aria-valuenow={Math.max(0, activeIndex)}
        aria-valuetext={shownLevel ? labelOf(shownLevel) : t("model.effort.default")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDragPercent(null)}
        onKeyDown={onKeyDown}
        className={cn(
          "relative select-none rounded-full border border-hairline/45 bg-ink/[0.05] shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1 focus-visible:ring-offset-base",
          dragPercent !== null ? "cursor-grabbing" : "cursor-grab",
          compact ? "h-8" : "h-10",
        )}
        style={{ touchAction: "none" }}
      >
        <div
          data-effort-slider-fill
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-[3px] left-[3px] rounded-full transition-[width,opacity] duration-300 ease-[cubic-bezier(.23,1,.32,1)]"
          style={{
            width: `calc(${percent}% - 6px)`,
            background:
              "linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 45%, transparent), var(--color-accent) 55%, var(--color-accent-border))",
            opacity: shownLevel ? 0.35 + strength * 0.65 : 0.12,
            boxShadow: shownLevel
              ? `0 0 ${Math.round(10 + strength * 22)}px color-mix(in srgb, var(--color-accent) ${Math.round(28 + strength * 40)}%, transparent)`
              : "none",
          }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full opacity-60 mix-blend-overlay"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 42%, rgba(0,0,0,.28) 100%)" }}
          />
        </div>

        {sorted.map((level) => {
          const at = stopOf(level);
          const passed = percent >= at - 1;
          return (
            <span
              key={level}
              aria-hidden="true"
              data-effort-slider-stop={level}
              data-passed={passed ? "true" : "false"}
              className={cn(
                "pointer-events-none absolute top-1/2 size-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all",
                passed ? "bg-accent-border shadow-[0_0_7px_var(--color-accent-border)]" : "bg-ink/30",
              )}
              style={{ left: `${at}%` }}
            />
          );
        })}

        <span
          aria-hidden="true"
          data-effort-slider-thumb
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[left,box-shadow] duration-300 ease-[cubic-bezier(.23,1,.32,1)]",
            compact ? "size-6" : "size-7",
            shownLevel ? "border-white/70" : "border-white/35",
          )}
          style={{
            left: `${percent}%`,
            background: shownLevel
              ? `radial-gradient(circle at 32% 30%, #ffffff 0%, var(--color-accent-border) 38%, var(--color-accent) 88%)`
              : "radial-gradient(circle at 32% 30%, #f5f5f5 0%, #9a9a9a 60%, #5f5f5f 100%)",
            boxShadow: shownLevel
              ? `0 0 0 2px rgba(255,255,255,.28), 0 ${compact ? 4 : 7}px ${compact ? 12 : 20}px color-mix(in srgb, var(--color-accent) ${Math.round(30 + strength * 35)}%, transparent)`
              : "0 0 0 2px rgba(255,255,255,.16)",
          }}
        />
      </div>

      {!compact && (
        <p data-effort-slider-hint className="text-[10px] leading-4 tracking-[0.04em] text-ink-tertiary">
          {sorted.map((level, index) => (
            <span key={level}>
              {index > 0 && <span className="mx-1 opacity-50">·</span>}
              <span className={cn(shownLevel === level && "font-medium text-ink-secondary")}>{labelOf(level)}</span>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function labelOf(level: EffortLevel): string {
  return t(`model.effort.${level}` as Parameters<typeof t>[0]);
}

/** The level whose stop is closest to a percent on the track. */
function nearestLevel(levels: readonly EffortLevel[], percent: number): EffortLevel {
  let best = levels[0]!;
  let distance = Number.POSITIVE_INFINITY;
  for (const level of levels) {
    const gap = Math.abs(stopOf(level) - percent);
    if (gap < distance) {
      distance = gap;
      best = level;
    }
  }
  return best;
}

/** Kept for the caller that only needs the layout math. */
export function effortTrackPercent(level: EffortLevel): number {
  return stopOf(level);
}

