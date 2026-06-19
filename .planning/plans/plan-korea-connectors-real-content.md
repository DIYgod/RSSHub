# Plan: Korea SPEC Connectors — Contract Hardening & Real-Content Validation

**Issue:** Continue development of Korea-focused `/spec/*` connectors as a private Sunbi backend; harden contracts and validate against real upstream content (not a public RSS service).
**Created:** 2026-06-19
**Status:** Draft

## Goal

Ship a reliable private-backend connector layer for Korean media sources (Naver Blog/Webtoon, Weverse, Bubble, plus Viki/Netflix/YouTube for K-content). Close the test and contract gaps on the two Naver routes, reconcile env/docs drift (especially Netflix/TMDB), add an opt-in real-content smoke harness operators can run against a live instance, and fix any breakage discovered on real KR fixtures.

## Current State

**Implemented SPEC routes (7):** `lib/routes/spec/youtube.ts`, `viki.ts`, `weverse.ts`, `bubble.ts`, `netflix.ts` (+ `netflix-bridge.ts`, `netflix-tmdb.ts`), `naver-blog.ts`, `naver-webtoon.ts` (+ `naver-webtoon-list.ts` parsers).

**Korea-native connectors:** `naver-blog`, `naver-webtoon`, `weverse`, `bubble`. **K-content on global platforms:** `youtube`, `viki`, `netflix`.

**Test coverage:**
- Full 6-test MSW contract suites exist for youtube, viki, weverse, bubble, netflix (`tests/routes/spec/*.test.ts`).
- `naver-webtoon.test.ts` only tests parser functions in `naver-webtoon-list.ts` — no route-handler or `_extra` contract tests.
- `naver-blog` has **no** test file, MSW handler, or fixture.
- Only `netflix.test.ts` calls `assertSpecExtra` from `lib/types/spec-extra.zod.ts`.

**Contract drift:**
- `naver-webtoon.ts` (~L195–199) emits `episodeHash` and `totalPages` on `_extra` via `as SpecExtraNaverWebtoon` cast, but `SpecExtraNaverWebtoon` (`lib/types/spec-extra.ts` ~L89–112) and `specExtraNaverWebtoonSchema` (`lib/types/spec-extra.zod.ts` ~L93–100) omit them and all optional `series*` fields.

**Env/docs drift:**
- `netflix.ts` requires `TMDB_API_KEY` via `assertEnv` in `netflix-tmdb.ts` (~L42) but `.env.example`, `docker-compose.sunbi-rsshub.yml`, and `docs/spec-secrets-runbook.md` document `NETFLIX_COOKIE` instead.
- `NAVER_COOKIE` is documented for paywalled Naver content but neither naver route reads it today (paywall failures are silently swallowed in `naver-webtoon.ts` ~L158–160).

**Real-content validation today:** Manual curls in `docs/LAUNCH_RUNBOOK.md` Phase 3 only — no committed `scripts/spec-smoke.sh` or opt-in live vitest suite.

**Parallel upstream route:** `lib/routes/naver/webtoon-series.ts` uses Naver's JSON API with a non-`SpecExtra` `_extra` shape (`webtoon_episode`) — functional overlap with `spec/naver-webtoon` but different contract. Convergence deferred.

## Approach

Fix contract drift first so tests are honest, then bring Naver routes to parity with the established 6-test MSW pattern used by Weverse/Bubble. Add `assertSpecExtra` to every SPEC test suite. Ship an opt-in two-track real-content harness: `scripts/spec-smoke.sh` (HTTP, production-shaped, reads secrets from `.env`) and `tests/live/` (handler-level, `LIVE_TESTS=1`, no MSW). Run smoke against documented real KR IDs, fix connector bugs, and update stale checklist/docs. Defer public-service work, spec-only registry slimming, and `naver/webtoon-series` convergence.

## Execution checklist

### Wave 1 — Contract & env scaffolding (blocking)

