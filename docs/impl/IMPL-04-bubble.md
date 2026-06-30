# IMPL-04 — SPEC Bubble route

## Handler

`lib/routes/spec/bubble.ts`

## Route

| Field   | Value                                        |
| ------- | -------------------------------------------- |
| Path    | `/spec/bubble/:artistId`                     |
| Example | numeric artist id (see Weverse/Bubble admin) |
| Auth    | **`BUBBLE_COOKIE`** required                 |

## Upstream

- `GET https://api.bubblem.io/v1/rooms/{artistId}/messages`

## `_extra`

`SpecExtraBubble` — `type: 'bubble/message'`, `messageType`: `text` | `image` | `video`.

## Errors

- `ERR_BUBBLE_COOKIE_MISSING` when env unset
- `ERR_BUBBLE_COOKIE_EXPIRED` on 401/403

## Cache

2 min — [`../spec-cache.md`](../spec-cache.md)

## Note

Archived `ROUTE_BUBBLE.md` described legacy `/bubble/artist/:slug` scraping; **canonical** implementation is **`/spec/bubble/:artistId`** with authenticated API.

## Verify

```bash
curl "http://localhost:1200/spec/bubble/<artistId>?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra'
```

## Tests

- `tests/routes/spec/bubble.test.ts`
