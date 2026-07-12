# IMPL-11 — SPEC Instagram route

## Handler

`lib/routes/spec/instagram.ts`

## Route

| Field   | Value                       |
| ------- | --------------------------- |
| Path    | `/spec/instagram/:username` |
| Example | `instagram`                 |
| Auth    | Guest web-api (no cookie)   |

## Data source

Upstream helpers (read-only import — do not edit `lib/routes/instagram/`):

- `getUserInfo` / `renderGuestItems` / `baseUrl` from `../instagram/web-api/utils`
- Guest timeline edges from `web_profile_info` (same as `/instagram/2/user/:key` without cookie)

## `_extra`

`SpecExtraInstagram` — `type: 'instagram/post'`, `platform: 'instagram'`, `username`, `shortcode`.

## Verify

```bash
curl "http://localhost:1200/spec/instagram/instagram?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra.type'
```

## Tests

- `tests/routes/spec/instagram.test.ts`
- Fixtures: `tests/fixtures/spec-instagram.json`
