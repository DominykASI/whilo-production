import { useEffect, useState } from "react";

export type RuntimeKind = "desktop" | "web";

export interface DesktopBridge {
  platform?: string;
  routineFlows?: unknown;
  agent?: unknown;
  routines?: unknown;
  openUrl?: (url: string) => Promise<void>;
  revealPath?: (path: string) => Promise<void>;
  openPath?: (path: string) => Promise<void>;
  localVm?: unknown;
  localComputer?: unknown;
  remoteClient?: { active?: boolean };
}

export interface RuntimeCapabilities {
  runtime: RuntimeKind;
  isDesktop: boolean;
  bridge: "whilo" | "ogb" | "none";
  platform: string;
  /** Electron IPC: the board's own flows, positions and links. */
  ipc: boolean;
  /** The board host that answers a canvas document. */
  flowBridge: boolean;
  /** A local filesystem: browse and attach files by path. */
  localFiles: boolean;
  /** Local CLI agents (codex, claude, cursor) that run on this machine. */
  localCliAgents: boolean;
  /** A local VM/computer workspace. */
  localVm: boolean;
  /** Native window chrome: drag regions and caption buttons. */
  nativeWindowChrome: boolean;
  /** Desktop notifications. */
  notifications: boolean;
  /** Opens a path or URL in the OS shell rather than a new tab. */
  shell: boolean;
  /** Keeps this machine awake for a due routine (Electron power assertion). */
  powerAssertion: boolean;
  /** A remote client: this page drives a server someone else owns. */
  remoteClient: boolean;
}

type WindowWithBridges = Window & { whilo?: DesktopBridge; ogb?: DesktopBridge & { remoteClient?: { active?: boolean } } };

function bridges(): { whilo?: DesktopBridge; ogb?: DesktopBridge } {
  if (typeof window === "undefined") return {};
  const scope = window as WindowWithBridges;
  return { whilo: scope.whilo, ogb: scope.ogb };
}

export function desktopBridge(): DesktopBridge | undefined {
  const { whilo, ogb } = bridges();
  return whilo ?? ogb;
}

export function capabilitiesFrom(scope?: { whilo?: DesktopBridge; ogb?: DesktopBridge }): RuntimeCapabilities {
  const windowScope = typeof window === "undefined" ? undefined : (window as WindowWithBridges);
  const whilo = scope?.whilo ?? windowScope?.whilo;
  const ogb = scope?.ogb ?? windowScope?.ogb;
  const bridge: RuntimeCapabilities["bridge"] = whilo ? "whilo" : ogb ? "ogb" : "none";
  const isDesktop = bridge !== "none";
  const platform = (whilo ?? ogb)?.platform ?? "other";
  return {
    runtime: isDesktop ? "desktop" : "web",
    isDesktop,
    bridge,
    platform,
    ipc: isDesktop,
    flowBridge: Boolean(whilo?.routineFlows ?? whilo?.agent),
    localFiles: isDesktop,
    localCliAgents: isDesktop,
    localVm: isDesktop && Boolean(whilo?.localVm ?? whilo?.localComputer),
    nativeWindowChrome: isDesktop && platform !== "linux",
    notifications: isDesktop,
    shell: Boolean(whilo?.openUrl ?? whilo?.revealPath ?? whilo?.openPath ?? ogb?.openUrl),
    powerAssertion: Boolean(windowScope?.ogb?.routines),
    remoteClient: ogb?.remoteClient?.active === true,
  };
}

export function runtimeCapabilities(): RuntimeCapabilities {
  return capabilitiesFrom();
}

export function isDesktopRuntime(): boolean {
  return runtimeCapabilities().isDesktop;
}

export function useRuntimeCapabilities(): RuntimeCapabilities {
  const [capabilities, setCapabilities] = useState<RuntimeCapabilities>(() => runtimeCapabilities());
  useEffect(() => {
    if (capabilities.isDesktop) return;
    let frame = 0;
    const check = () => {
      const next = runtimeCapabilities();
      if (next.isDesktop) {
        setCapabilities(next);
        return;
      }
      frame = window.setTimeout(check, 2_000);
    };
    frame = window.setTimeout(check, 2_000);
    return () => window.clearTimeout(frame);
  }, [capabilities.isDesktop]);
  return capabilities;
}

export type RuntimeGate = "web" | "desktop";

export function gateOf(kind: RuntimeGate, capabilities: RuntimeCapabilities): boolean {
  return kind === "desktop" ? capabilities.isDesktop : true;
}

export function openExternal(url: string): void {
  const bridge = desktopBridge();
  if (bridge?.openUrl) {
    void bridge.openUrl(url).catch(() => undefined);
    return;
  }
  if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
}

export function revealLocalPath(path: string): boolean {
  const bridge = desktopBridge();
  if (!bridge?.revealPath) return false;
  void bridge.revealPath(path).catch(() => undefined);
  return true;
}
