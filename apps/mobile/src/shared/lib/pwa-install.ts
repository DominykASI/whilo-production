import { Platform } from "react-native";

/** True only in a web browser (Expo web). Native builds never show install UI. */
export const isWeb = Platform.OS === "web";

/**
 * The shape of Chromium's `beforeinstallprompt` event. Kept structural so the
 * web bundle needs no extra types and native bundles never see it.
 */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type DeferredPrompt = BeforeInstallPromptEvent | null;

const DISMISS_KEY = "whilo:pwa-install-dismissed";

function readDismissed(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissed(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Private mode etc.: the prompt simply reappears next launch.
  }
}

/**
 * Capture the `beforeinstallprompt` event once, on web only. Returns a
 * `promptInstall` that shows the browser install UI, or null when install is
 * not available (already installed / unsupported browser / dismissed).
 *
 * iOS Safari has no `beforeinstallprompt`; callers fall back to the
 * "Add to Home Screen" instructions instead.
 */
export function useInstallPrompt(): { canPrompt: boolean; promptInstall: (() => Promise<void>) | null } {
  if (!isWeb) return { canPrompt: false, promptInstall: null };
  // Dynamic import keeps this module side-effect-free at import time and lets
  // the web-only listener live in its own file.
  return useWebInstallPrompt();
}

import { useEffect, useState } from "react";

function useWebInstallPrompt(): { canPrompt: boolean; promptInstall: (() => Promise<void>) | null } {
  const [deferred, setDeferred] = useState<DeferredPrompt>(null);
  const [dismissed, setDismissed] = useState(() => readDismissed());

  useEffect(() => {
    if (readDismissed()) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred || dismissed) return { canPrompt: false, promptInstall: null };

  const promptInstall = async () => {
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "dismissed") {
      writeDismissed();
      setDismissed(true);
    }
  };

  return { canPrompt: true, promptInstall };
}

/** True when the web app is already running as an installed PWA. */
export function isStandaloneDisplay(): boolean {
  if (!isWeb || typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
  );
}

/** True on iOS Safari, which has no install prompt and needs manual steps. */
export function isIOSWeb(): boolean {
  if (!isWeb || typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}
