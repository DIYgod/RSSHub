# IMPL-02: `viki` Route

> **Target file**: `lib/routes/spec/viki.ts`  
> **Auth**: Optional Viki API app id (`VIKI_APP_ID`); signed requests optional (`VIKI_APP_SECRET`)  
> **Cache TTL**: 60 min  
> **Puppeteer**: No

## Design notes

Viki exposes a public REST API at `https://api.viki.io/v4/`.

- `GET /containers/:titleId` — series metadata (title, poster, genres)
- `GET /containers/:titleId/episodes` — episode list

Requests include `app=<VIKI_APP_ID>`. For unauthenticated use, `app=100005a` (public app id) is widely documented for basic feeds. Wire `VIKI_APP_ID` in `lib/config.ts` if the fork requires typed config.

## Route file (design)

```typescript
import type { Context } from 'hono';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraViki } from '@/types/spec-extra';
import { cache } from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildCacheKey } from './utils';

const VIKI_API = 'https://api.viki.io/v4';
const PUBLIC_APP_ID = '100005a';

function appId(): string {
    return (config.VIKI_APP_ID as string | undefined) ?? process.env.VIKI_APP_ID ?? PUBLIC_APP_ID;
}

interface VikiContainer {
    id: string;
    titles?: { en?: string };
    images?: { poster?: { main?: { url?: string } } };
    genres?: Array<{ title?: string }>;
    origin?: { country?: string };
}

interface VikiEpisode {
    id: string;
    titles?: { en?: string };
    number?: number;
    season_number?: number;
    air_dates?: { start?: string };
    images?: { poster?: { main?: { url?: string } } };
    flags?: { regional_lockdown?: boolean };
    created_at?: string;
}

interface VikiEpisodeList {
    response: VikiEpisode[];
}

export const route: Route = {
    path: '/viki/:titleId',
    categories: ['multimedia'],
    example: '/spec/viki/37648c',
    parameters: {
        titleId: 'Viki container ID from the title URL, e.g. `37648c` from `viki.com/tv/37648c`.',
    },
    features: {
        requireConfig: [
            {
                name: 'VIKI_APP_ID',
                optional: true,
                description: 'Viki API app ID. Defaults to the public app ID (100005a). Provide your own for higher rate limits.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'viki.com',
    name: 'Series Episodes',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['www.viki.com/tv/:titleId', 'www.viki.com/movies/:titleId'],
            target: '/spec/viki/:titleId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const titleId = ctx.req.param('titleId');
    const app = appId();

    const [container, episodeList] = await Promise.all([
        cache.tryGet(
            buildCacheKey('viki', titleId, 'meta'),
            60 * 60,
            () =>
                ofetch(`${VIKI_API}/containers/${titleId}`, {
                    query: { app, per_page: 1, with_paging: false },
                }) as Promise<VikiContainer>
        ),
        cache.tryGet(
            buildCacheKey('viki', titleId, 'episodes'),
            60 * 60,
            () =>
                ofetch(`${VIKI_API}/containers/${titleId}/episodes`, {
                    query: { app, per_page: 50, sort: 'desc' },
                }) as Promise<VikiEpisodeList>
        ),
    ]);

    const seriesTitle = (container as VikiContainer).titles?.en ?? titleId;
    const seriesPoster = (container as VikiContainer).images?.poster?.main?.url ?? '';
    const genres = (container as VikiContainer).genres?.map((g) => g.title ?? '').filter(Boolean) ?? [];

    const episodes: VikiEpisode[] = (episodeList as VikiEpisodeList).response ?? [];

    const items: DataItem[] = episodes.map((ep) => {
        const epTitle = ep.titles?.en ?? `Episode ${ep.number ?? ep.id}`;
        const link = `https://www.viki.com/videos/${ep.id}`;
        const thumb = ep.images?.poster?.main?.url ?? seriesPoster;
        const pubDate = parseDate(ep.air_dates?.start ?? ep.created_at ?? '');
        const isRegionLocked = ep.flags?.regional_lockdown ?? false;

        const extra: SpecExtraViki = {
            type: 'viki/episode',
            platform: 'viki',
            sourceUrl: link,
            externalId: ep.id,
            seriesExternalId: titleId,
            episodeLabel: ep.number ? `EP ${ep.number}` : undefined,
            publishedAt: pubDate ? pubDate.toISOString() : undefined,
            titleId,
            seasonNumber: ep.season_number,
            episodeNumber: ep.number,
            regionLocked: isRegionLocked,
        };

        return {
            title: `${seriesTitle} — ${epTitle}`,
            link,
            guid: `spec-viki-${titleId}-${ep.id}`,
            pubDate,
            category: genres,
            image: thumb,
            description: thumb ? `<img src="${thumb}" />` : undefined,
            _extra: extra,
        };
    });

    return {
        title: `${seriesTitle} — Viki`,
        link: `https://www.viki.com/tv/${titleId}`,
        item: items,
    };
}
```
