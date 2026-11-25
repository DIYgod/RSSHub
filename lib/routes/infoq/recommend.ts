import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

import utils from './utils';

export const route: Route = {
    path: '/recommend',
    categories: ['new-media'],
    example: '/infoq/recommend',
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
            source: ['infoq.cn/'],
        },
    ],
    name: '推荐',
    maintainers: ['brilon'],
    handler,
    url: 'infoq.cn/',
};

async function handler(ctx) {
    const apiUrl = 'https://www.infoq.cn/public/v1/my/recommond';
    const pageUrl = 'https://www.infoq.cn';

    const resp = await got.post(apiUrl, {
        json: {
            size: getRouteLimit(ctx, 30),
        },
    });

    const data = resp.data.data;
    const items = await utils.processFeed(data, cache);

    return {
        title: 'InfoQ 推荐',
        link: pageUrl,
        item: items,
    };
}
