import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";

const MOBILE_DEVICE_ID_KEY = "whilo.mobile.device-id.v1";

export interface MobileDevice {
  /** The ID the account service lists this device under. It never leaves this device. */
  id: string;
  /** The name the platform gives the device, or null when it has none. */
  name: string | null;
}

/**
 * The ID that this device keeps for the account service, and the name the platform gives it.
 * `mobile-device.web.ts` answers the browser build, where neither `expo-secure-store` nor
 * `expo-device` has an implementation.
 */
export async function readMobileDevice(): Promise<MobileDevice> {
  let id = await SecureStore.getItemAsync(MOBILE_DEVICE_ID_KEY);
  if (!id) {
    id = Crypto.randomUUID();
    await SecureStore.setItemAsync(MOBILE_DEVICE_ID_KEY, id, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
  return { id, name: Device.deviceName?.trim() || Device.modelName?.trim() || null };
}
