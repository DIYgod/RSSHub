import type { Route } from '@/types';
import cache from '@/utils/cache';

import { ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: '/headline',
    categories: ['traditional-media'],
    example: '/yicai/headline',
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
            source: ['yicai.com/'],
        },
    ],
    name: '头条',
    maintainers: ['nczitzk'],
    handler,
    url: 'yicai.com/',
};

async function handler(ctx) {
    const apiUrl = `${rootUrl}/api/ajax/getlistbycid?cid=48&type=1&page=1&pagesize=${ctx.req.query('limit') ?? 30}`;

    const items = await ProcessItems(apiUrl, cache.tryGet);

    return {
        title: '第一财经 - 头条',
        link: rootUrl,
        item: items,
    };
}
