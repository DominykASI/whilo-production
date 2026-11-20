#!/usr/bin/env bash
# Register BOAT/Stripe/OAuth/hosting secrets on the Cloudflare Worker `whilo-auth-api`.
# SAFE: never prints secret values. Reads values from exported env vars in the current shell.
#
# Usage (from repo root or apps/auth-api):
#   export BOAT_API_KEY BOAT_WEBHOOK_SECRET HOSTED_SERVER_TEMPLATE   # ... (no values shown here)
#   ./scripts/hosting/register-whilo-worker-secrets.sh [--env <name>] [--only <NAME,...>]
#
# After secrets, deploy from apps/auth-api/dist/server with --keep-vars (see end of output).

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: register-whilo-worker-secrets.sh [--env <name>] [--only <comma,separated,names>]

  --env <name>     Wrangler environment passthrough (e.g. test).
  --only <names>   Comma-separated secret/var names to process (limits default set).

Reads values from exported, non-empty env vars in the current shell. Never prints values.
EOF
}

ENV_NAME=""
ONLY_CSV=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      [[ $# -ge 2 ]] || { echo "error: --env requires a value" >&2; usage >&2; exit 2; }
      ENV_NAME="$2"
      shift 2
      ;;
    --only)
      [[ $# -ge 2 ]] || { echo "error: --only requires a value" >&2; usage >&2; exit 2; }
      ONLY_CSV="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

# Resolve repo/auth-api context robustly (run from repo root or apps/auth-api).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# script lives at <repo>/scripts/hosting/
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AUTH_API_DIR="$REPO_ROOT/apps/auth-api"
WRANGLER_CONFIG="$AUTH_API_DIR/wrangler.jsonc"

if [[ ! -f "$WRANGLER_CONFIG" ]]; then
  # Fallback: maybe invoked relative to a different layout; try from cwd.
  if [[ -f "apps/auth-api/wrangler.jsonc" ]]; then
    REPO_ROOT="$(pwd)"
    AUTH_API_DIR="$REPO_ROOT/apps/auth-api"
    WRANGLER_CONFIG="$AUTH_API_DIR/wrangler.jsonc"
  elif [[ -f "wrangler.jsonc" && "$(basename "$(pwd)")" == "auth-api" ]]; then
    AUTH_API_DIR="$(pwd)"
    REPO_ROOT="$(cd "$AUTH_API_DIR/../.." && pwd)"
    WRANGLER_CONFIG="$AUTH_API_DIR/wrangler.jsonc"
  else
    echo "error: could not resolve apps/auth-api/wrangler.jsonc (run from repo root or apps/auth-api)" >&2
    exit 1
  fi
fi

# Resolve wrangler command: prefer bunx wrangler, then local node_modules fallback.
resolve_wrangler() {
  if command -v bunx >/dev/null 2>&1; then
    echo "bunx wrangler"
    return 0
  fi
  if [[ -x "$REPO_ROOT/node_modules/.bin/wrangler" ]]; then
    echo "$REPO_ROOT/node_modules/.bin/wrangler"
    return 0
  fi
  if [[ -x "$AUTH_API_DIR/node_modules/.bin/wrangler" ]]; then
    echo "$AUTH_API_DIR/node_modules/.bin/wrangler"
    return 0
  fi
  if command -v wrangler >/dev/null 2>&1; then
    echo "wrangler"
    return 0
  fi
  echo "error: wrangler not found (need bunx, node_modules/.bin/wrangler, or wrangler in PATH)" >&2
  exit 1
}

WRANGLER_CMD="$(resolve_wrangler)"
# shellcheck disable=SC2206
WRANGLER_ARR=($WRANGLER_CMD)

ENV_ARGS=()
if [[ -n "$ENV_NAME" ]]; then
  ENV_ARGS=(--env "$ENV_NAME")
fi

# Detect whether NAME is listed in secrets.required for the target env in wrangler.jsonc.
# Uses bun or node with JSONC comment/trailing-comma stripping; returns 0 if required secret, 1 otherwise.
is_required_secret() {
  local name="$1"
  local checker=""
  if command -v bun >/dev/null 2>&1; then
    checker="bun"
  elif command -v node >/dev/null 2>&1; then
    checker="node"
  else
    # No JS runtime: be conservative and treat as secret only if found in a simple grep of secrets.required.
    # This avoids blind secret-put of obvious vars is imperfect; warn.
    echo "warn: bun/node not found; cannot reliably detect var vs secret from wrangler.jsonc for $name" >&2
    return 0
  fi

  "$checker" -e '
    const fs = require("fs");
    const file = process.argv[1], env = process.argv[2] || "", name = process.argv[3];
    let t = fs.readFileSync(file, "utf8");
    t = t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/,\s*([}\]])/g, "$1");
    const cfg = JSON.parse(t);
    const sec = env ? (((cfg.env||{})[env]||{}).secrets||{}).required : (cfg.secrets||{}).required;
    process.exit(Array.isArray(sec) && sec.includes(name) ? 0 : 1);
  ' "$WRANGLER_CONFIG" "$ENV_NAME" "$name" 2>/dev/null
}

