import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import parser from '@/utils/rss-parser';

import { fetchArticle } from './utils';

const HOME_PAGE = 'https://apnews.com';

export const route: Route = {
    path: '/rss/:category?',
    categories: ['traditional-media'],
    example: '/apnews/rss/business',
    view: ViewType.Articles,
    parameters: {
        category: {
            description: 'Category from the first segment of the corresponding site, or `index` for the front page.',
            default: 'index',
        },
    },
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
            source: ['apnews.com/:category'],
            target: '/rss/:category',
        },
    ],
    name: 'News',
    maintainers: ['zoenglinghou', 'mjysci', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const { category = 'index' } = ctx.req.param();
    const url = `${HOME_PAGE}/${category}.rss`;
    const res = await parser.parseURL(url);

    const items = ctx.req.query('fulltext') === 'true' ? await Promise.all(res.items.map((item) => fetchArticle(item))) : res.items;

    return {
        ...res,
        item: items,
    } as Data;
}
