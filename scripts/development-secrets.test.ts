import { mkdtempSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readDevelopmentState } from "./development-secrets";

function projectWithLegacyState(state: unknown): { root: string; legacyDir: string } {
  const root = mkdtempSync(join(tmpdir(), "whilo-dev-state-"));
  const legacyDir = join(root, ".openbot");
  mkdirSync(legacyDir, { mode: 0o700 });
  writeFileSync(join(legacyDir, "dev-state.json"), JSON.stringify(state), { mode: 0o600 });
  return { root, legacyDir };
}

const SAVED = {
  version: 1,
  defaults: {
    REMOTE_TICKET_PRIVATE_JWK: '{"kty":"EC","d":"kept"}',
    REMOTE_TICKET_PUBLIC_JWKS: '{"keys":[{"kty":"EC"}]}',
    EMAIL_SMTP_HOST: "smtp.kept.test",
  },
  overrides: { EXTRA: "set-by-the-developer" },
};

describe("readDevelopmentState", () => {
  it("keeps the ticket keys of the previous directory name", () => {
    const { root } = projectWithLegacyState(SAVED);

    const state = readDevelopmentState(root);

    expect(state.defaults.REMOTE_TICKET_PRIVATE_JWK).toBe(SAVED.defaults.REMOTE_TICKET_PRIVATE_JWK);
    expect(state.defaults.EMAIL_SMTP_HOST).toBe("smtp.kept.test");
    expect(state.overrides.EXTRA).toBe("set-by-the-developer");
  });

  it("moves the state to the current directory and keeps it private", () => {
    const { root, legacyDir } = projectWithLegacyState(SAVED);

    readDevelopmentState(root);

    const moved = join(root, ".whilo", "dev-state.json");
    expect(existsSync(moved)).toBe(true);
    expect(existsSync(legacyDir)).toBe(false);
    // 0o600: the file holds local signing keys, so it is never readable by another account.
    expect(statSync(moved).mode & 0o777).toBe(0o600);
    expect(JSON.parse(readFileSync(moved, "utf8"))).toEqual(SAVED);
  });

  it("keeps a state that the current directory already holds", () => {
    const { root } = projectWithLegacyState(SAVED);
    const current = join(root, ".whilo");
    mkdirSync(current, { mode: 0o700 });
    const newer = {
      version: 1,
      defaults: {
        REMOTE_TICKET_PRIVATE_JWK: '{"kty":"EC","d":"newer"}',
        REMOTE_TICKET_PUBLIC_JWKS: '{"keys":[{"kty":"EC","kid":"newer"}]}',
      },
      overrides: {},
    };
    writeFileSync(join(current, "dev-state.json"), JSON.stringify(newer), { mode: 0o600 });

    const state = readDevelopmentState(root);

    expect(state.defaults.REMOTE_TICKET_PRIVATE_JWK).toBe('{"kty":"EC","d":"newer"}');
  });

  it("creates a fresh state when neither directory has one", () => {
    const root = mkdtempSync(join(tmpdir(), "whilo-dev-state-empty-"));

    const state = readDevelopmentState(root);

    expect(state.version).toBe(1);
    expect(state.defaults.REMOTE_TICKET_PRIVATE_JWK).toBeTruthy();
    expect(existsSync(join(root, ".whilo", "dev-state.json"))).toBe(true);
  });
});
