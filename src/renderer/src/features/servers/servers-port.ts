import type { WhiloDesktopApi, ServerSummary } from "@whilo/contracts/ipc";

/**
 * What the servers domain reaches in main: the server list and selection, the account changes, the local host, the
 * settings of one server, the name, logo and update of a joined server's host, the servers that
 * run on this computer, and the remote desktop setup of a server.
 */
export interface ServersPort {
  agent: Pick<
    WhiloDesktopApi["agent"],
    | "getStatus"
    | "listAgents"
    | "listConversationReads"
    | "listHiddenAgents"
    | "listMcpServers"
    | "listModels"
    | "removeMcpServer"
    | "saveMcpServer"
    | "setMcpServerEnabled"
    | "testMcpServer"
    | "signInMcpServer"
    | "mcpSignInPage"
    | "mcpSignInRelay"
    | "openMcpSignInRelay"
    | "completeMcpSignInRelay"
    | "cancelMcpSignIn"
    | "signOutMcpServer"
    | "listMcpSignIns"
    | "mcpSignInApp"
    | "saveMcpSignInApp"
    | "removeMcpSignInApp"
  >;
  events: WhiloDesktopApi["events"];
  auth: Pick<WhiloDesktopApi["auth"], "onEvent">;
  browser: Pick<WhiloDesktopApi["browser"], "setVisible">;
  hostAdmin: Pick<
    WhiloDesktopApi["hostAdmin"],
    "cancelUpdate" | "getUpdateStatus" | "startUpdate" | "updateIdentity"
  >;
  hostedServers: Pick<WhiloDesktopApi["hostedServers"], "list" | "restart" | "wake">;
  localServers: WhiloDesktopApi["localServers"];
  host: Pick<
    WhiloDesktopApi["host"],
    | "configure"
    | "getStatus"
    | "onEvent"
    | "recheckScreenRecording"
    | "rotateIdentityKey"
    | "start"
    | "stop"
    | "updateIdentity"
  >;
  notifications: Pick<WhiloDesktopApi["notifications"], "onOpened">;
  remoteDesktop: Pick<
    WhiloDesktopApi["remoteDesktop"],
    "checkSetup" | "connect" | "disconnect" | "list" | "openSetup" | "test"
  >;
  servers: Pick<
    WhiloDesktopApi["servers"],
    | "getPresenceFor"
    | "join"
    | "list"
    | "onEvent"
    | "onPresence"
    | "refreshIdentity"
    | "remove"
    | "reorder"
    | "retryConnection"
    | "select"
    | "setMuted"
    | "setNotificationLevel"
  >;
}

/** Read on each call: tests and stories replace `window.whilo` per case. */
export function serversPort(): ServersPort {
  return window.whilo;
}

/**
 * The member and invite calls for one server. This computer answers them for the local server
 * through `host`; a remote server answers them through `servers`, addressed by its id.
 */
export type ServerAdminPort = Pick<
  WhiloDesktopApi["host"],
  "getPresence" | "listMembers" | "listInvites" | "createInvite" | "updateMember" | "removeMember" | "revokeInvite"
>;

export function serverAdminPort(server: Pick<ServerSummary, "id" | "kind">): ServerAdminPort {
  if (server.kind === "local") return window.whilo.host;
  const serverId = server.id;
  return {
    getPresence: () => window.whilo.servers.getPresenceFor(serverId),
    listMembers: () => window.whilo.servers.listMembers(serverId),
    listInvites: () => window.whilo.servers.listInvites(serverId),
    createInvite: (input) => window.whilo.servers.createInvite(input, serverId),
    updateMember: (input) => window.whilo.servers.updateMember(input, serverId),
    removeMember: (memberId) => window.whilo.servers.removeMember(memberId, serverId),
    revokeInvite: (inviteId) => window.whilo.servers.revokeInvite(inviteId, serverId),
  };
}

/** The server main marks active. A test teardown can remove the bridge while a join is pending. */
export async function activeServerId(): Promise<string> {
  if (!window.whilo) return "local";
  return (await window.whilo.servers.list()).find((item) => item.active)?.id ?? "local";
}
