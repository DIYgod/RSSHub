import type { Route } from '@/types';

import { fetchPage, parseList } from './utils';

export const route: Route = {
    path: '/qwsj',
    categories: ['government'],
    example: '/gov/caict/qwsj',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.caict.ac.cn/kxyj/qwfb/qwsj', 'www.caict.ac.cn/kxyj/qwfb/qwsj/', 'caict.ac.cn/kxyj/qwfb/qwsj', 'caict.ac.cn/kxyj/qwfb/qwsj/'],
            target: '/qwsj',
        },
    ],
    name: '权威数据',
    maintainers: ['lisyer'],
    url: 'www.caict.ac.cn/kxyj/qwfb/qwsj/',
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const { $, url } = await fetchPage('/kxyj/qwfb/qwsj/');
    const items = parseList($, url, limit);

    return {
        title: '中国信息通信研究院 - 权威数据',
        link: url,
        language: 'zh-cn',
        item: items,
    };
}
