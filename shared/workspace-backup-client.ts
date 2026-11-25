// Exact app-owned browser state that belongs in an encrypted full backup.
// Never include cookies, authentication tokens, connection caches or unknown keys.
export const WORKSPACE_BACKUP_CLIENT_KEYS = [
  "whilo-drafts",
  "whilo-draft-attachments",
  "whilo-draft-send-ids",
  "whilo-draft-channel-modes",
  "whilo-skin",
  "whilo-show-threads",
  "whilo-show-run-card",
  "whilo-send-key",
  "whilo-color-user-bubbles",
  "whilo-chat-width",
  "openmausbot.sidebarDensity",
  "openmausbot.sidebarToolsLayout",
  "openmausbot.sidebarCollapsedSections.v1",
  "openmausbot.sidebarSectionOrder.v1",
  "whilo-analytics-opt-out",
  "whilo.remote-voice.v1",
] as const;

export type WorkspaceBackupClientState = Partial<Record<(typeof WORKSPACE_BACKUP_CLIENT_KEYS)[number], string>>;
