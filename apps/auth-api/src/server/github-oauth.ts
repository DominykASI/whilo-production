// The GitHub sign-in of the browser client: the authorization-code flow.
//
// GitHub signs no identity token and takes no PKCE: the Worker shows the person GitHub's consent
// page with an opaque `state`, then exchanges the code together with the client secret and reads
// the account from the API with the token that the exchange answers. The state hash is kept in the
// same D1 table as the Google flow for ten minutes, so a callback is accepted once and only for the
// browser that began the flow.
//
// The email comes from `/user/emails`, not from `/user`: GitHub lets an account change its public
// email without proving it, while an account of this service is found by its email, so an unverified
// address could open another person's account. The session that follows is the same desktop session
// that a verified email code issues, and it goes back in the URL fragment of the app, which a
// browser never sends to a server.

import { isDynamicRecord, isString } from "@whilo/contracts/runtime-values";
import { normalizeEmailAddress } from "@whilo/contracts/validation";
import { Effect, Schema } from "effect";
import type { AccountAnalytics } from "./account-analytics";
import { randomToken, sha256 } from "./crypto";
import type { AuthStoreError } from "./d1-auth-repository";
import { PERSISTENT_SESSION_EXPIRES_AT } from "./session-policy";
import type { AuthRepository, AuthUser, WorkerBindings } from "./types";

const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const USER_URL = "https://api.github.com/user";
const EMAILS_URL = "https://api.github.com/user/emails";
/** `read:user` reads the profile; `user:email` reads the addresses, the private ones included. */
const SCOPE = "read:user user:email";
/** The app is a Worker; GitHub refuses an API request with no `User-Agent`. */
const USER_AGENT = "whilo-auth-api";
const API_VERSION = "2022-11-28";
/** GitHub accepts a sign-in for ten minutes. An older state is a flow that nobody finished. */
const STATE_TTL_MS = 10 * 60_000;
const REQUEST_TIMEOUT_MS = 10_000;
const PROVIDER = "github";
const CALLBACK_PATH = "/v1/auth/oauth/github/callback";
/** The name that an account is created with. The profile setting keeps its own 3 to 20 characters. */
const NAME_LIMIT = 80;

export class GitHubOAuthError extends Schema.TaggedError<GitHubOAuthError>()("GitHubOAuthError", {
  status: Schema.Number,
  code: Schema.String,
  message: Schema.String,
}) {
  constructor(status: number, code: string, message: string) {
    super({ status, code, message });
  }
}

/** A failure of the Worker or of GitHub: the store, the exchange, or the API read. */
export class GitHubOAuthOperationError extends Schema.TaggedError<GitHubOAuthOperationError>()(
  "GitHubOAuthOperationError",
  {},
) {}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/** The claims of the GitHub account that this Worker uses. */
interface GitHubIdentity {
  subject: string;
  email: string;
  name: string;
}

function githubCall<A>(operation: () => Promise<A>): Effect.Effect<A, GitHubOAuthOperationError> {
  return Effect.tryPromise({ try: operation, catch: () => new GitHubOAuthOperationError({}) });
}

function notConfigured(): GitHubOAuthError {
  return new GitHubOAuthError(503, "oauth_not_configured", "GitHub sign-in is not configured on this deployment.");
}

function stateInvalid(): GitHubOAuthError {
  return new GitHubOAuthError(400, "oauth_state_invalid", "This GitHub sign-in expired. Start it again.");
}

function accountUnreadable(): GitHubOAuthError {
  return new GitHubOAuthError(502, "oauth_account_unreadable", "GitHub did not confirm this account.");
}

function exchangeFailed(): GitHubOAuthError {
  return new GitHubOAuthError(502, "oauth_exchange_failed", "GitHub did not accept this sign-in.");
}

function emailUnverified(): GitHubOAuthError {
  return new GitHubOAuthError(
    403,
    "oauth_email_unverified",
    "This GitHub account has no verified primary email address.",
  );
}

export class GitHubOAuthService {
  readonly #database: D1Database;
  readonly #repository: AuthRepository;
  readonly #analytics: AccountAnalytics | null;
  readonly #clientId: string;
  readonly #clientSecret: string;
  readonly #fetch: Fetch;
  readonly #now: () => number;
  readonly #configured: boolean;

