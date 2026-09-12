import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type Category = {
    id: number;
    name: string;
    link: string;
};

type PostsQuery = {
    _embed: string;
    per_page?: string;
    categories?: number;
};

export const route: Route = {
    path: '/:channel?',
    categories: ['new-media'],
    example: '/im2maker',
    parameters: { channel: '默认不填为 最新文章 ，频道如下' },
    description: `| 最新文章 | 行业快讯 | 行业观察 | 镁客请讲 | 硬科技 100 人 | 投融界   | 万象       |
| -------- | -------- | -------- | -------- | ------------- | -------- | ---------- |
|          | fresh    | industry | talk     | intech        | investor | everything |`,
    name: '频道',
    maintainers: ['jin1218scu'],
    handler,
};

async function handler(ctx: Context) {
    const baseUrl = 'https://www.im2maker.com';
    const channel = ctx.req.param('channel')?.toLowerCase();

    let title = '最新文章';
    let link = baseUrl;
    const query: PostsQuery = {
        _embed: '',
        per_page: ctx.req.query('limit') === '10' ? undefined : ctx.req.query('limit'),
    };

    if (channel) {
        const category = await cache.tryGet(`im2maker:category:${channel}`, async () => {
            const categories = await ofetch<Category[]>(`${baseUrl}/wp-json/wp/v2/categories`, { query: { slug: channel } });
            return categories[0];
        });
        title = category.name;
        link = category.link;
        query.categories = category.id;
    }

    const posts = await ofetch(`${baseUrl}/wp-json/wp/v2/posts`, { query });

    const items = posts.map((post) => ({
        title: post.title.rendered,
        link: post.link,
        guid: post.guid.rendered,
        description: post.content.rendered,
        pubDate: parseDate(post.date_gmt),
        author: post._embedded?.author?.[0]?.name,
        category: post._embedded?.['wp:term']?.flat().map((term) => term.name),
    }));

    return {
        title: `镁客网 ${title}`,
        link,
        description: '镁客网',
        item: items,
    };
}
