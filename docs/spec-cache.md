# SPEC cache — TTLs, layers, and a worked example

> **Purpose**: Document the two cache layers that wrap every `/spec/...` request — what they store, how long, and how a request flows through them.
>
> **Source of truth**: TTL table mirrored from [SPEC-sunbi-rsshub.md § Cache TTL table](SPEC-sunbi-rsshub.md#cache-ttl-table); config block at [`lib/config.ts:761-774`](lib/config.ts).

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

Cache key pattern (L2 in-route): `spec:<platform>:<seriesExternalId>[:<scope>]` — enforced by `buildCacheKey()` in [`lib/routes/spec/utils.ts`](lib/routes/spec/utils.ts).

---

## Two cache layers

`/spec/...` traffic is wrapped by **two distinct caches**, with different scopes, keys, and lifecycles. A request is checked against L1 first (the response cache in middleware), and on a miss each individual upstream fetch inside the route handler is checked against L2 (the per-route in-handler cache).

| Layer  | Where                                                                   | Key shape                                                                        | Stores                                                                                     | Backing store                       | TTL                                                            |
| ------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------- |
| **L1** | [`lib/middleware/cache.ts`](lib/middleware/cache.ts)                    | `rsshub:koa-redis-cache:<XXH64(path+format+limit)>`                              | Full rendered RSS/JSON response body                                                       | Redis (or memory) via `cacheModule` | `CACHE_EXPIRE` (default `5 * 60 s`)                            |
| **L2** | [`lib/utils/cache/index.ts`](lib/utils/cache/index.ts) (`cache.tryGet`) | Caller-supplied; for SPEC routes, `spec:<platform>:<seriesExternalId>[:<scope>]` | Whatever the fetcher returns (often a parsed list of upstream records used to build items) | Same `cacheModule` as L1            | Per-call (`maxAge` arg); for SPEC routes this is the row above |

L1 is the "did anyone request this URL in the last 5 minutes?" cache. It is keyed by hashed path+format+limit, and on a hit it short-circuits the entire route — no upstream fetches happen, and the response is served from `ctx.set('data', ...)` directly. The middleware also stamps a `RSSHub-Cache-Status: HIT` response header on hits.

L2 is the "I am in the middle of building a SPEC response and I want to memoize an upstream sub-fetch" cache. Each SPEC route handler wraps its inner fetches in `cache.tryGet(key, fetcher, maxAge)` — for example, a Weverse handler might cache the artist-community listing for 3 minutes while it iterates episodes. On a route-level cache miss (L1), the handler still benefits from L2 so that concurrent in-flight requests for the same `seriesExternalId` don't all hammer the upstream API.

The two are not redundant: L1 prevents re-rendering, L2 prevents re-fetching. With Redis (`CACHE_TYPE=redis`) both share the same backing store; with `CACHE_TYPE=memory` both share the in-process LRU; on Cloudflare Worker the L1 middleware is a no-op (see `isWorker` branch in [`lib/utils/cache/index.ts`](lib/utils/cache/index.ts)) and L2 must be wired to KV or a compatible store.

---

## Worked example — `GET /spec/youtube/UCVSjwV8LXSoqxDKRcNGPrQg?format=json&key=...`

Below: a real request and the cache flow that surrounds it. (Source pointers: [`lib/middleware/cache.ts`](lib/middleware/cache.ts), [`lib/utils/cache/index.ts`](lib/utils/cache/index.ts), [`lib/routes/spec/youtube.ts`](lib/routes/spec/youtube.ts), [`lib/config.ts:761-774`](lib/config.ts).)

### Configuration in effect

```typescript
// lib/config.ts:761-774 (relevant excerpt)
cache: {
    type: envs.CACHE_TYPE || 'memory',            // → 'redis' in production
    requestTimeout: toInt(envs.CACHE_REQUEST_TIMEOUT, 60),
    routeExpire: toInt(envs.CACHE_EXPIRE, 5 * 60),  // 300s = 5 min default for L1
    contentExpire: toInt(envs.CACHE_CONTENT_EXPIRE, 1 * 60 * 60), // 1 h default for L2
},
redis: {
    url: envs.REDIS_URL || 'redis://localhost:6379/',
},
```

### L1: response-level cache (middleware)

`lib/middleware/cache.ts:13-81` runs before every route. For the request above:

```typescript
// Pseudocode matching lib/middleware/cache.ts
const requestPath = '/spec/youtube/UCVSjwV8LXSoqxDKRcNGPrQg';
const format = ':json';
const limit = ''; // no ?limit= → not in key
const { h64ToString } = await xxhash();
const key = 'rsshub:koa-redis-cache:' + h64ToString(requestPath + format + limit);
// e.g. 'rsshub:koa-redis-cache:1f3a9c0e4b7d5e21'
const controlKey = 'rsshub:path-requested:' + h64ToString(requestPath + format + limit);
```

The middleware then:

1. Reads `controlKey` — if it equals `'1'`, another worker is already mid-fetch for this path; this worker waits up to 10 × 6 s (or 1 × 3 s under `NODE_ENV=test`) and re-checks, otherwise throws `RequestInProgressError`.
2. Reads `key` — if present, sets `RSSHub-Cache-Status: HIT`, parses the stored body, and skips the route handler entirely.
3. On miss, sets `controlKey = '1'`, runs the route handler, and on success writes the JSON body to `key` with TTL `config.cache.routeExpire` (300 s default).

So a second request to the same URL within 5 minutes is served from Redis with `RSSHub-Cache-Status: HIT` — no upstream call, no per-route L2 lookup.

### L2: in-route `cache.tryGet` (`lib/utils/cache/index.ts`)

Inside `lib/routes/spec/youtube.ts`, the route wraps the upstream RSS fetch in `cache.tryGet`:

```typescript
// lib/routes/spec/youtube.ts (paraphrased)
import cache from '@/utils/cache';
import { buildCacheKey } from './utils';

const items = await cache.tryGet(
    buildCacheKey('youtube', channelId), // → 'spec:youtube:UCVSjwV8LXSoqxDKRcNGPrQg'
    () => ofetch(`${YT_FEED_BASE}?channel_id=${channelId}`),
    30 * 60 // 30 min — matches TTL table
);
```

`buildCacheKey()` is the `spec:<platform>:<...>` pattern enforcer (see [`lib/routes/spec/utils.ts`](lib/routes/spec/utils.ts)).

`cache.tryGet` (in [`lib/utils/cache/index.ts:104-127`](lib/utils/cache/index.ts)) does:

1. `cacheModule.get(key)` — Redis `GET` (or memory LRU `get`).
2. Hit → return parsed JSON.
3. Miss → call `getValueFunc()` (the upstream fetch), `cacheModule.set(key, value, maxAge)`, and return the fresh value.

For our YouTube example, the L2 key in Redis is:

```
spec:youtube:UCVSjwV8LXSoqxDKRcNGPrQg
```

and the value is the parsed Atom XML body (or a pre-processed representation of it). TTL is 30 minutes per the table above.

For a high-frequency route like Weverse (3 min TTL), the L2 key would look like:

```
spec:weverse:3-EXID                        # artistId as second segment
```

For a near-real-time route like Bubble (2 min TTL):

```
spec:bubble:artist-12345                   # bubbleRoomId encoded as third segment
```

### Combined flow

```text
client → GET /spec/youtube/UCxxx?format=json&key=...
   │
   ▼
[lib/middleware/cache.ts]
   │
   ├── 1. read  rsshub:path-requested:<hash>   → '1'? → wait + re-check
   │
   ├── 2. read  rsshub:koa-redis-cache:<hash>  → HIT?  → return body, set RSSHub-Cache-Status: HIT
   │                                              ↓ MISS
   │                                              set controlKey = '1', proceed
   │
   ▼
[lib/routes/spec/youtube.ts handler]
   │
   ├── 3. cache.tryGet('spec:youtube:UCxxx', fetchYtRss, 1800)
   │      → HIT? → skip fetch
   │      → MISS → ofetch('https://www.youtube.com/feeds/videos.xml?channel_id=UCxxx')
   │             → parse → cache.set('spec:youtube:UCxxx', …, 1800)
   │
   ▼
build Data { items: [...] }   →   ctx.set('data', …)
   │
   ▼
[lib/middleware/cache.ts:70-76]
   │
   ├── 4. if Cache-Control != no-cache → cache.set(rsshub:koa-redis-cache:<hash>, body, routeExpire=300)
   │
   └── 5. set controlKey = '0' to release the in-flight gate
   │
   ▼
client ← 200 application/json (+ RSSHub-Cache-Status: MISS on first call, HIT on repeats)
```

### Verifying the cache locally

```bash
# First call: upstream is hit, RSSHub-Cache-Status: MISS, _extra populated.
curl -fsS -D - "http://localhost:1200/spec/youtube/UCVSjwV8LXSoqxDKRcNGPrQg?format=json&key=$ACCESS_KEY" \
  -o /dev/null | grep -i RSSHub-Cache-Status

# Second call within CACHE_EXPIRE: RSSHub-Cache-Status: HIT, no upstream call.
curl -fsS -D - "http://localhost:1200/spec/youtube/UCVSjwV8LXSoqxDKRcNGPrQg?format=json&key=$ACCESS_KEY" \
  -o /dev/null | grep -i RSSHub-Cache-Status

# Inspect L2 directly in Redis:
docker compose -f docker-compose.sunbi-rsshub.yml exec redis \
  redis-cli KEYS 'spec:*'                 # all per-route keys
docker compose -f docker-compose.sunbi-rsshub.yml exec redis \
  redis-cli KEYS 'rsshub:*'               # all L1 response keys
docker compose -f docker-compose.sunbi-rsshub.yml exec redis \
  redis-cli TTL 'spec:youtube:UCVSjwV8LXSoqxDKRcNGPrQg'   # 30 min for YouTube
```

---

## See also

- [SPEC-sunbi-rsshub.md § Cache TTL table](SPEC-sunbi-rsshub.md#cache-ttl-table) — authoritative TTL numbers
- [lib/middleware/cache.ts](lib/middleware/cache.ts) — L1 implementation
- [lib/utils/cache/index.ts](lib/utils/cache/index.ts) — L2 (`tryGet`) implementation
- [lib/config.ts:761-774](lib/config.ts) — cache + Redis config block
- [lib/routes/spec/utils.ts](lib/routes/spec/utils.ts) — `buildCacheKey()` helper used by all SPEC routes
- [RSSHUB_SETUP.md](routes/RSSHUB_SETUP.md) — proxy & env-var reference (proxy, NO_PROXY)
