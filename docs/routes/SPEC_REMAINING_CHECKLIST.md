# SPEC RSSHub — remaining work checklist

This checklist tracks what is left in **`sunbi-rsshub`** beyond "just write routes" (RSSHub fork; **SPEC** is the `/spec/` route namespace).

Status legend:

- `[ ]` not started
- `[-]` in progress
- `[x]` done

## 1) Repo and Local Runtime

- [x] Confirm toolchain: Node `>=22.20`, `pnpm@10`, `corepack enable`
- [x] Install deps: `pnpm install`
- [x] Create `.env` with at least:
    - [x] `ACCESS_KEY`
    - [x] `CACHE_TYPE`
    - [x] `REDIS_URL` (if using Redis)
- [x] Start local instance: `pnpm dev`
- [x] Smoke check health/feed endpoint at `http://localhost:1200`

## 2) Route Delivery Backlog

## Implemented / present

- [x] `naver/webtoon-series` custom route is present (`lib/routes/naver/webtoon-series.ts`)

## Remaining SPEC route plan

- [x] `lib/routes/spec/youtube.ts` (+ optional membership variant)
- [x] `lib/routes/spec/viki.ts`
- [x] `lib/routes/spec/weverse.ts`
- [x] `lib/routes/spec/bubble.ts`
- [x] `lib/routes/spec/netflix.ts` (validate contract vs upstream `lib/routes/netflix/` and Sunbi ingestion)

For each remaining route:

- [x] Create/verify `namespace.ts`
- [x] Add route file with valid `Route` metadata (`path`, `example`, `radar`, `features`, `maintainers`)
- [x] Ensure data items use `_extra` (not `extra`)
- [x] Add `pubDate` where source provides timestamps
- [x] Ensure item `link` is unique and human-readable
- [x] Add caching (`cache.tryGet`) for detail fetch loops

## 3) Contract and Payload Validation

- [x] Validate JSON output with `?format=json` for every route
- [x] Verify `_extra.type` discriminator for each platform
- [x] Verify required `_extra` keys used by Sunbi ingestion
- [x] Check route path and docs examples are working
- [x] Validate no unsupported `DataItem` top-level fields were added

## 4) Quality Gates

- [x] Build route manifest: `pnpm build:routes`
- [x] Lint: `pnpm lint`
- [x] Tests: `pnpm vitest` (or `pnpm test` for full checks)
- [x] Manual curl snapshots saved for each route (`docs/routes/SPEC_SMOKE_RESULTS.md`, `scripts/spec-smoke.sh`)
- [x] Error paths tested (missing auth, source failures, empty feed behavior)

## 5) Deployment and Ops

- [x] Choose runtime target:
    - [x] Node process (`pnpm start`) or
    - [ ] Docker Compose or
    - [ ] Cloudflare Worker
- [x] Provision production env vars (`ACCESS_KEY`, secrets, cookies/tokens)
- [x] Enable Redis cache in production
- [ ] Configure uptime/health monitoring
- [ ] Verify Sunbi client points to this running fork instance

## 6) Maintenance

- [ ] Add upstream remote if missing
- [ ] Monthly upstream sync (`pnpm upstream:sync`)
- [ ] Re-run route smoke tests after each sync
- [ ] Track expiring auth values (for example `WEVERSE_TOKEN`) and rotation schedule

## 7) Definition of Done

- [ ] All target routes implemented and returning valid JSON feed
- [ ] `_extra` / `SpecExtra` contract stable across all shipped **SPEC** routes
- [ ] CI/local quality checks green (`build:routes`, lint, tests)
- [ ] Production instance reachable and protected by `ACCESS_KEY`
- [ ] Runbook dry-run completed end-to-end

## 3.5) Operational docs

- [x] [docs/LAUNCH_RUNBOOK.md](../../LAUNCH_RUNBOOK.md) — VM Docker Compose launch procedure (phases 0–6).
- [x] [docs/spec-cache.md](../../spec-cache.md) — TTL table + `cache.tryGet` worked example.
- [x] [docs/spec-error-codes.md](../../spec-error-codes.md) — typed error code table + log triage.
- [x] [docs/spec-secrets-runbook.md](../../spec-secrets-runbook.md) — acquisition + rotation for `WEVERSE_TOKEN`, `NETFLIX_COOKIE`, `NAVER_COOKIE`, `BUBBLE_COOKIE`, `ACCESS_KEY`.
- [x] [docs/spec-upstream-merge.md](../../spec-upstream-merge.md) — `pnpm upstream:sync` procedure + `.gitattributes` merge=ours for SPEC paths.
- [x] [scripts/bootstrap-sunbi-env.sh](../../scripts/bootstrap-sunbi-env.sh) — generates `ACCESS_KEY`, writes `.env`, sets `CACHE_TYPE`, prints Fly secrets commands.
