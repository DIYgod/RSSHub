import { Route } from '@/types';
import fetchFeed from './utils';

export const route: Route = {
    path: '/search/:keyword?',
    categories: ['traditional-media'],
    example: '/ruancan/search/Windows',
    parameters: { keyword: '关键字，默认为空' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['ruancan.com/'],
        target: '',
    },
    name: '搜索',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const currentUrl = `/?s=${keyword}`;

    ctx.set('data', await fetchFeed(ctx, currentUrl));
}
