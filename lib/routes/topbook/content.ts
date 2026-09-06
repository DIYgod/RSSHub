import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:id?',
    categories: ['new-media'],
    example: '/topbook',
    parameters: { id: '分类 id，可在对应分类页 URL 中找到，默认为最新文章' },
    radar: [
        {
            source: ['topbook.cc/content', 'topbook.cc/'],
            target: '/:id',
        },
    ],
    name: '文章',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const rootUrl = 'https://topbook.cc';
    const response = await ofetch(id ? `${rootUrl}/webapi/content/article/${id}/page?start=0&limit=24` : `${rootUrl}/webapi/content/article/page?start=0&limit=24&sort_type=latest`);

    const items = response.data.items.map((item) => ({
        title: item.title,
        author: item.nickname,
        description: item.content,
        pubDate: timezone(parseDate(item.createTime), 8),
        link: `${rootUrl}/article/${item.articleId}`,
    }));

    let title = '最新文章';
    if (id) {
        const categoryUrl = `${rootUrl}/webapi/content/category/page?start=0&limit=20`;
        const categoryResponse = await cache.tryGet('topbook:category', () => ofetch(categoryUrl));
        title = categoryResponse.data.items.find((category) => category.categoryId === Number(id))?.name ?? title;
    }

    return {
        title: `${title} - Topbook`,
        link: id ? `${rootUrl}/content/${id}` : `${rootUrl}/content`,
        item: items,
    };
}
