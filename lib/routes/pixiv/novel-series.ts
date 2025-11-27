import { config } from '@/config';
import type { Data, Route } from '@/types';
import got from '@/utils/got';

import { getNSFWSeriesNovels } from './novel-api/series/nsfw';
import { getSFWSeriesNovels } from './novel-api/series/sfw';
import type { SeriesDetail } from './novel-api/series/types';

const baseUrl = 'https://www.pixiv.net';

export const route: Route = {
    path: '/novel/series/:id',
    categories: ['social-media'],
    example: '/pixiv/novel/series/11586857',
    parameters: {
        id: 'Series id, can be found in URL',
    },
    features: {
        requireConfig: [
            {
                name: 'PIXIV_REFRESHTOKEN',
                optional: true,
                description: `
refresh_token after Pixiv login, required for accessing R18 novels
Pixiv 登錄後的 refresh_token，用於獲取 R18 小說
[https://docs.rsshub.app/deploy/config#pixiv](https://docs.rsshub.app/deploy/config#pixiv)`,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Novel Series',
    maintainers: ['SnowAgar25', 'keocheung'],
    handler,
    radar: [
        {
            source: ['www.pixiv.net/novel/series/:id'],
            target: '/novel/series/:id',
        },
    ],
};

const hasPixivAuth = () => Boolean(config.pixiv && config.pixiv.refreshToken);

async function handler(ctx): Promise<Data> {
    const id = ctx.req.param('id');
    const { limit } = ctx.req.query();

    // Get series info and check content rating
    const seriesInfoResponse = await got(`${baseUrl}/ajax/novel/series/${id}`);
    const seriesInfo: SeriesDetail = seriesInfoResponse.data;

    // xRestrict: 0=All ages, 1=R18, 2=R18G
    if (seriesInfo.body.xRestrict > 0) {
        return await getNSFWSeriesNovels(id, limit);
    } else {
        // All-ages: prefer NSFW handler if authenticated
        if (hasPixivAuth()) {
            return await getNSFWSeriesNovels(id, limit);
        }
        return await getSFWSeriesNovels(id, limit);
    }
}