- [ ] In `lib/types/spec-extra.ts` (~L89–112): add optional `episodeHash?: string` and `totalPages?: number` to `SpecExtraNaverWebtoon`; remove the `as SpecExtraNaverWebtoon` cast in `lib/routes/spec/naver-webtoon.ts` (~L195–199) once types align.
- [ ] In `lib/types/spec-extra.zod.ts` (~L93–100): extend `specExtraNaverWebtoonSchema` with optional `seriesThumb`, `seriesFrontImage`, `seriesAuthor`, `seriesSummary`, `seriesScore`, `seriesRating`, `seriesDayOfWeek`, `thumbnail`, `episodeHash`, `totalPages` to match the TS interface.
- [ ] In `.env.example` (~L27–31): add `TMDB_API_KEY=` with comment; add `YOUTUBE_API_v3_KEY=` and `VIKI_APP_ID=` as optional; annotate `NETFLIX_COOKIE` as unused by current `/spec/netflix` (TMDB bridge) or remove it.
- [ ] In `docker-compose.sunbi-rsshub.yml` (~L17–22): add `TMDB_API_KEY: '${TMDB_API_KEY}'` to `rsshub.environment`; keep `YOUTUBE_API_v3_KEY` as-is.
- [ ] In `docs/spec-secrets-runbook.md`: add `TMDB_API_KEY` acquisition/rotation section; reconcile Netflix section to describe TMDB bridge (not cookie) for `/spec/netflix`.

### Wave 2 — Naver Blog contract tests (MSW)

- [ ] Create `tests/fixtures/naver-blog-webhackyo.xml`: sanitized RSS sample from `rss.blog.naver.com/webhackyo.xml` (strip PII beyond public post metadata).
- [ ] Create `tests/fixtures/spec-naver-blog.json`: recorded `_extras[]` array matching MSW output for `webhackyo` blog.
- [ ] In `tests/mocks/handlers.ts`: add `naverBlogHandlers` block intercepting `GET https://rss.blog.naver.com/:blogId.xml` returning the XML fixture; append to exported `handlers` array.
- [ ] Create `tests/routes/spec/naver-blog.test.ts`: implement the 6-test contract (snapshot `_extra`, happy path `naver/blog/post`, JSON view preserves `_extra`, `assertSpecExtra` loop, empty RSS → `[]`, no auth tests needed) mirroring `tests/routes/spec/weverse.test.ts` `callHandler()` pattern with `blogId=webhackyo`.

### Wave 3 — Naver Webtoon route-handler contract tests (MSW)

- [ ] Create `tests/fixtures/spec-naver-webtoon.json`: recorded `_extras[]` for title `848000` (or `570503`) from MSW-shaped handler output.
- [ ] Create `tests/fixtures/naver-webtoon-848000-detail.html`: sanitized mobile detail page HTML for one free episode (panel image URLs present).
- [ ] In `tests/mocks/handlers.ts`: add `naverWebtoonHandlers` intercepting `m.comic.naver.com` list + `comic.naver.com` desktop list + `m.comic.naver.com/webtoon/detail` detail page; wire existing `naver-webtoon-848000-list.html` fixture for list responses.
- [ ] In `tests/routes/spec/naver-webtoon.test.ts`: add a new `describe('naver-webtoon route handler')` block with 6-test contract (snapshot, happy path `naver/webtoon/episode`, JSON view, `assertSpecExtra`, empty list via MSW override, no auth) calling `route.handler` from `@/routes/spec/naver-webtoon` with `titleId=848000`; keep existing parser unit tests.

### Wave 4 — Zod contract on all SPEC suites

- [ ] In `tests/routes/spec/youtube.test.ts`, `viki.test.ts`, `weverse.test.ts`, `bubble.test.ts`: add `it('_extra payload validates against the Zod contract')` loop calling `assertSpecExtra` on each item (copy from `netflix.test.ts` ~L71–76).

### Wave 5 — Real-content smoke harness (opt-in, not CI-gated)

