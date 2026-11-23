import type { Context } from 'hono';

import { config } from '@/config';
import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import graphqlTemplate from './search-graphql-template.json';
import { baseUrl } from './utils';

const browserHeaders = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/159.0.0.0 Safari/537.36',
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

type SearchResults = {
    edges?: any[];
    page_info?: {
        has_next_page?: boolean;
        end_cursor?: string;
    };
};

function findSearchResults(value: unknown, depth = 0): SearchResults | undefined {
    if (depth > 35 || value === null || typeof value !== 'object') {
        return;
    }

    const obj = value as Record<string, any>;

    if (obj.serpResponse?.results?.edges) {
        return obj.serpResponse.results;
    }

    if (Array.isArray(value)) {
        for (const child of value) {
            const result = findSearchResults(child, depth + 1);
            if (result) {
                return result;
            }
        }
    } else {
        for (const child of Object.values(obj)) {
            const result = findSearchResults(child, depth + 1);
            if (result) {
                return result;
            }
        }
    }
}

function extractInitialResults(html: string): SearchResults {
    const scripts = html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);

    for (const match of scripts) {
        try {
            const data = JSON.parse(match[1]);
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

function getStory(edge: any) {
    return edge?.rendering_strategy?.view_model?.click_model?.story;
}

function toItem(edge: any) {
    const story = getStory(edge);
    if (!story?.post_id) {
        return;
    }

    const message = story.comet_sections?.content?.story?.message?.text ?? '';
    const author = story.feedback?.owning_profile?.name ?? story.actors?.[0]?.name ?? 'Facebook user';

    const title = message.trim().split('\n', 1)[0]?.slice(0, 180) || `${author} on Facebook`;

    return {
        title,
        description: message,
        link: story.permalink_url ?? `${baseUrl}/${story.post_id}`,
        guid: `facebook:${story.post_id}`,
        pubDate: story.creation_time ? Temporal.Instant.fromEpochMilliseconds(story.creation_time * 1000).toString() : undefined,
        author,
    };
}

function getToday() {
    return Temporal.Now.zonedDateTimeISO('UTC').toPlainDate().toString();
}

export const route: Route = {
    path: '/search/:query',
    name: 'Search Posts',
    example: '/facebook/search/we%20are%20hiring',
    parameters: {
        query: 'Search phrase',
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

function dateParts(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error(`Invalid date: ${date}. Expected YYYY-MM-DD`);
    }

    try {
        Temporal.PlainDate.from(date, { overflow: 'reject' });
    } catch {
        throw new Error(`Invalid date: ${date}. Expected YYYY-MM-DD`);
    }

    return {
        year: date.slice(0, 4),
        month: date.slice(0, 7),
        day: date,
    };
}

function buildFilters(start: string, end: string, sort: string) {
    const filters: string[] = [];

    if (sort === 'recent') {
        filters.push(JSON.stringify({ name: 'recent_posts', args: '' }));
    }

    const startParts = dateParts(start);
    const endParts = dateParts(end);

    filters.push(
        JSON.stringify({
            name: 'creation_time',
            args: JSON.stringify({
                start_year: startParts.year,
                start_month: startParts.month,
                start_day: startParts.day,
                end_year: endParts.year,
                end_month: endParts.month,
                end_day: endParts.day,
            }),
        })
    );

    return filters;
}

function extractGraphqlResults(text: string): SearchResults {
    // Facebook may return newline-delimited GraphQL JSON.
    for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('for (;;);')) {
            continue;
        }

        let data: any;
        try {
            data = JSON.parse(trimmed);
        } catch {
            continue;
        }

        if (data.errors?.length || data.error) {
            throw new Error(`Facebook GraphQL error: ${JSON.stringify(data.errors ?? data.error).slice(0, 500)}`);
        }

        const results = data.data?.serpResponse?.results ?? findSearchResults(data);

        if (results?.edges) {
            return results;
        }
    }

    throw new Error(`Facebook GraphQL response contained no search results: ${text.slice(0, 300)}`);
}

async function fetchNextPage(query: string, filters: string[], cursor: string, cookie: string): Promise<SearchResults> {
    const variables: any = structuredClone(graphqlTemplate.variables);

    variables.args ??= {};
    variables.args.text = query;
    variables.args.filters = filters;
    variables.cursor = cursor;

    // A fresh search session identifier.
    variables.args.context ??= {};
    variables.args.context.bsid = crypto.randomUUID();

    const lsd = crypto.randomUUID().replaceAll('-', '');
    const jazoest = `2${Array.from(lsd, (char) => char.codePointAt(0)!).reduce((a, b) => a + b, 0)}`;

    const tokenResponse = await fetch(`${baseUrl}/ajax/dtsg/?__a=1`, {
        headers: { ...browserHeaders, cookie },
    });

    if (!tokenResponse.ok) {
        throw new Error(`Facebook token request failed: HTTP ${tokenResponse.status}`);
    }

    const tokenText = await tokenResponse.text();
    const token = JSON.parse(tokenText.replace(/^for \(;;\);/, '')).payload?.token;

    const body = new URLSearchParams({
        av: /(?:^|;\s*)c_user=(\d+)/.exec(cookie)?.[1] ?? '0',
        __user: /(?:^|;\s*)c_user=(\d+)/.exec(cookie)?.[1] ?? '0',
        __a: '1',
        lsd,
        jazoest,
        fb_dtsg: token,
        fb_api_caller_class: 'RelayModern',
        fb_api_req_friendly_name: graphqlTemplate.friendlyName,
        doc_id: graphqlTemplate.docId,
        variables: JSON.stringify(variables),
    });

    const response = await fetch(`${baseUrl}/api/graphql/`, {
        method: 'POST',
        headers: {
            cookie,
            'user-agent': browserHeaders['user-agent'],
            'content-type': 'application/x-www-form-urlencoded',
            'x-fb-friendly-name': graphqlTemplate.friendlyName,
            'x-fb-lsd': lsd,
            origin: baseUrl,
            referer: `${baseUrl}/search/posts/`,
        },
        body,
    });

    if (response.status === 429) {
        throw new Error('Facebook rate limited pagination (HTTP 429)');
    }

    if (!response.ok) {
        throw new Error(`Facebook GraphQL returned HTTP ${response.status}`);
    }

    return extractGraphqlResults(await response.text());
}

async function handler(ctx: Context) {
    const query = ctx.req.param('query') ?? '';
    const cookie = config.facebook.cookie;

    if (!cookie) {
        throw new Error('FACEBOOK_COOKIE is required for Facebook search');
    }

    const params = new URL(ctx.req.url).searchParams;
    const today = getToday();
    const start = params.get('start') ?? today;
    const end = params.get('end') ?? today;
    const sort = params.get('sort') ?? 'recent';
    const requestedPages = Number(params.get('pages') ?? '5');

    if (!['recent', 'relevance'].includes(sort)) {
        throw new Error('sort must be recent or relevance');
    }

    dateParts(start);
    dateParts(end);

    if (start > end) {
        throw new Error('start must not be after end');
    }

    if (!Number.isSafeInteger(requestedPages) || requestedPages < 0) {
        throw new Error('pages must be a nonnegative integer');
    }

    const maxPages = Math.min(requestedPages, 5);
    const limit = getRouteLimit(ctx, 50);
    const filters = buildFilters(start, end, sort);

    const filterEntries = filters.map((filter) => {
        const name = JSON.parse(filter).name;
        return [name === 'recent_posts' ? 'recent_posts:0' : 'rp_creation_time:0', filter];
    });

    const filterObject = Object.fromEntries(filterEntries);
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

    let results = extractInitialResults(await response.text());
    const items = new Map<string, NonNullable<ReturnType<typeof toItem>>>();
    const seenCursors = new Set<string>();

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

    for (let page = 0; page < maxPages && items.size < limit; page++) {
        const cursor = results.page_info?.end_cursor;

        if (!results.page_info?.has_next_page || !cursor || seenCursors.has(cursor)) {
            break;
        }

        seenCursors.add(cursor);

        try {
            // eslint-disable-next-line no-await-in-loop -- Facebook pagination requires the previous page cursor.
            results = await fetchNextPage(query, filters, cursor, cookie);
        } catch (error) {
            if (items.size === 0) {
                throw error;
            }

            break;
        }

        addResults(results);
    }

    return {
        title: `Facebook Search: ${query}`,
        link: searchUrl.href,
        description: `Facebook posts matching "${query}" from ${start} to ${end}`,
        item: items
            .values()
            .toArray()
            .toSorted((a, b) => (b.pubDate ?? '').localeCompare(a.pubDate ?? ''))
            .slice(0, limit),
    };
}
