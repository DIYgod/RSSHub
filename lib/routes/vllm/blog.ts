import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';
import type { Item as RssItem } from 'rss-parser';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

import { renderFallbackDescription } from './templates/description';

const SITE_URL = 'https://vllm.ai';
const BLOG_URL = `${SITE_URL}/blog`;
const RSS_URL = `${BLOG_URL}/rss.xml`;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DETAIL_CONCURRENCY = 5;

const SAFE_HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const RASTER_IMAGE_EXTENSIONS = ['.png', '.webp', '.jpg', '.jpeg', '.gif'];
const MEDIA_KEEP_SELECTOR = 'img, video, audio, table, iframe, svg, math, mjx-container, pre, code, hr';

interface FeedEntry {
    title: string;
    link: string;
    summary: string;
    pubDate?: Temporal.Instant;
    author?: string;
    category?: string[];
}

const resolveHttpUrl = (rawUrl: string | undefined, baseUrl: string): string | undefined => {
    if (!rawUrl) {
        return undefined;
    }
    try {
        const parsed = new URL(rawUrl, baseUrl);
        return SAFE_HTTP_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
    } catch {
        return undefined;
    }
};

const isDynamicOgCard = (imageUrl: string): boolean => {
    try {
        return new URL(imageUrl).pathname === '/og';
    } catch {
        return false;
    }
};

const isRasterImageUrl = (imageUrl: string): boolean => {
    try {
        const pathname = new URL(imageUrl).pathname.toLowerCase();
        return RASTER_IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
    } catch {
        return false;
    }
};

const pickCoverImage = ($: CheerioAPI, $body: Cheerio<Element>, articleUrl: string): string | undefined => {
    const ogImage = resolveHttpUrl($('meta[property="og:image"]').attr('content'), articleUrl);
    if (ogImage && !isDynamicOgCard(ogImage)) {
        return ogImage;
    }

    let firstFallback: string | undefined;
    for (const el of $body.find('img').toArray()) {
        const resolved = resolveHttpUrl($(el).attr('src'), articleUrl);
        if (!resolved) {
            continue;
        }
        if (isRasterImageUrl(resolved)) {
            return resolved;
        }
        firstFallback ??= resolved;
    }

    return firstFallback ?? ogImage;
};

const pruneNoiseAndStyles = ($body: Cheerio<Element>, $: CheerioAPI) => {
    $body.find('button, style, details.kimi-contents').remove();
    $body
        .find('[style]')
        .filter((_, el) => $(el).closest('svg').length === 0)
        .removeAttr('style');
};

const normalizeMediaElements = ($body: Cheerio<Element>, $: CheerioAPI) => {
    $body.find('video').each((_, el) => {
        const $video = $(el);
        if ($video.attr('controls') === undefined) {
            $video.attr('controls', '');
        }
    });
    $body.find('img').each((_, el) => {
        $(el).removeAttr('loading').removeAttr('decoding').removeAttr('fetchpriority');
    });
};

const pruneEmptyDivs = ($body: Cheerio<Element>, $: CheerioAPI) => {
    $body.find('div').each((_, el) => {
        const $el = $(el);
        const hasText = $el.text().replaceAll('\u{A0}', '').trim().length > 0;
        if (!hasText && $(MEDIA_KEEP_SELECTOR, el).length === 0) {
            $el.remove();
        }
    });
};

const extractArticleContent = ($: CheerioAPI, articleUrl: string) => {
    const $article = $('article').first();
    const $candidate = $article.children('div').not(String.raw`.lg\:hidden`);
    const $body = $candidate.length > 0 ? $candidate : $article;
    if ($body.length === 0) {
        return { bodyHtml: '', image: resolveHttpUrl($('meta[property="og:image"]').attr('content'), articleUrl) };
    }

    pruneNoiseAndStyles($body, $);
    normalizeMediaElements($body, $);
    pruneEmptyDivs($body, $);

    const image = pickCoverImage($, $body, articleUrl);
    const hasContent = Boolean($body.text().trim()) || $(MEDIA_KEEP_SELECTOR, $body).length > 0;
    const bodyHtml = hasContent ? $body.html()?.trim() : '';

    return { bodyHtml, image };
};

const extractCategories = (rawCategories: string[] | undefined): string[] | undefined => {
    const categories = (rawCategories ?? []).filter(Boolean);
    return categories.length > 0 ? categories : undefined;
};

const toFeedEntry = (item: RssItem): FeedEntry | undefined => {
    const link = resolveHttpUrl(item.link, BLOG_URL);
    if (!link || !item.title) {
        return undefined;
    }
    const rawDate = item.isoDate ?? item.pubDate;
    return {
        title: item.title,
        link,
        summary: item.contentSnippet ?? item.content ?? '',
        pubDate: rawDate ? parseDate(rawDate) : undefined,
        author: item.creator,
        category: extractCategories(item.categories),
    };
};

const mapFeedEntries = (items: RssItem[], limit: number): FeedEntry[] => items.flatMap((item) => toFeedEntry(item) ?? []).slice(0, limit);

const fetchArticleDetail = (entry: FeedEntry) =>
    cache.tryGet(`vllm:blog:${entry.link}`, async () => {
        const html = await ofetch<string>(entry.link);
        const $ = load(html);
        const { bodyHtml, image } = extractArticleContent($, entry.link);
        const description = bodyHtml || renderFallbackDescription(entry.summary, entry.link, entry.title);

        const dataItem: DataItem = {
            title: entry.title,
            link: entry.link,
            description,
            pubDate: entry.pubDate,
            author: entry.author,
            category: entry.category,
            image,
        };

        return dataItem;
    });

async function handler(ctx: Context): Promise<Data> {
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const rssXml = await ofetch<string>(RSS_URL);
    const feed = await parser.parseString(rssXml);
    const entries = mapFeedEntries(feed.items, limit);

    const items = await pMap(entries, (entry) => fetchArticleDetail(entry), {
        concurrency: DETAIL_CONCURRENCY,
    });

    return {
        title: feed.title || 'vLLM Blog',
        description: feed.description || 'Technical articles, release announcements, model guides, and community updates from the vLLM project.',
        link: BLOG_URL,
        language: 'en-us',
        item: items,
    };
}

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'vllm.ai/blog',
    example: '/vllm/blog',
    categories: ['programming'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    description: 'Full-text articles, release announcements, and model guides from the official vLLM blog. Fetches up to 20 entries by default via the official RSS feed; supports the common `limit` query parameter.',
    zh: {
        name: '博客',
        description: '通过官方 RSS 发现并抓取 vLLM 官方博客全文（涵盖技术文章、版本发布与模型指南），默认获取最多 20 篇，支持通用 `limit` 参数。',
    },
    radar: [
        {
            source: ['vllm.ai/blog', 'vllm.ai/blog/:slug', 'vllm.ai/blog/rss.xml', 'vllm.ai/blog/atom.xml'],
            target: '/blog',
        },
        {
            source: ['blog.vllm.ai/', 'blog.vllm.ai/:slug'],
            target: '/blog',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    handler,
};
