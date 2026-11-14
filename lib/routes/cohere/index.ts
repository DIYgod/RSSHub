import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import type { SanityBlock } from './templates/description';
import { renderGhostDescription as renderGhostDescriptionTemplate, renderSanityDescription } from './templates/description';
import { assetFilename, resolveSafeUrl, SITE_URL } from './utils';

const BLOG_URL = `${SITE_URL}/blog`;
const SANITY_QUERY_URL = 'https://rjtqmwfu.apicdn.sanity.io/v2023-05-03/data/query/web3-prod';
const GHOST_POSTS_URL = 'https://cohere-ai.ghost.io/ghost/api/content/posts';
const GHOST_CONTENT_KEY = '572d288a9364f8e4186af1d60a';

interface CohereBlogPost {
    title: string;
    subtitle?: string | null;
    slug: string;
    date?: string | null;
    authors?: Array<string | null> | null;
    tags?: Array<string | string[] | null> | null;
    heroUrl?: string | null;
    heroAlt?: string | null;
    ogUrl?: string | null;
    keyTakeaways?: SanityBlock[] | null;
    body?: SanityBlock[] | null;
}

interface SanityQueryResponse {
    result: CohereBlogPost[];
}

interface GhostPost {
    title: string;
    slug: string;
    html?: string | null;
    excerpt?: string | null;
    published_at?: string | null;
    feature_image?: string | null;
    feature_image_alt?: string | null;
    feature_image_caption?: string | null;
    og_image?: string | null;
    authors?: Array<{ name?: string | null }> | null;
    tags?: Array<{ name?: string | null; visibility?: string | null }> | null;
}

interface GhostPostsResponse {
    posts: GhostPost[];
}

const renderDescription = (post: CohereBlogPost) => {
    const body = post.body ?? [];

    const heroUrl = resolveSafeUrl(post.heroUrl ?? undefined);
    let hero: { url: string; alt?: string | null } | undefined;
    if (heroUrl) {
        const heroFile = assetFilename(heroUrl);
        const alreadyInBody = body.some((block) => {
            const url = block._type === 'image' ? block.url : block._type === 'embeddedVideo' ? block.posterUrl : undefined;
            return Boolean(url && assetFilename(url) === heroFile);
        });
        if (!alreadyInBody) {
            hero = { url: heroUrl, alt: post.heroAlt };
        }
    }

    return renderSanityDescription({
        hero,
        subtitle: post.subtitle?.trim(),
        keyTakeaways: post.keyTakeaways,
        body,
    });
};

const renderGhostDescription = (post: GhostPost) => {
    const $ = load(post.html ?? '', null, false);
    $('script, style').remove();
    $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src?.startsWith('http://')) {
            $(el).attr('src', src.replace(/^http:\/\//, 'https://'));
        } else if (src?.startsWith('/')) {
            const resolved = resolveSafeUrl(src);
            if (resolved) {
                $(el).attr('src', resolved);
            }
        }
    });
    $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (!href?.startsWith('/')) {
            return;
        }
        const resolved = resolveSafeUrl(href);
        if (resolved) {
            $(el).attr('href', resolved);
        }
    });

    let feature: { url: string; alt?: string | null; caption?: string } | undefined;
    const featureUrl = resolveSafeUrl(post.feature_image ?? undefined)?.replace(/^http:\/\//, 'https://');
    if (featureUrl) {
        const featureFile = assetFilename(featureUrl);
        const alreadyInBody = $('img')
            .toArray()
            .some((el) => {
                const src = $(el).attr('src');
                return Boolean(src && assetFilename(src) === featureFile);
            });
        if (!alreadyInBody) {
            const caption = post.feature_image_caption ? load(post.feature_image_caption, null, false).text().trim() : '';
            feature = { url: featureUrl, alt: post.feature_image_alt, caption };
        }
    }

    const bodyHtml = $.html().trim();

    return {
        html: renderGhostDescriptionTemplate({ feature, bodyHtml, excerpt: post.excerpt?.trim() }),
        hasMainBody: Boolean(bodyHtml),
    };
};

const normalizeBlogLink = (slug: string) =>
    `${BLOG_URL}/${slug
        .replace(/^\/+/, '')
        .replace(/^blog\//, '')
        .replace(/\/+$/, '')}`;

const parseBlogDate = (value?: string | null) => (value ? parseDate(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value) : undefined);

const toValidTimestamp = (pubDate?: DataItem['pubDate']) => {
    if (!(pubDate instanceof Date)) {
        return 0;
    }
    const time = pubDate.getTime();
    return Number.isFinite(time) ? time : 0;
};

interface BlogEntry {
    item: DataItem;
    timestamp: number;
    hasMainBody: boolean;
}

const toSanityEntry = (post: CohereBlogPost, link: string): BlogEntry => {
    const categories = [...new Set((post.tags ?? []).flat().filter((tag): tag is string => Boolean(tag?.trim())))];
    const authors = (post.authors ?? []).filter((author): author is string => Boolean(author?.trim()));
    const image = resolveSafeUrl(post.ogUrl ?? undefined) ?? resolveSafeUrl(post.heroUrl ?? undefined);
    const rawPubDate = parseBlogDate(post.date);
    const timestamp = toValidTimestamp(rawPubDate);
    const { html: description, hasMainBody } = renderDescription(post);

    return {
        timestamp,
        hasMainBody,
        item: {
            title: post.title,
            link,
            description,
            pubDate: timestamp ? rawPubDate : undefined,
            author: authors.length ? authors.join(', ') : undefined,
            category: categories.length ? categories : undefined,
            image,
        },
    };
};

