import { Route, ViewType } from '@/types';
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
            source: ['apnews.com/:rss'],
            target: '/rss/:rss',
        },
    ],
    name: 'News',
    maintainers: ['zoenglinghou', 'mjysci', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const { rss = 'index' } = ctx.req.param();
    const url = `${HOME_PAGE}/${rss}.rss`;
    const res = await parser.parseURL(url);

    const items = ctx.req.query('fulltext') === 'true' ? await Promise.all(res.items.map((item) => fetchArticle(item))) : res;

    return {
        ...res,
        item: items,
    };
}
