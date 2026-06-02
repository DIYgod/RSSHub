import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraViki } from '@/types/spec-extra';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildCacheKey, throwAuthError } from './utils';

const VIKI_API = 'https://api.viki.io/v4';
// Public app id from Viki's documented unauthenticated flow.
const PUBLIC_APP_ID = '100005a';

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

async function fetchContainer(titleId: string, app: string): Promise<VikiContainer> {
    try {
        return (await ofetch(`${VIKI_API}/containers/${titleId}`, {
            query: { app, per_page: 1, with_paging: false },
        })) as VikiContainer;
    } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            throwAuthError('ERR_VIKI_AUTH', `Viki rejected the request. ${error?.response?.status === 401 ? 'Public app id is rate-limited or blocked; set VIKI_APP_ID.' : ''}`);
        }
        throw error;
    }
}

async function fetchEpisodes(titleId: string, app: string): Promise<VikiEpisodeList> {
    try {
        return (await ofetch(`${VIKI_API}/containers/${titleId}/episodes`, {
            query: { app, per_page: 50, sort: 'desc' },
        })) as VikiEpisodeList;
    } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            throwAuthError('ERR_VIKI_AUTH', `Viki rejected the request. ${error?.response?.status === 401 ? 'Public app id is rate-limited or blocked; set VIKI_APP_ID.' : ''}`);
        }
        throw error;
    }
}

export const route: Route = {
    path: '/viki/:titleId',
    categories: ['multimedia'],
    example: '/spec/viki/37648c',
    parameters: {
        titleId: 'Viki container ID from the title URL, e.g. `37648c` from `viki.com/tv/37648c`.',
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
    url: 'viki.com',
    name: 'Series Episodes',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['www.viki.com/tv/:titleId'],
            target: '/spec/viki/:titleId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const titleId = ctx.req.param('titleId');
    const app = process.env.VIKI_APP_ID || PUBLIC_APP_ID;

    const [container, episodeList] = await Promise.all([
        cache.tryGet(buildCacheKey('viki', titleId, 'meta'), () => fetchContainer(titleId, app), 60 * 60),
        cache.tryGet(buildCacheKey('viki', titleId, 'episodes'), () => fetchEpisodes(titleId, app), 60 * 60),
    ]);

    const seriesTitle = container.titles?.en ?? titleId;
    const seriesPoster = container.images?.poster?.main?.url ?? '';
    const genres = container.genres?.map((g) => g.title ?? '').filter(Boolean) ?? [];

    const episodes: VikiEpisode[] = episodeList.response ?? [];

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
            category: genres.length > 0 ? genres : undefined,
            image: thumb || undefined,
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
