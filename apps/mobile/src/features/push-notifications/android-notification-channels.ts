import { NOTIFICATION_SOUNDS, type NotificationSound } from "@whilo/contracts/notification-relay";
import type { MobileTextKey } from "@whilo/i18n/mobile";
import * as Notifications from "expo-notifications";
import { currentText } from "@/shared/lib/text";

/**
 * Android 8 and later play the sound of the notification channel, and a channel keeps its sound.
 * So each sound has a channel, and `WhiloMessagingService.kt` shows a notification in the channel
 * of the sound that the host sent. Both use these ids.
 */
export function androidChannelId(sound: NotificationSound | null): string {
  if (sound === null || sound === "default") return `whilo.sound.${sound ?? "none"}`;
  return `whilo.sound.${sound}.v2`;
}

/**
 * The sound files of `NOTIFICATION_SOUND_FILES`, as `with-notification-sounds.js` copies them into
 * the Android resources (replacing `-` with `_`).
 */
const SOUND_FILES: Readonly<Record<Exclude<NotificationSound, "default">, string>> = {
  whilo: "whilo_task.wav",
  warm: "whilo_warm.wav",
  mech: "whilo_mech.wav",
  bubble: "whilo_bubble.wav",
  press: "whilo_press.wav",
};

const SOUND_LABELS = {
  whilo: "mobile.settings.notifications.sound.whilo",
  warm: "mobile.settings.notifications.sound.warm",
  mech: "mobile.settings.notifications.sound.mech",
  bubble: "mobile.settings.notifications.sound.bubble",
  press: "mobile.settings.notifications.sound.press",
  default: "mobile.settings.notifications.sound.defaultAndroid",
} as const satisfies Record<NotificationSound, MobileTextKey>;

/**
 * Creates the channels, or gives them the names of the current app language. Android 13 asks for
 * the notification permission only when the app has a channel.
 */
export async function createAndroidChannels(): Promise<void> {
  const { t } = currentText();
  // Release builds up to 1.4.5 had no sound files, so the first channels of the sounds play the
  // Android notification sound. A channel keeps its sound, so the sounds have new channels.
  for (const sound of Object.keys(SOUND_FILES)) {
    await Notifications.deleteNotificationChannelAsync(`whilo.sound.${sound}`);
  }
  for (const sound of NOTIFICATION_SOUNDS) {
    await Notifications.setNotificationChannelAsync(androidChannelId(sound), {
      name: t("mobile.settings.notifications.channel", { sound: t(SOUND_LABELS[sound]) }),
      importance: Notifications.AndroidImportance.HIGH,
      // Without a sound, the channel plays the Android notification sound.
      ...(sound === "default" ? {} : { sound: SOUND_FILES[sound] }),
    });
  }
  await Notifications.setNotificationChannelAsync(androidChannelId(null), {
    name: t("mobile.settings.notifications.channelSilent"),
    importance: Notifications.AndroidImportance.HIGH,
    sound: null,
    enableVibrate: false,
  });
}
