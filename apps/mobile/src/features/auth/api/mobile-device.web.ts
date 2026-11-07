/**
 * The browser has no Keychain and no `expo-device`. `expo-secure-store` ships an empty module on web, so
 * the read of the saved device ID threw a `TypeError` inside `verifyMobileEmailCode` — before
 * `POST /v1/mobile-auth/email/verify` left the page — and the code that the user typed could never be
 * accepted. The same key lives in `localStorage` here, and the browser names itself from its user agent.
 */
const MOBILE_DEVICE_ID_KEY = "whilo.mobile.device-id.v1";

export interface MobileDevice {
  id: string;
  name: string | null;
}

const BROWSERS: readonly (readonly [RegExp, string])[] = [
  [/Edg\//u, "Edge"],
  [/OPR\//u, "Opera"],
  [/Firefox\//u, "Firefox"],
  [/Chrome\/|CriOS\//u, "Chrome"],
  [/Safari\//u, "Safari"],
];

const SYSTEMS: readonly (readonly [RegExp, string])[] = [
  [/Android/u, "Android"],
  [/iPhone|iPad|iPod/u, "iOS"],
  [/Macintosh|Mac OS X/u, "macOS"],
  [/Windows/u, "Windows"],
  [/Linux/u, "Linux"],
];

function readStoredId(): string | null {
  try {
    return globalThis.localStorage?.getItem(MOBILE_DEVICE_ID_KEY) ?? null;
  } catch {
    // A browser with storage turned off cannot keep the ID, and a new one per visit is still valid.
    return null;
  }
}

function writeStoredId(id: string): void {
  try {
    globalThis.localStorage?.setItem(MOBILE_DEVICE_ID_KEY, id);
  } catch {
    // A full or disabled storage keeps the ID of this visit only, as a cleared browser does.
  }
}

/**
 * A version 4 UUID, which the account service checks. `crypto.randomUUID` is offered on a secure page
 * only, and a development build opened at a LAN address is not one, so the bytes of `getRandomValues`
 * are the fallback, with the version and variant bits set as RFC 4122 requires.
 */
function randomDeviceId(): string {
  const source = globalThis.crypto;
  if (typeof source.randomUUID === "function") return source.randomUUID();
  const bytes = source.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** "Chrome on macOS": the name that the account's device list shows for this browser. */
function browserDeviceName(): string | null {
  const agent = globalThis.navigator?.userAgent;
  if (!agent) return null;
  const browser = BROWSERS.find(([pattern]) => pattern.test(agent))?.[1] ?? "Browser";
  const system = SYSTEMS.find(([pattern]) => pattern.test(agent))?.[1];
  return system ? `${browser} on ${system}` : browser;
}

export async function readMobileDevice(): Promise<MobileDevice> {
  let id = readStoredId();
  if (!id) {
    id = randomDeviceId();
    writeStoredId(id);
  }
  return { id, name: browserDeviceName() };
}
