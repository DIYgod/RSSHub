import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/idownloadblog',
    description: 'Provides a better reading experience (full text articles) over the official one.',
    name: 'blog',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx: Context) {
    const baseUrl = 'https://www.idownloadblog.com';
    const posts = await ofetch(`${baseUrl}/wp-json/wp/v2/posts`, {
        query: {
            per_page: ctx.req.query('limit') === '10' ? undefined : ctx.req.query('limit'),
        },
    });

    const items = posts.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        updated: parseDate(item.modified_gmt),
        link: item.link,
        author: item.yoast_head_json?.author,
    }));

    return {
        title: 'iDownloadBlog',
        link: baseUrl,
        description: 'iDownloadBlog',
        item: items,
    };
}
