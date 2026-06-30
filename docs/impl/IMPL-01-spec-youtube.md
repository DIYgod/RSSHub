# IMPL-01 — SPEC YouTube route

## Handler

`lib/routes/spec/youtube.ts` + `lib/routes/spec/youtube-sources.ts`

## Route

| Field      | Value                                                                        |
| ---------- | ---------------------------------------------------------------------------- |
| Path       | `/spec/youtube/:channelId`                                                   |
| Example ID | `UCjI0A18uEH8ivCRsbO9cI6w`                                                   |
| Auth       | None (public Atom feed); optional `YOUTUBE_KEY` for avatar / live enrichment |

`:channelId` accepts `UC…` channel IDs or `@handle` (resolved server-side via cached HTML scrape).

## Data sources

- Atom feed: `https://www.youtube.com/feeds/videos.xml?channel_id={channelId}`
- Optional: community posts, live now, podcast playlists (`youtube-sources.ts`)

## `_extra`

Use `SpecExtraYoutube` in `lib/types/spec-extra.ts` — types include `youtube/video`, `youtube/short`, `youtube/live`, `youtube/post`, `youtube/podcast`, `youtube/membership-video`.

## Cache

- Handle resolution: 24h (`spec-youtube-handle:{handle}`)
- Per-route L2 keys via `buildCacheKey('youtube', …)` — see [`../spec-cache.md`](../spec-cache.md)

## Verify

```bash
curl "http://localhost:1200/spec/youtube/UCjI0A18uEH8ivCRsbO9cI6w?format=json&key=$ACCESS_KEY" \
  | jq '.items[0]._extra.type'
```

## Tests

- `tests/routes/spec/youtube.test.ts`
- Fixture: `tests/fixtures/spec-youtube.json`
- Smoke: `scripts/spec-smoke.sh` (public tier)
