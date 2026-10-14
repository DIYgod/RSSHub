import type { Route } from '@/types';

import { getArticles, getLimit, processArticles, rootUrl } from './utils';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/panewslab/news',
    radar: [{ source: ['www.panewslab.com/zh/newsflash'], target: '/news' }],
    name: '快讯',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.panewslab.com/zh/newsflash',
};

async function handler(ctx) {
    const articles = await getArticles({ type: 'NEWS', isShowInList: true, take: getLimit(ctx.req.query('limit'), 50) });
    const items = await processArticles(articles, false);

    return {
        title: 'PANews - 快讯',
        link: `${rootUrl}/zh/newsflash`,
        item: items,
    };
}
