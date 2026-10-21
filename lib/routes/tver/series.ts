import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/series/:id',
    categories: ['traditional-media'],
    example: '/tver/series/srx2o7o3c8',
    parameters: {
        id: 'Series ID (as it appears in URLs). For example, in https://tver.jp/series/srx2o7o3c8, the ID is "srx2o7o3c8".',
    },
    radar: [
        {
            source: ['tver.jp/series/:id'],
            target: '/series/:id',
        },
    ],
    name: 'Series',
    maintainers: ['yuikisaito'],
    handler,
};
const commonHeaders = {
    Accept: '*/*',
    'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Sec-GPC': '1',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
};
interface EpisodeDetails {
    description?: string;
    viewStatus?: {
        startAt?: number;
    };
}
interface SeriesEpisodes {
    result: {
        contents?: Array<{
            contents: Array<{
                type: string;
                content: {
                    id: string;
                    title: string;
                    version?: number;
                };
            }>;
        }>;
    };
}
function getPublicationDate(startAt: number | undefined) {
    if (typeof startAt !== 'number' || !Number.isFinite(startAt) || startAt <= 0) {
        return;
    }
    const date = parseDate(startAt, 'X');
    return Number.isFinite(date.getTime()) ? date : undefined;
}
async function handler(ctx: Context): Promise<Data> {
    const { id } = ctx.req.param();
    const browserRequest = {
        method: 'POST',
        body: 'device_type=pc',
        headers: {
            ...commonHeaders,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        referer: 'https://s.tver.jp/',
        credentials: 'omit',
        mode: 'cors',
    } as const;
    const { result: browser } = await ofetch('https://platform-api.tver.jp/v2/api/platform_users/browser/create', browserRequest);
    const { platform_uid: platformUid, platform_token: platformToken } = browser;
    const seriesRequest = {
        method: 'GET',
        headers: commonHeaders,
        referer: 'https://tver.jp/',
        credentials: 'omit',
        mode: 'cors',
    } as const;
    const { title, description, broadcastProvider } = await ofetch(`https://statics.tver.jp/content/series/${id}.json`, seriesRequest);
    const episodesRequest = {
        method: 'GET',
        headers: {
            ...commonHeaders,
            'x-tver-platform-type': 'web',
        },
        referer: 'https://tver.jp/',
        credentials: 'omit',
        mode: 'cors',
    } as const;
    const { result } = await ofetch<SeriesEpisodes>(`https://platform-api.tver.jp/service/api/v1/callSeriesEpisodes/${id}?platform_uid=${platformUid}&platform_token=${platformToken}`, episodesRequest);
    const items: DataItem[] = await pMap(
        (result.contents?.[0]?.contents ?? []).filter((i) => i.type === 'episode'),
        async (i) => {
            const episode = await cache.tryGet<EpisodeDetails>(`tver:episode:${i.content.id}:${i.content.version ?? ''}`, () => ofetch(`https://statics.tver.jp/content/episode/${i.content.id}.json`, seriesRequest));
            return {
                title: i.content.title,
                link: `https://tver.jp/episodes/${i.content.id}`,
                image: `https://statics.tver.jp/images/content/thumbnail/episode/xlarge/${i.content.id}.jpg`,
                description: episode.description,
                pubDate: getPublicationDate(episode.viewStatus?.startAt),
            };
        },
        { concurrency: 3 }
    );
    return {
        title: 'TVer - ' + title,
        description,
        author: broadcastProvider.name,
        link: `https://tver.jp/series/${id}`,
        image: `https://statics.tver.jp/images/content/thumbnail/series/xlarge/${id}.jpg`,
        language: 'ja',
        item: items,
    };
}
