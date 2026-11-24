import { t } from "@/lib/i18n";
import { ProfileFields } from "../ProfileSettings";
import { Card } from "../SettingsPrimitives";

export function ProfileTab() {
  return (
    <Card title={t("settings.profile.title")} subtitle={t("settings.profile.sharedSubtitle")}>
      <ProfileFields />
    </Card>
  );
}
