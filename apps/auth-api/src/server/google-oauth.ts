// The Google sign-in of the browser client: the authorization-code flow with PKCE.
//
// The browser leaves for Google with an opaque `state`, a SHA-256 `code_challenge` and a `nonce`.
// The Worker keeps the state hash, the PKCE verifier and the nonce in D1 (`oauth_flows`) for ten
// minutes, so a callback is accepted once, only for the browser that began the flow, and only the
// code that matches that verifier is exchanged. Google's answer is checked against its published
// keys before an account is made or found, and the session that follows is the same desktop session
// that a verified email code issues. The session goes back in the URL fragment of the app, which a
// browser never sends to a server.

import { isDynamicRecord, isString } from "@whilo/contracts/runtime-values";
import { normalizeEmailAddress } from "@whilo/contracts/validation";
import { Effect, Result, Schema } from "effect";
import { createLocalJWKSet, type JSONWebKeySet, jwtVerify } from "jose";
import type { AccountAnalytics } from "./account-analytics";
import { randomToken, sha256 } from "./crypto";
import type { AuthStoreError } from "./d1-auth-repository";
import { PERSISTENT_SESSION_EXPIRES_AT } from "./session-policy";
import type { AuthRepository, AuthUser, WorkerBindings } from "./types";

const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SIGNING_KEYS_URL = "https://www.googleapis.com/oauth2/v3/certs";
/** Google names both forms; a token with either one is from Google. */
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
/** The only scope this flow needs: who the user is, the address, and the picture. */
const SCOPE = "openid email profile";
/** Google accepts a sign-in for ten minutes. An older state is a flow that nobody finished. */
const STATE_TTL_MS = 10 * 60_000;
/** Google's keys rotate slowly, so a set is reused for an hour before it is fetched again. */
const SIGNING_KEYS_TTL_MS = 60 * 60_000;
const REQUEST_TIMEOUT_MS = 10_000;
const PROVIDER = "google";
const CALLBACK_PATH = "/v1/auth/oauth/google/callback";
/** The name that an account is created with. The profile setting keeps its own 3 to 20 characters. */
const NAME_LIMIT = 80;

export class GoogleOAuthError extends Schema.TaggedError<GoogleOAuthError>()("GoogleOAuthError", {
  status: Schema.Number,
  code: Schema.String,
  message: Schema.String,
}) {
  constructor(status: number, code: string, message: string) {
    super({ status, code, message });
  }
}

/** A failure of the Worker or of Google: the store, the key set, or the exchange. */
export class GoogleOAuthOperationError extends Schema.TaggedError<GoogleOAuthOperationError>()(
  "GoogleOAuthOperationError",
  {},
) {}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Google's signing keys, as the JSON that the key set answered with. A resolved value is kept,
 * never a promise: workerd refuses a promise that another request made.
 */
let signingKeys: { keys: JSONWebKeySet; fetchedAt: number } | null = null;

/** The claims of the id_token that this Worker uses. */
interface GoogleIdentity {
  subject: string;
  email: string;
  name: string | null;
}

function googleCall<A>(operation: () => Promise<A>): Effect.Effect<A, GoogleOAuthOperationError> {
  return Effect.tryPromise({ try: operation, catch: () => new GoogleOAuthOperationError({}) });
}

function keySetFrom(
  keys: JSONWebKeySet,
): Effect.Effect<ReturnType<typeof createLocalJWKSet>, GoogleOAuthOperationError> {
  return Effect.try({ try: () => createLocalJWKSet(keys), catch: () => new GoogleOAuthOperationError({}) });
}

function notConfigured(): GoogleOAuthError {
  return new GoogleOAuthError(503, "oauth_not_configured", "Google sign-in is not configured on this deployment.");
}

function stateInvalid(): GoogleOAuthError {
  return new GoogleOAuthError(400, "oauth_state_invalid", "This Google sign-in expired. Start it again.");
}

function tokenInvalid(): GoogleOAuthError {
  return new GoogleOAuthError(502, "oauth_token_invalid", "Google did not confirm this sign-in.");
}

function exchangeFailed(): GoogleOAuthError {
  return new GoogleOAuthError(502, "oauth_exchange_failed", "Google did not accept this sign-in.");
}

export class GoogleOAuthService {
  readonly #database: D1Database;
  readonly #repository: AuthRepository;
  readonly #analytics: AccountAnalytics | null;
  readonly #clientId: string;
  readonly #clientSecret: string;
  readonly #fetch: Fetch;
  readonly #now: () => number;
  readonly #configured: boolean;

