import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { bodyName, colorName, expressionName } from "@/lib/mascot-names";
import { BOT_DESIGNS, botDesignPatch, botWearsDesign, type BotDesign } from "@/lib/bot-designs";
import type { Bot } from "@/state/store";
import { MausAvatar } from "./Avatar";
import type { AvatarPatch } from "./avatar-editing";

/** The ready-made looks, as the same popover the avatar editor opens. One click dresses the bot. */
export function BotDesignPicker({ bot, disabled, onPatch, onClose }: {
  bot: Bot;
  disabled?: boolean;
  onPatch: (patch: AvatarPatch) => void;
  onClose: () => void;
}) {
  const choose = (design: BotDesign) => {
    onPatch(botDesignPatch(design));
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label={t("botDesign.title")}
      data-bot-design-picker
      className="popover-surface mt-2.5 max-h-[320px] overflow-y-auto rounded-2xl border border-ink/[0.08] bg-menu text-left shadow-2xl shadow-black/50"
    >
      <div className="border-b border-ink/[0.06] p-2">
        <div className="px-[11px] py-[5px] text-[13px] font-medium text-ink">{t("botDesign.title")}</div>
        <p className="px-[11px] pb-1 text-[12px] text-ink-tertiary">{t("botDesign.intro")}</p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-3">
        {BOT_DESIGNS.map((design) => {
          const worn = botWearsDesign(bot, design);
          return (
            <button
              key={design.id}
              type="button"
              disabled={disabled}
              data-bot-design={design.id}
              aria-pressed={worn}
              aria-label={t("botDesign.use", { name: t(design.name) })}
              title={t(design.note)}
              onClick={() => choose(design)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 disabled:opacity-50",
                worn ? "bg-ink/[0.08] ring-[1.5px] ring-inset ring-ink/25" : "hover:bg-ink/[0.05]",
              )}
            >
              <span className="relative flex items-center justify-center">
                <MausAvatar
                  color={design.color}
                  faceColor={design.faceColor}
                  bodyId={design.body}
                  state={design.face}
                  size={44}
                  animated={false}
                  trackPointer={false}
                />
                {worn && (
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-ink text-menu" data-bot-design-worn>
                    <Check size={11} aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className="w-full truncate text-center text-[12px] text-ink">{t(design.name)}</span>
              <span className="w-full truncate text-center text-[11px] text-ink-tertiary" title={botDesignSummary(design)}>
                {bodyName(design.body)} · {colorName(design.color)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-ink/[0.06] px-3 py-2 text-[12px] text-ink-tertiary">{t("botDesign.hint")}</div>
    </div>
  );
}

/** The one-line summary a design shows under its name in a list, with the face it wears. */
export function botDesignSummary(design: BotDesign): string {
  return [bodyName(design.body), colorName(design.color), expressionName(design.face)].join(" · ");
}
