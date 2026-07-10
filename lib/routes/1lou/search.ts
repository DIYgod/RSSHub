import type { Route } from '@/types';

import { fetchThreads, rootUrl } from './util';

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const currentUrl = `${rootUrl}/search.htm?keyword=${encodeURIComponent(keyword)}`;

    const { items, language } = await fetchThreads(currentUrl, limit);

    return {
        title: `${keyword} - BT 之家 1LOU 站搜索`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
        language,
    };
}

export const route: Route = {
    path: '/search/:keyword',
    name: '关键词搜索',
    url: '1lou.me',
    maintainers: ['falling', 'nczitzk', 'JaggerH'],
    handler,
    example: '/1lou/search/奥本海默',
    parameters: { keyword: '搜索关键词' },
    description: '1LOU 站的关键词搜索，对应站内 `https://www.1lou.me/search.htm?keyword=<关键词>`。',
    categories: ['multimedia'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
};
