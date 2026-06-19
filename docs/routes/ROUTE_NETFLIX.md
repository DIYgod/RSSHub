# Route: Netflix Title Episodes (SPEC)

← [INDEX](INDEX.md) | Setup: [RSSHUB_SETUP.md](RSSHUB_SETUP.md)

## File Location

`lib/routes/spec/netflix.ts` (+ `netflix-bridge.ts`, `netflix-tmdb.ts`)

## Route Path

`/spec/netflix/:netflixTitleId`

## Auth

**`TMDB_API_KEY`** (required) — free key from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

No Netflix login cookie is used. The route scrapes `imdb:pageConst` from `netflix.com/title/:id`, resolves the title via TMDB `/find/:imdbId`, then fetches season/episode metadata from TMDB.

## Parameters

| Param            | Type   | Example    | Source                       |
| ---------------- | ------ | ---------- | ---------------------------- |
| `netflixTitleId` | string | `81249997` | `netflix.com/title/81249997` |

## Cache

- Bridge (Netflix → IMDb → TMDB ids): 30 days
- TMDB season/series payloads: 60 minutes

## `_extra` payload shape

See `lib/types/spec-extra.ts` (`SpecExtraNetflix`). Key fields:

- `type`: `netflix/episode` or `netflix/film`
- `netflixTitleId`, `tmdbSeriesId`, `imdbId`, `thumbnailUrl`
- `subtitleStatus`: always `none` at ingest (downstream fills)
- `captionLanguages`: always `[]` at ingest

## Example

```bash
curl "http://localhost:1200/spec/netflix/81249997?format=json&key=$ACCESS_KEY" \
  | jq '.items[0]._extra'
```

## Tests

- MSW contract: `tests/routes/spec/netflix.test.ts`
- Live smoke: `scripts/spec-smoke.sh` (skipped when `TMDB_API_KEY` unset)

---

## Legacy note

Older docs referenced `/netflix/drama/:showId` with `NETFLIX_COOKIE` and Falcor scraping. That path is **not** the SPEC route. Sunbi ingestion uses `/spec/netflix/:netflixTitleId` only.