  constructor(
    bindings: Pick<WorkerBindings, "DB" | "GOOGLE_OAUTH_CLIENT_ID" | "GOOGLE_OAUTH_CLIENT_SECRET">,
    options: {
      repository: AuthRepository;
      analytics?: AccountAnalytics | undefined;
      fetch?: Fetch | undefined;
      now?: (() => number) | undefined;
    },
  ) {
    const clientId = bindings.GOOGLE_OAUTH_CLIENT_ID?.trim() ?? "";
    const clientSecret = bindings.GOOGLE_OAUTH_CLIENT_SECRET?.trim() ?? "";
    this.#configured = clientId !== "" && clientSecret !== "";
    this.#database = bindings.DB;
    this.#repository = options.repository;
    this.#analytics = options.analytics ?? null;
    this.#clientId = clientId;
    this.#clientSecret = clientSecret;
    this.#fetch = options.fetch ?? ((input, init) => fetch(input, init));
    this.#now = options.now ?? Date.now;
  }

  /** Without the client id and the secret, `/start` answers 503 and the web button says so. */
  get configured(): boolean {
    return this.#configured;
  }

  /** Where Google sends the browser back. Google compares it with the URI registered in its console. */
  redirectUri(requestUrl: string): string {
    return new URL(CALLBACK_PATH, requestUrl).toString();
  }

  /** The address that the browser opens to start a sign-in. It carries no secret. */
  readonly authorizeUrl = Effect.fn("GoogleOAuthService.authorizeUrl")(function* (
    this: GoogleOAuthService,
    redirectUri: string,
  ): Effect.fn.Return<string, GoogleOAuthError | GoogleOAuthOperationError> {
    if (!this.#configured) return yield* notConfigured();
    const state = randomToken();
    const verifier = randomToken();
    const nonce = randomToken();
    const now = this.#now();
    yield* this.#insertFlow({
      stateHash: yield* this.#hash(state),
      verifier,
      nonce,
      createdAt: now,
      expiresAt: now + STATE_TTL_MS,
    });
    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set("client_id", this.#clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", SCOPE);
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("code_challenge", yield* this.#hash(verifier));
    url.searchParams.set("code_challenge_method", "S256");
    return url.toString();
  }).bind(this);

  /**
   * Spends the state, exchanges the code, checks Google's answer and signs the account in. The
   * account of a verified email is linked to this Google identity; without one, it is created.
   */
  readonly complete = Effect.fn("GoogleOAuthService.complete")(function* (
    this: GoogleOAuthService,
    input: { code: string; state: string; redirectUri: string },
  ): Effect.fn.Return<
    { sessionToken: string; user: AuthUser },
    GoogleOAuthError | GoogleOAuthOperationError | AuthStoreError
  > {
    if (!this.#configured) return yield* notConfigured();
    const flow = yield* this.#consumeFlow(input.state);
    const idToken = yield* this.#exchangeCode({
      code: input.code,
      verifier: flow.verifier,
      redirectUri: input.redirectUri,
    });
    const identity = yield* this.#verifyIdToken({ idToken, nonce: flow.nonce });
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

  readonly #hash = Effect.fn("GoogleOAuthService.hash")(function* (value: string) {
    return yield* sha256(value).pipe(Effect.mapError(() => new GoogleOAuthOperationError({})));
  });

