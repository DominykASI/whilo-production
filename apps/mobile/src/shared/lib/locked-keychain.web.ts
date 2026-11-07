/**
 * The browser has no Keychain, so the web build keeps these items in `localStorage`. The names are the
 * same, so a value written by one platform is read by the same key on the other. `localStorage` throws
 * when the browser has storage disabled, and the sign-in path treats a failed read as "no session", so
 * every call answers instead of throwing.
 */
const PREFIX = "whilo.keychain.";

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export async function getItemAsync(key: string): Promise<string | null> {
  return storage()?.getItem(PREFIX + key) ?? null;
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  try {
    storage()?.setItem(PREFIX + key, value);
  } catch {
    // A full or disabled storage leaves the session in memory for this visit only.
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  try {
    storage()?.removeItem(PREFIX + key);
  } catch {
    // Nothing to remove from a storage that cannot be opened.
  }
}

export function getItem(key: string): string | null {
  return storage()?.getItem(PREFIX + key) ?? null;
}

export function setItem(key: string, value: string): void {
  try {
    storage()?.setItem(PREFIX + key, value);
  } catch {
    // See setItemAsync.
  }
}
