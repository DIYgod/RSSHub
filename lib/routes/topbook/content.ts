import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?',
    categories: ['new-media'],
    example: '/topbook',
    parameters: { id: '分类 id，可在对应分类页 URL 中找到，默认为最新文章' },
    radar: [
        {
            source: ['topbook.cc/content', 'topbook.cc/'],
            target: '',
        },
        {
            source: ['topbook.cc/content/:id'],
            target: '/:id',
        },
    ],
    name: '文章',
    maintainers: ['nczitzk'],
    handler,
};

function renderContent(content: string) {
    const $ = load(content, null, false);
    $('oembed[url]').each((_, element) => {
        const embed = $(element);
        const url = new URL(embed.attr('url')!);
        if (!['http:', 'https:'].includes(url.protocol)) {
            return;
        }
        embed.replaceWith(url.pathname.endsWith('.mp4') ? $('<video controls>').attr('src', url.href) : $('<iframe allowfullscreen>').attr('src', url.href));
    });
    return $.html();
}

function parsePubDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(`${value} +08:00`, 'YYYY-MM-DD HH:mm:ss Z');
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const rootUrl = 'https://topbook.cc';
    const response = await ofetch(id ? `${rootUrl}/webapi/content/article/${id}/page?start=0&limit=24` : `${rootUrl}/webapi/content/article/page?start=0&limit=24&sort_type=latest`);

    const items = response.data.items.map((item) => ({
        title: item.title,
        author: item.nickname,
        description: renderContent(item.content),
        pubDate: parsePubDate(item.createTime),
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
