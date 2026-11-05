import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import type { LiteratureResponse } from './types';
import { baseUrl, parseLiterature } from './utils';

export const route: Route = {
    path: '/literature/:q',
    example: '/inspirehep/literature/Physics',
    parameters: { q: 'Search keyword' },
    name: 'Literature Search',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const q = ctx.req.param('q');
    const limit = getRouteLimit(ctx, 25);

    const response = await ofetch<LiteratureResponse>(`${baseUrl}/api/literature`, {
        query: {
            sort: 'mostrecent',
            size: limit,
            page: 1,
            q,
        },
    });

    const items = parseLiterature(response.hits.hits);

    return {
        title: 'Literature Search - INSPIRE',
        link: `${baseUrl}/literature?sort=mostrecent&size=${limit}&page=1&q=${encodeURIComponent(q)}`,
        item: items,
    };
}
