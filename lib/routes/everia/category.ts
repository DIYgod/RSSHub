import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

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
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const category = ctx.req.param('category');
    const categoryUrl = `${SUB_URL}category/${category}/`;

    const categoryId = await cache.tryGet(`everia:category:${category}`, async () => {
        const { data: categories } = await got(`${SUB_URL}wp-json/wp/v2/categories?slug=${category}`);
        if (!categories.length) {
            throw new InvalidParameterError(`Category not found: ${category}`);
        }
        return categories[0].id as number;
    });
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?categories=${categoryId}&per_page=${limit}&_embed`);

    return {
        title: `${SUB_NAME_PREFIX} - Category: ${category}`,
        link: categoryUrl,
        item: posts.map((post) => loadArticle(post)),
    };
}