  readonly #insertFlow = Effect.fn("GoogleOAuthService.insertFlow")(function* (
    this: GoogleOAuthService,
    input: { stateHash: string; verifier: string; nonce: string; createdAt: number; expiresAt: number },
  ): Effect.fn.Return<void, GoogleOAuthOperationError> {
    yield* googleCall(() =>
      this.#database
        .prepare(
          `INSERT INTO oauth_flows(state_hash, provider, code_verifier, nonce, created_at, expires_at)
       VALUES (?, 'google', ?, ?, ?, ?)`,
        )
        .bind(input.stateHash, input.verifier, input.nonce, input.createdAt, input.expiresAt)
        .run(),
    );
  }).bind(this);

  /** Reads and deletes the flow in one statement, so a state is spent only once. */
  readonly #consumeFlow = Effect.fn("GoogleOAuthService.consumeFlow")(function* (
    this: GoogleOAuthService,
    state: string,
  ): Effect.fn.Return<{ verifier: string; nonce: string }, GoogleOAuthError | GoogleOAuthOperationError> {
    if (!state || state.length > 128) return yield* stateInvalid();
    const stateHash = yield* this.#hash(state);
    const row = yield* googleCall(() =>
      this.#database
        .prepare(
          "DELETE FROM oauth_flows WHERE state_hash = ? AND provider = 'google' AND expires_at > ? RETURNING code_verifier, nonce",
        )
        .bind(stateHash, this.#now())
        .first<{ code_verifier: string; nonce: string }>(),
    );
    if (!row) return yield* stateInvalid();
    return { verifier: row.code_verifier, nonce: row.nonce };
  }).bind(this);

  readonly #exchangeCode = Effect.fn("GoogleOAuthService.exchangeCode")(function* (
    this: GoogleOAuthService,
    input: { code: string; verifier: string; redirectUri: string },
  ): Effect.fn.Return<string, GoogleOAuthError | GoogleOAuthOperationError> {
    const response = yield* Effect.tryPromise({
      try: () =>
        this.#fetch(TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: this.#clientId,
            client_secret: this.#clientSecret,
            code: input.code,
            code_verifier: input.verifier,
            grant_type: "authorization_code",
            redirect_uri: input.redirectUri,
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }),
      catch: exchangeFailed,
    });
    const body = yield* googleCall(() => response.json().catch(() => null));
    if (!response.ok || !isDynamicRecord(body) || !isString(body.id_token)) return yield* exchangeFailed();
    return body.id_token;
  }).bind(this);

  /**
   * Checks the id_token against Google's key set: the issuer, the audience, the expiry and the
   * nonce are what make an answer Google's own, for this deployment and for this flow.
   */
  readonly #verifyIdToken = Effect.fn("GoogleOAuthService.verifyIdToken")(function* (
    this: GoogleOAuthService,
    input: { idToken: string; nonce: string },
  ): Effect.fn.Return<GoogleIdentity, GoogleOAuthError | GoogleOAuthOperationError> {
    let verified = yield* this.#verifyOnce(input.idToken);
    // Google publishes a new signing key before it signs with it. A token that names a key the
    // cached set does not have is worth one more fetch, which is cheaper than a failed sign-in.
    if (Result.isFailure(verified) && isUnknownKey(verified.failure)) {
      signingKeys = null;
      verified = yield* this.#verifyOnce(input.idToken);
    }
    if (Result.isFailure(verified)) return yield* tokenInvalid();
    const claims = verified.success.payload;
    // jwtVerify proves the signature, the issuer, the audience and the lifetime. The nonce is what
    // ties this token to the browser that started the flow.
    if (claims.nonce !== input.nonce || !isString(claims.sub) || !isString(claims.email)) {
      return yield* tokenInvalid();
    }
    if (claims.email_verified !== true) {
      return yield* new GoogleOAuthError(
        403,
        "oauth_email_unverified",
        "This Google account has no verified email address.",
      );
    }
    const email = normalizeEmailAddress(claims.email);
    if (!email) return yield* tokenInvalid();
    return { subject: claims.sub, email, name: nameFrom(claims.name) };
  }).bind(this);

  readonly #verifyOnce = Effect.fn("GoogleOAuthService.verifyOnce")(function* (
    this: GoogleOAuthService,
    idToken: string,
  ) {
    const keySet = yield* this.#signingKeys();
    return yield* Effect.result(
      Effect.tryPromise({
        try: () =>
          jwtVerify(idToken, keySet, { issuer: GOOGLE_ISSUERS, audience: this.#clientId, algorithms: ["RS256"] }),
        catch: (error) => error,
      }),
    );
  }).bind(this);

  readonly #signingKeys = Effect.fn("GoogleOAuthService.signingKeys")(function* (this: GoogleOAuthService) {
    const cached = signingKeys;
    if (cached && cached.fetchedAt > this.#now() - SIGNING_KEYS_TTL_MS) return yield* keySetFrom(cached.keys);
    const response = yield* googleCall(() =>
      this.#fetch(SIGNING_KEYS_URL, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }),
    );
    const body = yield* googleCall(() => response.json().catch(() => null));
    if (!response.ok || !isDynamicRecord(body) || !Array.isArray(body.keys)) {
      return yield* new GoogleOAuthOperationError({});
    }
    const keys = body as unknown as JSONWebKeySet;
    const keySet = yield* keySetFrom(keys);
    signingKeys = { keys, fetchedAt: this.#now() };
    return keySet;
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

/** Google answers `ERR_JWKS_NO_MATCHING_KEY` for a token signed with a key that the set lacks. */
function isUnknownKey(error: unknown): boolean {
  const code = isDynamicRecord(error) ? error.code : undefined;
  return code === "ERR_JWKS_NO_MATCHING_KEY";
}