- [ ] Create `scripts/spec-smoke.sh`: bash script reading `BASE_URL` (default `http://localhost:1200`) and `ACCESS_KEY` from env/`.env`; iterate public-tier routes (youtube `UCVSjwV8LXSoqxDKRcNGPrQg`, netflix `81249997`, naver-blog `webhackyo`, naver-webtoon `570503`, viki `37648c`) with `curl ?format=json&key=`; treat gated routes (weverse `3-EXID`, bubble placeholder) as SKIP on HTTP 401; assert `items.length > 0` and `items[0]._extra.type` present; exit 1 only on public-tier failures.
- [ ] Add `"smoke:spec": "bash scripts/spec-smoke.sh"` to `package.json` scripts (~L28).
- [ ] Create `tests/live/spec-live.test.ts`: `describe.skipIf(process.env.LIVE_TESTS !== '1')` calling real handlers (no `import '../../setup'`); public routes always run; gated routes wrapped in `describe.skipIf(!process.env.WEVERSE_TOKEN)` etc.; each test asserts `assertSpecExtra` on all items; 30s timeout per test.
- [ ] Add `"vitest:live": "cross-env NODE_ENV=test LIVE_TESTS=1 vitest run tests/live"` to `package.json` scripts; ensure default `pnpm vitest` does not pick up `tests/live/` (use separate path in script only).

### Wave 6 — Real-content run & connector fixes

- [ ] Run `pnpm dev` locally with `.env` populated (`ACCESS_KEY`, `TMDB_API_KEY`, optional `WEVERSE_TOKEN`/`BUBBLE_COOKIE`); execute `bash scripts/spec-smoke.sh` and record pass/fail per route in `docs/routes/SPEC_SMOKE_RESULTS.md` (new file, sanitized — no secrets).
- [ ] Fix any public-tier route failures discovered (likely targets: `naver-webtoon.ts` parser/selectors, `bubble.ts` API host `api.bubblem.io` vs `bubble.us` links, `viki.ts` public app-id rate limit); commit fixes in the same PR series as smoke harness.
- [ ] With `WEVERSE_TOKEN` and `BUBBLE_COOKIE` set locally, re-run smoke and confirm gated routes return `_extra`-populated items; document expected SKIP vs PASS in `SPEC_SMOKE_RESULTS.md`.

### Wave 7 — Documentation & checklist sync

- [ ] Create `docs/routes/ROUTE_NAVER_BLOG.md`: document `/spec/naver/blog/:blogId`, example `webhackyo`, no auth, `_extra.type=naver/blog/post`, cache TTL 30min.
- [ ] In `docs/routes/ROUTE_NETFLIX.md`: replace `NETFLIX_COOKIE` requirement with `TMDB_API_KEY` + IMDb bridge description matching `netflix-bridge.ts`.
- [ ] In `docs/LAUNCH_RUNBOOK.md` Phase 3 (~L68–85): replace inline curl loop with `bash scripts/spec-smoke.sh`; replace `<test-title-id>` / `<test-artist-id>` placeholders with real IDs (`37648c`, document bubble artist ID once verified).
- [ ] In `docs/routes/SPEC_REMAINING_CHECKLIST.md`: mark netflix route `[x]`; add `[x]` items for naver contract tests and smoke harness when done; keep deployment monitoring items `[ ]` (out of scope).

## Testing Strategy

- **CI gate (unchanged):** `pnpm vitest run tests/routes/spec/` — all MSW contract tests including new naver suites; `pnpm lint`; `pnpm build:routes`.
- **Opt-in live (local/VM only):** `pnpm vitest:live` with `TMDB_API_KEY` etc. in `.env`; never run in GitHub Actions.
- **Operator smoke (post-deploy):** `BASE_URL=https://rsshub.yourdomain.com bash scripts/spec-smoke.sh` from LAUNCH_RUNBOOK VM.
- **Templates:** Mirror `tests/routes/spec/weverse.test.ts` for naver-blog; extend `tests/routes/spec/naver-webtoon.test.ts` for handler tests; MSW patterns in `tests/mocks/handlers.ts` weverse/bubble blocks.
- **Edge cases:** Naver paywalled episode (empty `panelImageUrls` but list metadata ships); Weverse/Bubble 401 when secret missing; Netflix title-not-found (`allowEmpty`); Viki `regionLocked: true`.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Naver HTML structure changes break scraper | M | H | Parser unit tests + live smoke; mobile/desktop dual-parse already in `naver-webtoon-list.ts` |
| Real-content tests flaky (rate limits, geo) | H | M | Never CI-gate; SKIP gated 401s; run from KR VM per LAUNCH_RUNBOOK |
| `episodeHash`/`totalPages` contract change breaks Sunbi ingest | L | M | Add as optional fields; confirm with extension before making required |
| Bubble API host/link mismatch | M | M | Verify on real artist ID in Wave 6; fix `bubble.ts` links if needed |
| Viki public app-id blocked | M | L | Document `VIKI_APP_ID` override; soft-fail in smoke with clear message |
| MSW intercepts live tests accidentally | M | H | `tests/live/` must not import `tests/setup.ts`; separate vitest script path |

