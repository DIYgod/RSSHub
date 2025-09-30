import { Route } from '@/types';
import got from '@/utils/got';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';
import { WPPost } from './types';

export const route: Route = {
    path: '/category/:category',
    categories: ['picture'],
    example: '/4kup/category/coser',
    parameters: { category: 'Category' },
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
            source: ['4kup.net/category/:category'],
            target: '/category/:category',
        },
    ],
    name: 'Category',
    maintainers: ['AiraNadih'],
    handler,
    url: '4kup.net/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const category = ctx.req.param('category');
    const categoryUrl = `${SUB_URL}category/${category}/`;

    const {
        data: [{ id: categoryId }],
    } = await got(`${SUB_URL}wp-json/wp/v2/categories?slug=${category}`);
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?categories=${categoryId}&per_page=${limit}`);

    return {
        title: `${SUB_NAME_PREFIX} - Category: ${category}`,
        link: categoryUrl,
        item: posts.map((post) => loadArticle(post as WPPost)),
    };
}
