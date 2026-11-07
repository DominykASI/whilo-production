import { createFileRoute } from "@tanstack/solid-router";
import { Effect } from "effect";
import { runApiResponse } from "../../../../../server/effect-runtime";
import { apiError, githubOAuthErrorResponse, requestGitHubOAuth } from "../../../../../server/request-auth";

// The browser opens this address to sign in with GitHub. It answers a redirect to GitHub, which
// carries the state; the client secret never leaves the Worker. Without the GitHub client this
// answers 503 `oauth_not_configured`, never a redirect.
export const Route = createFileRoute("/v1/auth/oauth/github/start")({
  server: {
    handlers: {
      GET: ({ request }) =>
        runApiResponse(
          Effect.gen(function* () {
            const github = requestGitHubOAuth();
            if (!github.configured) {
              return apiError(503, "oauth_not_configured", "GitHub sign-in is not configured on this deployment.");
            }
            const url = yield* github.authorizeUrl(github.redirectUri(request.url));
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
          githubOAuthErrorResponse,
        ),
    },
  },
});