  constructor(
    bindings: Pick<WorkerBindings, "DB" | "GITHUB_OAUTH_CLIENT_ID" | "GITHUB_OAUTH_CLIENT_SECRET">,
    options: {
      repository: AuthRepository;
      analytics?: AccountAnalytics | undefined;
      fetch?: Fetch | undefined;
      now?: (() => number) | undefined;
    },
  ) {
    const clientId = bindings.GITHUB_OAUTH_CLIENT_ID?.trim() ?? "";
    const clientSecret = bindings.GITHUB_OAUTH_CLIENT_SECRET?.trim() ?? "";
    this.#configured = clientId !== "" && clientSecret !== "";
    this.#database = bindings.DB;
    this.#repository = options.repository;
    this.#analytics = options.analytics ?? null;
    this.#clientId = clientId;
    this.#clientSecret = clientSecret;
    this.#fetch = options.fetch ?? ((input, init) => fetch(input, init));
    this.#now = options.now ?? Date.now;
  }

  /** Without the client id and the secret, `/start` answers 503 and the web disc says so. */
  get configured(): boolean {
    return this.#configured;
  }

  /** Where GitHub sends the browser back. GitHub compares it with the URI registered in the app. */
  redirectUri(requestUrl: string): string {
    return new URL(CALLBACK_PATH, requestUrl).toString();
  }

  /** The address that the browser opens to start a sign-in. It carries no secret. */
  readonly authorizeUrl = Effect.fn("GitHubOAuthService.authorizeUrl")(function* (
    this: GitHubOAuthService,
    redirectUri: string,
  ): Effect.fn.Return<string, GitHubOAuthError | GitHubOAuthOperationError> {
    if (!this.#configured) return yield* notConfigured();
    const state = randomToken();
    const now = this.#now();
    yield* this.#insertFlow({
      stateHash: yield* this.#hash(state),
      createdAt: now,
      expiresAt: now + STATE_TTL_MS,
    });
    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set("client_id", this.#clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", SCOPE);
    url.searchParams.set("state", state);
    return url.toString();
  }).bind(this);

