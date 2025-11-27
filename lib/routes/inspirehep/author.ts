import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { AuthorResponse, LiteratureResponse } from './types';
import { baseUrl, parseLiterature } from './utils';

export const route: Route = {
    path: '/authors/:id',
    example: '/inspirehep/authors/1696909',
    parameters: { id: 'Author ID' },
    name: 'Author Search',
    maintainers: ['TonyRL'],
    radar: [
        {
            source: ['inspirehep.net/authors/:id'],
        },
    ],
    handler,
};

export const getAuthorById = (id: string) =>
    cache.tryGet(`inspirehep:author:${id}`, () =>
        ofetch<AuthorResponse>(`${baseUrl}/api/authors/${id}`, {
            headers: {
                accept: 'application/vnd+inspire.record.ui+json',
            },
            parseResponse: JSON.parse,
        })
    );

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;

    const authorInfo = (await getAuthorById(id)) as AuthorResponse;
    const response = await ofetch<LiteratureResponse>(`${baseUrl}/api/literature`, {
        query: {
            sort: 'mostrecent',
            size: limit,
            page: 1,
            search_type: 'hep-author-publication',
            author: authorInfo.metadata.facet_author_name,
        },
    });

    const items = parseLiterature(response.hits.hits);

    return {
        title: `${authorInfo.metadata.name.preferred_name} - INSPIRE`,
        link: `${baseUrl}/authors/${id}`,
        item: items,
    };
}
