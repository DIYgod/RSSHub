# IMPL-05 — SPEC Netflix route

## Handler

`lib/routes/spec/netflix.ts` + `netflix-bridge.ts` + `netflix-tmdb.ts`

## Route

| Field   | Value                                                                     |
| ------- | ------------------------------------------------------------------------- |
| Path    | `/spec/netflix/:netflixTitleId`                                           |
| Example | `81249997`                                                                |
| Auth    | **`TMDB_API_KEY`** (free key from themoviedb.org) — **no** Netflix cookie |

## Pipeline

1. Scrape Netflix title page for IMDb id (`imdb:pageConst`)
2. TMDB `/find/{imdbId}` → series/season metadata
3. Emit episodes with `SpecExtraNetflix`

## `_extra`

`SpecExtraNetflix` — `netflix/episode` | `netflix/film`; includes `tmdbSeriesId`, `imdbId`, `subtitleStatus: 'none'` at ingest.

## Cache

- Bridge ids: ~30 days
- TMDB payloads: 60 min — [`../spec-cache.md`](../spec-cache.md)

## Verify

```bash
curl "http://localhost:1200/spec/netflix/81249997?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra.type'
```

## Tests

- `tests/routes/spec/netflix.test.ts`
- Smoke: SKIP when `TMDB_API_KEY` unset
