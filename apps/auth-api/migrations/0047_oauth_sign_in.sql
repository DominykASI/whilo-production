-- The browser sign-in of the account API, for Google and GitHub. `oauth_flows` holds one row for
-- each sign-in that the browser started: the provider, the state, the PKCE verifier and the
-- id_token nonce stay on the server, so a callback is accepted only once, only by the provider that
-- began it, and only for the browser that started the flow. The row is deleted when the callback
-- spends it, and the daily retention run deletes the ones that nobody used.
CREATE TABLE oauth_flows (
  state_hash TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  -- Google's PKCE verifier and id_token nonce. GitHub has neither: it signs no identity token, and
  -- its exchange authenticates the Worker with the client secret. NULL is a provider without them.
  code_verifier TEXT,
  nonce TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX oauth_flows_expires_at ON oauth_flows(expires_at);

-- The provider identity of an account. A verified Google or GitHub sign-in with an email that an
-- account already has links this row to that account; a sign-in with neither makes the account. The
-- email is the address that the provider verified, kept for the audit of the link, not for the lookup.
CREATE TABLE user_identities (
  provider TEXT NOT NULL,
  subject TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (provider, subject)
);

CREATE INDEX user_identities_user_id ON user_identities(user_id);
