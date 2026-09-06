import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiUrl, renderItem } from './utils';

export const route: Route = {
    path: '/',
    categories: ['journal'],
    example: '/technologyreview',
    radar: [
        {
            source: ['www.technologyreview.com/'],
        },
    ],
    name: 'Index',
    maintainers: ['zphw'],
    handler,
    url: 'www.technologyreview.com',
};

async function handler(ctx: Context): Promise<Data> {
    const limit = Number(ctx.req.query('limit') ?? 10);

    const posts = await ofetch(`${apiUrl}/posts`, {
        query: {
            per_page: limit === 10 ? undefined : limit,
            _embed: '',
        },
    });

    return {
        title: 'MIT Technology Review',
        link: 'https://www.technologyreview.com/',
        language: 'en-us',
        item: posts.map((item) => renderItem(item)),
    };
}
