import { APP_CORNER_RADII, type AppCornerRadius } from "@whilo/contracts/ipc";
import type { AppTextKey } from "@whilo/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@whilo/ui";
import type { JSX } from "@solidjs/web";
import { useText } from "../../text";

/** Kobalte takes a mutable array. The contract list stays read-only, so copy it once here. */
const options: AppCornerRadius[] = [...APP_CORNER_RADII];

const CORNER_RADIUS_KEYS = {
  compact: "settings.cornerRadius.compact",
  default: "settings.cornerRadius.default",
  round: "settings.cornerRadius.round",
  pill: "settings.cornerRadius.pill",
} as const satisfies Record<AppCornerRadius, AppTextKey>;

export interface CornerRadiusSelectProps {
  value: AppCornerRadius;
  onChange: (value: AppCornerRadius) => void;
  /** The dialog element the popover portals into, as the other Settings selects receive it. */
  mount?: HTMLElement | undefined;
}

/** The corner radius row control: a sharper or a softer interface, or the released look. */
export function CornerRadiusSelect(props: CornerRadiusSelectProps): JSX.Element {
  const { t } = useText();
  const label = (value: AppCornerRadius | undefined) => (value === undefined ? "" : t(CORNER_RADIUS_KEYS[value]));

  return (
    <Select<AppCornerRadius>
      class="settings-modal-select"
      options={options}
      value={props.value}
      onChange={(value) => value && props.onChange(value)}
      placement="bottom-end"
      itemComponent={(itemProps) => <SelectItem item={itemProps.item}>{label(itemProps.item.rawValue)}</SelectItem>}
    >
      <SelectTrigger size="sm" aria-label={t("settings.cornerRadius.title")}>
        <SelectValue<AppCornerRadius>>{(state) => label(state.selectedOption())}</SelectValue>
      </SelectTrigger>
      <SelectContent mount={props.mount} />
    </Select>
  );
}
