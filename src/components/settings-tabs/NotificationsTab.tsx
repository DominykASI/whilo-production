import { t } from "@/lib/i18n";
import { NotificationRows } from "../NotificationSettingsRows";
import { Card } from "../SettingsPrimitives";

export function NotificationsTab() {
  return (
    <Card title={t("settings.notifications.whatYouHear")} subtitle={t("settings.notifications.allDevices")}>
      <NotificationRows />
    </Card>
  );
}
