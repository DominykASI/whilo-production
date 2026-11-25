// Side-effect import that scrubs ambient Whilo env before a module snapshots it (scripts/mcp-server.ts reads
// WHILO_URL / WHILO_PORT at evaluation). Import order is the contract: keep it above the module under test.
import { isAmbientOmbKey } from "./whilo-env.ts";

for (const key of Object.keys(process.env)) {
  if (isAmbientOmbKey(key)) delete process.env[key];
}
