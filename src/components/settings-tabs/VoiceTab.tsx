import { t } from "@/lib/i18n";
import { SelectRow, SwitchRow } from "./LocalSettingsRow";
import { SettingsGroup, SettingsRows } from "../SettingsPrimitives";
import { VoiceEveryReplySetting } from "../VoiceEveryReplySetting";

const LANGUAGES = [
  { value: "auto", labelKey: "settings.voice.language.automatic" },
  { value: "en", labelKey: "language.name.en" },
  { value: "pt", labelKey: "language.name.pt" },
  { value: "es", labelKey: "language.name.es" },
  { value: "fr", labelKey: "language.name.fr" },
  { value: "de", labelKey: "language.name.de" },
  { value: "it", labelKey: "language.name.it" },
  { value: "ja", labelKey: "language.name.ja" },
  { value: "zh", labelKey: "language.name.zh" },
] as const;

const VOICES = [
  { value: "f1", labelKey: "settings.voice.speech.voice.female" },
  { value: "f2", labelKey: "settings.voice.speech.voice.female" },
  { value: "m1", labelKey: "settings.voice.speech.voice.male" },
  { value: "m2", labelKey: "settings.voice.speech.voice.male" },
] as const;

const SPEEDS = [
  { value: "0.75", labelKey: "settings.voice.speech.speed.title" },
  { value: "1", labelKey: "settings.voice.speech.speed.title" },
  { value: "1.25", labelKey: "settings.voice.speech.speed.title" },
  { value: "1.5", labelKey: "settings.voice.speech.speed.title" },
] as const;

export function VoiceTab() {
  return (
    <>
      <SettingsGroup label={t("settings.voice.dictation.section")} block="dictation">
        <SettingsRows>
          <SelectRow
            titleKey="settings.voice.language.section"
            descriptionKey="settings.voice.language.description"
            initial="auto"
            options={LANGUAGES}
          />
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup label={t("settings.voice.speech.section")} block="speech">
        <SettingsRows>
          <SwitchRow
            titleKey="settings.voice.speech.readReplies.title"
            descriptionKey="settings.voice.speech.readReplies.description"
          />
          <SelectRow titleKey="settings.voice.speech.voice.title" initial="f1" options={VOICES} />
          <SelectRow titleKey="settings.voice.speech.speed.title" initial="1" options={SPEEDS} />
          <VoiceEveryReplySetting />
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup label={t("settings.voice.live.section")} block="live">
        <SettingsRows>
          <SwitchRow
            titleKey="settings.voice.speech.codexLive.title"
            descriptionKey="settings.voice.speech.codexLive.description"
          />
        </SettingsRows>
      </SettingsGroup>
    </>
  );
}
