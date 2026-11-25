import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';

import { loadArticle } from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';

export const route: Route = {
    path: '/category/:category',
    categories: ['picture'],
    example: '/everia/category/cosplay',
    parameters: {
        category: 'Category of the image stream',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['everia.club/category/:category'],
            target: '/category/:category',
        },
    ],
    name: 'Images with category',
    maintainers: ['KTachibanaM', 'AiraNadih'],
    handler,
};

async function handler(ctx) {
    const limit = Math.min(getRouteLimit(ctx, 20), 100);
    const category = ctx.req.param('category');
    const categoryUrl = `${SUB_URL}category/${encodeURIComponent(category)}/`;

    const categoryId = await cache.tryGet(`everia:category:${category}`, async (): Promise<number> => {
        const { data: categories } = await got(`${SUB_URL}wp-json/wp/v2/categories`, { searchParams: { slug: category } });
        if (!categories.length) {
            throw new InvalidParameterError(`Category not found: ${category}`);
        }
        return categories[0].id;
    });
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?categories=${categoryId}&per_page=${limit}&_embed`);

    return {
        title: `${SUB_NAME_PREFIX} - Category: ${category}`,
        link: categoryUrl,
        item: posts.map((post) => loadArticle(post)),
    };
}
