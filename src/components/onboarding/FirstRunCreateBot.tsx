// First-run area for a workspace with no bots: the create-bot flow itself, instead
// of an empty sidebar and a one-line "No bots yet" loading line. Uses only the
// existing NewBotDialog in its normal (non-defaults) mode.
import { useEffect, useState } from "react";
import { Bot as BotIcon } from "lucide-react";
import { NewBotDialog } from "../lazy-screens";
import { useStore } from "@/state/store";
import { t } from "@/lib/i18n";

/** While the create dialog is closed this shows the create prompt; the dialog
 * itself (the existing New Bot flow) appears as soon as the owner asks for it. */
export function FirstRunCreateBot() {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);

  // Show the existing create/bot flow itself with no extra click, so the first
  // screen with no bots is the New Bot editor rather than an empty sidebar.
  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <main data-first-run-create="" className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-4 bg-app p-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-raised text-ink-secondary" aria-hidden="true">
        <BotIcon size={22} />
      </div>
      <div className="max-w-md">
        <h1 className="text-[20px] font-semibold text-ink">{t("onboarding.firstRun.title")}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">{t("onboarding.firstRun.body")}</p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ui-button-primary rounded-lg bg-accent px-5 py-2.5 text-[14px] font-medium text-white hover:brightness-110"
      >
        {t("sidebar.newBot")}
      </button>
      {open && <NewBotDialog onClose={() => setOpen(false)} onCreated={(bot) => dispatch({ type: "select", id: bot.id })} />}
    </main>
  );
}
