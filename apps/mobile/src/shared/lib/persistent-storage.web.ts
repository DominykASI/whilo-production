/**
 * Web implementation of the persistent-storage facade.
 * expo-secure-store is effectively unavailable on web and getItemAsync fails, which caused
 * ~20 modules to silently fall back to defaults (sign-in, onboarding, consent, settings reset
 * on reload). localStorage persists across reloads; every operation is guarded so disabled
 * storage or quota errors degrade gracefully instead of throwing.
 *
 * SecureStore options (keychain accessibility/services) have no web equivalent and are ignored.
 */
export type KeychainAccessibilityConstant = string;

// Compatibility constants (values are irrelevant on web; callers pass them through on native).
export const AFTER_FIRST_UNLOCK = "AFTER_FIRST_UNLOCK";
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = "AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY";
export const ALWAYS = "ALWAYS";
export const ALWAYS_THIS_DEVICE_ONLY = "ALWAYS_THIS_DEVICE_ONLY";
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = "WHEN_PASSCODE_SET_THIS_DEVICE_ONLY";
export const WHEN_UNLOCKED = "WHEN_UNLOCKED";
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = "WHEN_UNLOCKED_THIS_DEVICE_ONLY";

// Namespace compatibility for `SecureStore.SecureStoreOptions` / `SecureStore.WHEN_*` usage.
export namespace SecureStore {
  export type SecureStoreOptions = Record<string, unknown>;
  export type KeychainAccessibilityConstant = string;
  export const AFTER_FIRST_UNLOCK = "AFTER_FIRST_UNLOCK";
  export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = "AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY";
  export const ALWAYS = "ALWAYS";
  export const ALWAYS_THIS_DEVICE_ONLY = "ALWAYS_THIS_DEVICE_ONLY";
  export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = "WHEN_PASSCODE_SET_THIS_DEVICE_ONLY";
  export const WHEN_UNLOCKED = "WHEN_UNLOCKED";
  export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = "WHEN_UNLOCKED_THIS_DEVICE_ONLY";
}

export type SecureStoreOptions = SecureStore.SecureStoreOptions;

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function getItem(key: string, _options?: SecureStoreOptions): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export async function getItemAsync(key: string, _options?: SecureStoreOptions): Promise<string | null> {
  return getItem(key, _options);
}

export function setItem(key: string, value: string, _options?: SecureStoreOptions): void {
  try {
    storage()?.setItem(key, value);
  } catch {
    // Disabled storage or quota exceeded: keep in-memory state; value won't survive reload.
  }
}

export async function setItemAsync(key: string, value: string, _options?: SecureStoreOptions): Promise<void> {
  setItem(key, value, _options);
}

export async function deleteItemAsync(key: string, _options?: SecureStoreOptions): Promise<void> {
  try {
    storage()?.removeItem(key);
  } catch {
    // Best-effort removal.
  }
}

// Synchronous delete is not part of the expo-secure-store public API used here, but some
// wrappers may probe for it; provide a safe no-op-compatible helper if imported.
export function deleteItem(key: string, _options?: SecureStoreOptions): void {
  try {
    storage()?.removeItem(key);
  } catch {
    // Best-effort removal.
  }
}

export function isAvailableAsync(): Promise<boolean> {
  return Promise.resolve(storage() !== null);
}

export function canUseBiometricAuthentication(): boolean {
  return false;
}
