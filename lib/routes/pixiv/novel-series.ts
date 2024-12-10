import { Data, Route } from '@/types';
import { config } from '@/config';
import { getNSFWSeriesNovels } from './novel-api/series/nsfw';
import { getSFWSeriesNovels } from './novel-api/series/sfw';

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

    if (hasPixivAuth()) {
        return await getNSFWSeriesNovels(id, limit);
    }

    return await getSFWSeriesNovels(id, limit);
}
