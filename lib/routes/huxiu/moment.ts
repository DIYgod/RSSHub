import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiMomentRootUrl, fetchData, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/moment',
    categories: ['new-media'],
    example: '/huxiu/moment',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['huxiu.com/moment'],
        },
    ],
    name: '24 小时',
    maintainers: ['nczitzk'],
    handler,
    url: 'huxiu.com/moment',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL('web-v3/moment/feed', apiMomentRootUrl).href;
    const currentUrl = new URL('moment', rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
        },
    });

    const items = await processItems(response.data.moment_list.datalist, limit, cache.tryGet);

    const data = await fetchData(currentUrl);

    return {
        item: items,
        ...data,
    };
}
