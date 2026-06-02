Here is the full implementation spec for the Netflix integration.

---

# IMPL-11: Netflix Integration

> **Scope**: Episode feed via TMDB, subtitle capture via extension session intercept, optional server-side cookie linking.
> **No Puppeteer. No official Netflix API.**
> **Files**: `lib/routes/spec/netflix.ts`, `lib/types/sunbi-extra.ts`, Supabase Edge Function `fetch-netflix-subtitle`, Sunbi extension `netflix.ts`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│ RSSHub /spec/netflix/:netflixTitleId                 │
│  → TMDB API (free key)                               │
│  → resolves Netflix ID → IMDb → TMDB                 │
│  → emits episode feed: title, description, thumbnail │
└─────────────────────────┬───────────────────────────┘
                          │ _extra.tmdbSeriesId
                          ▼
┌─────────────────────────────────────────────────────┐
│ Sunbi Extension (Chrome)                             │
│  → chrome.cookies detects active Netflix session     │
│  → webRequest intercepts subtitle blobs on playback  │
│  → POST subtitle segments → Supabase Edge Function   │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│ Supabase Edge Function: process-netflix-subtitle     │
│  → validates + stores in dict.media_episode_transcript│
│  → triggers difficulty grading job                   │
└─────────────────────────────────────────────────────┘
```

---

## Sprint 1: RSSHub Route (`/spec/netflix/:netflixTitleId`)

### Goals

- Emit per-episode RSS items with TMDB metadata.
- Cache the Netflix → TMDB ID bridge permanently.
- No Netflix auth required for the feed.

### Checklist

#### TMDB Setup

- [ ] Register free TMDB API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- [ ] Add `TMDB_API_KEY` to env vars and `.env.example`
- [ ] Document in `docs/spec-env-vars.md`

#### Netflix ID → TMDB ID Bridge

- [ ] Create `lib/routes/spec/netflix-bridge.ts`:
    - [ ] `resolveNetflixToTmdb(netflixTitleId: string): Promise<TmdbBridge>`
    - [ ] Step 1: fetch `https://www.netflix.com/title/:id` with plain `got.get()` (no auth needed for HTML)
    - [ ] Step 2: extract IMDb ID from HTML meta tag `<meta property="imdb:pageConst" content="tt...">`
    - [ ] Step 3: call `https://api.themoviedb.org/3/find/:imdbId?external_source=imdb_id&api_key=...`
    - [ ] Step 4: return `{ tmdbSeriesId, tmdbType: 'tv' | 'movie', imdbId }`
    - [ ] Cache result with key `spec:netflix:bridge:${netflixTitleId}` — **TTL: 30 days** (IDs never change)
    - [ ] Handle 404 from Netflix (removed title) gracefully — return `null`, emit empty feed

#### TMDB Episode Fetcher

- [ ] Create `lib/routes/spec/netflix-tmdb.ts`:
    - [ ] `fetchTmdbSeries(tmdbId: string): Promise<TmdbSeries>` — series metadata, poster, genres
    - [ ] `fetchTmdbSeason(tmdbId: string, seasonNumber: number): Promise<TmdbSeason>` — episode list
    - [ ] `fetchTmdbChanges(tmdbId: string): Promise<TmdbChange[]>` — detect new episodes
    - [ ] Cache series metadata: TTL 24h
    - [ ] Cache season episodes: TTL 6h
    - [ ] Cache changes: TTL 30min (this is what RSS polling hits)
    - [ ] Handle movies: single item with TMDB movie metadata, no seasons

#### Route Handler (`lib/routes/spec/netflix.ts`)

- [ ] Define route:
    ```typescript
    path: '/netflix/:netflixTitleId';
    example: '/spec/netflix/81249997'; // Squid Game
    parameters: {
        netflixTitleId: 'Netflix title ID from netflix.com/title/:id';
    }
    ```
- [ ] `features.requireConfig`:
    - [ ] `TMDB_API_KEY` — required
- [ ] `features.requirePuppeteer: false`
- [ ] Radar:
    - [ ] `www.netflix.com/title/:netflixTitleId` → `/spec/netflix/:netflixTitleId`
    - [ ] `www.netflix.com/watch/:netflixTitleId` → `/spec/netflix/:netflixTitleId`
- [ ] Handler flow:
    - [ ] Call `resolveNetflixToTmdb(netflixTitleId)`
    - [ ] If `null` → return empty feed with error message in description
    - [ ] If `tmdbType === 'movie'` → single item
    - [ ] If `tmdbType === 'tv'`:
        - [ ] Fetch all seasons via `fetchTmdbChanges` to detect latest
        - [ ] Fetch most recent 2 seasons' episodes
        - [ ] Emit one `DataItem` per episode, newest first
