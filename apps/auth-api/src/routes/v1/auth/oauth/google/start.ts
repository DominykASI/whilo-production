import { createFileRoute } from "@tanstack/solid-router";
import { Effect } from "effect";
import { runApiResponse } from "../../../../../server/effect-runtime";
import { apiError, googleOAuthErrorResponse, requestGoogleOAuth } from "../../../../../server/request-auth";

// The browser opens this address to sign in with Google. It answers a redirect to Google, which
// carries the state and the PKCE challenge; the client secret never leaves the Worker. Without the
// Google client this answers 503 `oauth_not_configured`, never a redirect.
export const Route = createFileRoute("/v1/auth/oauth/google/start")({
  server: {
    handlers: {
      GET: ({ request }) =>
        runApiResponse(
          Effect.gen(function* () {
            const google = requestGoogleOAuth();
            if (!google.configured) {
              return apiError(503, "oauth_not_configured", "Google sign-in is not configured on this deployment.");
            }
            const url = yield* google.authorizeUrl(google.redirectUri(request.url));
            return new Response(null, {
              status: 302,
              headers: {
                Location: url,
                // The state is one-use: a cached start would hand a second person the first one's flow.
                "Cache-Control": "no-store",
                "Referrer-Policy": "no-referrer",
              },
            });
          }),
          googleOAuthErrorResponse,
        ),
    },
  },
});
