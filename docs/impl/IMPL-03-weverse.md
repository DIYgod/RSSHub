# IMPL-03 — SPEC Weverse route

## Handler

`lib/routes/spec/weverse.ts`

## Route

| Field   | Value                                               |
| ------- | --------------------------------------------------- |
| Path    | `/spec/weverse/:artistId`                           |
| Example | `3-EXID`                                            |
| Auth    | **`WEVERSE_TOKEN`** required (Bearer from DevTools) |

## Behavior

- Resolves community by artist id/slug
- HMAC-signed requests to `apis.naver.com/weverse/…`
- Throws `ERR_WEVERSE_TOKEN_MISSING` / `ERR_WEVERSE_TOKEN_EXPIRED`

## `_extra`

`SpecExtraWeverse` — types `weverse/post`, `weverse/media`, `weverse/moment`; `isPaid` from API.

## Cache

3 min community feed — [`../spec-cache.md`](../spec-cache.md)

## Secrets

Acquisition and rotation: [`../spec-secrets-runbook.md`](../spec-secrets-runbook.md)

## Verify

```bash
curl "http://localhost:1200/spec/weverse/3-EXID?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra.type'
```

## Tests

- `tests/routes/spec/weverse.test.ts`
- Smoke: SKIP without `WEVERSE_TOKEN`
