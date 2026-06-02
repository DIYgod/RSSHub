# RSSHub Self-Hosted Setup

← [INDEX](INDEX.md) | See also: [ARCH.md](ARCH.md)

## Repo

`sunbi-rsshub` — your fork of `DIYgod/RSSHub`
Custom SPEC routes live in `lib/routes/spec/` (plus other namespaces under `lib/routes/`).

## Why a Fork (not vanilla Docker)

RSSHub's Docker image bakes routes at build time — volume-mounting custom
routes does not work. A fork lets you add routes under `lib/routes/` and build
your own image. Upstream updates are pulled via `git merge upstream/main`.

## Initial Setup

```bash
# 1. Fork on GitHub: DIYgod/RSSHub → your-org/sunbi-rsshub
# 2. Clone locally
git clone https://github.com/your-org/sunbi-rsshub.git
cd sunbi-rsshub

# 3. Add upstream remote for future updates
git remote add upstream https://github.com/DIYgod/RSSHub.git

# 4. Install dependencies (RSSHub uses pnpm)
corepack enable
pnpm install

# 5. Start dev server (hot reload)
pnpm dev
# Routes available at http://localhost:1200
```

## Directory Structure for Custom Routes

```
lib/routes/
├── naver/
│   ├── namespace.ts            ← extend upstream Naver routes
│   ├── webtoon-series.ts       ← see ROUTE_NAVER_WEBTOON.md
│   └── ...
├── spec/                       ← SPEC namespace (Sunbi media contract)
│   ├── namespace.ts
│   ├── utils.ts
│   ├── youtube.ts              ← see ROUTE_YOUTUBE.md / IMPL-01
│   ├── viki.ts                 ← see ROUTE_VIKI.md / IMPL-02
│   ├── weverse.ts              ← see ROUTE_WEVERSE.md / IMPL-03
│   ├── bubble.ts               ← see ROUTE_BUBBLE.md / IMPL-04
│   └── netflix.ts              ← see ROUTE_NETFLIX.md / IMPL-05
├── viki/                       ← upstream (reference / wrap as needed)
├── netflix/
├── weverse/
└── bubble/
```

## Environment Variables

Create `.env` in the repo root (gitignored):

```bash
# Required
NODE_ENV=production
CACHE_TYPE=redis
REDIS_URL=redis://redis:6379/

# Access control — all SPEC route requests must include ?key=VALUE
ACCESS_KEY=<generate with: openssl rand -hex 32>

# Optional: platform auth
WEVERSE_TOKEN=<bearer token from browser devtools>
  # How to get: Open weverse.io → DevTools → Network → any /api/ request
  # → Headers → Authorization → copy the Bearer token
  # Expires: ~30 days, must be refreshed manually

NETFLIX_COOKIE=<optional; full episode data>
  # How to get: netflix.com → DevTools → Application → Cookies
  # → copy the full Cookie header string
  # Needed for: Falcor cache with episode-level data

NAVER_COOKIE=<optional; cafe/paywalled webtoon content>
  # How to get: comic.naver.com → DevTools → Application → Cookies

# KR Residential Proxy (see Proxy Configuration section below)
HTTP_PROXY=
HTTPS_PROXY=
NO_PROXY=localhost,redis
```

## Docker Compose (production)

`docker-compose.yml` in repo root:

```yaml
version: '3.8'

services:
    rsshub:
        build:
            context: .
            dockerfile: Dockerfile
        image: sunbi/rsshub:latest
        restart: unless-stopped
        ports:
            - '1200:1200'
        environment:
            NODE_ENV: production
            CACHE_TYPE: redis
            REDIS_URL: redis://redis:6379/
            CACHE_EXPIRE: 600
            CACHE_CONTENT_EXPIRE: 3600
            ACCESS_KEY: '${ACCESS_KEY}'
            WEVERSE_TOKEN: '${WEVERSE_TOKEN:-}'
            NETFLIX_COOKIE: '${NETFLIX_COOKIE:-}'
            NAVER_COOKIE: '${NAVER_COOKIE:-}'
            # Limit concurrent requests to avoid anti-bot triggers
            REQUEST_TIMEOUT: '20000'
            REQUEST_RETRY: '2'
            # KR residential proxy (leave blank to go direct)
            HTTP_PROXY: '${HTTP_PROXY:-}'
            HTTPS_PROXY: '${HTTPS_PROXY:-}'
            NO_PROXY: '${NO_PROXY:-localhost,redis}'
        depends_on:
            redis:
                condition: service_healthy
        networks:
            - sunbi-internal
        healthcheck:
            test: ['CMD', 'curl', '-f', 'http://localhost:1200/healthz']
            interval: 30s
            timeout: 10s
            retries: 3

    redis:
        image: redis:7-alpine
        restart: unless-stopped
        command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
        volumes:
            - rsshub_redis:/data
        networks:
            - sunbi-internal
        healthcheck:
            test: ['CMD', 'redis-cli', 'ping']
            interval: 10s
            timeout: 5s
            retries: 3

networks:
    sunbi-internal:
        name: sunbi-internal

volumes:
    rsshub_redis:
```

