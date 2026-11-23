import type { Context } from 'hono';

import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import graphqlTemplate from './search-graphql-template.json';
import { baseUrl, fetchGraphql } from './utils';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type SearchResults = {
    edges?: JsonValue[];
    page_info?: {
        has_next_page?: boolean;
        end_cursor?: string;
    };
};

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSearchResults(value: JsonValue): value is JsonValue & SearchResults {
    if (!isObject(value) || !Array.isArray(value.edges)) {
        return false;
    }

    const pageInfo = value.page_info;
    return pageInfo === undefined || (isObject(pageInfo) && (pageInfo.has_next_page === undefined || typeof pageInfo.has_next_page === 'boolean') && (pageInfo.end_cursor === undefined || typeof pageInfo.end_cursor === 'string'));
}

function findSearchResults(value: JsonValue, depth = 0): SearchResults | undefined {
    if (depth > 35 || value === null || typeof value !== 'object') {
        return;
    }

    if (Array.isArray(value)) {
        for (const child of value) {
            const result = findSearchResults(child, depth + 1);
            if (result) {
                return result;
            }
        }
        return;
    }

    const serpResponse = value.serpResponse;
    if (serpResponse && isObject(serpResponse) && serpResponse.results !== undefined && isSearchResults(serpResponse.results)) {
        return serpResponse.results;
    }

    for (const child of Object.values(value)) {
        const result = findSearchResults(child, depth + 1);
        if (result) {
            return result;
        }
    }
}

function getField(value: JsonValue | undefined, ...keys: string[]): JsonValue | undefined {
    for (const key of keys) {
        if (!value || !isObject(value)) {
            return;
        }
        value = value[key];
    }
    return value;
}

function getString(value: JsonValue | undefined): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

function toItem(edge: JsonValue) {
    const story = getField(edge, 'rendering_strategy', 'view_model', 'click_model', 'story');
    const postIdValue = getField(story, 'post_id');
    const postId = typeof postIdValue === 'string' || typeof postIdValue === 'number' ? String(postIdValue) : undefined;

    if (!postId) {
        return;
    }

    const message = getString(getField(story, 'comet_sections', 'content', 'story', 'message', 'text')) ?? '';
    const actors = getField(story, 'actors');
    const firstActor = Array.isArray(actors) ? actors[0] : undefined;
    const author = getString(getField(story, 'feedback', 'owning_profile', 'name')) ?? getString(getField(firstActor, 'name')) ?? 'Facebook user';
    const title = message || `${author} on Facebook`;
    const creationTime = getField(story, 'creation_time');

    return {
        title,
        description: message,
        link: getString(getField(story, 'permalink_url')) ?? `${baseUrl}/${postId}`,
        guid: `facebook:${postId}`,
        pubDate: typeof creationTime === 'number' ? parseDate(creationTime, 'X') : undefined,
        author,
    };
}

export const route: Route = {
    path: '/search/:query/:sort?',
    name: 'Search Posts',
    example: '/facebook/search/we%20are%20hiring',
    parameters: {
        query: 'Search phrase',
        sort: {
            description: 'Sort order',
            options: [
                { value: 'recent', label: 'Recent posts' },
                { value: 'relevance', label: 'Relevance' },
            ],
            default: 'recent',
        },
    },
    categories: ['social-media'],
    features: {
        requireConfig: [
            {
                name: 'FACEBOOK_COOKIE',
                optional: true,
                description: 'Facebook c_user and xs cookies. Set this if you see rate limits or restricted results.',
            },
        ],
        antiCrawler: true,
    },
    maintainers: ['blazezhenli-sys'],
    handler,
    url: 'www.facebook.com',
};

async function handler(ctx: Context) {
    const { query = '', sort = 'recent' } = ctx.req.param();

    if (!['recent', 'relevance'].includes(sort)) {
        throw new Error('sort must be recent or relevance');
    }

    const limit = getRouteLimit(ctx, 50);
    const searchUrl = new URL(`${baseUrl}/search/posts/`);
    searchUrl.searchParams.set('q', query);
    const filters = sort === 'recent' ? [JSON.stringify({ name: 'recent_posts', args: '' })] : [];
    const variables = {
        ...graphqlTemplate.variables,
        args: {
            ...graphqlTemplate.variables.args,
            text: query,
            filters,
            context: {
                ...graphqlTemplate.variables.args.context,
                bsid: crypto.randomUUID(),
            },
        },
    };

    const edges = await fetchGraphql(graphqlTemplate.friendlyName, graphqlTemplate.docId, variables, limit, (lines) => lines.flatMap((line) => findSearchResults(line)?.edges ?? []), {
        firstPageOnly: true,
        cacheKey: `${query}:${sort}`,
    });
    const items = new Map<string, NonNullable<ReturnType<typeof toItem>>>();

    for (const edge of edges) {
        const item = toItem(edge);
        if (item) {
            items.set(item.guid, item);
        }
    }

    return {
        title: `Facebook Search: ${query}`,
        link: searchUrl.href,
        description: `Facebook posts matching "${query}"`,
        item: items
            .values()
            .toArray()
            .toSorted((a, b) => (b.pubDate?.epochMilliseconds ?? 0) - (a.pubDate?.epochMilliseconds ?? 0))
            .slice(0, limit),
    };
}
