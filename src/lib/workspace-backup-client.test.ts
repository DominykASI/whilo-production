import { describe, expect, it } from "vitest";
import { applyWorkspaceClientState, collectWorkspaceClientState } from "./workspace-backup-client";
import { SEND_KEY_KEY } from "./send-key";

function memory(values: Record<string, string>) {
  const entries = new Map(Object.entries(values));
  return { entries, getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, value); }, removeItem: (key: string) => { entries.delete(key); } };
}

describe("full-backup browser state", () => {
  it("exports exact app drafts/preferences, never saved webhook credentials or auth/cache keys", () => {
    const storage = memory({ "whilo-drafts": "draft", "whilo-webhook-credentials": "private URL", "whilo-skin": "daylight", "auth-token": "secret", "whilo-connected-apps": "cached accounts", "whilo-email-gate": "identity", "whilo-pending-workspace-restore": "old" });
    expect(collectWorkspaceClientState(storage)).toEqual({ "whilo-drafts": "draft", "whilo-skin": "daylight" });
  });

  it("replaces only allowlisted keys and clears old drafts absent from the backup", () => {
    const storage = memory({ "whilo-drafts": "old", "whilo-draft-attachments": "old attachment", "auth-token": "keep", "whilo-webhook-credentials": "destination URL" });
    applyWorkspaceClientState({ "whilo-drafts": "restored", "whilo-show-threads": "false" }, storage);
    expect(Object.fromEntries(storage.entries)).toEqual({ "whilo-drafts": "restored", "whilo-show-threads": "false", "auth-token": "keep", "whilo-webhook-credentials": "destination URL" });
  });

  it("carries the run card visibility choice in a workspace backup", () => {
    const storage = memory({ "whilo-show-run-card": "0" });
    expect(collectWorkspaceClientState(storage)).toEqual({ "whilo-show-run-card": "0" });
    applyWorkspaceClientState({ "whilo-show-run-card": "1" }, storage);
    expect(storage.getItem("whilo-show-run-card")).toBe("1");
  });

  it("carries the send key choice in a workspace backup", () => {
    const storage = memory({ [SEND_KEY_KEY]: "mod-enter" });
    expect(collectWorkspaceClientState(storage)).toEqual({ "whilo-send-key": "mod-enter" });
    applyWorkspaceClientState({ "whilo-send-key": "enter" }, storage);
    expect(storage.getItem(SEND_KEY_KEY)).toBe("enter");
  });

  it("carries the message color choice and leaves older backups opted out", () => {
    const storage = memory({ "whilo-color-user-bubbles": "1" });
    expect(collectWorkspaceClientState(storage)).toEqual({ "whilo-color-user-bubbles": "1" });
    applyWorkspaceClientState({ "whilo-color-user-bubbles": "0" }, storage);
    expect(storage.getItem("whilo-color-user-bubbles")).toBe("0");
    applyWorkspaceClientState({}, storage);
    expect(storage.getItem("whilo-color-user-bubbles")).toBeNull();
  });

  it("carries the chat width choice and clears it for older backups", () => {
    const storage = memory({ "whilo-chat-width": "full" });
    expect(collectWorkspaceClientState(storage)).toEqual({ "whilo-chat-width": "full" });
    applyWorkspaceClientState({ "whilo-chat-width": "wide" }, storage);
    expect(storage.getItem("whilo-chat-width")).toBe("wide");
    applyWorkspaceClientState({}, storage);
    expect(storage.getItem("whilo-chat-width")).toBeNull();
  });

  it.each([null, [], { "auth-token": "injected" }, { "whilo-webhook-credentials": "source URL" }, { "whilo-drafts": 1 }])("rejects invalid client state before clearing anything (%j)", (value) => {
    const storage = memory({ "whilo-drafts": "old", "auth-token": "keep" });
    expect(() => applyWorkspaceClientState(value, storage)).toThrow("Invalid backup browser state");
    expect(Object.fromEntries(storage.entries)).toEqual({ "whilo-drafts": "old", "auth-token": "keep" });
  });

  it("rolls browser state back if restored values exceed storage quota", () => {
    const storage = memory({ "whilo-drafts": "old", "whilo-skin": "daylight", "auth-token": "keep" });
    const original = storage.setItem;
    storage.setItem = (key, value) => { if (value === "too large") throw new Error("quota"); original(key, value); };
    expect(() => applyWorkspaceClientState({ "whilo-drafts": "too large" }, storage)).toThrow("quota");
    expect(Object.fromEntries(storage.entries)).toEqual({ "whilo-drafts": "old", "whilo-skin": "daylight", "auth-token": "keep" });
  });
});
