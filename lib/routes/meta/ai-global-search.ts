import querystring from 'node:querystring';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildGraphqlBody, getMetaServerContext, GRAPHQL_ENDPOINT, metaGraphqlHeaders } from './utils';

export const route: Route = {
    path: '/ai/global-search/:routeParams?',
    categories: ['programming'],
    example: '/meta/ai/global-search/content_types=blog',
    name: 'AI Global Search',
    maintainers: ['shcheglovnd'],
    url: 'ai.meta.com/global_search/',
    parameters: {
        routeParams:
            'URL-encoded query string of filters (path-based so each combination caches independently). Supported keys: `q` (search query), `content_types` (comma-separated: `person`, `publication`, `blog`, `dataset`, `event`, `tool`), `research_areas` (e.g. `natural-language-processing,computer-vision`), `filter_tags` (`research`, `ml-applications`, `open-source`, `developer-tools`, `ar-vr`, `hardware`), `years` (e.g. `2024,2025`), `location_cities` (publication venues like `AAAI,ACL`), `alphabetical_filter` (single letter, pairs with `content_types=person`+`sort_by=ALPHABETICAL`), `sort_by` (`RELEVANCE`, `MOST_RECENT`, `ALPHABETICAL`, `RANDOM`, default `RELEVANCE`), `offset` (default `0`).',
        limit: 'Number of items to return (default `36`). Provided as a normal query string (`?limit=N`) since the cache layer keys on it.',
    },
    radar: [
        {
            source: ['ai.meta.com/global_search/', 'ai.meta.com/global_search', 'ai.meta.com/results/'],
        },
    ],
    handler,
};

const toList = (value: string | undefined): string[] | null => {
    if (!value) {
        return null;
    }
    const list = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return list.length ? list : null;
};

const firstString = (value: string | string[] | undefined): string | undefined => (Array.isArray(value) ? value[0] : value);

type ResultShape = {
    title: string;
    description: string | null;
    href: string;
    image_src: string | null;
    cmsid: string;
    type: string;
    authors: string | null;
    tags: string[] | null;
    location: string | null;
    journal_number: string | null;
    published_time: string | null;
    year: string | null;
};

async function handler(ctx) {
    const link = 'https://ai.meta.com/global_search/';
    const { server } = await getMetaServerContext(link);

    const params = querystring.parse(ctx.req.param('routeParams') || '');

    const limit = Number.parseInt(ctx.req.query('limit') ?? '36', 10);
    const offset = Number.parseInt(firstString(params.offset) ?? '0', 10);
    const searchQuery = firstString(params.q) ?? firstString(params.search_query) ?? '';
    const sortBy = firstString(params.sort_by) ?? 'RELEVANCE';
    const alphabeticalFilter = firstString(params.alphabetical_filter) || null;

    const variables = {
        input: {
            alphabetical_filter: alphabeticalFilter,
            content_types: toList(firstString(params.content_types)),
            offset,
            search_query: searchQuery,
            sort_by: sortBy,
            filter_tags: toList(firstString(params.filter_tags)),
            location_cities: toList(firstString(params.location_cities)),
            research_areas: toList(firstString(params.research_areas)),
            years: toList(firstString(params.years)),
        },
    };

    const friendlyName = 'useFBAIGlobalSearchQuery';
    const data = await ofetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: metaGraphqlHeaders(server, friendlyName),
        body: buildGraphqlBody({
            server,
            friendlyName,
            docId: '9716930201759979',
            variables,
        }),
        parseResponse: JSON.parse,
    });

    const result = data?.data?.result;
    const shapes: ResultShape[] = result?.result_shapes ?? [];

    const items = shapes.slice(0, limit).map((item) => ({
        title: item.title,
        description: item.description ?? '',
        link: item.href?.startsWith('http') ? item.href : `https://ai.meta.com${item.href}`,
        pubDate: item.published_time ? parseDate(Number(item.published_time) * 1000) : undefined,
        author: item.authors || undefined,
        category: [item.type, ...(item.tags ?? [])].filter(Boolean) as string[],
        image: item.image_src || undefined,
        guid: item.cmsid,
    }));

    const filterSummary = [
        searchQuery && `q=${searchQuery}`,
        variables.input.content_types && `content_types=${variables.input.content_types.join(',')}`,
        variables.input.research_areas && `research_areas=${variables.input.research_areas.join(',')}`,
        variables.input.filter_tags && `filter_tags=${variables.input.filter_tags.join(',')}`,
        variables.input.years && `years=${variables.input.years.join(',')}`,
        variables.input.location_cities && `location_cities=${variables.input.location_cities.join(',')}`,
        alphabeticalFilter && `alphabetical_filter=${alphabeticalFilter}`,
    ]
        .filter(Boolean)
        .join(' · ');

    const baseTitle = 'Meta AI Global Search';
    return {
        title: filterSummary ? `${baseTitle} — ${filterSummary}` : baseTitle,
        description: `Search results from ai.meta.com/global_search/ (sort: ${sortBy}, total hits: ${result?.total_hits ?? 0}).`,
        link,
        item: items,
    };
}
