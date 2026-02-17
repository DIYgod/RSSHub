import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { namespace } from './namespace';

export const route: Route = {
    path: '/',
    categories: namespace.categories,
    example: '/chongdiantou',
    radar: [
        {
            source: ['www.chongdiantou.com'],
        },
    ],
    name: '最新资讯',
    maintainers: ['Geraldxm'],
    handler,
    url: 'www.chongdiantou.com',
};

async function handler() {
    const response = await ofetch('https://www.chongdiantou.com/nice-json/front-end/home-load-more');
    let items = [];

    items = response.data.map((item) => ({
        title: item.title,
        link: item.link,
        image: item.cover,
        pubDate: new Date(item.time),
        category: item.cat.name,
    }));

    items = await Promise.all(
        items.map(
            async (item) =>
                await cache.tryGet(item.link, async () => {
                    try {
                        const response = await ofetch(item.link);
                        const $ = load(response);
                        item.description = $('.post-content').html() || 'No content found';
                    } catch {
                        item.description = 'Failed to fetch content';
                    }
                    return item;
                })
        )
    );

    return {
        title: '充电头网 - 最新资讯',
        description: '充电头网新闻资讯',
        link: 'https://www.chongdiantou.com',
        image: 'https://static.chongdiantou.com/wp-content/uploads/2021/02/2021021806172389.png',
        item: items,
    };
}
