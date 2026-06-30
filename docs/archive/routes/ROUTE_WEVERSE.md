# Route: Weverse Artist Feed

← [INDEX](INDEX.md) | Setup: [RSSHUB_SETUP.md](RSSHUB_SETUP.md)

## Background

VLive shut down December 2022. All artist content (lives, VODs, posts) moved
to Weverse. This route replaces any VLive connector.

## File Location

`lib/v2/weverse/artist-feed.ts`

## Route Path

`/weverse/artist/:artistName/:type?`

## Parameters

| Param        | Type   | Default  | Options                                       |
| ------------ | ------ | -------- | --------------------------------------------- |
| `artistName` | string | required | Community name from `weverse.io/{artistName}` |
| `type`       | string | `all`    | `all`, `live`, `post`, `media`                |

## Examples

```
/weverse/artist/bts           ← all content
/weverse/artist/bts/live      ← lives and VODs only
/weverse/artist/seventeen/post ← posts only
```

## Authentication

⚠️ **Bearer token required.** Set `WEVERSE_TOKEN` in RSSHub `.env`.

### How to get the token

1. Open `weverse.io` in Chrome
2. DevTools → Network tab → filter by `apis.naver.com`
3. Click any API request → Headers → `Authorization: Bearer XXXXX`
4. Copy the token (starts with `eyJ...`)
5. Token expires in ~30 days — must be refreshed manually

## HMAC Signing

Weverse's API requires every request URL to be HMAC-SHA1 signed.
The signing secret is embedded in their frontend JS bundle and changes
on each deploy. The route extracts it dynamically:

```typescript
// 1. Fetch weverse.io HTML → find main JS bundle URL
// 2. Fetch the JS bundle → regex for: return "HEXKEY" (64-char hex string)
// 3. HMAC-SHA1 sign the request path+timestamp with the key
// 4. Append ?wmsgpad={timestamp}&wmd={base64sig} to every API URL
```

Cache the extracted secret for 3600s. If extraction fails (bundle changed),
throw a descriptive error so the operator knows to check the regex.

## API Endpoints

Base: `https://apis.naver.com/weverse/wevweb`

| Purpose           | Path                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| List communities  | `/v2.0/communities?fieldSet=communityForSummary&appId=be4d79eb8fc7bd008ee82c8ec4ff6fd4&language=en&platform=WEB&wpf=pc` |
| Artist feed (all) | `/v2.0/communities/{communityId}/feed?fieldSet=postsForFeed&...&limit=20`                                               |
| Lives only        | `/v2.0/communities/{communityId}/live?...`                                                                              |
| Posts only        | `/v2.0/communities/{communityId}/post?...`                                                                              |
| Media only        | `/v2.0/communities/{communityId}/media?...`                                                                             |

## Post Types

| `postType` | Meaning               | `item_type` in Sunbi |
| ---------- | --------------------- | -------------------- |
| `NORMAL`   | Text/image post       | `artist_post`        |
| `LIVE`     | Live stream or VOD    | `artist_live`        |
| `MEDIA`    | Photo/video post      | `artist_media`       |
| `NOTICE`   | Official announcement | `artist_post`        |

## Post Object Fields

```typescript
{
  postId: string,
  postType: 'NORMAL' | 'LIVE' | 'MEDIA' | 'NOTICE',
  body: string,                          // post text content
  publishedAt: string,                   // ISO 8601
  createdAt: string,
  author: { profileName: string },       // member/artist name
  community: { communityName: string },
  attachedPhotos: [{ photoUrl: string }],
  reactionCount: number,
  commentCount: number,
  liveInfo: {
    status: 'ON' | 'ENDED',
    vodUrl: string | null,
    thumbnail: string,
    playTime: number,                    // VOD duration in seconds
    liveTitle: string,
  } | null,
  video: {
    videoInfo: {
      videoId: string,
      thumbnail: { url: string },
    }
  } | null,
}
```

## `_extra` payload shape

```typescript
{
  type: 'artist_live' | 'artist_media' | 'artist_post',
  platform: 'weverse',
  communityId: string,
  postId: string,
  artistName: string,
  memberName: string,
  thumbnail: string | null,
  vodUrl: string | null,
  isLiveNow: boolean,
  durationSeconds: number | null,
  likeCount: number,
  commentCount: number,
  sourceLocale: 'ko',
  bodyText: string | null,           // Bibim input
  transcriptPending: boolean,        // true if live VOD needs transcript
}
```

## Cache Strategy

| Data         | Key                                              | TTL    |
| ------------ | ------------------------------------------------ | ------ |
| HMAC secret  | `weverse:secret`                                 | 3600s  |
| Community ID | `weverse:community:id:{artistName}`              | 86400s |
| Feed items   | Not cached (always fresh — Weverse is real-time) | —      |

## Fragility Points

1. **HMAC secret regex** — changes if Weverse updates their bundle structure.
   The regex `return\s?"([a-fA-F0-9]{64})"` targets a 64-char hex literal.
   If it fails, log a clear error and update the regex.
2. **Bearer token expiry** — 30-day tokens need manual refresh.
   Future improvement: implement Weverse OAuth refresh flow.
3. **API version** — `/v2.0/` may be deprecated. Monitor for 404s.
