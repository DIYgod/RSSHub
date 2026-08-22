import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/isso',
    categories: ['university'],
    example: '/utdallas/isso',
    radar: [
        {
            source: ['isso.utdallas.edu'],
        },
    ],
    name: 'International Student Services',
    maintainers: ['Chang4Tech'],
    handler,
    url: 'isso.utdallas.edu',
};

async function handler(ctx: Context) {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10;
    const link = 'https://isso.utdallas.edu';

    const posts = await ofetch(`${link}/wp-json/wp/v2/posts`, {
        query: {
            _embed: '',
            per_page: limit === 10 ? undefined : limit,
        },
    });

    const items = posts.map((post) => ({
        title: post.title.rendered,
        link: post.link,
        description: post.content.rendered,
        pubDate: parseDate(post.date_gmt),
        author: post._embedded?.author?.[0]?.name,
        category: post._embedded?.['wp:term']?.flat().map((term) => term.name),
    }));

    return {
        title: 'UTDallas - International Student Services',
        link,
        item: items,
    };
}
