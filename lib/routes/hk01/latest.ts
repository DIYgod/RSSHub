import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiRootUrl, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/hk01/latest',
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
            source: ['hk01.com/latest', 'hk01.com/'],
        },
    ],
    name: '即時',
    maintainers: ['5upernova-heng'],
    handler,
    url: 'hk01.com/latest',
};

async function handler(ctx) {
    const currentUrl = `${rootUrl}/latest`;
    const apiUrl = `${apiRootUrl}/v2/page/latest`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await ProcessItems(response.data.items, ctx.req.query('limit'), cache.tryGet);

    return {
        title: '即時 | 香港01',
        link: currentUrl,
        item: items,
    };
}
