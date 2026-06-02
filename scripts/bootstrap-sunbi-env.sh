#!/usr/bin/env bash
#
# bootstrap-sunbi-env.sh — one-shot .env generator for sunbi-rsshub.
#
# Usage:
#   bash scripts/bootstrap-sunbi-env.sh
#
#   # If you plan to deploy straight to Fly.io / Docker Compose, also pass
#   # SUNBI_DEPLOY=1 to print the matching `fly secrets set` / `docker compose`
#   # commands after the .env is written.
#   SUNBI_DEPLOY=1 bash scripts/bootstrap-sunbi-env.sh
#
# Behaviour:
#   - Refuses to overwrite an existing .env (delete it first if you want a clean rebuild).
#   - Reads .env.example.
#   - Generates ACCESS_KEY with `openssl rand -hex 32`.
#   - Defaults CACHE_TYPE=memory (production should override to redis — see Phase 1 of docs/LAUNCH_RUNBOOK.md).
#   - Defaults REDIS_URL=redis://localhost:6379/.
#   - Writes .env with chmod 600.
#   - Prints the new ACCESS_KEY to stdout with a clear banner.
#   - When SUNBI_DEPLOY=1, also prints the `fly secrets set` and
#     `docker compose -f docker-compose.sunbi-rsshub.yml` commands.

set -euo pipefail

# Resolve the repo root regardless of where the script is invoked from.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." &>/dev/null && pwd)"
cd "${REPO_ROOT}"

ENV_FILE="${REPO_ROOT}/.env"
ENV_EXAMPLE="${REPO_ROOT}/.env.example"

# Refuse to overwrite an existing .env.
if [[ -f "${ENV_FILE}" ]]; then
    echo "ERROR: ${ENV_FILE} already exists. Refusing to overwrite." >&2
    echo "       Delete it first if you want a clean rebuild:" >&2
    echo "         rm ${ENV_FILE}" >&2
    exit 1
fi

# Sanity-check the example file exists.
if [[ ! -f "${ENV_EXAMPLE}" ]]; then
    echo "ERROR: ${ENV_EXAMPLE} not found. Are you in the right repo?" >&2
    exit 1
fi

# Make sure openssl is available.
if ! command -v openssl >/dev/null 2>&1; then
    echo "ERROR: openssl is required (apt install openssl / brew install openssl)." >&2
    exit 1
fi

# Generate the access key. Use /dev/urandom via openssl so this works on macOS
# and Linux without depending on /dev/random blocking behaviour.
ACCESS_KEY="$(openssl rand -hex 32)"

# Copy the example file as a starting point, then substitute the secrets we own.
cp "${ENV_EXAMPLE}" "${ENV_FILE}"

# Replace the placeholder ACCESS_KEY. The example ships with
# `ACCESS_KEY=replace-with-openssl-rand-hex-32`; replace that line in place.
# If for some reason that line is missing, append ACCESS_KEY= at the end.
if grep -qE '^ACCESS_KEY=' "${ENV_FILE}"; then
    # In-place replace; use a delimiter that does not appear in the value.
    sed -i.bak "s|^ACCESS_KEY=.*|ACCESS_KEY=${ACCESS_KEY}|" "${ENV_FILE}"
    rm -f "${ENV_FILE}.bak"
else
    printf '\nACCESS_KEY=%s\n' "${ACCESS_KEY}" >> "${ENV_FILE}"
fi

# Enforce the documented local-dev defaults. Production should override
# CACHE_TYPE=redis (see docs/LAUNCH_RUNBOOK.md Phase 1).
if grep -qE '^CACHE_TYPE=' "${ENV_FILE}"; then
    sed -i.bak 's|^CACHE_TYPE=.*|CACHE_TYPE=memory|' "${ENV_FILE}"
    rm -f "${ENV_FILE}.bak"
else
    printf 'CACHE_TYPE=memory\n' >> "${ENV_FILE}"
fi

if grep -qE '^REDIS_URL=' "${ENV_FILE}"; then
    sed -i.bak 's|^REDIS_URL=.*|REDIS_URL=redis://localhost:6379/|' "${ENV_FILE}"
    rm -f "${ENV_FILE}.bak"
else
    printf 'REDIS_URL=redis://localhost:6379/\n' >> "${ENV_FILE}"
fi

# Lock down file permissions — .env contains a secret.
chmod 600 "${ENV_FILE}"

# Print the banner + key. We echo the key ONCE to stdout so the user can
# capture it into a password manager or directly into the Edge Function
# secrets UI.
cat <<EOF
================================================================
  sunbi-rsshub .env bootstrap — complete
================================================================

  ${ENV_FILE} written (chmod 600).

  SAVE THIS — you will need it in your browser/API client:
  ----------------------------------------------------------------
  ACCESS_KEY=${ACCESS_KEY}
  ----------------------------------------------------------------

  Notes:
  - CACHE_TYPE=memory is the default for local dev. For Docker
    Compose or Fly.io production, change it to "redis" (see
    docs/LAUNCH_RUNBOOK.md Phase 1).
  - REDIS_URL defaults to redis://localhost:6379/. If you use
    the bundled docker-compose.sunbi-rsshub.yml, the Compose
    service hostname is "redis" — set REDIS_URL=redis://redis:6379/
    before running `docker compose up -d`.
  - Optional platform auth (WEVERSE_TOKEN, NETFLIX_COOKIE,
    NAVER_COOKIE, BUBBLE_COOKIE) is left commented out. Add the
    ones you need — see docs/spec-secrets-runbook.md.
================================================================
EOF

# Optional deploy hints.
if [[ "${SUNBI_DEPLOY:-0}" == "1" ]]; then
    cat <<EOF

  SUNBI_DEPLOY=1 detected — printing the deploy commands.
  (Do NOT run these blindly; review before pasting.)

  # Fly.io
  fly secrets set --app rsshub ACCESS_KEY=${ACCESS_KEY}
  # Plus any of:
  #   fly secrets set --app rsshub WEVERSE_TOKEN=...
  #   fly secrets set --app rsshub NETFLIX_COOKIE=...
  #   fly secrets set --app rsshub NAVER_COOKIE=...
  #   fly secrets set --app rsshub BUBBLE_COOKIE=...
  fly deploy

  # Docker Compose on a VM
  # Copy the same env vars into the VM's .env (or set them in your
  # secret manager) and re-export ACCESS_KEY there:
  #   export ACCESS_KEY=${ACCESS_KEY}
  #   sed -i "s|^ACCESS_KEY=.*|ACCESS_KEY=\${ACCESS_KEY}|" .env
  docker compose -f docker-compose.sunbi-rsshub.yml up -d rsshub
  docker compose -f docker-compose.sunbi-rsshub.yml logs -f rsshub
================================================================
EOF
fi
