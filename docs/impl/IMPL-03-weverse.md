# IMPL-03: `weverse` Route

> **Target file**: `lib/routes/spec/weverse.ts`  
> **Auth**: `WEVERSE_TOKEN` — **required**. Bearer token from an authenticated Weverse session (DevTools → Network → `Authorization: Bearer …` on an `/api/v2` request).  
> **Cache TTL**: 3 min  
> **Puppeteer**: No

## Design notes

Weverse internal API base: `https://weverse.io/api/v2/`.

```
GET /api/v2/post/v1.0/community-{communityId}/feedList
  ?fieldSet=postForFeed&offset=0&limit=20&sortType=LATEST
```

`communityId` maps to the community feed. Slug → id resolution can use `GET /api/v2/community/v1.0/communityList/artistList` once; v1 route can accept numeric `communityId` directly.

## Route file (design)

```typescript
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraWeverse } from '@/types/spec-extra';
import { cache } from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { assertEnv, buildCacheKey, throwAuthError } from './utils';

const WEVERSE_API = 'https://weverse.io/api/v2';

type WeversePostType = 'ARTIST' | 'FAN' | 'MEDIA' | 'MOMENT';

interface WeversePost {
    postId: string;
    postType: WeversePostType;
    communityId: number;
    publishedAt?: string;
    body?: string;
    thumbnail?: { url?: string };
    extension?: { isPaid?: boolean };
    artist?: { profileImageUrl?: string; name?: string };
    community?: { name?: string };
}

interface WeverseFeedResponse {
    data?: WeversePost[];
}

function postTypeLabel(raw: WeversePostType): SpecExtraWeverse['postType'] {
    const map: Record<WeversePostType, SpecExtraWeverse['postType']> = {
        ARTIST: 'artist',
        FAN: 'fan',
        MEDIA: 'media',
        MOMENT: 'moment',
    };
    return map[raw] ?? 'artist';
}

export const route: Route = {
    path: '/weverse/:communityId',
    categories: ['social-media'],
    example: '/spec/weverse/46',
    parameters: {
        communityId: 'Weverse community (artist) ID — numeric. Find via the community list API or Weverse DevTools.',
    },
    features: {
        requireConfig: [
            {
                name: 'WEVERSE_TOKEN',
                optional: false,
                description: 'Bearer token from an authenticated Weverse session. Obtain via DevTools Network tab → Authorization header.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'weverse.io',
    name: 'Artist Community Feed',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['weverse.io/:artistSlug', 'weverse.io/:artistSlug/feed'],
            target: '/spec/weverse/:communityId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const communityId = ctx.req.param('communityId');
    const token = assertEnv('WEVERSE_TOKEN', 'ERR_WEVERSE_TOKEN_MISSING');

    const feed = await cache.tryGet(
        buildCacheKey('weverse', communityId),
        3 * 60, // 3 min
        async () => {
            try {
                return (await ofetch(`${WEVERSE_API}/post/v1.0/community-${communityId}/feedList`, {
                    query: {
                        fieldSet: 'postForFeed',
                        offset: 0,
                        limit: 20,
                        sortType: 'LATEST',
                    },
                    headers: { Authorization: `Bearer ${token}` },
                })) as WeverseFeedResponse;
            } catch (err: any) {
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    throwAuthError('ERR_WEVERSE_TOKEN_EXPIRED', 'WEVERSE_TOKEN has expired. Renew via DevTools and redeploy.');
                }
                throw err;
            }
        }
    );

    const posts: WeversePost[] = (feed as WeverseFeedResponse).data ?? [];

    const communityName = posts[0]?.community?.name ?? `Community ${communityId}`;

    const items: DataItem[] = posts.map((post) => {
        const link = `https://weverse.io/community/${communityId}/post/${post.postId}`;
        const isPaid = post.extension?.isPaid ?? false;
        const thumb = post.thumbnail?.url ?? post.artist?.profileImageUrl ?? '';
        const pubDate = parseDate(post.publishedAt ?? '');
        const postTypeNorm = postTypeLabel(post.postType);

        const extra: SpecExtraWeverse = {
            type: `weverse/${postTypeNorm}` as SpecExtraWeverse['type'],
            platform: 'weverse',
            sourceUrl: link,
            externalId: post.postId,
            seriesExternalId: communityId,
            publishedAt: pubDate ? pubDate.toISOString() : undefined,
            artistId: communityId,
            communityId: String(post.communityId),
            postType: postTypeNorm,
            isPaid,
        };

        return {
            title: isPaid ? `[Paid] ${communityName} — ${post.postType}` : `${communityName} — ${post.postType}`,
            link,
            guid: `spec-weverse-${communityId}-${post.postId}`,
            pubDate,
            image: thumb,
            description: [thumb ? `<img src="${thumb}" />` : '', post.body ? `<p>${post.body}</p>` : ''].filter(Boolean).join('\n'),
            _extra: extra,
        };
    });

    return {
        title: `${communityName} — Weverse`,
        link: `https://weverse.io/community/${communityId}`,
        item: items,
        language: 'ko',
    };
}
```
