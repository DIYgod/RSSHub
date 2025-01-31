import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['design'],
    example: '/bossdesign',
    parameters: { category: '分类，可在对应分类页 URL 中找到，留空为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['TonyRL'],
    handler,
    description: `| Boss 笔记 | 电脑日志        | 素材资源         | 设计师神器      | 设计教程        | 设计资讯            |
| --------- | --------------- | ---------------- | --------------- | --------------- | ------------------- |
| note      | computer-skills | design-resources | design-software | design-tutorial | design\_information |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const limit = Number.parseInt(ctx.req.query('limit'), 10) || undefined;
    const baseUrl = 'https://www.bossdesign.cn';

    const currentCategory = await cache.tryGet(`bossdesign:categories:${category}`, async () => {
        const { data: categories } = await got(`${baseUrl}/wp-json/wp/v2/categories`);
        return categories.find((item) => item.slug === category || item.name === category);
    });

    const categoryId = currentCategory?.id;

    const { data: posts } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            categories: categoryId,
            per_page: limit,
            _embed: '',
        },
    });

    const items = posts.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        updated: parseDate(item.modified_gmt),
        link: item.link,
        guid: item.guid.rendered,
        category: [...new Set([...item._embedded['wp:term'][0].map((item) => item.name), ...item._embedded['wp:term'][1].map((item) => item.name)])],
    }));

    return {
        title: currentCategory?.name ? `${currentCategory.name} | Boss设计` : 'Boss设计 | 收集国外设计素材网站的资源平台。',
        description: currentCategory?.description ?? 'Boss设计-收集国外设计素材网站的资源平台。专注于收集国外设计素材和国外设计网站，以及超实用的设计师神器，只为设计初学者和设计师提供海量的资源平台。..',
        image: currentCategory?.cover ?? `${baseUrl}/wp-content/themes/pinghsu/images/Bossdesign-ico.ico`,
        link: currentCategory?.link ?? baseUrl,
        item: items,
    };
}