const toGhostEntry = (post: GhostPost, link: string, includeBody: boolean): BlogEntry => {
    const categories = [...new Set((post.tags ?? []).filter((tag) => tag.visibility !== 'internal' && tag.name && !tag.name.startsWith('#')).map((tag) => tag.name!.trim()))];
    const authors = (post.authors ?? []).map((author) => author.name?.trim()).filter((name): name is string => Boolean(name));
    const image = resolveSafeUrl(post.og_image ?? undefined) ?? resolveSafeUrl(post.feature_image ?? undefined);
    const rawPubDate = parseBlogDate(post.published_at);
    const timestamp = toValidTimestamp(rawPubDate);
    const pubDate = timestamp ? rawPubDate : undefined;
    const author = authors.length ? authors.join(', ') : undefined;
    const category = categories.length ? categories : undefined;

    const description = includeBody ? renderGhostDescription(post) : undefined;
    return {
        timestamp,
        hasMainBody: description?.hasMainBody ?? false,
        item: {
            title: post.title,
            link,
            description: description?.html,
            pubDate,
            author,
            category,
            image,
        },
    };
};

const mergeGhostEntry = (existing: BlogEntry, incoming: BlogEntry) => {
    existing.item.title ||= incoming.item.title;
    if (!existing.hasMainBody && (incoming.hasMainBody || (!existing.item.description && incoming.item.description))) {
        existing.item.description = incoming.item.description;
        existing.hasMainBody = incoming.hasMainBody;
    }
    if (!existing.item.pubDate && incoming.item.pubDate) {
        existing.item.pubDate = incoming.item.pubDate;
        existing.timestamp = incoming.timestamp;
    }
    existing.item.author ||= incoming.item.author;
    existing.item.category ||= incoming.item.category;
    existing.item.image ||= incoming.item.image;
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'cohere.com/blog',
    maintainers: ['Loongphy', 'ljh12138164'],
    handler,
    example: '/cohere/blog',
    parameters: {},
    description:
        'Full-text articles from the Cohere Blog (merging both official CMS sources), including key takeaways, formulas, FAQs, code blocks, tables, and embedded media. Fetches 20 entries by default; use the common `limit` query parameter (1-100) to adjust.',
    zh: {
        name: '博客',
        parameters: {},
        description: '合并读取 Cohere 官方博客双 CMS 接口获取英文全文，包含要点总结、公式、FAQ 问答、代码块、表格与内嵌媒体。默认获取 20 篇，可通过通用 `limit` 参数（1-100）调整条数。',
    },
    categories: ['blog'],
    view: ViewType.Articles,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cohere.com/blog', 'cohere.com/blog/:slug'],
            target: '/blog',
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const limit = Math.min(getRouteLimit(ctx, 20), 100);
    const groqQuery = `*[_type == "blogPost" && defined(slug.current) && string::startsWith(slug.current, "blog/") && (!defined(language) || language == "en-US")] | order(coalesce(date, _createdAt) desc) [0...${limit}] {
        title,
        subtitle,
        "slug": slug.current,
        date,
        "authors": authorReferences[]->fullName,
        "tags": tagReferences[]->tag,
        "heroUrl": heroImage.file.asset->url,
        "heroAlt": coalesce(heroImage.file.altText, heroImage.alt, seoTitle),
        "ogUrl": openGraphImage.asset->url,
        keyTakeaways,
        body[]{
            ...,
            _type == "image" => { ..., "url": coalesce(url, asset->url, file.asset->url) },
            _type == "embeddedVideo" => { ..., "posterUrl": fallbackImage.file.asset->url, "playbackId": video.asset->playbackId },
            _type == "audioEmbed" => { ..., "audioUrl": file.asset->url }
        }
    }`;

    const [sanityRes, ghostRes] = await Promise.all([
        ofetch<SanityQueryResponse>(SANITY_QUERY_URL, {
            query: { query: groqQuery },
        }),
        ofetch<GhostPostsResponse>(GHOST_POSTS_URL, {
            query: {
                key: GHOST_CONTENT_KEY,
                limit,
                include: ['authors', 'tags'],
                filter: 'tag:-hash-hidden+tag:-llmu',
            },
        }),
    ]);

    const byLink = new Map<string, BlogEntry>();

    const sanityPosts = sanityRes.result ?? [];
    for (const post of sanityPosts) {
        const link = normalizeBlogLink(post.slug);
        if (!byLink.has(link)) {
            byLink.set(link, toSanityEntry(post, link));
        }
    }

    const ghostPosts = ghostRes.posts ?? [];
    for (const post of ghostPosts) {
        const link = normalizeBlogLink(post.slug);
        const existing = byLink.get(link);
        const entry = toGhostEntry(post, link, !existing?.hasMainBody);
        if (existing) {
            mergeGhostEntry(existing, entry);
        } else {
            byLink.set(link, entry);
        }
    }

    const items = byLink
        .values()
        .toArray()
        .toSorted((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .map((entry) => entry.item);

    return {
        title: 'The Cohere Blog',
        link: BLOG_URL,
        language: 'en',
        item: items,
    };
}
