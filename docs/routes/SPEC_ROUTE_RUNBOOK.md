# SPEC RSSHub route runbook

Purpose: execute remaining route work and ship a running **`sunbi-rsshub`** instance for Sunbi (routes live under **`/spec/`**).

Use this with `SPEC_REMAINING_CHECKLIST.md`.

## Phase 0: Preconditions

1. Confirm environment:
    - Node `>=22.20`
    - `pnpm@10`
2. From repo root:
    - `corepack enable`
    - `pnpm install`
3. Create `.env` (minimum):
    - `ACCESS_KEY=<random secret>`
    - `CACHE_TYPE=memory` (local) or `redis` (shared/prod)
    - `REDIS_URL=redis://localhost:6379/` (when using Redis)

Exit criteria:

- Local dev can start with no fatal config errors.

## Phase 1: Local Runtime Bring-up

1. Start local server:
    - `pnpm dev`
2. In another shell, smoke check:
    - `curl "http://localhost:1200/naver/webtoon/series/758037?format=json&key=<ACCESS_KEY>"`

If this fails:

- Check server logs for env/key mismatch.
- Check route path correctness (`lib/routes/*`).

Exit criteria:

- At least one known route responds with JSON.

## Phase 2: Implement Remaining Route Backlog

Current observed custom coverage:

- Implemented: `naver/webtoon-series`
- Remaining: `spec/youtube`, `spec/viki`, `spec/weverse`, `spec/bubble`, and Sunbi ingestion validation for `spec/netflix`

For each remaining route:

1. Add/verify `lib/routes/spec/namespace.ts` and route modules beside it
2. Add route file with correct `Route` metadata.
3. Build item payloads with typed fields and `_extra` object.
4. Add caching for detail fetches (`cache.tryGet` in loops).
5. Ensure:
    - unique `item.link`
    - `pubDate` when available
    - no unsupported top-level fields

Exit criteria:

- All planned namespaces have working endpoint(s).

## Phase 3: Contract validation for Sunbi ingestion

For each route endpoint:

1. Request JSON:
    - `curl "http://localhost:1200/<route>?format=json&key=<ACCESS_KEY>"`
2. Validate `_extra` exists:
    - `jq '.items[0]._extra'`
3. Validate discriminator:
    - `_extra.type` must be stable and platform-specific.
4. Validate required payload fields for ingestion mapping.

Failure handling:

- If `_extra` missing or malformed, treat as blocking.
- Fix route and re-run validation before moving on.

Exit criteria:

- Contract checks pass for every SPEC route you ship.

## Phase 4: Quality Gates

Run in order:

1. `pnpm build:routes`
2. `pnpm lint`
3. `pnpm vitest` (or `pnpm test` for full format+coverage pipeline)

Failure handling:

- Fix failures immediately.
- Re-run failing command until clean.

Exit criteria:

- Build/lint/tests pass locally.

## Phase 5: Deploy Runtime for Fork

Important: the fork must be running somewhere; code in GitHub is not enough.

Choose one:

1. Node runtime:
    - Build as required
    - `pnpm start`
2. Docker Compose:
    - `docker compose build`
    - `docker compose up -d`
3. Cloudflare Worker:
    - `pnpm worker-build && pnpm worker-deploy`

Post-deploy validation:

- Hit public endpoint with `?key=<ACCESS_KEY>&format=json`
- Confirm route data and `_extra` on deployed instance
- Confirm health monitoring is in place

Exit criteria:

- Sunbi can fetch from your deployed fork endpoint.

## Phase 6: Upstream Sync and Maintenance

Monthly (or as needed):

1. `git fetch upstream`
2. `git merge upstream/main`
3. Resolve conflicts (prefer custom namespace isolation)
4. Re-run:
    - `pnpm build:routes`
    - `pnpm lint`
    - `pnpm vitest`
5. Re-run route smoke checks

Also maintain:

- `ACCESS_KEY` rotation policy
- token/cookie expiry refresh process (for providers that require auth context)

Exit criteria:

- Fork remains current and SPEC routes remain healthy.

## Fast Triage Table

- 401/403 responses:
    - Check `ACCESS_KEY` mismatch and required provider auth values.
- Empty feed:
    - Validate source fetch still works; inspect parser selectors/API response.
- Duplicated items:
    - Verify unique `item.link` generation.
- Slow route:
    - Ensure detail loops are cached and avoid unnecessary page-level scraping.
- Route not found:
    - Re-run `pnpm build:routes` and verify route metadata/path.
