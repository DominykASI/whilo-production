import { WHILO_INVITE_PATH } from "@whilo/contracts/invite-links";
import { createFileRoute } from "@tanstack/solid-router";
import { Effect } from "effect";
import { installReturnPage } from "../../../../../server/canonical-redirect";
import { runApiResponse } from "../../../../../server/effect-runtime";
import { GoogleOAuthError } from "../../../../../server/google-oauth";
import { requestGoogleOAuth } from "../../../../../server/request-auth";

// Google sends the browser back here. The Worker spends the state, exchanges the code and answers
// the app with the session in the URL fragment: a fragment is never sent to a server, so the token
// stays out of the request line, the logs and the `Referer` of every page that follows.
export const Route = createFileRoute("/v1/auth/oauth/google/callback")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const target = installReturnPage(WHILO_INVITE_PATH, url);
        return runApiResponse(
          Effect.gen(function* () {
            const code = url.searchParams.get("code");
            const state = url.searchParams.get("state");
            // A refusal at Google's page comes back with `error` and no code.
            if (!code || !state) return send(target, { error: cancelledCode(url.searchParams.get("error")) });
            const google = requestGoogleOAuth();
            const session = yield* google.complete({
              code,
              state,
              redirectUri: google.redirectUri(request.url),
            });
            return send(target, { session: session.sessionToken });
          }),
          (error) =>
            send(target, { error: error instanceof GoogleOAuthError ? error.code : "oauth_sign_in_failed" }),
        );
      },
    },
  },
});

/** Google's `access_denied` is a person who closed the consent page, not a failure of ours. */
function cancelledCode(error: string | null): string {
  return error === "access_denied" ? "oauth_cancelled" : "oauth_failed";
}

function send(target: URL, fragment: Record<string, string>): Response {
  target.hash = new URLSearchParams(fragment).toString();
  return new Response(null, {
    status: 303,
    headers: { Location: target.toString(), "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}
