import { APP_ACCENT_COLORS, APP_ACCENTS, type AppAccent } from "@whilo/contracts/ipc";
import type { AppTextKey } from "@whilo/i18n";
import { Button } from "@whilo/ui";
import type { JSX } from "@solidjs/web";
import { For } from "solid-js";
import { useText } from "../../text";

const ACCENT_LABEL_KEYS = {
  blue: "settings.accent.blue",
  violet: "settings.accent.violet",
  teal: "settings.accent.teal",
  amber: "settings.accent.amber",
  rose: "settings.accent.rose",
  graphite: "settings.accent.graphite",
  lagoon: "settings.accent.lagoon",
  ember: "settings.accent.ember",
} as const satisfies Record<AppAccent, AppTextKey>;

export interface AccentPickerProps {
  value: AppAccent;
  onChange: (value: AppAccent) => void;
}

/** One swatch for each accent, in the same shape as the logo color grid. */
export function AccentPicker(props: AccentPickerProps): JSX.Element {
  const { t } = useText();
  return (
    <fieldset class="accent-grid" aria-label={t("settings.accent.title")}>
      <For each={APP_ACCENTS}>
        {(accent) => (
          <Button
            variant="ghost"
            type="button"
            class={["accent-choice", { "accent-choice-selected": props.value === accent }]}
            aria-label={t(ACCENT_LABEL_KEYS[accent])}
            aria-pressed={props.value === accent ? "true" : "false"}
            data-cuelume-tap="select"
            onClick={() => props.onChange(accent)}
          >
            <span
              class="accent-choice-swatch"
              style={{ background: APP_ACCENT_COLORS[accent].swatch }}
            />
          </Button>
        )}
      </For>
    </fieldset>
  );
}
