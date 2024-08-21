import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { rootUrl, apiRootUrl, parseResult, parseArticle } from './utils';

export const route: Route = {
    path: '/category/:category?',
    categories: ['new-media'],
    example: '/utgd/category/method',
    parameters: { category: '分类，可在对应分类页的 URL 中找到，默认为方法' },
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
            source: ['utgd.net/category/s/:category', 'utgd.net/'],
            target: '/category/:category',
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 方法   | 观点    |
  | ------ | ------- |
  | method | opinion |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'method';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 9;

    const apiUrl = `${apiRootUrl}/api/v2/categories`;
    const currentUrl = `${rootUrl}/category/s/${category}`;
    const slugUrl = `${apiRootUrl}/api/v2/category/slug/${category}/`;

    const categoryData = await ofetch(slugUrl);

    const response = await ofetch(`${apiUrl}/${categoryData.id}/related_articles`, {
        query: {
            page: 1,
            page_size: limit,
        },
    });

    const list = parseResult(response.results, limit);

    const items = await Promise.all(list.map((item) => parseArticle(item)));

    return {
        title: `UNTAG - ${categoryData.category_name}`,
        link: currentUrl,
        item: items,
        image: categoryData.category_image,
        description: categoryData.category_description,
    };
}
