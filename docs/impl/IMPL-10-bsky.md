# IMPL-10 — SPEC Bluesky route

## Handler

`lib/routes/spec/bsky.ts`

## Route

| Field   | Value                |
| ------- | -------------------- |
| Path    | `/spec/bsky/:handle` |
| Example | `bsky.app`           |
| Auth    | None (public API)    |

## Data source

Upstream helpers (read-only import — do not edit `lib/routes/bsky/`):

- `resolveHandle` / `getProfile` / `getAuthorFeed` from `../bsky/utils`
- Public ATProto: `public.api.bsky.app`

## `_extra`

`SpecExtraBsky` — `type: 'bsky/post'`, `platform: 'bluesky'`, `handle`, `did`, `rkey`.

## Verify

```bash
curl "http://localhost:1200/spec/bsky/bsky.app?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra.type'
```

## Tests

- `tests/routes/spec/bsky.test.ts`
- Fixtures: `tests/fixtures/spec-bsky.json`
