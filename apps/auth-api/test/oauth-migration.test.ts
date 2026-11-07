import { afterEach, describe, expect, it } from "vitest";
import { migratedDatabase } from "./sqlite-d1";

const databases: ReturnType<typeof migratedDatabase>[] = [];

afterEach(() => {
  for (const database of databases.splice(0)) database.close();
});

function migrated(): ReturnType<typeof migratedDatabase> {
  const database = migratedDatabase("0047_oauth_sign_in.sql");
  databases.push(database);
  return database;
}

describe("Browser sign-in migration", () => {
  it("adds the flow and identity tables without touching the accounts that exist", () => {
    const database = migrated();
    // The insert and the read of the Worker that runs before this deploy name no new table.
    database.exec(`
      INSERT INTO users(id, identity_key, email, name, avatar_url, created_at, updated_at)
        VALUES ('existing', 'email:existing@example.com', 'existing@example.com', 'Ada', NULL, 1, 2);
    `);
    expect(database.prepare("SELECT id, email, name FROM users").all()).toEqual([
      { id: "existing", email: "existing@example.com", name: "Ada" },
    ]);
    expect(database.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
    expect(database.prepare("PRAGMA integrity_check").get()).toEqual({ integrity_check: "ok" });
  });

  it("links one provider identity to an account, and removes it with the account", () => {
    const database = migrated();
    database.exec(`
      INSERT INTO users(id, identity_key, email, name, avatar_url, created_at, updated_at)
        VALUES ('account', 'email:person@example.com', 'person@example.com', NULL, NULL, 1, 1);
      INSERT INTO user_identities(provider, subject, user_id, email, created_at)
        VALUES ('google', 'google-subject', 'account', 'person@example.com', 2);
      INSERT INTO user_identities(provider, subject, user_id, email, created_at)
        VALUES ('github', '17', 'account', 'person@example.com', 2);
    `);
    expect(database.prepare("SELECT provider, subject, user_id FROM user_identities ORDER BY provider").all()).toEqual([
      { provider: "github", subject: "17", user_id: "account" },
      { provider: "google", subject: "google-subject", user_id: "account" },
    ]);
    // A second row for the same Google identity is impossible, so two callbacks cannot both link it.
    expect(() =>
      database.exec(`
        INSERT INTO user_identities(provider, subject, user_id, email, created_at)
          VALUES ('google', 'google-subject', 'account', 'person@example.com', 3);
      `),
    ).toThrow(/UNIQUE constraint failed/);
    database.exec("DELETE FROM users WHERE id = 'account'");
    expect(database.prepare("SELECT COUNT(*) AS rows FROM user_identities").get()).toEqual({ rows: 0 });
  });

  it("spends a flow state once, only while it is alive, and only for its provider", () => {
    const database = migrated();
    database.exec(`
      INSERT INTO oauth_flows(state_hash, provider, code_verifier, nonce, created_at, expires_at)
        VALUES ('live', 'google', 'verifier', 'nonce', 100, 200),
               ('stale', 'google', 'verifier', 'nonce', 100, 150),
               ('github', 'github', NULL, NULL, 100, 200);
    `);
    const spend = database.prepare(
      "DELETE FROM oauth_flows WHERE state_hash = ? AND provider = 'google' AND expires_at > ? RETURNING code_verifier, nonce",
    );
    expect(spend.get("stale", 160)).toBeUndefined();
    expect(spend.get("live", 160)).toEqual({ code_verifier: "verifier", nonce: "nonce" });
    expect(spend.get("live", 160)).toBeUndefined();
    // A GitHub state that came back to the Google route is not spent: it stays for its own callback.
    expect(spend.get("github", 160)).toBeUndefined();
    expect(database.prepare("SELECT provider, code_verifier, nonce FROM oauth_flows").all()).toEqual([
      // The expired Google flow stays until the retention run deletes it.
      { provider: "google", code_verifier: "verifier", nonce: "nonce" },
      { provider: "github", code_verifier: null, nonce: null },
    ]);
  });

  it("accepts the flow insert that the GitHub route makes, with no verifier and no nonce", () => {
    const database = migrated();
    const insert = database.prepare(
      `INSERT INTO oauth_flows(state_hash, provider, code_verifier, nonce, created_at, expires_at)
       VALUES (?, 'github', NULL, NULL, ?, ?)`,
    );
    expect(insert.run("state", 1, 600_001).changes).toBe(1);
    expect(() => insert.run("state", 1, 600_001)).toThrow(/UNIQUE constraint failed/);
    expect(database.prepare("SELECT provider FROM oauth_flows").all()).toEqual([{ provider: "github" }]);
  });

  it("accepts the account insert that the OAuth routes make, and the link to it", () => {
    const database = migrated();
    expect(
      database
        .prepare(
          `INSERT OR IGNORE INTO users(id, identity_key, email, name, avatar_url, created_at, updated_at)
           VALUES (?, ?, ?, ?, NULL, ?, ?)`,
        )
        .run("new", "google:subject", "new@example.com", "Ada Lovelace", 5, 5).changes,
    ).toBe(1);
    expect(
      database
        .prepare(
          `INSERT OR IGNORE INTO user_identities(provider, subject, user_id, email, created_at)
           SELECT ?, ?, id, email, ? FROM users WHERE email = ?`,
        )
        .run("google", "subject", 5, "new@example.com").changes,
    ).toBe(1);
    // The same account again, through GitHub: the account is found by email, so nothing is added.
    expect(
      database
        .prepare(
          `INSERT OR IGNORE INTO users(id, identity_key, email, name, avatar_url, created_at, updated_at)
           VALUES (?, ?, ?, ?, NULL, ?, ?)`,
        )
        .run("other-id", "github:42", "new@example.com", "Ada Lovelace", 6, 6).changes,
    ).toBe(0);
    expect(
      database
        .prepare(
          `INSERT OR IGNORE INTO user_identities(provider, subject, user_id, email, created_at)
           SELECT ?, ?, id, email, ? FROM users WHERE email = ?`,
        )
        .run("github", "42", 6, "new@example.com").changes,
    ).toBe(1);
    expect(database.prepare("SELECT COUNT(*) AS rows FROM users").get()).toEqual({ rows: 1 });
  });
});
