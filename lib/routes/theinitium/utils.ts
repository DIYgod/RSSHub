import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const GHOST_API_BASE = 'https://theinitium.com/ghost/api/content';
const GHOST_CONTENT_KEY = 'a44a0409c222328d39e2c75293';

// Old channel slugs → Ghost tag slugs mapping
const CHANNEL_TAG_MAP: Record<string, string> = {
    latest: '', // no filter = latest
    whatsnew: 'whatsnew',
    'news-brief': 'whatsnew',
    opinion: 'opinion',
    international: 'international',
    mainland: 'mainland',
    hongkong: 'hong-kong',
    taiwan: 'taiwan',
    technology: 'technology',
    feature: 'report',
    report: 'report',
    'daily-brief': 'daily-brief',
    weekly: 'weekly',
};

// Ghost uses a language-based tagging system:
//   - zh-hant (Traditional Chinese): uses base tag slug, e.g. "whatsnew", with internal tag #zh-hant
//   - zh-hans (Simplified Chinese): uses suffixed tag slug, e.g. "whatsnew-zh-hans", with internal tag #zh-hans
// When no language is specified, we return all posts (both zh-hans and zh-hant mixed).
function applyLanguageToTagSlug(tagSlug: string, language: string): string {
    if (language === 'zh-hans') {
        return `${tagSlug}-zh-hans`;
    }
    // zh-hant uses the base slug
    return tagSlug;
}

interface GhostPost {
    id: string;
    uuid: string;
    slug: string;
    title: string;
    html: string;
    feature_image?: string;
    feature_image_caption?: string;
    custom_excerpt?: string;
    published_at: string;
    updated_at: string;
    url: string;
    excerpt?: string;
    access: boolean;
    visibility?: string;
    authors?: Array<{ name: string; slug: string }>;
    tags?: Array<{ name: string; slug: string; visibility: string }>;
    primary_author?: { name: string; slug: string };
    primary_tag?: { name: string; slug: string };
}

interface GhostResponse {
    posts: GhostPost[];
    meta: {
        pagination: {
            page: number;
            limit: number;
            pages: number;
            total: number;
        };
    };
}

