import type { Route } from '@/types';
import { ViewType } from '@/types';

import { getArticleItems, rootUrl } from './utils';

export const route: Route = {
    path: '/',
    example: '/techflowpost',
    radar: [
        {
            source: ['techflowpost.com/zh-CN'],
        },
    ],
    name: '首页',
    categories: ['finance'],
    view: ViewType.Articles,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    maintainers: ['nczitzk'],
    handler,
    url: 'techflowpost.com/zh-CN',
};

async function handler(ctx) {
    const items = await getArticleItems({
        limit: ctx.req.query('limit') ?? 50,
    });

    return {
        title: '深潮TechFlow',
        link: `${rootUrl}/zh-CN`,
        item: items,
    };
}
