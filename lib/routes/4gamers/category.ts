import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { getCategories, parseItem, parseList } from './utils';

export const route: Route = {
    path: ['/', '/category/:category'],
    radar: [
        {
            source: ['www.4gamers.com.tw/news', 'www.4gamers.com.tw/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.4gamers.com.tw/news',
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;
    const isLatest = !category;

    const { data: response } = await got(`https://www.4gamers.com.tw/site/api/news/${isLatest ? 'latest' : `by-category/${category}`}`, {
        searchParams: {
            nextStart: 0,
            pageSize: limit,
        },
    });
    const list = parseList(response.data.results);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    let categories = [];
    let categoryName = '最新消息';
    if (!isLatest) {
        categories = await getCategories(cache.tryGet);
        categoryName = categories.find((c) => c.id === Number.parseInt(category)).name;
    }

    return {
        title: `4Gamers - ${categoryName}`,
        link: `https://www.4gamers.com.tw/news${isLatest ? '' : `/category/${category}/${categoryName}`}`,
        item: items,
    };
}
