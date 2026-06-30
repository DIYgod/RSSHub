# IMPL-09 — SPEC Naver Blog route

## Handler

`lib/routes/spec/naver-blog.ts`

## Route

| Field   | Value                      |
| ------- | -------------------------- |
| Path    | `/spec/naver/blog/:blogId` |
| Example | `webhackyo`                |
| Auth    | None                       |

## Data source

Official RSS: `https://rss.blog.naver.com/:blogId.xml`

## `_extra`

`SpecExtraNaverBlog` — `type: 'naver/blog/post'`, `platform: 'naver-blog'`.

## Cache

30 min — `buildCacheKey('naver-blog', blogId)`

## Verify

```bash
curl "http://localhost:1200/spec/naver/blog/webhackyo?format=json&key=$ACCESS_KEY" | jq '.items[0]._extra.type'
```

## Tests

- `tests/routes/spec/naver-blog.test.ts`
- Fixtures: `tests/fixtures/spec-naver-blog.json`, `tests/fixtures/naver-blog-webhackyo.xml`
