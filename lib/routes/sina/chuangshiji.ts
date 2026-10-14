import pMap from 'p-map';

import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { getRollNewsList, parseArticle, parseRollNewsList } from './utils';

export const route: Route = {
    path: '/csj',
    categories: ['new-media'],
    example: '/sina/csj',
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
            source: ['tech.sina.com.cn/chuangshiji', 'tech.sina.com.cn/'],
        },
    ],
    name: '专栏 - 创事记',
    maintainers: ['xapool'],
    handler,
    url: 'tech.sina.com.cn/chuangshiji',
};

async function handler(ctx) {
    const pageid = '402';
    const lid = '2559';
    const limit = getRouteLimit(ctx, 50);
    const response = await getRollNewsList(pageid, lid, limit);
    const list = parseRollNewsList(response.data.result.data);

    const out = await pMap(list, parseArticle, { concurrency: 3 });

    return {
        title: '新浪专栏-创事记',
        link: 'https://tech.sina.com.cn/chuangshiji',
        item: out,
    };
}
