import { For, Show, createMemo, createSignal, type Accessor } from "solid-js";
import type { AgentReasoningEffort } from "@whilo/contracts/ipc";
import type { AppTranslate } from "@whilo/i18n";
import { reasoningLabel } from "./ProviderModelPicker";

/**
 * A draggable effort track for the model picker: a glowing fill grows with the level, a thumb
 * travels along it, and the marks the thumb has passed light up. A drag always lands on a level
 * the model accepts, and the arrow keys move one level at a time.
 *
 * The stops are spread on the engine's own scale, so a model that offers only two levels gets two
 * marks across the same track.
 */

/** Where each level sits on the track, in ascending order. */
const STOP_PERCENT: Record<AgentReasoningEffort, number> = {
  none: 4,
  minimal: 12,
  low: 24,
  medium: 42,
  high: 62,
  xhigh: 82,
  max: 93,
  ultra: 100,
};

/** How strongly the fill glows at each level. */
const STOP_GLOW: Record<AgentReasoningEffort, number> = {
  none: 0.12,
  minimal: 0.24,
  low: 0.38,
  medium: 0.55,
  high: 0.72,
  xhigh: 0.86,
  max: 0.95,
  ultra: 1,
};

const stopOf = (level: AgentReasoningEffort): number => STOP_PERCENT[level];

function nearest(levels: readonly AgentReasoningEffort[], percent: number): AgentReasoningEffort {
  return levels.reduce((best, level) =>
    Math.abs(stopOf(level) - percent) < Math.abs(stopOf(best) - percent) ? level : best,
  levels[0]!);
}

export function EffortTrack(props: {
  levels: readonly AgentReasoningEffort[];
  value: Accessor<AgentReasoningEffort | undefined>;
  onPick: (level: AgentReasoningEffort) => void;
  disabled?: boolean;
  t: AppTranslate;
  label: string;
  resetLabel?: string;
  onReset?: () => void;
}) {
  const levels = createMemo(() => [...props.levels].sort((left, right) => stopOf(left) - stopOf(right)));
  const [draft, setDraft] = createSignal<number | null>(null);
  let track: HTMLDivElement | undefined;

  const index = createMemo(() => {
    const value = props.value();
    return value === undefined ? -1 : levels().indexOf(value);
  });
  const resting = createMemo(() => (index() >= 0 ? stopOf(levels()[index()]!) : 0));
  const percent = () => draft() ?? resting();
  const preview = createMemo(() => nearest(levels(), percent()));
  const shown = () => (draft() === null ? props.value() : preview());
  const glow = () => (shown() ? STOP_GLOW[shown()!] : 0);

  function percentAt(clientX: number): number {
    const rect = track?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }

  function commit(at: number): void {
    setDraft(null);
    const level = nearest(levels(), at);
    if (level !== props.value()) props.onPick(level);
  }

  return (
    <div class="effort-track-field" data-effort-track>
      <div class="effort-track-head">
        <span>{props.label}</span>
        <Show when={props.onReset} fallback={<Show when={props.value() === undefined}>{props.resetLabel}</Show>}>
          <button
            type="button"
            class="effort-track-reset"
            data-effort-track-reset
            title={props.resetLabel}
            disabled={props.value() === undefined}
            onClick={() => props.onReset?.()}
          >
            {props.resetLabel}
          </button>
        </Show>
      </div>
      <div
        ref={(element) => {
          track = element;
        }}
        class="effort-track"
        data-effort-track-rail="true"
        role="slider"
        tabindex={props.disabled ? -1 : 0}
        aria-label={props.label}
        aria-valuemin={0}
        aria-valuemax={levels().length - 1}
        aria-valuenow={Math.max(0, index())}
        aria-valuetext={shown() ? reasoningLabel(shown()!, props.t) : props.resetLabel}
        aria-disabled={props.disabled ? "true" : undefined}
        style={{ "--effort-percent": `${percent()}%`, "--effort-glow": String(glow()) }}
        onPointerDown={(event) => {
          if (props.disabled || (event.button !== 0 && event.pointerType === "mouse")) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDraft(percentAt(event.clientX));
        }}
        onPointerMove={(event) => {
          if (draft() === null) return;
          setDraft(percentAt(event.clientX));
        }}
        onPointerUp={(event) => {
          if (draft() === null) return;
          const at = percentAt(event.clientX);
          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch {}
          commit(at);
        }}
        onPointerCancel={() => setDraft(null)}
        onKeyDown={(event) => {
          if (props.disabled) return;
          const step = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1
            : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1
            : 0;
          if (step === 0) return;
          event.preventDefault();
          const from = index() >= 0 ? index() : 0;
          const next = levels()[Math.min(levels().length - 1, Math.max(0, from + step))];
          if (next && next !== props.value()) props.onPick(next);
        }}
      >
        <span class="effort-track-fill" aria-hidden="true" />
        <For each={levels()}>
          {(level) => (
            <span
              class="effort-track-stop"
              aria-hidden="true"
              data-effort-track-stop={level}
              data-passed={percent() >= stopOf(level) - 1 ? "true" : "false"}
              style={{ left: `${stopOf(level)}%` }}
            />
          )}
        </For>
        <span class="effort-track-thumb" aria-hidden="true" data-effort-track-thumb />
      </div>
      <div class="effort-track-scale" aria-hidden="true">
        <For each={levels()}>
          {(level, position) => (
            <>
              <Show when={position() > 0}>
                <span class="effort-track-dot">·</span>
              </Show>
              <span class={["effort-track-label", { "effort-track-current": shown() === level }]}>{reasoningLabel(level, props.t)}</span>
            </>
          )}
        </For>
      </div>
    </div>
  );
}