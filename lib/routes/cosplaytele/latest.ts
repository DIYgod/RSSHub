import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import loadArticle from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';

export const route: Route = {
    path: '/',
    categories: ['picture'],
    example: '/cosplaytele',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['cosplaytele.com/'],
            target: '',
        },
    ],
    name: 'Latest',
    maintainers: ['AiraNadih'],
    handler,
    url: 'cosplaytele.com/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const response = await got(SUB_URL);
    const $ = load(response.body);
    const itemRaw = $('#content .post-item').slice(0, limit).toArray();

    return {
        title: `${SUB_NAME_PREFIX} - Latest`,
        link: SUB_URL,
        item: await Promise.all(
            itemRaw.map((e) => {
                const item = $(e);
                const link = item.find('h5.post-title a').attr('href');
                return cache.tryGet(link, () => loadArticle(link));
            })
        ),
    };
}
