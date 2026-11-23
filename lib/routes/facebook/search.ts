import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { baseUrl } from './utils';

const browserHeaders = {
    'user-agent': config.trueUA,
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'upgrade-insecure-requests': '1',
    'sec-ch-ua-platform': '"macOS"',
    'sec-ch-ua': '"Chromium";v="159", "Not/A)Brand";v="8"',
    'sec-ch-ua-mobile': '?0',
    'viewport-width': '1280',
    dpr: '2',
};

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

function parseJson(text: string): JsonValue {
    return JSON.parse(text) as JsonValue;
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

function extractInitialResults(html: string): SearchResults {
    const $ = load(html);

    for (const script of $('script').toArray()) {
        try {
            const data = parseJson($(script).html() ?? '');
            const results = findSearchResults(data);

            if (results) {
                return results;
            }
        } catch {
            // Not every script contains JSON.
        }
    }

    throw new Error('Facebook search results not found in initial HTML');
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
                description: 'Facebook c_user and xs cookies',
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
    const cookie = config.facebook.cookie;

    if (!cookie) {
        throw new ConfigNotFoundError('FACEBOOK_COOKIE is required for Facebook search');
    }

    if (!['recent', 'relevance'].includes(sort)) {
        throw new Error('sort must be recent or relevance');
    }

    const limit = getRouteLimit(ctx, 50);
    const filterObject = sort === 'recent' ? { 'recent_posts:0': JSON.stringify({ name: 'recent_posts', args: '' }) } : {};
    const encodedFilters = new TextEncoder().encode(JSON.stringify(filterObject)).toBase64();

    const searchUrl = new URL(`${baseUrl}/search/posts/`);
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('filters', encodedFilters);

    const response = await fetch(searchUrl, {
        headers: { ...browserHeaders, cookie },
    });

    if (!response.ok) {
        throw new Error(`Facebook search returned HTTP ${response.status}`);
    }

    const results = extractInitialResults(await response.text());
    const items = new Map<string, NonNullable<ReturnType<typeof toItem>>>();

    const addResults = (page: SearchResults) => {
        const edges = page.edges ?? [];
        for (const edge of edges) {
            const item = toItem(edge);
            if (item) {
                items.set(item.guid, item);
            }
        }
    };

    addResults(results);

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
