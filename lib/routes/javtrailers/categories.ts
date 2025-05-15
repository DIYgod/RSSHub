import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { baseUrl, getItem, headers, parseList } from './utils';

export const route: Route = {
    path: '/categories/:category',
    categories: ['multimedia'],
    example: '/javtrailers/categories/50001755',
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
};

async function handler(ctx) {
    const { category } = ctx.req.param();

    const response = await ofetch(`${baseUrl}/api/categories/${category}?page=0`, {
        headers,
    });

    const list = parseList(response.videos);

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => getItem(item))));

    return {
        title: `Watch ${response.category.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
        description: `Watch ${response.category.name} Jav video’s free, we have the largest Jav collections with high definition`,
        link: `${baseUrl}/categories/${category}`,
        item: items,
    };
}
