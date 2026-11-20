import { AccountUsageDetails } from "@whilo/ui/features/account/AccountUsageDetails";
import type { AccountUsageProviderRow } from "@whilo/ui/features/account/account-usage-view";
import { useText } from "@whilo/ui/text";
import type { Accessor } from "solid-js";

/**
 * The usage page of the web app: the cloud models and their remaining quota, and nothing else. The
 * desktop app keeps its full machine report (tokens, cost and the per-agent table); the web shows
 * what a browser can act on, which is the account's cloud model limits.
 */
export function WebCloudUsage(props: {
  rows: Accessor<AccountUsageProviderRow[]>;
  loading: Accessor<boolean>;
  onRefresh: () => void;
}) {
  const { t } = useText();
  return (
    <section class="agent-usage" aria-label={t("account.usage.title")}>
      <div class="web-cloud-usage">
        <AccountUsageDetails
          rows={props.rows()}
          loading={props.loading()}
          error={null}
          refreshActive={props.loading()}
          refreshDisabled={props.loading()}
          onRefresh={props.onRefresh}
          title={<h2 class="account-usage-popover-title">{t("account.usage.title")}</h2>}
        />
      </div>
    </section>
  );
}
