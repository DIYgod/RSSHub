import vm from 'node:vm';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

const contentFilterMap = {
    nonplus: 'regular_content',
    plus: 'content_plus',
} as const;

const contentTypeMap = {
    article: 'article',
    audio: 'audio',
    document: 'document',
    live: 'live_stream',
    live_stream: 'live_stream',
    pdf: 'document',
    podcast: 'audio',
    podcasts: 'audio',
    video: 'video',
} as const;

const serverId = 'src_lib_localsApi_index_ts--serverApi_4#/app/packages/locals/src/lib/localsApi/index.ts?tsr-directive-use-server=';
const tenantInfoId = 'src_lib_shared_cachedQueries_ts--_tenantInfo_query#/app/packages/locals/src/lib/shared/cachedQueries.ts?tsr-directive-use-server=';

type ContentFilter = keyof typeof contentFilterMap;
type ContentType = keyof typeof contentTypeMap;

type LocalsPost = {
    author_name?: string;
    author_username?: string;
    content_plus?: {
        enabled?: boolean;
    };
    content_type?: string;
    photos?: Array<{
        sizes?: {
            full?: {
                url?: string;
            };
            thumb?: {
                url?: string;
            };
        };
    }>;
    post_date?: string;
    published?: string;
    share_url?: string;
    subtitle?: string;
    text?: string;
    title?: string;
    is_content?: boolean;
    videos?: Array<{
        preview?: string;
        source?: string;
    }>;
};

type LocalsResponse = {
    code: string;
    data: LocalsPost[];
};

type LocalsCommunityInfo = {
    description?: string;
    design?: {
        image?: {
            big?: string;
            thumb?: string;
        };
    };
    hashtag: string;
    id: number;
    title: string;
};

