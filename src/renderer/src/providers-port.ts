import type { WhiloDesktopApi } from "@whilo/contracts/ipc";

/**
 * What provider state reaches in main: connecting, signing in and refreshing providers, and the
 * runtimes Whilo installs for them, on this computer or on a host the account administers.
 */
export interface ProvidersPort {
  cancelProviderCodeLogin: WhiloDesktopApi["cancelProviderCodeLogin"];
  connectProvider: WhiloDesktopApi["connectProvider"];
  connectProviderInMainlandChina: WhiloDesktopApi["connectProviderInMainlandChina"];
  cancelProviderSignIn: WhiloDesktopApi["cancelProviderSignIn"];
  refreshAgentProviders: WhiloDesktopApi["refreshAgentProviders"];
  setProviderOn: WhiloDesktopApi["setProviderOn"];
  restartProvider: WhiloDesktopApi["restartProvider"];
  cancelProviderRestart: WhiloDesktopApi["cancelProviderRestart"];
  startProviderCodeLogin: WhiloDesktopApi["startProviderCodeLogin"];
  providerRuntimes: WhiloDesktopApi["providerRuntimes"];
  connectProviderAccount: WhiloDesktopApi["connectProviderAccount"];
  cancelProviderAccountSignIn: WhiloDesktopApi["cancelProviderAccountSignIn"];
  renameProviderAccount: WhiloDesktopApi["renameProviderAccount"];
  removeProviderAccount: WhiloDesktopApi["removeProviderAccount"];
  signOutProvider: WhiloDesktopApi["signOutProvider"];
  providerUsageResets: WhiloDesktopApi["providerUsageResets"];
  resetProviderUsage: WhiloDesktopApi["resetProviderUsage"];
  /** The same, for the host of a joined server the account administers. */
  providerAdmin: WhiloDesktopApi["providerAdmin"];
}

/** Read on each call: tests and stories replace `window.whilo` per case. */
export function providersPort(): ProvidersPort {
  return window.whilo;
}
