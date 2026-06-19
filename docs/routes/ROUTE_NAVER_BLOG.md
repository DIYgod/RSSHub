# Route: Naver Blog (SPEC)

← [INDEX](INDEX.md) | Setup: [RSSHUB_SETUP.md](RSSHUB_SETUP.md)

## File Location

`lib/routes/spec/naver-blog.ts`

## Route Path

`/spec/naver/blog/:blogId`

## Parameters

| Param    | Type   | Example     | Source                            |
| -------- | ------ | ----------- | --------------------------------- |
| `blogId` | string | `webhackyo` | `blog.naver.com/:blogId` username |

## Data Source

Official Naver Blog RSS feed (no auth):

```
https://rss.blog.naver.com/:blogId.xml
```

## Cache

`cache.tryGet` key: `spec:naver-blog:{blogId}` — TTL **30 minutes**.

## `_extra` payload shape

```typescript
{
  type: 'naver/blog/post',
  platform: 'naver-blog',
  sourceUrl: string,       // post URL
  externalId: string,      // logNo from link
  seriesExternalId: string, // blogId
  blogId: string,
  authorId: string,        // same as blogId for RSS items
  publishedAt?: string,    // ISO 8601
  episodeLabel?: string,
}
```

## Example

```bash
curl "http://localhost:1200/spec/naver/blog/webhackyo?format=json&key=$ACCESS_KEY" \
  | jq '.items[0]._extra'
```

## Tests

- MSW contract: `tests/routes/spec/naver-blog.test.ts`
- Fixture: `tests/fixtures/spec-naver-blog.json`, `tests/fixtures/naver-blog-webhackyo.xml`
- Live smoke: `scripts/spec-smoke.sh` (public tier)