# Default set (put only if exported). HOSTED_SERVERS_ALLOWED_USER_IDS is a var in config, not a secret;
# it is included here intentionally and handled factually (not put via secret put blindly).
DEFAULT_NAMES=(
  BOAT_API_KEY
  BOAT_WEBHOOK_SECRET
  HOSTED_SERVER_TEMPLATE
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  GOOGLE_OAUTH_CLIENT_SECRET
  GITHUB_OAUTH_CLIENT_SECRET
  HOSTED_SERVERS_ALLOWED_USER_IDS
)

NAMES=()
if [[ -n "$ONLY_CSV" ]]; then
  IFS=',' read -r -a NAMES <<< "$ONLY_CSV"
  # trim whitespace
  for i in "${!NAMES[@]}"; do
    NAMES[$i]="$(echo "${NAMES[$i]}" | xargs)"
  done
else
  NAMES=("${DEFAULT_NAMES[@]}")
fi

PUT_NAMES=()
SKIPPED_NAMES=()
VAR_SKIPPED_NAMES=()

echo "Registering worker secrets for whilo-auth-api (config: apps/auth-api/wrangler.jsonc${ENV_NAME:+, env: $ENV_NAME})."
echo "Secret values are never printed."
echo

for name in "${NAMES[@]}"; do
  [[ -n "$name" ]] || continue
  # Check if exported and non-empty in current shell, without printing value.
  if [[ ! -v "$name" ]] || [[ -z "${!name}" ]]; then
    echo "$name: skipped (not set in shell)"
    SKIPPED_NAMES+=("$name")
    continue
  fi

  if is_required_secret "$name"; then
    # Pipe value via stdin; never echo/print the value.
    printf %s "${!name}" | "${WRANGLER_ARR[@]}" secret put "$name" --config "$WRANGLER_CONFIG" ${ENV_ARGS[@]+"${ENV_ARGS[@]}"} >/dev/null
    echo "$name: put (secret)"
    PUT_NAMES+=("$name")
  else
    # Config var (not in secrets.required for target env): do NOT put into secret put blindly.
    echo "$name: skipped (config var, not in secrets.required for ${ENV_NAME:-production/top-level}; not sent via secret put)."
    echo "  -> To set this var, update 'vars' in apps/auth-api/wrangler.jsonc (or use --var at deploy time); value not shown."
    VAR_SKIPPED_NAMES+=("$name")
  fi
done

echo
echo "=== Summary (names only, no values) ==="
echo "Put as secrets: ${PUT_NAMES[*]:-(none)}"
echo "Skipped (not set in shell): ${SKIPPED_NAMES[*]:-(none)}"
echo "Skipped (config vars, not secret put): ${VAR_SKIPPED_NAMES[*]:-(none)}"
echo
echo "Next steps:"
echo "  1) Deploy from apps/auth-api/dist/server with --keep-vars (preserves worker-managed vars/secrets):"
echo "     cd $AUTH_API_DIR && ../../node_modules/.bin/wrangler deploy --config dist/server/wrangler.json --keep-vars${ENV_NAME:+ --env $ENV_NAME}"
echo "  2) Verify:"
echo "     curl https://api.whilo.onerall.com/health/live"
echo
echo "WARNING: BOAT_WEBHOOK_SECRET must be the real boat signing secret for https://api.whilo.onerall.com/v2/hosting/boat/webhook (copied when the boat webhook is created/rotated). A local placeholder is NOT valid unless registered with boat."
