import { useState, type ReactNode } from "react";
import { t } from "@/lib/i18n";
import type { LocaleKey } from "@/locales";
import { Select } from "../Select";
import { SettingRow, Switch } from "../SettingsPrimitives";

export function SwitchRow({
  titleKey,
  descriptionKey,
  initial = false,
  disabled = false,
}: {
  titleKey: LocaleKey;
  descriptionKey?: LocaleKey;
  initial?: boolean;
  disabled?: boolean;
}) {
  const [on, setOn] = useState(initial);
  return (
    <SettingRow title={t(titleKey)} subtitle={descriptionKey ? t(descriptionKey) : undefined}>
      <Switch checked={on} disabled={disabled} aria-label={t(titleKey)} onClick={() => setOn(!on)} />
    </SettingRow>
  );
}

export function SelectRow<T extends string>({
  titleKey,
  descriptionKey,
  options,
  initial,
  disabled = false,
}: {
  titleKey: LocaleKey;
  descriptionKey?: LocaleKey;
  options: readonly { value: T; labelKey: LocaleKey }[];
  initial: T;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<T>(initial);
  return (
    <SettingRow title={t(titleKey)} subtitle={descriptionKey ? t(descriptionKey) : undefined}>
      <Select
        size="sm"
        className="w-full max-w-[240px]"
        value={value}
        disabled={disabled}
        aria-label={t(titleKey)}
        onChange={(event) => setValue(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </Select>
    </SettingRow>
  );
}

export function SegmentedRow<T extends string>({
  titleKey,
  descriptionKey,
  options,
  initial,
  disabled = false,
}: {
  titleKey: LocaleKey;
  descriptionKey?: LocaleKey;
  options: readonly { value: T; labelKey: LocaleKey }[];
  initial: T;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<T>(initial);
  return (
    <SettingRow title={t(titleKey)} subtitle={descriptionKey ? t(descriptionKey) : undefined}>
      <div role="radiogroup" aria-label={t(titleKey)} className="inline-flex flex-wrap gap-1 rounded-lg bg-inset p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            disabled={disabled}
            onClick={() => setValue(option.value)}
            className={
              value === option.value
                ? "rounded-md bg-raised px-2.5 py-1 text-[13px] text-ink shadow"
                : "rounded-md px-2.5 py-1 text-[13px] text-ink-secondary hover:text-ink disabled:opacity-50"
            }
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>
    </SettingRow>
  );
}

export function ActionRow({
  titleKey,
  descriptionKey,
  action,
}: {
  titleKey: LocaleKey;
  descriptionKey?: LocaleKey;
  action: ReactNode;
}) {
  return (
    <SettingRow title={t(titleKey)} subtitle={descriptionKey ? t(descriptionKey) : undefined}>
      {action}
    </SettingRow>
  );
}

export function RangeRow({
  labelKey,
  value,
  onChange,
  min,
  max,
  step,
  disabled = false,
}: {
  labelKey: LocaleKey;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
}) {
  return (
    <SettingRow title={t(labelKey)}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={t(labelKey)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-40 accent-accent disabled:opacity-50"
        />
        <span className="w-10 shrink-0 text-right text-[12px] text-ink-secondary">{value}%</span>
      </div>
    </SettingRow>
  );
}
