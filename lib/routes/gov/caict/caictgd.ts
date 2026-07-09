import type { Route } from '@/types';

import { fetchPage, parseList } from './utils';

export const route: Route = {
    path: '/caictgd',
    categories: ['government'],
    example: '/gov/caict/caictgd',
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
            source: ['www.caict.ac.cn/kxyj/caictgd', 'www.caict.ac.cn/kxyj/caictgd/', 'caict.ac.cn/kxyj/caictgd', 'caict.ac.cn/kxyj/caictgd/'],
            target: '/caictgd',
        },
    ],
    name: 'CAICT 观点',
    maintainers: ['lisyer'],
    url: 'www.caict.ac.cn/kxyj/caictgd/',
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const { $, url } = await fetchPage('/kxyj/caictgd/');
    // Mostly WeChat article links — list metadata is enough
    const items = parseList($, url, limit);

    return {
        title: '中国信息通信研究院 - CAICT观点',
        link: url,
        language: 'zh-cn',
        item: items,
    };
}
