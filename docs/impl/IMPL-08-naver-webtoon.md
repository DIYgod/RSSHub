# IMPL-08 — SPEC Naver Webtoon route

## Handler

`lib/routes/spec/naver-webtoon.ts`

## Route

| Field   | Value                                                                                       |
| ------- | ------------------------------------------------------------------------------------------- |
| Path    | `/spec/naver/webtoon/:titleId`                                                              |
| Example | `848000`, `758037`                                                                          |
| Auth    | None for public episodes; `NAVER_COOKIE` paywall path deferred ([`../TODO.md`](../TODO.md)) |

## Data source

Naver comic JSON APIs (not SPA HTML scrape):

- `GET /api/article/list/info?titleId=`
- `GET /api/article/list?titleId=&page=1` (first page only)

## `_extra`

`SpecExtraNaverWebtoon` in `lib/types/spec-extra.ts` — `type: 'naver/webtoon/episode'`.

## KR proxy

Naver may block foreign/datacenter IPs — see proxy section in [`../routes/RSSHUB_SETUP.md`](../routes/RSSHUB_SETUP.md).

## Verify

```bash
curl "http://localhost:1200/spec/naver/webtoon/848000?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra.type'
```

## Tests

- `tests/routes/spec/naver-webtoon.test.ts`
- Smoke: public tier PASS (see [`../routes/SPEC_SMOKE_RESULTS.md`](../routes/SPEC_SMOKE_RESULTS.md))

## Legacy

Upstream `lib/routes/naver/webtoon-series.ts` and archived `docs/naver-webtoon/` narratives — convergence tracked in [`../TODO.md`](../TODO.md).