async function ghostFetch(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${GHOST_API_BASE}/${endpoint}/`);
    url.searchParams.set('key', GHOST_CONTENT_KEY);
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
    }
    return await ofetch(url.href);
}

async function scrapeFullArticle(url: string, cookie: string): Promise<string | null> {
    try {
        const response = await ofetch(url, {
            headers: {
                Cookie: cookie,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            },
            parseResponse: (txt) => txt,
        });
        const $ = load(response);
        const article = $('article');
        if (article.length === 0) {
            return null;
        }
        const html = article.html();
        if (html && html.length > 500) {
            return html;
        }
        return null;
    } catch (error) {
        logger.warn(`Failed to scrape Initium article: ${url}`, error);
        return null;
    }
}

async function postsToItems(posts: GhostPost[]) {
    const memberCookie = config.initium?.memberCookie;

    const items = await Promise.all(
        posts.map(async (post) => {
            // Ghost uses '-zh-hans' suffixed names for simplified Chinese variants
            // e.g. author "端传媒编辑部-zh-hans", tag "國際-zh-hans" — strip for clean display
            const stripLangSuffix = (name: string) => name.replace(/-zh-hans$/i, '');
            const authors = post.authors?.map((a) => stripLangSuffix(a.name)) ?? [];
            const categories = post.tags?.filter((t) => t.visibility === 'public').map((t) => stripLangSuffix(t.name)) ?? [];

            let description = post.html;

            // For paid articles with truncated content, scrape full text if cookie available
            if (!post.access && memberCookie) {
                const fullHtml = (await cache.tryGet(`theinitium:full:${post.slug}`, () => scrapeFullArticle(post.url, memberCookie), config.cache.contentExpire, false)) as string | null;
                if (fullHtml) {
                    description = fullHtml;
                }
            }

            return {
                title: post.title,
                author: authors.join(', ') || post.primary_author?.name || '',
                category: categories,
                description,
                link: post.url,
                pubDate: parseDate(post.published_at),
                updated: parseDate(post.updated_at),
                guid: post.uuid,
                banner: post.feature_image ?? undefined,
            };
        })
    );

    return items;
}

export const processFeed = async (model: string, ctx: Context) => {
    const type = ctx.req.param('type') ?? 'latest';
    const language = ctx.req.param('language') ?? '';

    let filter = '';
    let listLink = '';
    let feedName = '';

    switch (model) {
        case 'channel': {
            const baseTag = CHANNEL_TAG_MAP[type] ?? type;
            if (baseTag === '') {
                // "latest" = no tag filter, but we can still filter by language via internal tag
                if (language === 'zh-hans' || language === 'zh-hant') {
                    filter = `tag:hash-${language}`;
                }
            } else {
                const tagSlug = language ? applyLanguageToTagSlug(baseTag, language) : baseTag;
                filter = `tag:${tagSlug}`;
            }
            listLink = type === 'latest' ? 'https://theinitium.com/latest/' : `https://theinitium.com/tag/${baseTag}/`;
            feedName = type;
            break;
        }
        case 'tags': {
            const tagSlug = language ? applyLanguageToTagSlug(type, language) : type;
            filter = `tag:${tagSlug}`;
            listLink = `https://theinitium.com/tag/${type}/`;
            feedName = type;
            break;
        }
        case 'author': {
            // Author slugs also have -zh-hans suffixed versions for simplified Chinese
            const authorSlug = language === 'zh-hans' ? `${type}-zh-hans` : type;
            filter = `author:${authorSlug}`;
            listLink = `https://theinitium.com/author/${type}/`;
            feedName = type;
            break;
        }
        default:
            throw new InvalidParameterError(`Unsupported model: ${model}`);
    }

    const cacheKey = `theinitium:ghost:${model}:${type}:${language}`;
    // Use routeExpire (5 min default) and refresh=false so cache actually expires
    const data = (await cache.tryGet(
        cacheKey,
        async () => {
            const params: Record<string, string> = {
                include: 'tags,authors',
                limit: '20',
            };
            if (filter) {
                params.filter = filter;
            }
            return await ghostFetch('posts', params);
        },
        config.cache.routeExpire,
        false
    )) as GhostResponse;

    const items = await postsToItems(data.posts);

    // Try to get a nice display name from the first post's relevant tag/author
    // Strip '-zh-hans' suffix from display names for cleanliness
    const cleanName = (name: string) => name.replace(/-zh-hans$/i, '');
    let displayName = feedName;
    if (data.posts.length > 0) {
        switch (model) {
            case 'channel': {
                const baseTag = CHANNEL_TAG_MAP[type] ?? type;
                if (baseTag) {
                    const langTag = language === 'zh-hans' ? `${baseTag}-zh-hans` : baseTag;
                    const matchedTag = data.posts[0].tags?.find((t) => t.slug === langTag || t.slug === baseTag);
                    if (matchedTag) {
                        displayName = cleanName(matchedTag.name);
                    }
                } else {
                    displayName = '最新';
                }

                break;
            }
            case 'tags': {
                const langTag = language === 'zh-hans' ? `${type}-zh-hans` : type;
                const matchedTag = data.posts[0].tags?.find((t) => t.slug === langTag || t.slug === type);
                if (matchedTag) {
                    displayName = cleanName(matchedTag.name);
                }

                break;
            }
            case 'author': {
                const authorSlug = language === 'zh-hans' ? `${type}-zh-hans` : type;
                const matchedAuthor = data.posts[0].authors?.find((a) => a.slug === authorSlug || a.slug === type);
                if (matchedAuthor) {
                    displayName = cleanName(matchedAuthor.name);
                }

                break;
            }
            default:
            // Do nothing
        }
    }

    return {
        title: `端傳媒 - ${displayName}`,
        link: listLink,
        icon: 'https://theinitium.com/favicon.ico',
        language: language === 'zh-hans' ? 'zh-CN' : 'zh-TW',
        item: items,
    };
};
