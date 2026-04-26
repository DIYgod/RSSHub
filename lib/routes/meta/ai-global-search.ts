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
            'URL-encoded query string of filters (path-based so each combination caches independently). Supported keys: `q` (search query), `content_types` (comma-separated: `person`, `publication`, `blog`, `dataset`, `event`, `tool`), `research_areas` (e.g. `natural-language-processing,computer-vision`), `filter_tags` (`research`, `ml-applications`, `open-source`, `developer-tools`, `ar-vr`, `hardware`), `years` (e.g. `2024,2025`), `location_cities` (publication venues like `AAAI,ACL`), `alphabetical_filter` (single letter, pairs with `content_types=person`+`sort_by=ALPHABETICAL`), `sort_by` (`RELEVANCE`, `MOST_RECENT`, `ALPHABETICAL`, `RANDOM`, default `RELEVANCE`), `offset` (default `0`). Combine multiple filters by encoding `&` as `%26`.',
    },
    description: 'Page size can be tuned with the `limit` query string parameter (default `36`).',
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

type SearchInput = {
    alphabetical_filter: string | null;
    content_types: string[] | null;
    offset: number;
    search_query: string;
    sort_by: string;
    filter_tags: string[] | null;
    location_cities: string[] | null;
    research_areas: string[] | null;
    years: string[] | null;
};

const buildSearchInput = (params: querystring.ParsedUrlQuery): SearchInput => ({
    alphabetical_filter: firstString(params.alphabetical_filter) || null,
    content_types: toList(firstString(params.content_types)),
    offset: Number.parseInt(firstString(params.offset) ?? '0', 10),
    search_query: firstString(params.q) ?? firstString(params.search_query) ?? '',
    sort_by: firstString(params.sort_by) ?? 'RELEVANCE',
    filter_tags: toList(firstString(params.filter_tags)),
    location_cities: toList(firstString(params.location_cities)),
    research_areas: toList(firstString(params.research_areas)),
    years: toList(firstString(params.years)),
});

const summarizeFilters = (input: SearchInput): string => {
    const parts: string[] = [];
    if (input.search_query) {
        parts.push(`q=${input.search_query}`);
    }
    if (input.content_types) {
        parts.push(`content_types=${input.content_types.join(',')}`);
    }
    if (input.research_areas) {
        parts.push(`research_areas=${input.research_areas.join(',')}`);
    }
    if (input.filter_tags) {
        parts.push(`filter_tags=${input.filter_tags.join(',')}`);
    }
    if (input.years) {
        parts.push(`years=${input.years.join(',')}`);
    }
    if (input.location_cities) {
        parts.push(`location_cities=${input.location_cities.join(',')}`);
    }
    if (input.alphabetical_filter) {
        parts.push(`alphabetical_filter=${input.alphabetical_filter}`);
    }
    return parts.join(' · ');
};

const mapItem = (item: ResultShape) => ({
    title: item.title,
    description: item.description ?? '',
    link: item.href?.startsWith('http') ? item.href : `https://ai.meta.com${item.href}`,
    pubDate: item.published_time ? parseDate(Number(item.published_time) * 1000) : undefined,
    author: item.authors || undefined,
    category: [item.type, ...(item.tags ?? [])].filter(Boolean) as string[],
    image: item.image_src || undefined,
    guid: item.cmsid,
});

async function handler(ctx) {
    const link = 'https://ai.meta.com/global_search/';
    const { server } = await getMetaServerContext(link);

    const params = querystring.parse(ctx.req.param('routeParams') || '');
    const limit = Number.parseInt(ctx.req.query('limit') ?? '36', 10);
    const input = buildSearchInput(params);

    const friendlyName = 'useFBAIGlobalSearchQuery';
    const data = await ofetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: metaGraphqlHeaders(server, friendlyName),
        body: buildGraphqlBody({
            server,
            friendlyName,
            docId: '9716930201759979',
            variables: { input },
        }),
        parseResponse: JSON.parse,
    });

    const result = data?.data?.result;
    const shapes: ResultShape[] = result?.result_shapes ?? [];
    const items = shapes.slice(0, limit).map((item) => mapItem(item));

    const filterSummary = summarizeFilters(input);
    const baseTitle = 'Meta AI Global Search';
    return {
        title: filterSummary ? `${baseTitle} — ${filterSummary}` : baseTitle,
        description: 'Search results from ai.meta.com/global_search/.',
        link,
        item: items,
    };
}
