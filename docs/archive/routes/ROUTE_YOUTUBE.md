# Route: YouTube Channel (SPEC)

← [INDEX](INDEX.md) | Setup: [RSSHUB_SETUP.md](RSSHUB_SETUP.md)

## File Location

`lib/routes/spec/youtube.ts`

## Why a New Namespace

Upstream RSSHub has `/youtube/channel/:id` but it does not fetch transcripts
or enrich with the `SpecExtra` / `_extra` payload the Sunbi extension needs. The
**SPEC** namespace under `/spec/...` avoids conflict with upstream and keeps
custom work explicit.

## Route Path

`/spec/youtube/:channelId`

## Parameters

| Param       | Type   | Example                    | Source                                                  |
| ----------- | ------ | -------------------------- | ------------------------------------------------------- |
| `channelId` | string | `UCVSjwV8LXSoqxDKRcNGPrQg` | `youtube.com/channel/UCxxxx` or resolved from `@handle` |

## Radar Rules

```typescript
radar: [
    { source: ['youtube.com/channel/:channelId'], target: '/spec/youtube/:channelId' },
    { source: ['youtube.com/channel/:channelId/videos'], target: '/spec/youtube/:channelId' },
    { source: ['youtube.com/@:handle'], target: null },
    // @handle needs an extra API call to resolve channelId — omit from radar,
    // handle in Sunbi's "Add Source" flow instead
];
```

## Data Source

YouTube's official Atom feed (no auth, no API key):

```
https://www.youtube.com/feeds/videos.xml?channel_id={channelId}
```

### Fields available from the Atom feed

| Field             | XML path                                                  | Notes                 |
| ----------------- | --------------------------------------------------------- | --------------------- |
| Video ID          | `yt:videoId`                                              |                       |
| Title             | `title`                                                   |                       |
| Link              | `link[href]`                                              | Full watch URL        |
| Published         | `published`                                               | ISO 8601              |
| Updated           | `updated`                                                 |                       |
| Author            | `author > name`                                           | Channel name          |
| Description       | `media:description`                                       | Full description text |
| View count        | `media:statistics[views]`                                 |                       |
| Star rating avg   | `media:starRating[average]`                               |                       |
| Star rating count | `media:starRating[count]`                                 |                       |
| Thumbnail         | Constructed: `i.ytimg.com/vi/{videoId}/maxresdefault.jpg` | Not in feed directly  |

### Thumbnail URL patterns

```
maxresdefault.jpg  → 1280×720, may 404 for older videos
hqdefault.jpg      → 480×360, always available
mqdefault.jpg      → 320×180
```

Always try `maxresdefault` first with an `onerror` fallback to `hqdefault`.

## Transcript Fetching

Transcripts are fetched in a secondary request, cached per video.

### Method 1: YouTube timedtext API (preferred, no auth)

```
https://www.youtube.com/api/timedtext?lang=ko&v={videoId}&fmt=json3
https://www.youtube.com/api/timedtext?lang=en&v={videoId}&fmt=json3
```

Returns `{events: [{segs: [{utf8: "word "}]}]}`. Assemble with `.join(' ')`.
Availability: most videos with auto-captions or manual captions.
Not available: some music videos, very new uploads.

### Method 2: youtube-transcript npm package (fallback)

```typescript
import { YoutubeTranscript } from 'npm:youtube-transcript@1.2.1';
const result = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ko' });
transcript = result.map((t) => t.text).join(' ');
```

Add to `package.json` in your fork if not already present.

## `_extra` payload shape

```typescript
{
  type: 'youtube_video',
  videoId: string,
  channelId: string,
  thumbnail: string,
  thumbnailFallback: string,
  viewCount: number,
  starRating: number,
  rawDescription: string,       // full video description
  transcript: string | null,    // full transcript text (Bibim input)
  transcriptWordCount: number,
  hasTranscript: boolean,
}
```

## Cache Strategy

| Data                   | Key                                    | TTL   |
| ---------------------- | -------------------------------------- | ----- |
| Per video (all fields) | `yt:{videoId}`                         | 3600s |
| Channel feed           | Not cached (always fresh from YouTube) | —     |

## Community Posts (Future)

YouTube Community tab has no RSS. Future approach: Puppeteer scrape of
`youtube.com/@handle/community`. Not in scope for v1.

## Handle → Channel ID Resolution

When a user provides `@handle` instead of `UCxxx`:

```typescript
// Sunbi extension utility — runs client-side, not in RSSHub
async function resolveYouTubeHandle(handle: string): Promise<string | null> {
    // Method: fetch youtube.com/@handle, parse og:url meta tag
    // og:url = https://www.youtube.com/channel/UCxxxx
    const res = await fetch(`https://www.youtube.com/@${handle}`);
    const html = await res.text();
    const match = html.match(/\"channelId\":\"(UC[^"]+)\"/);
    return match?.[1] ?? null;
}
```
