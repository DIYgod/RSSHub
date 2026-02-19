import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: '/vip/:id?',
    categories: ['traditional-media'],
    example: '/yicai/vip/428',
    parameters: { id: '频道 id，可在对应频道页中找到，默认为一元点金' },
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
            source: ['yicai.com/vip/product/:id', 'yicai.com/'],
            target: '/vip/:id',
        },
    ],
    name: 'VIP 频道',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '428';

    const currentUrl = `${rootUrl}/vip/product/${id}`;
    const apiUrl = `${rootUrl}/api/ajax/getlistbypid?id=${id}&type=3&page=1&pagesize=${ctx.req.query('limit') ?? 30}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = await ProcessItems(apiUrl, cache.tryGet);

    return {
        title: `第一财经VIP频道 - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
}
