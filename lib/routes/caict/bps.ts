import type { Route } from '@/types';

import { fetchPage, parseList } from './utils';

export const route: Route = {
    path: '/bps',
    categories: ['government'],
    example: '/caict/bps',
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
            source: ['www.caict.ac.cn/kxyj/qwfb/bps', 'www.caict.ac.cn/kxyj/qwfb/bps/', 'caict.ac.cn/kxyj/qwfb/bps', 'caict.ac.cn/kxyj/qwfb/bps/'],
            target: '/bps',
        },
    ],
    name: '白皮书',
    maintainers: ['lisyer'],
    url: 'www.caict.ac.cn/kxyj/qwfb/bps/',
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    // List only: detail pages are often blocked/slow by the site WAF
    const { $, url } = await fetchPage('/kxyj/qwfb/bps/');
    const items = parseList($, url, limit);

    return {
        title: '中国信息通信研究院 - 白皮书',
        link: url,
        language: 'zh-cn',
        item: items,
    };
}
