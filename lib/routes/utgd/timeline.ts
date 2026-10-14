import pMap from 'p-map';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

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
    const limit = getRouteLimit(ctx, 20);

    const response = await ofetch(`${apiRootUrl}/api/v2/timeline/`, {
        query: {
            page: 1,
            page_size: limit,
        },
    });

    const list = parseResult(response.results, limit);

    const items = await pMap(list, parseArticle, { concurrency: 3 });

    return {
        title: 'UNTAG',
        link: rootUrl,
        item: items,
    };
}
