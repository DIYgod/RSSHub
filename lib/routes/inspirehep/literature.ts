import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import type { LiteratureResponse } from './types';
import { baseUrl, parseLiterature } from './utils';

export const route: Route = {
    path: '/literature/:q',
    example: '/inspirehep/literature/Physics',
    parameters: { q: 'Search keyword' },
    name: 'Literature Search',
    maintainers: ['TonyRL'],
    radar: [
        {
            source: ['inspirehep.net/literature'],
            target: (_params, url) => `/inspirehep/literature/${new URL(url).searchParams.get('q')}`,
        },
    ],
    handler,
};

async function handler(ctx) {
    const q = ctx.req.param('q');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;

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
        link: `${baseUrl}/literature?sort=mostrecent&size=${limit}&page=1&q=${q}`,
        item: items,
    };
}
