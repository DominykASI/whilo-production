import { useStore } from "@/state/store";
import { t } from "@/lib/i18n";
import { CloudAccountSettings } from "../CloudAccountSettings";
import { UsageSection } from "../UsageSection";

export function BillingTab() {
  const { state } = useStore();
  const cloudHome = state.config?.cloudHome === true;
  const cloudAvailable = cloudHome || Boolean(window.ogb?.cloudAccount) || Boolean(window.ogb?.cloudPlan);
  return (
    <>
      {cloudAvailable ? (
        <CloudAccountSettings cloudHome={cloudHome} />
      ) : (
        <p role="status" className="px-4 text-[13px] leading-relaxed text-ink-secondary">
          {t("cloudAccount.desktopOnly")}
        </p>
      )}
      <UsageSection />
    </>
  );
}