- [ ] `_extra` per episode:
    ```typescript
    {
      type: 'netflix/episode' | 'netflix/film',
      platform: 'netflix',
      sourceUrl: `https://www.netflix.com/title/${netflixTitleId}`,
      externalId: `${netflixTitleId}-S${season}E${episode}`,
      seriesExternalId: netflixTitleId,
      episodeLabel: `S${season}E${episode}`,
      publishedAt: ep.air_date,
      netflixTitleId,
      tmdbSeriesId,
      tmdbEpisodeId,
      imdbId,
      thumbnailUrl: `https://image.tmdb.org/t/p/w500${ep.still_path}`,
      subtitleStatus: 'none',   // updated by extension
      captionLanguages: [],     // populated when subtitle captured
    }
    ```
- [ ] Add `SunbiExtraNetflix` type update to `lib/types/sunbi-extra.ts`:
    - [ ] `netflixTitleId: string`
    - [ ] `tmdbSeriesId: string`
    - [ ] `tmdbEpisodeId: number`
    - [ ] `imdbId: string`
    - [ ] `thumbnailUrl: string`
    - [ ] `subtitleStatus: 'none' | 'captured' | 'processing' | 'done'`
    - [ ] `captionLanguages: string[]`

#### JSON Fixture

- [ ] Create `tests/fixtures/spec/netflix-squid-game.json` — canonical TMDB response for S02E01

#### Tests

- [ ] Vitest: happy path — valid Netflix ID → episode list
- [ ] Vitest: movie path — single item output
- [ ] Vitest: bridge 404 — removed title returns empty feed
- [ ] Vitest: TMDB downstream 500 — cached stale data returned, no crash

---

## Sprint 2: Supabase Schema

### Goals

- Store episode metadata and captured subtitle segments.
- Track subtitle capture status per episode per user.

### Checklist

#### Migration

- [ ] Create migration `dict.media_netflix_episode`:
    ```sql
    CREATE TABLE dict.media_netflix_episode (
      id              BIGSERIAL PRIMARY KEY,
      netflix_title_id TEXT NOT NULL,
      tmdb_series_id   TEXT,
      tmdb_episode_id  INTEGER,
      season_number    INTEGER,
      episode_number   INTEGER,
      title            TEXT,
      overview         TEXT,
      thumbnail_url    TEXT,
      air_date         DATE,
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE UNIQUE INDEX ON dict.media_netflix_episode (netflix_title_id, season_number, episode_number);
    ```
- [ ] Create migration `dict.media_episode_transcript` (shared with YouTube):
    ```sql
    CREATE TABLE dict.media_episode_transcript (
      id               BIGSERIAL PRIMARY KEY,
      platform         TEXT NOT NULL,  -- 'netflix', 'youtube', etc.
      external_id      TEXT NOT NULL,  -- e.g. '81249997-S2E1'
      lang             TEXT NOT NULL,
      segments         JSONB NOT NULL, -- [{start_ms, dur_ms, text}]
      raw_format       TEXT,           -- 'ttml', 'vtt', 'srt'
      difficulty_score NUMERIC,
      captured_by      UUID REFERENCES auth.users,
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE UNIQUE INDEX ON dict.media_episode_transcript (platform, external_id, lang);
    ```
- [ ] Add RLS policies:
    - [ ] Users can only read/write their own captured transcripts
    - [ ] Service role can write from Edge Functions

---

## Sprint 3: Sunbi Extension — Netflix Session Detection

### Goals

- Detect when user is logged into Netflix.
- Show "Netflix linked ✓" in Sunbi UI.
- Never send Netflix cookie values to server.

### Checklist

#### Manifest permissions

- [ ] Add to `manifest.json` / WXT config:
    ```json
    "permissions": ["cookies"],
    "host_permissions": ["https://www.netflix.com/*"]
    ```

#### Session detection (`src/entrypoints/background/netflix.ts`)

- [ ] Create `checkNetflixSession(): Promise<boolean>`:
    ```typescript
    const cookie = await browser.cookies.get({
        url: 'https://www.netflix.com',
        name: 'NetflixId',
    });
    return cookie !== null;
    ```
- [ ] Poll every 60s while extension is active
- [ ] Store result in extension local storage: `{ netflixLinked: boolean, checkedAt: ISO }`
- [ ] Expose via background message handler: `{ type: 'GET_NETFLIX_STATUS' }`
- [ ] **Never send cookie value anywhere** — boolean flag only

#### UI (`src/components/AccountStatus.tsx` or equivalent)

- [ ] Show Netflix linked status badge in Sunbi popup
- [ ] If not linked: "Open Netflix and log in to enable subtitle capture"
- [ ] If linked: "Netflix ✓ — subtitle capture active"

---

## Sprint 4: Sunbi Extension — Subtitle Intercept

### Goals

- Capture subtitle segments during Netflix playback automatically.
- Send processed text (not raw credentials) to Supabase.

### Checklist

#### Web request interception (`src/entrypoints/background/netflix-subtitles.ts`)

- [ ] Register `webRequest.onCompleted` listener for `https://www.netflix.com/*`:
    ```typescript
    browser.webRequest.onCompleted.addListener(
        (details) => {
            if (details.url.includes('nflxvideo.net') && details.url.includes('dfxp')) {
                handleSubtitleRequest(details.url, details.tabId);
            }
        },
        { urls: ['*://*.nflxvideo.net/*', '*://www.netflix.com/*'] }
    );
    ```
- [ ] `handleSubtitleRequest(url, tabId)`:
    - [ ] `fetch(url)` to retrieve TTML/DFXP XML blob
    - [ ] Parse XML → extract `<p begin="..." end="..." ...>text</p>` elements
    - [ ] Convert timestamps (`HH:MM:SS.mmm`) → milliseconds
    - [ ] Build segments array: `[{ start_ms, dur_ms, text }]`
    - [ ] Extract episode context from active Netflix tab URL (titleId, episodeId)

#### Permissions additions

- [ ] `"webRequest"` permission in manifest
- [ ] `"*://*.nflxvideo.net/*"` in host_permissions

#### TTML Parser (`src/lib/netflix/ttml-parser.ts`)

- [ ] Parse TTML/DFXP XML:
    - [ ] Handle `<tt>` root
    - [ ] Extract `xml:lang` for language code
    - [ ] Parse `<body><div><p>` structure
    - [ ] Handle `tts:color` spans (strip formatting, keep text)
    - [ ] Output: `{ lang: string, segments: Segment[] }`
- [ ] Unit tests with real TTML fixture (captured from DevTools)

#### Episode context resolver (`src/lib/netflix/episode-context.ts`)

- [ ] From active tab URL `netflix.com/watch/:episodeId`:
    - [ ] Extract `episodeId`
    - [ ] Look up `netflixTitleId` from Supabase (was stored when RSS item was ingested)
    - [ ] Build `externalId`: `${netflixTitleId}-S${season}E${episode}`
- [ ] Fallback: store raw `episodeId` and resolve later

#### Send to Supabase Edge Function

- [ ] POST to `supabase.functions.invoke('process-netflix-subtitle')`:
    ```typescript
    {
      platform: 'netflix',
      externalId: '81249997-S2E1',
      lang: 'ko',
      segments: [{ start_ms, dur_ms, text }],
      rawFormat: 'ttml'
    }
    ```
- [ ] On success: update local extension state `subtitleStatus: 'processing'`
- [ ] On failure: queue for retry (max 3 attempts, store in `chrome.storage.local`)

---

## Sprint 5: Supabase Edge Function — `process-netflix-subtitle`

### Goals

- Validate, store, and trigger grading for captured subtitle segments.

### Checklist

- [ ] Create `supabase/functions/process-netflix-subtitle/index.ts`:
    - [ ] Validate request body with Zod:
        ```typescript
        const schema = z.object({
            platform: z.literal('netflix'),
            externalId: z.string(),
            lang: z.string().length(2),
            segments: z
                .array(
                    z.object({
                        start_ms: z.number(),
                        dur_ms: z.number(),
                        text: z.string(),
                    })
                )
                .min(1),
            rawFormat: z.enum(['ttml', 'vtt', 'srt']),
        });
        ```
    - [ ] Upsert into `dict.media_episode_transcript`
    - [ ] Invoke difficulty grading function (or queue via `pg_net`)
    - [ ] Return `{ success: true, segmentCount: N }`
- [ ] Deploy: `supabase functions deploy process-netflix-subtitle`
- [ ] Add to `.env.example`: no new vars needed (uses `SUPABASE_SERVICE_ROLE_KEY` internally)
- [ ] Write integration test with fixture TTML → expected segments

---

## Sprint 6: Contract Tests + Ops

### Checklist

#### Contract tests

- [ ] Record real TMDB API response for Squid Game S2 → snapshot in `tests/fixtures/spec/tmdb-squid-s2.json`
- [ ] Record real TTML subtitle fixture from Netflix DevTools → `tests/fixtures/spec/netflix-ttml-ko.xml`
- [ ] Test TTML parser against fixture → assert segment count, first text, lang
- [ ] Test Edge Function with fixture → assert DB write shape

#### Ops

- [ ] Document TMDB_API_KEY rotation (free key, no rotation needed but note the quota: 1M requests/day)
- [ ] Add Sentry or structured log for subtitle capture failures in extension
- [ ] Add alert: if `subtitleStatus` stuck at `'processing'` > 10min → log warning

#### Maintenance

- [ ] Netflix changes their TTML schema occasionally — add a schema version check in the parser and fail loudly with a structured error rather than silently producing garbage segments
- [ ] TMDB `still_path` base URL (`https://image.tmdb.org/t/p/w500`) may need size variant — document in `docs/spec-tmdb-image-sizes.md`

---

## Known Limitations

| Limitation                                         | Impact                        | Mitigation                                                          |
| -------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Subtitle capture requires active playback          | No background pre-fetch       | Accept as UX constraint; show "watch to capture" prompt             |
| Netflix `nflxvideo.net` URL pattern may change     | Intercept breaks silently     | Add error telemetry, watch LLN extension GitHub for pattern changes |
| TMDB has no Netflix episode IDs natively           | Bridge via IMDb required      | One-time cached lookup per title                                    |
| Netflix removes titles                             | Old RSS items become orphaned | Mark as `unavailable` in Supabase, don't delete                     |
| TTML not always available (some regions serve VTT) | Parser needs both formats     | Implement VTT fallback parser alongside TTML                        |
