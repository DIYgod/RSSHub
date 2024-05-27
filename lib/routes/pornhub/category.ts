import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { defaultDomain, renderDescription } from './utils';
import { config } from '@/config';

export const route: Route = {
    path: '/category/:caty',
    categories: ['multimedia'],
    example: '/pornhub/category/popular-with-women',
    parameters: { caty: 'category, see [categories](https://www.pornhub.com/webmasters/categories)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('caty');

    const categories = await cache.tryGet('pornhub:categories', async () => {
        const { data } = await got(`${defaultDomain}/webmasters/categories`);
        return data.categories;
    });

    const categoryId = isNaN(category) ? categories.find((item) => item.category === category)?.id : category;
    const categoryName = isNaN(category) ? category : categories.find((item) => item.id === Number.parseInt(category)).category;

    const response = await cache.tryGet(
        `pornhub:category:${categoryName}`,
        async () => {
            const { data } = await got(`${defaultDomain}/webmasters/search?category=${categoryName}`);
            return data;
        },
        config.cache.routeExpire,
        false
    );

    if (response.code) {
        throw new Error(response.message);
    }

    const list = response.videos.map((item) => ({
        title: item.title,
        link: item.url,
        description: renderDescription({ thumbs: item.thumbs }),
        pubDate: parseDate(item.publish_date),
        category: [...new Set([...item.tags.map((t) => t.tag_name), ...item.categories.map((c) => c.category)])],
    }));

    return {
        title: `Pornhub - ${categoryName}`,
        link: `${defaultDomain}/video?c=${categoryId}`,
        item: list,
    };
}
