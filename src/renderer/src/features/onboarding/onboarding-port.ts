import type { WhiloDesktopApi } from "@whilo/contracts/ipc";

/**
 * What onboarding reaches in main: the saved setup, the preview of an invite before the user
 * joins, the browser for the Terms of Service and the Privacy Policy, and the first value of the
 * analytics box.
 */
export interface OnboardingPort {
  getSetupState: WhiloDesktopApi["getSetupState"];
  saveSetup: WhiloDesktopApi["saveSetup"];
  onSetupState: WhiloDesktopApi["onSetupState"];
  servers: Pick<WhiloDesktopApi["servers"], "previewInvite">;
  openUrl: WhiloDesktopApi["openUrl"];
  getAnalyticsDefault: WhiloDesktopApi["getAnalyticsDefault"];
}

/** Read on each call: tests and stories replace `window.whilo` per case. */
export function onboardingPort(): OnboardingPort {
  return window.whilo;
}
