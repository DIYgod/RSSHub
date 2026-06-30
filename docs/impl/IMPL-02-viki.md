# IMPL-02 — SPEC Viki route

## Handler

`lib/routes/spec/viki.ts`

## Route

| Field   | Value                                                                |
| ------- | -------------------------------------------------------------------- |
| Path    | `/spec/viki/:titleId`                                                |
| Example | `37648c` (from `viki.com/tv/37648c-…`)                               |
| Auth    | Public `VIKI_APP_ID` default `100005a`; set `VIKI_APP_ID` if blocked |

## Upstream

- `GET https://api.viki.io/v4/containers/{titleId}.json`
- `GET …/containers/{titleId}/episodes.json`

## `_extra`

`SpecExtraViki` — `type: 'viki/episode'`, `regionLocked` from API flags.

## Errors

`ERR_VIKI_AUTH` on 401/403 (often geo or rate limit from non-KR hosts).

## Cache

60 min series scope — [`../spec-cache.md`](../spec-cache.md)

## Verify

```bash
curl "http://localhost:1200/spec/viki/37648c?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra'
```

## Tests

- `tests/routes/spec/viki.test.ts`
- Smoke: gated when API returns 503 from dev host
