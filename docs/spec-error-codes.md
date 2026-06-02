# SPEC error codes — table, surface, triage

> **Purpose**: Every auth/expiry error on a SPEC route is a typed, machine-readable string. This doc is the canonical list and the on-call triage cheatsheet.
>
> **Source of truth**: error table mirrored from [SPEC-sunbi-rsshub.md § Error codes](SPEC-sunbi-rsshub.md#error-codes); runtime throw helpers in [`lib/routes/spec/utils.ts`](lib/routes/spec/utils.ts).

---

## Error code table

| Code                         | Platform | Trigger                              | HTTP hint |
| ---------------------------- | -------- | ------------------------------------ | --------- |
| `ERR_WEVERSE_TOKEN_MISSING`  | Weverse  | `WEVERSE_TOKEN` env var absent       | 401       |
| `ERR_WEVERSE_TOKEN_EXPIRED`  | Weverse  | API returns 401/403                  | 401       |
| `ERR_NETFLIX_COOKIE_MISSING` | Netflix  | `NETFLIX_COOKIE` env var absent      | 401       |
| `ERR_NETFLIX_COOKIE_EXPIRED` | Netflix  | API returns 401 or redirect to login | 401       |
| `ERR_NAVER_COOKIE_MISSING`   | Naver    | `NAVER_COOKIE` env var absent        | 401       |
| `ERR_NAVER_COOKIE_EXPIRED`   | Naver    | API returns 401                      | 401       |
| `ERR_BUBBLE_COOKIE_MISSING`  | Bubble   | `BUBBLE_COOKIE` env var absent       | 401       |
| `ERR_BUBBLE_COOKIE_EXPIRED`  | Bubble   | API returns 401                      | 401       |
| `ERR_VIKI_AUTH`              | Viki     | Token absent or expired              | 401       |

Throw these using RSSHub's standard error mechanism via `throwAuthError()` in [`lib/routes/spec/utils.ts`](lib/routes/spec/utils.ts). **Do not** return empty arrays with custom messages — that violates `AGENTS.md` rule #44 ("no fabricated empty responses").

---

## How the codes reach the client

Each SPEC handler calls `assertEnv(varName, errorCode)` at the top of the handler (see [`lib/routes/spec/utils.ts`](lib/routes/spec/utils.ts)) and converts 401/403 responses from the upstream API into the matching `*_EXPIRED` code. The thrown `Error` carries a `code` property (string) which RSSHub's standard error middleware translates into the response body.

```typescript
// lib/routes/spec/utils.ts
export function throwAuthError(code: string, message: string): never {
    const err = new Error(message) as Error & { code: string };
    err.code = code;
    throw err;
}
```

When the Edge Function or the Sunbi extension sees a response with status `401`, it should look at the body for the `code` field (or grep logs for the literal string) to decide whether to alert on rotation or skip the route for the rest of the cron window.

---

## Triage

### General: any SPEC error

```bash
# Tail all SPEC errors across the lifetime of the running container:
docker compose -f docker-compose.sunbi-rsshub.yml logs rsshub | grep ERR_

# Last hour, with timestamps:
docker compose logs rsshub --since 1h | grep -E 'ERR_[A-Z_]+'
```

For Fly.io, substitute `fly logs --app rsshub | grep ERR_`. For Cloudflare Worker, use `wrangler tail | grep ERR_`.

### Rotation alerts

```bash
# Token / cookie expiry cluster (rotate the corresponding secret):
docker compose logs rsshub --since 1h | grep -E 'ERR_WEVERSE_TOKEN_EXPIRED|ERR_NETFLIX_COOKIE_EXPIRED|ERR_NAVER_COOKIE_EXPIRED|ERR_BUBBLE_COOKIE_EXPIRED'
```

A single occurrence is usually enough to act on — these errors mean the platform rejected our credential and the route will keep failing until you rotate.

### What to do for each error class

| Error code                   | What it means                                        | What to do                                                                                                          | Where to read                                                               |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `ERR_WEVERSE_TOKEN_MISSING`  | `WEVERSE_TOKEN` env var was empty at startup.        | Set `WEVERSE_TOKEN` in `.env` (or `fly secrets set`), then `docker compose up -d` / `fly deploy`.                   | [spec-secrets-runbook.md § Weverse](spec-secrets-runbook.md#weverse_token)  |
| `ERR_WEVERSE_TOKEN_EXPIRED`  | Weverse API returned 401/403 with the current token. | Refresh the bearer token from Weverse DevTools (cookie lasts ~30 days), update the secret, redeploy.                | [spec-secrets-runbook.md § Weverse](spec-secrets-runbook.md#weverse_token)  |
| `ERR_NETFLIX_COOKIE_MISSING` | `NETFLIX_COOKIE` env var was empty at startup.       | Set `NETFLIX_COOKIE` in `.env` (or `fly secrets set`), then `docker compose up -d` / `fly deploy`.                  | [spec-secrets-runbook.md § Netflix](spec-secrets-runbook.md#netflix_cookie) |
| `ERR_NETFLIX_COOKIE_EXPIRED` | Netflix API returned 401 or redirected to login.     | Re-export the full `Cookie` header from a live browser session, update the secret, redeploy.                        | [spec-secrets-runbook.md § Netflix](spec-secrets-runbook.md#netflix_cookie) |
| `ERR_NAVER_COOKIE_MISSING`   | `NAVER_COOKIE` env var was empty at startup.         | Set `NAVER_COOKIE` in `.env` (or `fly secrets set`), then `docker compose up -d` / `fly deploy`.                    | [spec-secrets-runbook.md § Naver](spec-secrets-runbook.md#naver_cookie)     |
| `ERR_NAVER_COOKIE_EXPIRED`   | Naver API returned 401.                              | Re-export the full `Cookie` header from a logged-in Naver session, update the secret, redeploy.                     | [spec-secrets-runbook.md § Naver](spec-secrets-runbook.md#naver_cookie)     |
| `ERR_BUBBLE_COOKIE_MISSING`  | `BUBBLE_COOKIE` env var was empty at startup.        | Set `BUBBLE_COOKIE` in `.env` (or `fly secrets set`), then `docker compose up -d` / `fly deploy`.                   | [spec-secrets-runbook.md § Bubble](spec-secrets-runbook.md#bubble_cookie)   |
| `ERR_BUBBLE_COOKIE_EXPIRED`  | Bubble API returned 401.                             | Re-export the full `Cookie` header from a live Bubble session, update the secret, redeploy.                         | [spec-secrets-runbook.md § Bubble](spec-secrets-runbook.md#bubble_cookie)   |
| `ERR_VIKI_AUTH`              | Viki token absent or rejected.                       | Refresh the Viki token (see [RSSHUB_SETUP.md](routes/RSSHUB_SETUP.md) § "How to get"), update the secret, redeploy. | [RSSHUB_SETUP.md](routes/RSSHUB_SETUP.md)                                   |

### If you see a code that's not in the table

1. `grep -RIn 'throwAuthError' lib/routes/spec/` — confirm it's an intentional code from this fork.
2. `grep -RIn 'ERR_' lib/` — search for upstream throw sites; some upstream routes reuse the same code family.
3. If it looks new, file an issue with the full stack trace and the route path.

---

## Smoke-testing each error path locally

Each `*_EXPIRED` code can be triggered by hand on a dev box:

```bash
# Temporarily blank the env var and hit the route:
docker compose -f docker-compose.sunbi-rsshub.yml exec rsshub \
  sh -c 'unset WEVERSE_TOKEN && curl -fsS -H "Cache-Control: no-cache" \
        "http://localhost:1200/spec/weverse/3-EXID?format=json&key=$ACCESS_KEY" \
        || true' | jq .   # should show ERR_WEVERSE_TOKEN_MISSING (or *_EXPIRED after 401)
```

For `*_EXPIRED`, point the route at a deliberately bad credential (e.g. truncate the token to its last 4 chars) and re-issue the request — the upstream 401 will surface as the typed code.

---

## See also

- [SPEC-sunbi-rsshub.md § Error codes](SPEC-sunbi-rsshub.md#error-codes) — authoritative table
- [lib/routes/spec/utils.ts](lib/routes/spec/utils.ts) — `throwAuthError`, `assertEnv`
- [spec-secrets-runbook.md](spec-secrets-runbook.md) — acquisition + rotation for each credential
- [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) — Phase 1 env setup, Phase 5 health monitoring