  /**
   * Spends the state, exchanges the code and signs the account in. The account of the verified
   * primary email is linked to this GitHub identity; without one, it is created.
   */
  readonly complete = Effect.fn("GitHubOAuthService.complete")(function* (
    this: GitHubOAuthService,
    input: { code: string; state: string; redirectUri: string },
  ): Effect.fn.Return<
    { sessionToken: string; user: AuthUser },
    GitHubOAuthError | GitHubOAuthOperationError | AuthStoreError
  > {
    if (!this.#configured) return yield* notConfigured();
    yield* this.#consumeFlow(input.state);
    const accessToken = yield* this.#exchangeCode({ code: input.code, redirectUri: input.redirectUri });
    const identity = yield* this.#readIdentity(accessToken);
    const now = this.#now();
    const { user, created } = yield* this.#repository.upsertProviderUser({
      provider: PROVIDER,
      subject: identity.subject,
      email: identity.email,
      name: identity.name,
      now,
    });
    const session = { id: crypto.randomUUID(), token: randomToken(), expiresAt: PERSISTENT_SESSION_EXPIRES_AT };
    // The same record, and the same expiry, that a verified email code issues for the desktop app.
    yield* this.#repository.createDesktopSession({ userId: user.id, session, now });
    if (created) this.#analytics?.track(user.id, { name: "account_created", surface: "web", firstTouch: null });
    return { sessionToken: session.token, user };
  }).bind(this);

  readonly #hash = Effect.fn("GitHubOAuthService.hash")(function* (value: string) {
    return yield* sha256(value).pipe(Effect.mapError(() => new GitHubOAuthOperationError({})));
  });

  readonly #insertFlow = Effect.fn("GitHubOAuthService.insertFlow")(function* (
    this: GitHubOAuthService,
    input: { stateHash: string; createdAt: number; expiresAt: number },
  ): Effect.fn.Return<void, GitHubOAuthOperationError> {
    // GitHub has no PKCE verifier and no id_token nonce: the row keeps the state and the provider.
    yield* githubCall(() =>
      this.#database
        .prepare(
          `INSERT INTO oauth_flows(state_hash, provider, code_verifier, nonce, created_at, expires_at)
       VALUES (?, 'github', NULL, NULL, ?, ?)`,
        )
        .bind(input.stateHash, input.createdAt, input.expiresAt)
        .run(),
    );
  }).bind(this);

  /** Reads and deletes the flow in one statement, so a state is spent only once. */
  readonly #consumeFlow = Effect.fn("GitHubOAuthService.consumeFlow")(function* (
    this: GitHubOAuthService,
    state: string,
  ): Effect.fn.Return<void, GitHubOAuthError | GitHubOAuthOperationError> {
    if (!state || state.length > 128) return yield* stateInvalid();
    const stateHash = yield* this.#hash(state);
    const row = yield* githubCall(() =>
      this.#database
        .prepare(
          "DELETE FROM oauth_flows WHERE state_hash = ? AND provider = 'github' AND expires_at > ? RETURNING state_hash",
        )
        .bind(stateHash, this.#now())
        .first<{ state_hash: string }>(),
    );
    if (!row) return yield* stateInvalid();
  }).bind(this);

  readonly #exchangeCode = Effect.fn("GitHubOAuthService.exchangeCode")(function* (
    this: GitHubOAuthService,
    input: { code: string; redirectUri: string },
  ): Effect.fn.Return<string, GitHubOAuthError | GitHubOAuthOperationError> {
    const response = yield* Effect.tryPromise({
      try: () =>
        this.#fetch(TOKEN_URL, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: this.#clientId,
            client_secret: this.#clientSecret,
            code: input.code,
            redirect_uri: input.redirectUri,
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }),
      catch: exchangeFailed,
    });
    const body = yield* githubCall(() => response.json().catch(() => null));
    // A spent or foreign code answers 200 with an `error` and no token.
    if (!response.ok || !isDynamicRecord(body) || !isString(body.access_token)) return yield* exchangeFailed();
    return body.access_token;
  }).bind(this);

  readonly #readIdentity = Effect.fn("GitHubOAuthService.readIdentity")(function* (
    this: GitHubOAuthService,
    accessToken: string,
  ): Effect.fn.Return<GitHubIdentity, GitHubOAuthError | GitHubOAuthOperationError> {
    const user = yield* this.#readApi(accessToken, USER_URL);
    if (!isDynamicRecord(user) || typeof user.id !== "number" || !Number.isSafeInteger(user.id)) {
      return yield* accountUnreadable();
    }
    const email = yield* this.#verifiedPrimaryEmail(accessToken);
    return {
      subject: String(user.id),
      email,
      // The handle is the name that every GitHub account has.
      name: nameFrom(user.name) ?? (isString(user.login) ? nameFrom(user.login) : null) ?? "GitHub",
    };
  }).bind(this);

  /** The address that GitHub verified and that the account calls primary, or a refusal. */
  readonly #verifiedPrimaryEmail = Effect.fn("GitHubOAuthService.verifiedPrimaryEmail")(function* (
    this: GitHubOAuthService,
    accessToken: string,
  ): Effect.fn.Return<string, GitHubOAuthError | GitHubOAuthOperationError> {
    const emails = yield* this.#readApi(accessToken, EMAILS_URL);
    if (!Array.isArray(emails)) return yield* accountUnreadable();
    const primary = emails.find(
      (entry) => isDynamicRecord(entry) && entry.primary === true && entry.verified === true && isString(entry.email),
    );
    if (!isDynamicRecord(primary) || !isString(primary.email)) return yield* emailUnverified();
    const email = normalizeEmailAddress(primary.email);
    if (!email) return yield* accountUnreadable();
    return email;
  }).bind(this);

  readonly #readApi = Effect.fn("GitHubOAuthService.readApi")(function* (
    this: GitHubOAuthService,
    accessToken: string,
    address: string,
  ): Effect.fn.Return<unknown, GitHubOAuthError | GitHubOAuthOperationError> {
    const response = yield* Effect.tryPromise({
      try: () =>
        this.#fetch(address, {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": USER_AGENT,
            "X-GitHub-Api-Version": API_VERSION,
          },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }),
      catch: () => new GitHubOAuthOperationError({}),
    });
    if (!response.ok) return yield* accountUnreadable();
    return yield* githubCall(() => response.json().catch(() => null));
  }).bind(this);
}

function nameFrom(value: unknown): string | null {
  if (!isString(value)) return null;
  const name = value
    .normalize("NFC")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, NAME_LIMIT)
    .trim();
  return name === "" ? null : name;
}