export const route: Route = {
    path: ['/content/:community', '/content/:community/:option1', '/content/:community/:option1/:option2'],
    categories: ['social-media'],
    example: '/locals/content/mattfradd/video',
    parameters: {
        community: 'Community slug from `locals.com/:community/feed?mode=content`',
        option1: 'Optional filter or content type. Filters: `plus`, `nonplus`. Content types: `video`, `live`, `audio`, `podcast`, `article`, `document`, `pdf`',
        option2: 'Optional content type when `option1` is a filter',
    },
    description: 'Fetches the Locals content library with an authenticated session cookie. By default it merges regular content and content+ posts, and it can be filtered by access tier and media type.',
    features: {
        requireConfig: [
            {
                name: 'LOCALS_SESSION',
                description: 'The value of the `locals2.v3.session` cookie after logging in to Locals',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['locals.com/:community/feed?mode=content'],
            target: '/content/:community',
        },
    ],
    name: 'Content Feed',
    maintainers: ['luckycold'],
    handler,
};

function getCookieHeader(session: string) {
    return [`locals2.v3.session=${session}`, 'locals.preferLocals2=false', 'locals2.v3.locale.actual=en-us%2Cen', 'locals2.v3.locale.inferred=en'].join('; ');
}

function createRequestBody(value: unknown) {
    let nextIndex = 0;

    const encode = (input: unknown): object => {
        if (typeof input === 'number') {
            return { t: 0, s: input };
        }

        if (typeof input === 'string') {
            return { t: 1, s: input };
        }

        if (Array.isArray(input)) {
            const i = nextIndex++;
            return {
                a: input.map((item) => encode(item)),
                i,
                l: input.length,
                o: 0,
                t: 9,
            };
        }

        if (input && typeof input === 'object') {
            const i = nextIndex++;
            const entries = Object.entries(input).filter(([, item]) => item !== undefined);

            return {
                i,
                o: 0,
                p: {
                    k: entries.map(([key]) => key),
                    s: entries.length,
                    v: entries.map(([, item]) => encode(item)),
                },
                t: 10,
            };
        }

        throw new Error('Unsupported Locals request payload.');
    };

    return JSON.stringify({
        f: 31,
        m: [],
        t: encode(value),
    });
}

function parseUnknownResponse<T>(body: string, instanceId: string): T {
    const sandbox = {
        $R: {},
        self: {},
    } as {
        $R: Record<string, unknown[]>;
        self: {
            $R?: Record<string, unknown[]>;
        };
    };

    sandbox.self.$R = sandbox.$R;

    vm.createContext(sandbox);
    vm.runInContext(body, sandbox, { timeout: 5000 });

    const value = sandbox.self.$R?.[instanceId]?.[0] as T | undefined;
    if (!value) {
        throw new Error('Unable to decode the Locals server response.');
    }

    return value;
}

function getImage(post: LocalsPost) {
    return post.photos?.[0]?.sizes?.full?.url || post.photos?.[0]?.sizes?.thumb?.url || post.videos?.[0]?.preview;
}

function getTitle(post: LocalsPost) {
    const textFallback = post.text
        ?.replaceAll(/<[^>]+>/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .find(Boolean);
    return post.title || post.subtitle || textFallback || post.share_url || 'Locals post';
}

function mapPostToItem(post: LocalsPost): DataItem | null {
    if (!post.share_url || (!post.is_content && post.content_type === 'no_content')) {
        return null;
    }

    const contentType = post.content_type ? [post.content_type] : [];
    const accessType = post.content_plus?.enabled ? ['content_plus'] : ['content'];

    return {
        author: post.author_name || post.author_username,
        category: [...accessType, ...contentType],
        description: post.text,
        itunes_item_image: getImage(post),
        link: post.share_url,
        pubDate: post.published ? parseDate(post.published) : post.post_date ? parseDate(post.post_date) : undefined,
        title: getTitle(post),
    };
}

function parseOptions(option1: string | undefined, option2: string | undefined) {
    const values = [option1, option2].filter(Boolean) as string[];
    const filter = values.find((value): value is ContentFilter => value in contentFilterMap);
    const contentType = values.find((value): value is ContentType => value in contentTypeMap);
    const unknown = values.find((value) => !(value in contentFilterMap) && !(value in contentTypeMap));

    if (unknown) {
        throw new Error('Invalid Locals content route option. Supported filters are `plus` and `nonplus`, and supported content types are `video`, `live`, `audio`, `podcast`, `article`, `document`, and `pdf`.');
    }

    return {
        contentType: contentType ? contentTypeMap[contentType] : undefined,
        filter,
    };
}

async function requestServerFunction<T>(session: string, id: string, key: string, args: unknown[]) {
    const response = await fetch('https://locals.com/_server', {
        body: createRequestBody(args),
        headers: {
            'Content-Type': 'application/json',
            Cookie: getCookieHeader(session),
            'User-Agent': config.trueUA,
            'X-Server-Id': id,
            'X-Server-Instance': key,
        },
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Unable to access the Locals server function (${response.status}).`);
    }

    return parseUnknownResponse<T>(await response.text(), key);
}

function fetchCommunityInfo(community: string, session: string) {
    return cache.tryGet(`locals:community:${community}`, () => requestServerFunction<LocalsCommunityInfo>(session, tenantInfoId, `server-fn:rsshub-tenant-${community}`, [community]));
}

async function fetchFeedData(communityId: number, community: string, session: string, filter: ContentFilter | undefined, contentType: string | undefined) {
    const requestFilter = filter ? contentFilterMap[filter] : undefined;
    const filters = requestFilter ? [requestFilter] : Object.values(contentFilterMap);

    const responses = await Promise.all(
        filters.map((currentFilter) =>
            cache.tryGet(`locals:data:${communityId}:${community}:${currentFilter}:${contentType ?? 'all'}`, () =>
                requestServerFunction<LocalsResponse>(session, serverId, `server-fn:rsshub-${community}-${currentFilter}-${contentType ?? 'all'}`, [
                    {
                        communityId,
                        contentType,
                        filter: currentFilter,
                        order: 'recent',
                        page: 1,
                        pageSize: 20,
                    },
                ])
            )
        )
    );

    const items = new Map<string, DataItem>();

    for (const response of responses) {
        for (const post of response.data) {
            const item = mapPostToItem(post);
            if (!item?.link) {
                continue;
            }

            if (!items.has(item.link)) {
                items.set(item.link, item);
                continue;
            }

            const existing = items.get(item.link);
            if (existing) {
                existing.category = [...new Set([...(existing.category ?? []), ...(item.category ?? [])])];
                existing.description = existing.description || item.description;
                existing.itunes_item_image = existing.itunes_item_image || item.itunes_item_image;
            }
        }
    }

    return [...items.values()].toSorted((a, b) => {
        const aTime = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const bTime = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return bTime - aTime;
    });
}

async function handler(ctx) {
    const { community, option1, option2 } = ctx.req.param();

    if (!config.locals?.session) {
        throw new ConfigNotFoundError('Locals RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const { contentType, filter } = parseOptions(option1, option2);
    const communityInfo = await fetchCommunityInfo(community, config.locals.session);
    const items = await fetchFeedData(communityInfo.id, community, config.locals.session, filter, contentType);

    return {
        description: `Locals content feed for ${communityInfo.title}${filter ? ` (${filter})` : ''}${contentType ? ` (${contentType})` : ''}`,
        image: communityInfo.design?.image?.big || communityInfo.design?.image?.thumb,
        item: items,
        link: `https://locals.com/${community}/feed?mode=content${contentType ? `&content=${contentType}` : ''}`,
        title: `Locals - ${communityInfo.title}`,
    };
}