## Files Affected

| File | Action | Purpose |
|------|--------|---------|
| `lib/types/spec-extra.ts` | Modify | Add naver-webtoon optional fields |
| `lib/types/spec-extra.zod.ts` | Modify | Sync Zod schema with TS interface |
| `lib/routes/spec/naver-webtoon.ts` | Modify | Remove unsafe cast after type sync |
| `.env.example` | Modify | Document TMDB_API_KEY, optional keys |
| `docker-compose.sunbi-rsshub.yml` | Modify | Inject TMDB_API_KEY |
| `docs/spec-secrets-runbook.md` | Modify | TMDB section; fix Netflix |
| `tests/fixtures/naver-blog-webhackyo.xml` | Create | MSW RSS fixture |
| `tests/fixtures/spec-naver-blog.json` | Create | `_extra` snapshot |
| `tests/fixtures/spec-naver-webtoon.json` | Create | `_extra` snapshot |
| `tests/fixtures/naver-webtoon-848000-detail.html` | Create | Detail page fixture |
| `tests/mocks/handlers.ts` | Modify | Naver blog + webtoon MSW handlers |
| `tests/routes/spec/naver-blog.test.ts` | Create | 6-test contract suite |
| `tests/routes/spec/naver-webtoon.test.ts` | Modify | Add handler contract tests |
| `tests/routes/spec/youtube.test.ts` | Modify | Add assertSpecExtra |
| `tests/routes/spec/viki.test.ts` | Modify | Add assertSpecExtra |
| `tests/routes/spec/weverse.test.ts` | Modify | Add assertSpecExtra |
| `tests/routes/spec/bubble.test.ts` | Modify | Add assertSpecExtra |
| `scripts/spec-smoke.sh` | Create | Opt-in HTTP smoke harness |
| `tests/live/spec-live.test.ts` | Create | Opt-in handler live tests |
| `package.json` | Modify | `smoke:spec`, `vitest:live` scripts |
| `docs/routes/ROUTE_NAVER_BLOG.md` | Create | Route documentation |
| `docs/routes/ROUTE_NETFLIX.md` | Modify | TMDB env reconciliation |
| `docs/LAUNCH_RUNBOOK.md` | Modify | Point Phase 3 at smoke script |
| `docs/routes/SPEC_REMAINING_CHECKLIST.md` | Modify | Sync completion status |
| `docs/routes/SPEC_SMOKE_RESULTS.md` | Create | Record real-content run outcomes |
| `docs/TODO.md` | Create | Deferred work ledger |

## Pragmatist Notes

- **Scope trimmed:** Public RSS service, spec-only registry build, rate limiting, and `naver/webtoon-series` → `SpecExtra` convergence are explicitly out of scope — logged in `docs/TODO.md`.
- **Wave ordering:** Contract/env fixes (Wave 1) must land before naver contract tests or `assertSpecExtra` will fail on known drift.
- **Real-content fixes (Wave 6) are intentionally last:** smoke harness first gives a reproducible failure surface; don't guess at selector fixes without a failing run.
- **Bubble artist ID:** smoke script uses a placeholder until Wave 6 verifies a real room ID — document the verified ID before marking Wave 7 complete.
- **No `pnpm test` in checklist:** `/do` runs project verification after implementation; checklist focuses on discrete deliverables.
