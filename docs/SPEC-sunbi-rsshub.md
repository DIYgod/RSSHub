# Sunbi × SPEC-RSSHub — Development Spec & Sprint Plan

> **Repo**: [koreanpatch/SPEC-RSSHub](https://github.com/koreanpatch/SPEC-RSSHub)
> **Paired extension**: [koreanpatch/sunbi](https://github.com/koreanpatch/sunbi)
> **Supabase project**: `dtbrtukejtbooqmnxvvl` (nickname: sunbi)
> **Primary source of truth**: `AGENTS.md` in this repo

**Implementation specs (per route / tests / extension client):** [docs/impl/README.md](impl/README.md) (split from [SPEC-Dump.md](SPEC-Dump.md)).

---

## Overview

SPEC-RSSHub is a focused fork of upstream RSSHub. Its purpose is to expose a small, tightly-defined set of media routes that power the Sunbi Chrome extension's "what's new" and "track progress" features. Every item returned by a **SPEC** route (`/spec/...`) carries a structured `_extra` object (discriminated by `type`) that maps directly into the Supabase `dict.*` schema.

### In-scope platforms

| Platform        | Auth required          | Item kind                | Puppeteer?              |
| --------------- | ---------------------- | ------------------------ | ----------------------- |
| YouTube (Sunbi) | No (RSS or API)        | video / membership video | No                      |
| Viki            | Possibly (token)       | episode                  | No                      |
| Weverse         | Yes — `WEVERSE_TOKEN`  | post / paid post         | No                      |
| Bubble          | Yes — cookie/token     | message                  | No                      |
| Netflix (Sunbi) | Yes — `NETFLIX_COOKIE` | episode                  | TBD (avoid if possible) |

### Out of scope

- Generic RSSHub route changes not touching Sunbi platforms
- Puppeteer-heavy routes not needed by Sunbi
- Complex user account linking (manual cookie/token setup is acceptable v1)

---

## Repository conventions (from `AGENTS.md`)

The following rules govern all code written in this repo. They are non-negotiable; CI enforces them.

### Route structure

- Route files live at `lib/routes/<namespace>/index.ts` (or named files per sub-route).
- **No `README.md` or `radar.ts` files** — descriptions go in `Route['description']`, radar rules go in `Route['radar']`.
- **No edits to `lib/router.js`** — it is deprecated; routes self-register.
- `namespace.ts`: the `url` field must **not** include `https://` prefix.
- `example` field in route config must start with `/` (route path, not a website URL).
- `categories`: exactly **one** entry.
- `maintainers`: valid GitHub usernames only.
- `requirePuppeteer: true` only when Puppeteer is actually used.

### Code style

- `camelCase` everywhere — no `snake_case` in JS/TS variables.
- `import type { ... }` for type-only imports.
- No template literals where a plain string suffices.
- Arrow functions always use parentheses around parameters.
- No `await` inside loops — use `Promise.all()`.
- Functions defined at highest possible scope.

### Data handling

- **`_extra` is the only valid place for SPEC / Sunbi ingestion payloads** — no ad-hoc top-level keys on items.
- `cache.tryGet()` is mandatory when fetching article details in a loop.
- Cache key pattern: `spec:<platform>:<scope>:<identifier>`.
- `pubDate` must use `parseDate`; never use `new Date()` as a fallback.
- `description` contains only body content — no title, author, date duplication.
- `link` must be a human-readable URL and globally unique (it becomes `guid`).
- No custom query parameters — path parameters only (`:param`).
- Never paginate (first page only per RSS convention).

### Media / enclosures

- `enclosure_type` must be a valid MIME type — `video/youtube` is **not** valid.
- `enclosure_url` must point to a direct media file, not a webpage.

---

## `_extra` contract

### Global required fields (all SPEC routes)

```typescript
interface SpecExtraBase {
    /** Discriminator — format: "<platform>/<item-kind>" */
    type: string;
    platform: 'youtube' | 'viki' | 'weverse' | 'bubble' | 'netflix';
    /** Canonical human-readable URL for this item */
    sourceUrl: string;
    /** Stable platform-specific item ID */
    externalId: string;
    /** Series/channel/show level ID */
    seriesExternalId: string;
    /** Human-readable episode/video label, e.g. "EP 7" or "S01E03" */
    episodeLabel?: string;
    /** ISO 8601 timestamp — must equal item.pubDate if present */
    publishedAt?: string;
}
```

### Platform-specific extensions

```typescript
interface SpecExtraYoutube extends SpecExtraBase {
    type: 'youtube/video' | 'youtube/membership-video';
    platform: 'youtube';
    channelId: string;
    channelTitle: string;
    isMembershipOnly: boolean;
}

interface SpecExtraViki extends SpecExtraBase {
    type: 'viki/episode';
    platform: 'viki';
    titleId: string;
    seasonNumber?: number;
    episodeNumber?: number;
    regionLocked: boolean;
}

interface SpecExtraWeverse extends SpecExtraBase {
    type: 'weverse/post' | 'weverse/media' | 'weverse/moment';
    platform: 'weverse';
    artistId: string;
    communityId: string;
    postType: 'artist' | 'fan' | 'media' | 'moment';
    isPaid: boolean;
}

interface SpecExtraBubble extends SpecExtraBase {
    type: 'bubble/message';
    platform: 'bubble';
    artistId: string;
    bubbleRoomId: string;
    messageType: 'text' | 'image' | 'video';
}

interface SpecExtraNetflix extends SpecExtraBase {
    type: 'netflix/episode' | 'netflix/film';
    platform: 'netflix';
    titleId: string;
    seasonNumber?: number;
    episodeNumber?: number;
    maturityRating?: string;
}

export type SpecExtra = SpecExtraYoutube | SpecExtraViki | SpecExtraWeverse | SpecExtraBubble | SpecExtraNetflix;
```

> **Location**: `lib/types/spec-extra.ts`
> **Rule**: `_extra` must be typed against this union. No ad-hoc keys outside this shape.

---

## Cache TTL table

| Platform | Scope            | Recommended TTL | Rationale                              |
| -------- | ---------------- | --------------- | -------------------------------------- |
| YouTube  | channel/playlist | 30 min          | Videos post infrequently               |
| YouTube  | membership       | 15 min          | Slightly more time-sensitive           |
| Viki     | series           | 60 min          | Catalog-like; episodes add slowly      |
| Weverse  | artist community | 3 min           | High-frequency posts                   |
| Bubble   | room             | 2 min           | Near-real-time messages                |
| Netflix  | title/season     | 60 min          | Catalog; episodes added weekly at most |

Cache key pattern: `spec:<platform>:<seriesExternalId>[:<scope>]`

---

## Error codes

All auth/expiry errors must surface both a machine-readable code and a human string.

| Code                         | Platform | Trigger                              | HTTP hint |
| ---------------------------- | -------- | ------------------------------------ | --------- |
| `ERR_WEVERSE_TOKEN_MISSING`  | Weverse  | `WEVERSE_TOKEN` env var absent       | 401       |
| `ERR_WEVERSE_TOKEN_EXPIRED`  | Weverse  | API returns 401/403                  | 401       |
| `ERR_NETFLIX_COOKIE_MISSING` | Netflix  | `NETFLIX_COOKIE` env var absent      | 401       |
| `ERR_NETFLIX_COOKIE_EXPIRED` | Netflix  | API returns 401 or redirect to login | 401       |
| `ERR_NAVER_COOKIE_MISSING`   | Naver    | `NAVER_COOKIE` env var absent        | 401       |
| `ERR_NAVER_COOKIE_EXPIRED`   | Naver    | API returns 401                      | 401       |
| `ERR_VIKI_AUTH`              | Viki     | Token absent or expired              | 401       |

Throw these using RSSHub's standard error mechanism — do not return empty arrays with custom messages (AGENTS.md rule #44).

---

## Deploy targets

Three config files exist in the repo. Choose one as the primary; the others remain for reference.

| File                                        | Target            | Notes                                                                                                        |
| ------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `docker-compose.sunbi-rsshub.yml`           | Compose on a VM   | Simplest ops; supports all routes; no Worker limitations                                                     |
| `fly.toml`                                  | Fly.io            | Good for always-on; needs secret management via `fly secrets set`                                            |
| `wrangler.toml` + `tsdown-worker.config.ts` | Cloudflare Worker | Fastest cold starts; **must verify** no `requirePuppeteer` routes; `cache.tryGet` backed by KV or compatible |

**Recommendation**: Start with Compose/Fly for full route compatibility. Add Worker support only after confirming all SPEC routes are Puppeteer-free.

---

## Sprint 0 — Foundation and CI (Day 1–2)

**Goal**: Every collaborator can clone, run, test, and deploy in under 30 minutes.

### Checklist

- [ ] Add `lib/types/spec-extra.ts` with the full `SpecExtra` union type
- [ ] Confirm primary deploy target; update root `README` with:
    - [ ] Which config file is canonical
    - [ ] Required env vars: `SPEC_RSSHUB_KEY`, `WEVERSE_TOKEN`, `NETFLIX_COOKIE`, `NAVER_COOKIE`
    - [ ] Health check endpoint and expected response
- [ ] Verify `vitest.config.ts` runs `pnpm test` cleanly on a fresh clone
- [ ] Add a CI step (GitHub Actions or equivalent) that runs:
    - [ ] Lint (ESLint — AGENTS.md code style rules)
    - [ ] `pnpm test` (Vitest)
- [ ] Confirm no Sunbi-specific routes exist yet (baseline test run should be green)
- [ ] Add `docs/spec-cache.md` (TTL table from this spec)
- [ ] Add `docs/spec-error-codes.md` (error code table from this spec)

### Deliverable

Green CI on `main`. Every engineer can run tests locally.

---

## Sprint 1 — Core routes (Week 1)

**Goal**: All five platform routes implemented with `_extra` populated and at least one JSON fixture per route.

### Checklist — Shared

- [ ] Create `lib/routes/spec/namespace.ts`:
    - [ ] `name: 'SPEC'`
    - [ ] `url: 'sunbi.app'` (no `https://` — AGENTS.md rule; consumer landing site for Sunbi)
    - [ ] `categories: ['multimedia']` (single entry — must match `Category` in `lib/types.ts`)
- [ ] Create `lib/routes/spec/utils.ts` with shared helpers:
    - [ ] `buildCacheKey(platform, ...parts)` — enforces `spec:<platform>:<...>` pattern
    - [ ] `throwAuthError(code, message)` — standardised error throw
    - [ ] `assertEnv(varName, errorCode)` — checks env var and throws if missing

### Checklist — YouTube (`spec/youtube`)

- [ ] Route path: `/spec/youtube/:channelId` (and optionally `/spec/youtube/membership/:channelId`)
- [ ] Data source: YouTube RSS feed (`https://www.youtube.com/feeds/videos.xml?channel_id=:channelId`) — no API key required for public feeds
- [ ] For membership videos: requires an authenticated request; document acquisition in route `description`
- [ ] Populate `SpecExtraYoutube` on every item
- [ ] Cache: 30 min (public), 15 min (membership)
- [ ] Record JSON fixture: `tests/fixtures/spec-youtube.json`
- [ ] Radar:
    - `source: ['www.youtube.com/channel/:channelId']`
    - `source: ['www.youtube.com/@:handle']`
    - `target: '/spec/youtube/:channelId'`

### Checklist — Viki

- [ ] Route path: `/spec/viki/:titleId`
- [ ] Examine existing upstream `viki` route in `lib/routes/viki/` — reuse or wrap
- [ ] Populate `SpecExtraViki` on every item; set `regionLocked` from API response
- [ ] Cache: 60 min
- [ ] Record JSON fixture: `tests/fixtures/spec-viki.json`
- [ ] Radar:
    - `source: ['www.viki.com/tv/:titleId']`
    - `target: '/spec/viki/:titleId'`

### Checklist — Weverse

- [ ] Route path: `/spec/weverse/:artistId`
- [ ] Auth: `WEVERSE_TOKEN` from env — call `assertEnv('WEVERSE_TOKEN', 'ERR_WEVERSE_TOKEN_MISSING')` at handler start
- [ ] Handle 401/403 responses from Weverse API → throw `ERR_WEVERSE_TOKEN_EXPIRED`
- [ ] Populate `SpecExtraWeverse`; set `isPaid` from API field
- [ ] Cache: 3 min
- [ ] Record JSON fixture including at least one paid post: `tests/fixtures/spec-weverse.json`
- [ ] Radar:
    - `source: ['weverse.io/:artistSlug']`
    - `source: ['weverse.io/:artistSlug/feed']`
    - `target: '/spec/weverse/:artistId'`

### Checklist — Bubble

- [ ] Route path: `/spec/bubble/:artistId`
- [ ] Auth: bubble session cookie (env var `BUBBLE_COOKIE` — add to env var docs)
- [ ] Handle session expiry gracefully
- [ ] Populate `SpecExtraBubble` on every item
- [ ] Cache: 2 min
- [ ] Record JSON fixture: `tests/fixtures/spec-bubble.json`
- [ ] Radar:
    - `source: ['bubble.us/channel/:artistId']`
    - `target: '/spec/bubble/:artistId'`

### Checklist — Netflix

- [ ] Investigate upstream `lib/routes/netflix/` — determine:
    - [ ] Does it use Puppeteer? (`requirePuppeteer` flag)
    - [ ] What auth mechanism does it use?
    - [ ] Decision: wrap upstream vs. new handler at `/spec/netflix/:titleId`
- [ ] Route path: `/spec/netflix/:titleId` (series) or `/spec/netflix/film/:titleId`
- [ ] Auth: `NETFLIX_COOKIE` — call `assertEnv`, throw `ERR_NETFLIX_COOKIE_EXPIRED` on 401/redirect
- [ ] Populate `SpecExtraNetflix` on every item
- [ ] Cache: 60 min
- [ ] Record JSON fixture with a multi-season series: `tests/fixtures/spec-netflix.json`
- [ ] Radar:
    - `source: ['www.netflix.com/title/:titleId']`
    - `target: '/spec/netflix/:titleId'`

### Deliverable

All five routes accessible locally (`pnpm dev`). Five JSON fixtures committed. `AGENTS.md` rules pass lint.

---

## Sprint 2 — Contract hardening and tests (Week 2)

**Goal**: Zero silent contract drift between RSSHub output and Sunbi ingestion.

### Checklist — Snapshot tests

For each route, add a Vitest test file at `tests/routes/spec/<platform>.test.ts`:

- [ ] `youtube.test.ts`
- [ ] `viki.test.ts`
- [ ] `weverse.test.ts`
- [ ] `bubble.test.ts`
- [ ] `netflix.test.ts`

Each file must contain:

```
describe('<platform> route', () => {
  it('matches snapshot', ...)          // serialises items to JSON; compare to fixture
  it('happy path — returns items', ...) // msw mock of upstream API; assert item count > 0
  it('auth missing — throws typed error', ...) // unset env var; assert error code
  it('auth expired — throws typed error', ...) // msw returns 401; assert error code
  it('empty list — returns []', ...)   // msw returns empty; assert items === []
})
```

### Checklist — msw setup

- [ ] Add `msw` as a dev dependency if not present
- [ ] Create `tests/mocks/handlers.ts` with one handler per platform
- [ ] Create `tests/mocks/server.ts` (msw Node server for Vitest)
- [ ] Wire `beforeAll/afterEach/afterAll` lifecycle in a Vitest setup file

### Checklist — Runtime validation

- [ ] Add Zod (or `@sinclair/typebox`) schema mirroring `SpecExtra` union
- [ ] In each route handler, validate `_extra` against the Zod schema before returning (dev/test mode only — skip in production for performance)
- [ ] Add a test that feeds the recorded fixture through the Zod schema and asserts it passes

### Checklist — CI gate

- [ ] All snapshot and contract tests must pass on PR
- [ ] Failing snapshot = required review before merge

### Deliverable

Full test suite (≥5 happy-path + ≥10 error-path tests). Snapshots committed. CI blocks on failure.

---

## Sprint 3 — Sunbi extension integration (Week 3)

**Goal**: Extension can fetch, parse, and display items from SPEC-RSSHub. One platform end-to-end into Supabase.

### Checklist — Extension (`koreanpatch/sunbi`)

- [ ] Add `src/lib/rsshubClient.ts`:
    - [ ] Reads `RSSHUB_BASE_URL` and `RSSHUB_KEY` from extension config/storage
    - [ ] Builds URLs: `${baseUrl}/spec/${platform}/${id}?key=${key}&format=json`
    - [ ] Returns `SpecExtra[]` (shared types via git submodule or `npm` package if extracted)
    - [ ] Typed error classes: `RsshubAuthError`, `RsshubEmptyError`, `RsshubNetworkError`
    - [ ] Displays a clear error banner in UI when RSSHub returns auth/network errors
- [ ] Implement at minimum for YouTube:
    - [ ] Show a list of latest items from a configured channel
    - [ ] Mark items read/unread (writes to Supabase `dict.*`)

### Checklist — Supabase Edge Function (`spec-ingest`)

- [ ] Create edge function `spec-ingest` in Supabase project `dtbrtukejtbooqmnxvvl`:
    - [ ] Accepts POST body: `{ platform, items: SpecExtra[] }`
    - [ ] Validates body using the Zod schema (shared with RSSHub tests or duplicated)
    - [ ] Maps `SpecExtra` → `dict.*` tables:
        - [ ] `dict.media_source` (`platform` + `externalId`)
        - [ ] `dict.media_series` (`seriesExternalId`, series metadata)
        - [ ] `dict.media_episode` (item-level record)
        - [ ] `dict.media_progress` (per-user, if auth context present)
    - [ ] Uses upsert — idempotent on `externalId`
- [ ] Contract tests:
    - [ ] For each platform, POST the recorded JSON fixture to the edge function in test mode
    - [ ] Assert correct rows inserted/updated
    - [ ] Assert no nulls in required columns

### Deliverable

End-to-end demo: browser extension fetches YouTube items → displays list → marks one read → Supabase row updated.

---

## Sprint 4 — Ops polish and maintenance loop (Week 4)

**Goal**: Failures are visible, secrets are rotatable, upstream merges are safe.

### Checklist — Radar verification

- [ ] Test each Radar rule manually:
    - Open the real platform URL in a browser
    - Confirm RSSHub Radar (browser extension) suggests the correct SPEC route
- [ ] Verify patterns for: YouTube channel/handle, Viki title, Weverse artist, Bubble artist, Netflix title

### Checklist — Operational polish

- [ ] Structured logging on every route handler:
    - Log: `{ route, platform, identifier, cacheHit, durationMs }` on success
    - Log: `{ route, platform, errorCode, message }` on failure
- [ ] Health check endpoint (`/spec/health` or reuse existing `/healthz`):
    - Returns: `{ status: 'ok', routes: ['youtube','viki','weverse','bubble','netflix'], gitSha, buildTime }`
- [ ] Add `docs/spec-ops.md`:
    - How to tail logs per deploy target (Compose: `docker logs`, Fly: `fly logs`, Worker: `wrangler tail`)
    - How to confirm cache is working

### Checklist — Secrets rotation runbook

Document in `docs/spec-secrets-runbook.md`:

- [ ] **`WEVERSE_TOKEN`**:
    - How to obtain (login flow / DevTools Network tab)
    - Rotation frequency: as needed when `ERR_WEVERSE_TOKEN_EXPIRED` appears in logs
    - How to redeploy: `fly secrets set WEVERSE_TOKEN=<value>` or Compose `.env` update
- [ ] **`NETFLIX_COOKIE`**:
    - How to obtain (`Cookie` header from authenticated Netflix session)
    - Rotation frequency: as needed (Netflix sessions can last weeks to months)
    - Alert trigger: `ERR_NETFLIX_COOKIE_EXPIRED` in logs
- [ ] **`NAVER_COOKIE`**:
    - Same pattern as Netflix

### Checklist — Upstream merge cadence

- [ ] Create `docs/spec-upstream-merge.md`:
    - Target frequency: weekly (small merges beat giant rebases)
    - Merge steps:
        1. `git fetch upstream && git merge upstream/main`
        2. Resolve conflicts (SPEC routes are in `lib/routes/spec/` — usually no conflict)
        3. Run `pnpm test` — all snapshot tests must pass
        4. Manual `curl` check for each SPEC route against local instance
        5. If snapshots change due to upstream, update fixture + review diff
    - Who is responsible for the weekly merge

### Deliverable

Ops docs complete. Secrets runbook reviewed. One successful upstream merge with tests passing.

---

## Future iterations

- [ ] Extract `SpecExtra` types and Zod schemas into a shared npm package (`@koreanpatch/sunbi-types`) for use by both RSSHub fork and Supabase edge functions without duplication
- [ ] Add `contract_version` field to `_extra` so the extension can handle breaking schema changes gracefully
- [ ] Expose a `/spec/status` endpoint listing each route's last successful fetch time and cache freshness
- [ ] Per-user personalization: once Supabase auth is wired, scope ingest to `auth.uid()` in `dict.media_progress`
- [ ] Cloudflare Worker path: confirm all SPEC routes are Puppeteer-free, then test `wrangler deploy` and validate KV-backed cache TTLs

---

## Quick reference — env vars

| Variable          | Used by                | Description                                                       |
| ----------------- | ---------------------- | ----------------------------------------------------------------- |
| `SPEC_RSSHUB_KEY` | All routes             | API access key; validated by RSSHub key middleware                |
| `WEVERSE_TOKEN`   | `weverse` route        | Bearer token from an authenticated Weverse session                |
| `NETFLIX_COOKIE`  | `netflix` route        | Full `Cookie` header string from an authenticated Netflix session |
| `NAVER_COOKIE`    | `naver/webtoon-series` | Full `Cookie` header string from an authenticated Naver session   |
| `BUBBLE_COOKIE`   | `bubble` route         | Session cookie from an authenticated Bubble session               |
