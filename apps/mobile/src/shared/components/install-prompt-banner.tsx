import { Button, Typography } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import { isIOSWeb, isStandaloneDisplay, useInstallPrompt } from "@/shared/lib/pwa-install";
import { useText } from "@/shared/lib/text";

/**
 * Non-blocking install banner for the web PWA. Renders nothing on native, when
 * the app is already installed, or when the browser offers no install prompt.
 * On iOS (no `beforeinstallprompt`) it shows the manual Add-to-Home-Screen
 * steps instead.
 */
export function InstallPromptBanner() {
  const { t } = useText();
  const { canPrompt, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (isStandaloneDisplay() || dismissed) return null;
  if (canPrompt && promptInstall) {
    return (
      <View className="gap-3 rounded-grouped bg-grouped p-4">
        <Typography.Paragraph>{t("mobile.settings.install.title")}</Typography.Paragraph>
        <Typography.Paragraph type="body-xs" className="text-grouped-secondary">
          {t("mobile.settings.install.body")}
        </Typography.Paragraph>
        <View className="flex-row gap-3">
          <Button
            onPress={() => {
              void promptInstall();
            }}
          >
            {t("mobile.settings.install.action")}
          </Button>
          <Button
            variant="secondary"
            onPress={() => setDismissed(true)}
          >
            {t("mobile.settings.install.dismiss")}
          </Button>
        </View>
      </View>
    );
  }
  if (isIOSWeb()) {
    return (
      <View className="gap-2 rounded-grouped bg-grouped p-4">
        <Typography.Paragraph>{t("mobile.settings.install.iosTitle")}</Typography.Paragraph>
        <Typography.Paragraph type="body-xs" className="text-grouped-secondary">
          {t("mobile.settings.install.iosBody")}
        </Typography.Paragraph>
        <Button variant="secondary" onPress={() => setDismissed(true)}>
          {t("mobile.settings.install.dismiss")}
        </Button>
      </View>
    );
  }
  return null;
}
