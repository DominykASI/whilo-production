import type { HostedServerSummary } from "@whilo/contracts/hosted-servers";

/**
 * What the setup screen shows for a new server. `payment`: the server waits for the first payment.
 * `connecting`: the server runs, but this phone does not list it yet.
 */
export type HostedSetupStatus = "payment" | "creating" | "starting" | "connecting" | "ready" | "error";

export function hostedSetupStatus(server: HostedServerSummary, listed: boolean): HostedSetupStatus {
  switch (server.state) {
    case "awaiting_payment":
      return "payment";
    case "creating":
      return "creating";
    case "starting":
    case "waking":
      return "starting";
    case "running":
      // Never show ready before observed_state is actually running (and the host is listed).
      return listed ? "ready" : "connecting";
    case "stopping":
    case "stopped":
      // Never present as "ready" unless observed_state is running.
      return "error";
    default:
      return "error";
  }
}

/** The setup polls until the server is ready or failed. */
export function hostedSetupSettled(status: HostedSetupStatus): boolean {
  return status === "ready" || status === "error";
}

/**
 * A server of the account whose setup page has something to show: the payment, the setup steps, or
 * a failure with its Retry action. A listed server that wakes or runs is not in setup.
 */
export function hostedServerInSetup(server: HostedServerSummary, listed: boolean): boolean {
  switch (server.state) {
    case "awaiting_payment":
    case "creating":
    case "starting":
    case "error":
      return true;
    case "waking":
    case "running":
      return !listed;
    default:
      return false;
  }
}
