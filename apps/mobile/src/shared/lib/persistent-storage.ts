/**
 * Platform-persistent key/value storage.
 * Native: delegates to expo-secure-store (Keychain/Keystore) with full options support.
 * Web: uses localStorage; secure-store is unavailable in browsers and its getItemAsync throws.
 * Kept tiny and framework-free so feature modules share one migration point.
 */
export * from "expo-secure-store";