## Build and Deploy Commands

```bash
# Development
pnpm dev                        # hot reload at localhost:1200

# Test a specific route
curl "http://localhost:1200/naver/webtoon/series/758037?format=json"
curl "http://localhost:1200/spec/youtube/UCVSjwV8LXSoqxDKRcNGPrQg?format=json"

# Production build + run
docker compose build
docker compose up -d
docker compose logs -f rsshub

# Update from upstream (monthly)
git fetch upstream
git merge upstream/main
# resolve conflicts in lib/routes/ (isolated namespaces reduce collisions)
docker compose build
docker compose up -d
```

## Proxy Configuration

RSSHub's `lib/utils/ofetch.ts` reads `HTTP_PROXY` / `HTTPS_PROXY` from the
environment and applies them to all outbound requests automatically. No code
changes are needed — proxy support is purely a deployment configuration.

### Why a KR residential proxy

Naver's anti-bot systems are IP-origin aware. Datacenter IPs (AWS, GCP, etc.)
and foreign IPs are held to higher scrutiny than Korean residential addresses.
A KR residential proxy ensures all Naver requests appear to originate from a
normal Korean user, regardless of where your server is hosted.

### Recommended provider

**Smartproxy residential** (`smartproxy.com`) — has a Korean residential pool,
supports HTTP CONNECT, and rotates the exit IP automatically on each new
connection. At this service's request volume (~tens of requests/day to Naver
after cache), cost is under $1/month.

### Setup

1. Sign up at smartproxy.com → Residential Proxies → create a sub-user
2. Note your username and password
3. Add to `.env`:

```bash
# country-KR forces a Korean residential exit node
# Port 10000 = rotating (new IP per connection)
# Port 10001 = sticky session (same IP for 10 min)
HTTP_PROXY=http://user-country-KR:yourpassword@gate.smartproxy.com:10000
HTTPS_PROXY=http://user-country-KR:yourpassword@gate.smartproxy.com:10000

# Only proxy Naver — YouTube, Weverse, etc. go direct (faster)
NO_PROXY=localhost,redis,youtube.com,weverse.io,viki.com,netflix.com,bubble.us
```

4. Restart the stack: `docker compose up -d`

### Verify the proxy is working

```bash
# Should show a Korean IP, not your server's IP
curl -x "$HTTP_PROXY" https://api.ipify.org

# Should return webtoon feed data (not a Naver block/redirect)
curl "http://localhost:1200/naver/webtoon/series/758037?format=json&key=$ACCESS_KEY" \
  | jq '.items[0].title'
```

### Alternative: Gluetun VPN sidecar

If you prefer a VPN over a proxy service, add a
[gluetun](https://github.com/qdm12/gluetun) sidecar to `docker-compose.yml`
and route the `rsshub` container's traffic through it via
`network_mode: "service:gluetun"`. This works with any VPN provider that has
Korean servers (Mullvad, ProtonVPN, etc.) but rotates IP only on reconnect
rather than per-request, so it provides less IP diversity than a residential
proxy pool.

### When you don't need a proxy

If your server is hosted in Korea (KT, SKB, or KR-region cloud), your IP is
already Korean residential-adjacent and Naver is unlikely to block you at
typical RSS polling rates. Add a proxy only if you observe 429s or redirect
loops in `docker compose logs -f rsshub`.

## TTL Reference by Route

| Route                                   | Cache TTL             | Why                       |
| --------------------------------------- | --------------------- | ------------------------- |
| `naver/webtoon/series/*`                | 15 min (series list)  | New episodes weekly       |
| `naver/webtoon/series/*` individual eps | 24 h                  | Immutable once live       |
| `spec/youtube/*`                        | 15 min                | Videos can drop any time  |
| `viki/series/*`                         | 30 min (episode list) | Dramas air 1-2x/week      |
| `netflix/drama/*`                       | 60 min                | Episodes drop weekly      |
| `weverse/artist/*`                      | 5 min                 | Posts/lives are real-time |
| `bubble/artist/*`                       | 10 min                | Message notifications     |

## Verifying the `_extra` field

JSON Feed output (`?format=json`) uses the key **`_extra`** on each item (see `lib/views/json.ts`). Confirm it is present:

```bash
curl "http://localhost:1200/naver/webtoon/series/758037?format=json&key=$ACCESS_KEY" | \
  jq '.items[0]._extra'
```

Expected for Naver Webtoon:

```json
{
    "type": "webtoon_episode",
    "platform": "naver",
    "titleId": "758037",
    "episodeNo": "200",
    "thumbnail": "https://...",
    "seriesTitle": "...",
    "isFree": true,
    "sourceLocale": "ko",
    "ocrPending": true
}
```

The ingestion Edge Function reads this object to populate `feed.items` columns.
See [INGESTION.md](INGESTION.md) for the full mapping.
