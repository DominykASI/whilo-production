import { createFileRoute } from "@tanstack/solid-router";
import { Effect } from "effect";
import { runApiResponse } from "../../../../server/effect-runtime";
import { authErrorResponse, json, requestOAuthProviderStatus } from "../../../../server/request-auth";

// What the browser asks before it offers a social disc. A deployment without one provider's client
// id and secret answers `false` for it, and its disc keeps the "not configured" note instead of
// starting a redirect that ends nowhere. The ids are public; nothing here reads a secret value.
export const Route = createFileRoute("/v1/auth/oauth/status")({
  server: {
    handlers: {
      GET: () => runApiResponse(Effect.sync(() => json(requestOAuthProviderStatus())), authErrorResponse),
    },
  },
});
