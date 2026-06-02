# IMPL-05: `netflix` Route

> **Target file**: `lib/routes/spec/netflix.ts`  
> **Auth**: `NETFLIX_COOKIE` — full `Cookie` header string from an authenticated Netflix session  
> **Cache TTL**: 60 min  
> **Puppeteer**: No (shakti JSON API)

## Design notes

Netflix internal JSON API (`shakti`), e.g.:

```
GET https://www.netflix.com/api/shakti/<buildIdentifier>/metadata
  ?movieid=<titleId>&drmSystem=widevine&isWatchlistEnabled=false&isShortformEnabled=false&isVolatileBillboardsEnabled=false
```

`buildIdentifier` is embedded in HTML from `https://www.netflix.com/title/<titleId>` — regex `"BUILD_IDENTIFIER":"([\w-]+)"` is a common approach. Response includes `video.seasons[].episodes[]` for series or a single `video` for films.

## Route file (design)

```typescript
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraNetflix } from '@/types/spec-extra';
import { cache } from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { assertEnv, buildCacheKey, throwAuthError } from './utils';

const NETFLIX_ORIGIN = 'https://www.netflix.com';

interface NetflixEpisodeMeta {
    episodeId: number;
    seq: number;
    title: string;
    synopsis?: string;
    stills?: Array<{ url: string }>;
    year?: number;
    runtime?: number;
}

interface NetflixSeasonMeta {
    seq: number;
    episodes: NetflixEpisodeMeta[];
}

interface NetflixVideoMeta {
    id: number;
    title: string;
    type: 'show' | 'movie';
    boxart?: Array<{ url: string }>;
    maturity?: { rating?: { value?: string } };
    seasons?: NetflixSeasonMeta[];
    year?: number;
}

interface NetflixShaktiResponse {
    video?: NetflixVideoMeta;
}

async function fetchBuildId(titleId: string, cookie: string): Promise<string> {
    const html = (await ofetch(`${NETFLIX_ORIGIN}/title/${titleId}`, {
        headers: { Cookie: cookie },
        parseResponse: (txt) => txt,
    })) as string;
    const match = html.match(/"BUILD_IDENTIFIER":"([\w-]+)"/);
    return match?.[1] ?? 'main';
}

export const route: Route = {
    path: '/netflix/:titleId',
    categories: ['multimedia'],
    example: '/spec/netflix/80189175',
    parameters: {
        titleId: 'Netflix title ID — numeric. Find in the URL: `netflix.com/title/<titleId>`.',
    },
    features: {
        requireConfig: [
            {
                name: 'NETFLIX_COOKIE',
                optional: false,
                description: 'Full Cookie header string from an authenticated Netflix session. Obtain via DevTools → Network → Cookie header on any netflix.com request.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'netflix.com',
    name: 'Title Episodes',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['www.netflix.com/title/:titleId'],
            target: '/spec/netflix/:titleId',
        },
        {
            source: ['www.netflix.com/watch/:titleId'],
            target: '/spec/netflix/:titleId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const titleId = ctx.req.param('titleId');
    const cookie = assertEnv('NETFLIX_COOKIE', 'ERR_NETFLIX_COOKIE_MISSING');

    const buildId = await cache.tryGet(buildCacheKey('netflix', titleId, 'buildId'), 60 * 60, () => fetchBuildId(titleId, cookie));

    const meta = await cache.tryGet(buildCacheKey('netflix', titleId, 'meta'), 60 * 60, async () => {
        try {
            return (await ofetch(`${NETFLIX_ORIGIN}/api/shakti/${buildId}/metadata`, {
                query: {
                    movieid: titleId,
                    drmSystem: 'widevine',
                    isWatchlistEnabled: false,
                    isShortformEnabled: false,
                    isVolatileBillboardsEnabled: false,
                },
                headers: {
                    Cookie: cookie,
                    'x-netflix.request.client.user.guid': '',
                },
            })) as NetflixShaktiResponse;
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                throwAuthError('ERR_NETFLIX_COOKIE_EXPIRED', 'NETFLIX_COOKIE has expired or is invalid. Renew via DevTools and redeploy.');
            }
            throw err;
        }
    });

    const video = (meta as NetflixShaktiResponse).video;
    if (!video) {
        return { title: `Netflix ${titleId}`, item: [], allowEmpty: true };
    }

    const seriesTitle = video.title;
    const maturityRating = video.maturity?.rating?.value;
    const posterUrl = video.boxart?.[0]?.url ?? '';

    const items: DataItem[] = [];

    if (video.type === 'show' && video.seasons) {
        for (const season of video.seasons) {
            for (const ep of season.episodes) {
                const link = `${NETFLIX_ORIGIN}/watch/${ep.episodeId}`;
                const thumb = ep.stills?.[0]?.url ?? posterUrl;
                const pubDate = ep.year ? parseDate(String(ep.year)) : undefined;

                const extra: SpecExtraNetflix = {
                    type: 'netflix/episode',
                    platform: 'netflix',
                    sourceUrl: link,
                    externalId: String(ep.episodeId),
                    seriesExternalId: titleId,
                    episodeLabel: `S${String(season.seq).padStart(2, '0')}E${String(ep.seq).padStart(2, '0')}`,
                    publishedAt: pubDate?.toISOString(),
                    titleId,
                    seasonNumber: season.seq,
                    episodeNumber: ep.seq,
                    maturityRating,
                };

                items.push({
                    title: `${seriesTitle} — S${season.seq}E${ep.seq} ${ep.title}`,
                    link,
                    guid: `spec-netflix-${titleId}-${ep.episodeId}`,
                    pubDate,
                    image: thumb,
                    description: [thumb ? `<img src="${thumb}" />` : '', ep.synopsis ? `<p>${ep.synopsis}</p>` : ''].filter(Boolean).join('\n'),
                    _extra: extra,
                });
            }
        }
    } else {
        const link = `${NETFLIX_ORIGIN}/watch/${titleId}`;
        const extra: SpecExtraNetflix = {
            type: 'netflix/film',
            platform: 'netflix',
            sourceUrl: link,
            externalId: titleId,
            seriesExternalId: titleId,
            publishedAt: video.year ? parseDate(String(video.year))?.toISOString() : undefined,
            titleId,
            maturityRating,
        };

        items.push({
            title: seriesTitle,
            link,
            guid: `spec-netflix-film-${titleId}`,
            pubDate: video.year ? parseDate(String(video.year)) : undefined,
            image: posterUrl,
            _extra: extra,
        });
    }

    return {
        title: `${seriesTitle} — Netflix`,
        link: `${NETFLIX_ORIGIN}/title/${titleId}`,
        item: items,
    };
}
```

## Caution

Netflix HTML and API shapes change frequently. Treat this route as high-churn; prefer extensive MSW tests and defensive parsing when implementing.
