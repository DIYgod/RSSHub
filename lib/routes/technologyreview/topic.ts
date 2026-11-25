import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { apiUrl, renderItem } from './utils';

export const route: Route = {
    path: '/:category_name',
    categories: ['journal'],
    example: '/technologyreview/artificial-intelligence',
    parameters: { category_name: 'see below' },
    description: `| Category                  | \`:category_name\`        |
| ------------------------- | ----------------------- |
| Artificial intelligence   | artificial-intelligence |
| Biotechnology and health  | biotechnology           |
| Business                  | business                |
| Climate change and energy | climate-change          |
| Computing                 | computing               |
| Culture                   | culture                 |
| Policy                    | policy                  |
| Space                     | space                   |`,
    radar: [
        {
            source: ['www.technologyreview.com/topic/:category_name'],
            target: '/:category_name',
        },
    ],
    name: 'Topics',
    maintainers: ['laampui'],
    handler,
    url: 'www.technologyreview.com',
};

interface Category {
    id: number;
    name: string;
}

async function handler(ctx: Context): Promise<Data> {
    const { category_name: categoryName } = ctx.req.param();

    const categories = await cache.tryGet(`technologyreview:category:${categoryName}`, () =>
        ofetch<Category[]>(`${apiUrl}/categories`, {
            query: { slug: categoryName },
        })
    );
    const limit = getRouteLimit(ctx, 10);
    if (categories.length === 0) {
        throw new InvalidParameterError(`Unknown topic "${categoryName}". Choose a topic from https://www.technologyreview.com/.`);
    }

    const posts = await ofetch(`${apiUrl}/posts`, {
        query: {
            categories: categories[0].id,
            per_page: limit === 10 ? undefined : limit,
            _embed: '',
        },
    });

    return {
        title: `${categories[0].name} | MIT Technology Review`,
        link: `https://www.technologyreview.com/topic/${categoryName}/`,
        language: 'en-us',
        item: posts.map((item) => renderItem(item)),
    };
}
