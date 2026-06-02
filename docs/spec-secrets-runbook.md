# SPEC secrets runbook — acquisition, rotation, redeploy

> **Purpose**: One page per credential used by SPEC routes. For each: how to obtain it from a real browser session, when to rotate, and how to redeploy the secret into whichever target you run on (Docker Compose on a VM, Fly.io, or Cloudflare Worker).
>
> **Acquisition steps (DevTools) are summarised here and detailed in [RSSHUB_SETUP.md § Environment Variables](routes/RSSHUB_SETUP.md#environment-variables) — link, do not duplicate.**

---

## Quick matrix

| Secret           | Used by route                  | Typical lifetime         | Default on expiry                           | Re-obtain by…                                               |
| ---------------- | ------------------------------ | ------------------------ | ------------------------------------------- | ----------------------------------------------------------- |
| `WEVERSE_TOKEN`  | `/spec/weverse/*`              | ~30 days                 | 401 → `ERR_WEVERSE_TOKEN_EXPIRED`           | Re-login + copy new `Authorization: Bearer …` from DevTools |
| `NETFLIX_COOKIE` | `/spec/netflix/*`              | weeks – months           | 401/redirect → `ERR_NETFLIX_COOKIE_EXPIRED` | Re-login + copy full `Cookie` header                        |
| `NAVER_COOKIE`   | `/spec/naver/*` (paid content) | weeks – months           | 401 → `ERR_NAVER_COOKIE_EXPIRED`            | Re-login + copy full `Cookie` header                        |
| `BUBBLE_COOKIE`  | `/spec/bubble/*`               | days – weeks             | 401 → `ERR_BUBBLE_COOKIE_EXPIRED`           | Re-login + copy full `Cookie` header                        |
| `ACCESS_KEY`     | every `/spec/*`                | never (rotated manually) | 401 from key middleware                     | Regenerate with `openssl rand -hex 32`                      |

Set the rotation trigger in your monitoring to fire on the corresponding `ERR_*_EXPIRED` log line. See [spec-error-codes.md](spec-error-codes.md) for the grep patterns.

---

## `WEVERSE_TOKEN`

- **How to obtain** — see [RSSHUB_SETUP.md § `WEVERSE_TOKEN`](routes/RSSHUB_SETUP.md#environment-variables) for the DevTools steps (Network tab → any `/api/...` request → copy the `Authorization: Bearer …` value). Plan: log in at `weverse.io`, open DevTools → Network, click any feed or post request, copy the full bearer value.
- **When to rotate** — every ~30 days, or immediately on `ERR_WEVERSE_TOKEN_EXPIRED` in `docker compose logs rsshub | grep ERR_WEVERSE_TOKEN`. Weverse tokens are short-lived by design.
- **How to redeploy**
    - **Docker Compose**:
        ```bash
        # 1. Edit .env on the VM, set WEVERSE_TOKEN=<new value>
        # 2. Restart only the rsshub service so Redis state is preserved:
        docker compose -f docker-compose.sunbi-rsshub.yml up -d rsshub
        docker compose -f docker-compose.sunbi-rsshub.yml logs -f rsshub
        ```
    - **Fly.io**:
        ```bash
        fly secrets set WEVERSE_TOKEN=<new value> --app rsshub
        fly deploy   # secrets are picked up at deploy time
        ```
    - **Cloudflare Worker**:
        ```bash
        echo "<new value>" | wrangler secret put WEVERSE_TOKEN
        pnpm worker-deploy
        ```
- **Verify**:
    ```bash
    docker compose -f docker-compose.sunbi-rsshub.yml logs rsshub --since 1m | grep -E 'ERR_WEVERSE' || echo "no token errors"
    curl -fsS "https://rsshub.yourdomain.com/spec/weverse/3-EXID?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra'
    ```

## `NETFLIX_COOKIE`

- **How to obtain** — see [RSSHUB_SETUP.md § `NETFLIX_COOKIE`](routes/RSSHUB_SETUP.md#environment-variables). Plan: log in at `netflix.com`, open DevTools → Application → Cookies → `netflix.com`, copy the **full `Cookie` header** as a single string (every `name=value;` pair).
- **When to rotate** — Netflix sessions can last weeks to months. Rotate on `ERR_NETFLIX_COOKIE_EXPIRED` (Netflix returns 401 or redirects to the login page). Some anti-bot flows also silently redirect without a clear error, so watch the `lastBuildDate` and item count for that route.
- **How to redeploy** — same shape as `WEVERSE_TOKEN`:
    - **Docker Compose**: edit `.env`, `docker compose -f docker-compose.sunbi-rsshub.yml up -d rsshub`.
    - **Fly.io**: `fly secrets set NETFLIX_COOKIE="NID=…; SecureNetflixId=…; …" --app rsshub`, then `fly deploy`.
    - **Cloudflare Worker**: `echo "NID=…; …" | wrangler secret put NETFLIX_COOKIE`, then `pnpm worker-deploy`.
- **Verify**:
    ```bash
    docker compose -f docker-compose.sunbi-rsshub.yml logs rsshub --since 1m | grep -E 'ERR_NETFLIX' || echo "no cookie errors"
    curl -fsS "https://rsshub.yourdomain.com/spec/netflix/81249997?format=json&key=$ACCESS_KEY" | jq '.items[0] | {title, _extra}'
    ```

## `NAVER_COOKIE`

- **How to obtain** — see [RSSHUB_SETUP.md § `NAVER_COOKIE`](routes/RSSHUB_SETUP.md#environment-variables). Plan: log in at `comic.naver.com` (or whichever Naver property you target — `cafe.naver.com`, `blog.naver.com`, etc.), DevTools → Application → Cookies → copy the full `Cookie` header.
- **When to rotate** — weeks-to-months lifetime. Rotate on `ERR_NAVER_COOKIE_EXPIRED`. Naver's anti-bot can also 401 transiently under load; if you see 401s only at peak hours, consider adding a residential proxy ([RSSHUB_SETUP.md § Proxy Configuration](routes/RSSHUB_SETUP.md#proxy-configuration)) before rotating the cookie.
- **How to redeploy** — same as `NETFLIX_COOKIE` above, substituting the variable name.
- **Verify**:
    ```bash
    docker compose -f docker-compose.sunbi-rsshub.yml logs rsshub --since 1m | grep -E 'ERR_NAVER' || echo "no cookie errors"
    curl -fsS "https://rsshub.yourdomain.com/spec/naver/blog/webhackyo?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra'
    ```

## `BUBBLE_COOKIE`

- **How to obtain** — log in at `bubble.us`, open DevTools → Network → click any feed/poll request → Headers → copy the full `Cookie` request header. (Pattern matches the upstream `lib/routes/bubble/` module.)
- **When to rotate** — Bubble sessions are short (days to a few weeks). Rotate on `ERR_BUBBLE_COOKIE_EXPIRED` or when the upstream starts returning empty feeds.
- **How to redeploy** — same shape as `NETFLIX_COOKIE`:
    - **Docker Compose**: edit `.env`, `docker compose -f docker-compose.sunbi-rsshub.yml up -d rsshub`.
    - **Fly.io**: `fly secrets set BUBBLE_COOKIE="…" --app rsshub`, then `fly deploy`.
    - **Cloudflare Worker**: `echo "…" | wrangler secret put BUBBLE_COOKIE`, then `pnpm worker-deploy`.
- **Verify**:
    ```bash
    docker compose -f docker-compose.sunbi-rsshub.yml logs rsshub --since 1m | grep -E 'ERR_BUBBLE' || echo "no cookie errors"
    curl -fsS "https://rsshub.yourdomain.com/spec/bubble/<artist-id>?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra'
    ```

## `ACCESS_KEY`

The shared-secret key that all SPEC route clients must pass as `?key=...` (validated by RSSHub's access-key middleware against `config.accessKey`).

- **How to obtain** — never copy from anywhere. Generate it locally:
    ```bash
    openssl rand -hex 32
    ```
    The bootstrap helper [`scripts/bootstrap-sunbi-env.sh`](../scripts/bootstrap-sunbi-env.sh) does this automatically when writing `.env` from `.env.example`.
- **When to rotate** — only on suspected leak (e.g. it was checked into a public repo, or shared in a public support channel). Rotation invalidates every client in one step, so treat it as a "break-glass" rotation. There is no automatic expiry.
- **How to redeploy**
    - **Docker Compose**:
        ```bash
        # On the VM:
        sed -i "s|^ACCESS_KEY=.*|ACCESS_KEY=$(openssl rand -hex 32)|" /opt/sunbi-rsshub/.env
        docker compose -f docker-compose.sunbi-rsshub.yml up -d rsshub
        # Distribute the new key to:
        #   - Supabase Edge Function secrets (RSSHUB_ACCESS_KEY)
        #   - Anyone else calling the API directly
        ```
    - **Fly.io**:
        ```bash
        fly secrets set ACCESS_KEY=$(openssl rand -hex 32) --app rsshub
        fly deploy
        ```
    - **Cloudflare Worker**:
        ```bash
        openssl rand -hex 32 | wrangler secret put ACCESS_KEY
        pnpm worker-deploy
        ```
- **Verify**:
    ```bash
    # Without key: 401
    curl -o /dev/null -s -w "%{http_code}\n" "https://rsshub.yourdomain.com/spec/youtube/UCxxx?format=json"
    # With new key: 200 + items
    curl -fsS "https://rsshub.yourdomain.com/spec/youtube/UCxxx?format=json&key=$ACCESS_KEY" | jq '.items | length'
    ```

---

## Operational tips

- **One secret per command, not many at once.** If you bundle `fly secrets set WEVERSE_TOKEN=… NETFLIX_COOKIE=…` into a single command and one of them is malformed, the whole call fails silently and you have to bisect. Run them one at a time when you're rotating a stack.
- **Quoting matters for cookies.** `NETFLIX_COOKIE="SecureNetflixId=…; …"` — the value contains `;` and `=`, both of which are fine inside double quotes, but if you `eval` or pass through `sh -c` you must single-quote the whole value.
- **Don't bake secrets into the image.** The compose file reads them from `.env` at container start; the Fly and Worker configs read them from secret stores at deploy time. None of these should land inside the built image.
- **Audit trail.** `fly secrets list` and `wrangler secret list` show which secrets are set; pair these with the grep in [spec-error-codes.md](spec-error-codes.md) to confirm a rotation actually propagated.
- **Triage order on `ERR_*_EXPIRED`.** Always:
    1. `docker compose logs rsshub --since 1h | grep ERR_<PLATFORM>` — confirm the exact code.
    2. Re-obtain the secret from a fresh browser session.
    3. Update the secret store (`.env` / `fly secrets set` / `wrangler secret put`).
    4. Restart only the `rsshub` service (or `fly deploy` / `pnpm worker-deploy`).
    5. Hit the route with `?key=$ACCESS_KEY&format=json` and confirm `_extra` is populated.

---

## See also

- [RSSHUB_SETUP.md](routes/RSSHUB_SETUP.md) — full DevTools acquisition steps
- [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) — Phase 1 env setup
- [spec-error-codes.md](spec-error-codes.md) — error code table + grep triage
- [scripts/bootstrap-sunbi-env.sh](../scripts/bootstrap-sunbi-env.sh) — one-shot `.env` bootstrap
- [SPEC-sunbi-rsshub.md § Quick reference — env vars](SPEC-sunbi-rsshub.md#quick-reference--env-vars) — authoritative var list
