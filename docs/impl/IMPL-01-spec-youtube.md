# IMPL-01: SPEC YouTube route

> **Target file**: `lib/routes/spec/youtube.ts`  
> **Modelled on**: `naver/webtoon-series.ts`  
> **Auth**: None for public feeds; optional membership cookie (`YOUTUBE_MEMBERSHIP_COOKIE`) documented in `requireConfig` when implemented  
> **Cache TTL**: 30 min (public), 15 min (membership) when membership path exists  
> **Puppeteer**: No

## Design notes

YouTube exposes a native RSS feed for channels with no API key:

```
https://www.youtube.com/feeds/videos.xml?channel_id=<channelId>
```

This is an Atom 1.0 feed — parse with `fast-xml-parser` and `parseDate`. No authentication required for public channels. Membership-only videos require a cookie; for v1 they can be filtered out of the feed (marked `isMembershipOnly: true` so Sunbi can display them as locked).

## Route file (design)

```typescript
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraYoutube } from '@/types/spec-extra';
import { cache } from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildCacheKey } from './utils';

const YT_FEED_BASE = 'https://www.youtube.com/feeds/videos.xml';

interface YtAtomEntry {
    'yt:videoId': string;
    title: string;
    link: { $: { href: string } };
    published?: string;
    updated?: string;
    author?: { name: string; uri: string };
    'media:group'?: {
        'media:thumbnail'?: { $: { url: string } };
        'media:description'?: string;
    };
}

interface YtAtomFeed {
    feed: {
        title: string;
        'yt:channelId': string;
        entry?: YtAtomEntry[];
    };
}

export const route: Route = {
    path: '/youtube/:channelId',
    categories: ['multimedia'],
    example: '/spec/youtube/UCxxxxxxxxxxxxxxxxxxxxxx',
    parameters: {
        channelId: 'YouTube channel ID (starts with UC…). Find it in the channel URL.',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'youtube.com',
    name: 'Channel Videos',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['www.youtube.com/channel/:channelId', 'www.youtube.com/channel/:channelId/videos'],
            target: '/spec/youtube/:channelId',
        },
        {
            source: ['www.youtube.com/@:handle'],
            target: (params) => {
                // handle → channelId resolution is not possible in Radar without
                // a live lookup; surface the handle as a best-effort path until
                // the user confirms their channel ID.
                const handle = params.handle as string | undefined;
                return handle ? `/spec/youtube/@${handle}` : '';
            },
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const channelId = ctx.req.param('channelId');

    const feedXml = await cache.tryGet(
        buildCacheKey('youtube', channelId),
        30 * 60, // 30 min
        () =>
            ofetch(YT_FEED_BASE, {
                query: { channel_id: channelId },
                parseResponse: (txt) => txt, // return raw XML string
            })
    );

    // RSSHub ships fast-xml-parser — use it directly.
    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '$' });
    const parsed = parser.parse(feedXml as string) as YtAtomFeed;

    const feed = parsed.feed;
    const channelTitle = String(feed?.title ?? channelId);
    const entries = feed?.entry ?? [];

    const items: DataItem[] = entries.map((entry) => {
        const videoId = String(entry['yt:videoId'] ?? '');
        const link = `https://www.youtube.com/watch?v=${videoId}`;
        const thumb = entry['media:group']?.['media:thumbnail']?.$.url ?? '';
        const descText = entry['media:group']?.['media:description'] ?? '';
        const pubDate = parseDate(entry.published ?? entry.updated ?? '');

        const extra: SpecExtraYoutube = {
            type: 'youtube/video',
            platform: 'youtube',
            sourceUrl: link,
            externalId: videoId,
            seriesExternalId: channelId,
            publishedAt: pubDate ? pubDate.toISOString() : undefined,
            channelId,
            channelTitle,
            isMembershipOnly: false,
        };

        return {
            title: String(entry.title ?? videoId),
            link,
            guid: `spec-youtube-${channelId}-${videoId}`,
            pubDate,
            author: channelTitle,
            image: thumb,
            description: [thumb ? `<img src="${thumb}" />` : '', descText ? `<p>${descText}</p>` : ''].filter(Boolean).join('\n'),
            _extra: extra,
        };
    });

    return {
        title: `${channelTitle} — YouTube`,
        link: `https://www.youtube.com/channel/${channelId}`,
        item: items,
        language: 'en',
    };
}
```

## AGENTS.md alignment

- Confirm `Route['features']` in this fork supports `supportRadar` if used; otherwise omit or match `lib/types.ts`.
- Radar `target` callbacks must match whatever upstream RSSHub types expect.
- Match real `cache.tryGet` arity/order from `@/utils/cache` or middleware before copying verbatim.

## Implementation checklist

- [x] Add `lib/routes/spec/youtube.ts` (Atom feed, `cache.tryGet(key, fetcher, 30 * 60)`, `SpecExtraYoutube` on items, UC-only channel id; radar uses string `target` only — no function targets, for `build-routes` JSON).
- [x] Run `pnpm build:routes` and confirm `spec` includes `/youtube/:channelId`.
