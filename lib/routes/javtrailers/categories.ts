import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';

import { baseUrl, getItem, getList, parseList } from './utils';

export const route: Route = {
    path: '/categories/:category',
    categories: ['multimedia'],
    example: '/javtrailers/categories/hi-def',
    parameters: { category: 'Category name, can be found in the URL of the category page' },
    radar: [
        {
            source: ['javtrailers.com/categories/:category'],
        },
    ],
    name: 'Categories',
    maintainers: ['TonyRL'],
    url: 'javtrailers.com/categories',
    handler,
    features: {
        nsfw: true,
        requirePuppeteer: false,
    },
};

async function handler(ctx) {
    const { category } = ctx.req.param();

    const response = await getList(`${baseUrl}/categories/${category}`, 'category');

    const list = parseList(response.videos);

    const items = await pMap(
        list,
        async (item) => ({
            ...(await cache.tryGet(item.link, () => getItem(item))),
            ...item,
        }),
        { concurrency: 3 }
    );

    return {
        title: `Watch ${response.category.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
        description: `Watch ${response.category.name} Jav video’s free, we have the largest Jav collections with high definition`,
        link: `${baseUrl}/categories/${category}`,
        item: items,
    };
}
