import { createFileRoute } from "@tanstack/solid-router";

const CLIENT_ID = "https://openbot.run/oauth/mcp-client.json";

/**
 * Whilo's OAuth client metadata document (CIMD, SEP-991). An MCP authorization server with no
 * client registration, such as ElevenLabs, reads it when Whilo sends this URL as its `client_id`.
 * `MCP_CLIENT_METADATA_URL` in `src/backend/mcp-oauth-provider.ts` sends it. The redirect addresses
 * are the loopback listener of `src/main/mcp-oauth-redirect-server.ts` and its `whilo://` fallback.
 */
function mcpClientMetadataResponse(): Response {
  return Response.json(
    {
      client_id: CLIENT_ID,
      client_name: "Whilo",
      client_uri: "https://openbot.run",
      logo_uri: "https://openbot.run/icon-512x512.png",
      redirect_uris: ["http://127.0.0.1:28417/mcp-auth", "whilo://mcp-auth"],
      application_type: "native",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    { headers: { "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" } },
  );
}

export const Route = createFileRoute("/oauth/mcp-client.json")({
  server: { handlers: { GET: mcpClientMetadataResponse } },
});
