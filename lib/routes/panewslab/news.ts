import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { getArticles, processArticles, rootUrl } from './utils';

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
    const articles = await getArticles({ type: 'NEWS', isShowInList: true, take: getRouteLimit(ctx, 50) });
    const items = await processArticles(articles, false);

    return {
        title: 'PANews - 快讯',
        link: `${rootUrl}/zh/newsflash`,
        item: items,
    };
}
