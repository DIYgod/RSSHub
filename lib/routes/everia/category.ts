import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';

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

    const response = await got(categoryUrl);
    const $ = load(response.body);
    const itemRaw = $('article.blog-entry').slice(0, limit).toArray();

    return {
        title: `${SUB_NAME_PREFIX} - Category: ${category}`,
        link: categoryUrl,
        item: await Promise.all(
            itemRaw.map((e) => {
                const item = $(e);
                const link = item.find('h2.entry-title a').attr('href');
                return cache.tryGet(link, () => loadArticle(link));
            })
        ),
    };
}
