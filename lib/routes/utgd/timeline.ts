import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiRootUrl, parseArticle, parseResult, rootUrl } from './utils';

export const route: Route = {
    path: '/timeline',
    categories: ['new-media'],
    example: '/utgd/timeline',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['utgd.net/'],
        },
    ],
    name: '时间线',
    maintainers: ['nczitzk'],
    handler,
    url: 'utgd.net/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const response = await ofetch(`${apiRootUrl}/api/v2/timeline/`, {
        query: {
            page: 1,
            page_size: limit,
        },
    });

    const list = parseResult(response.results, limit);

    const items = await Promise.all(list.map((item) => parseArticle(item)));

    return {
        title: 'UNTAG',
        link: rootUrl,
        item: items,
    };
}
