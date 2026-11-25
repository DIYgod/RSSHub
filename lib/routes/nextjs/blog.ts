import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';
import type { Item as RssItem } from 'rss-parser';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

import type { BenchmarkMetricValue, BenchmarkRow, ChartLabel } from './templates/description';
import { renderBenchmarkFigure, renderChartLabels, renderFallbackDescription } from './templates/description';

const SITE_URL = 'https://nextjs.org';
const BLOG_URL = `${SITE_URL}/blog`;
const RSS_URL = `${SITE_URL}/feed.xml`;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DETAIL_CONCURRENCY = 5;
const VIDEO_RATIO_MAX = 32;
const VIDEO_TARGET_WIDTH = 800;

const ALLOWED_BLOG_HOSTS = new Set(['nextjs.org', 'www.nextjs.org']);
const SAFE_HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const RASTER_IMAGE_EXTENSIONS = ['.png', '.webp', '.jpg', '.jpeg', '.gif'];
const MEDIA_KEEP_SELECTOR = 'img, video, audio, table, iframe, svg, math, mjx-container, pre, code, hr';

const SVG_VAR_RE = /var\(--ds-[a-z0-9-]+\)/g;

const SVG_CSS_VAR_FALLBACKS = new Map<string, string>([
    ['var(--ds-blue-700)', '#0070f3'],
    ['var(--ds-blue-900)', '#0068d6'],
    ['var(--ds-blue-100)', '#ebf5ff'],
    ['var(--ds-pink-700)', '#e93d82'],
    ['var(--ds-pink-900)', '#cb1d63'],
    ['var(--ds-pink-100)', '#fcebf3'],
    ['var(--ds-gray-alpha-400)', '#d4d4d4'],
    ['var(--ds-gray-alpha-700)', '#737373'],
    ['var(--ds-gray-600)', '#737373'],
    ['var(--ds-gray-1000)', '#171717'],
    ['var(--ds-background-100)', '#ffffff'],
    ['var(--ds-background-200)', '#fafafa'],
]);

interface BenchmarkTableData {
    columns: string[];
    rows: BenchmarkRow[];
}

interface FeedEntry {
    title: string;
    link: string;
    summary: string;
    pubDate?: Temporal.Instant;
}

interface JsonLdAuthor {
    name?: string;
    url?: string;
}

interface JsonLdArticle {
    author?: JsonLdAuthor | JsonLdAuthor[];
}

interface AuthorItem {
    name: string;
    url?: string;
}

interface CachedDetail {
    bodyHtml: string;
    author?: AuthorItem[];
    pubDateRaw?: string;
    image?: string;
}

const resolveHttpUrl = (rawUrl: string | undefined, baseUrl: string): string | undefined => {
    const trimmed = rawUrl?.trim();
    if (!trimmed) {
        return undefined;
    }
    try {
        const parsed = new URL(trimmed, baseUrl);
        return SAFE_HTTP_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
    } catch {
        return undefined;
    }
};

const resolveBlogArticleUrl = (rawUrl: string | undefined): string | undefined => {
    const resolved = resolveHttpUrl(rawUrl, BLOG_URL);
    if (!resolved) {
        return undefined;
    }
    try {
        const parsed = new URL(resolved);
        const isAllowedHost = ALLOWED_BLOG_HOSTS.has(parsed.hostname.toLowerCase());
        return parsed.protocol === 'https:' && isAllowedHost && parsed.pathname.startsWith('/blog/') ? parsed.href : undefined;
    } catch {
        return undefined;
    }
};

const unwrapNextImageUrl = (rawUrl: string | undefined, articleUrl: string): string | undefined => {
    const resolved = resolveHttpUrl(rawUrl, articleUrl);
    if (!resolved) {
        return undefined;
    }
    try {
        const parsed = new URL(resolved);
        if (parsed.pathname !== '/_next/image') {
            return undefined;
        }
        const innerUrl = parsed.searchParams.get('url');
        return innerUrl ? resolveHttpUrl(innerUrl, SITE_URL) : undefined;
    } catch {
        return undefined;
    }
};

const isDarkOnlyElement = (classAttr: string | undefined): boolean => {
    if (!classAttr) {
        return false;
    }
    const tokens = classAttr.split(/\s+/);
    if (tokens.includes('geist-show-on-dark')) {
        return true;
    }
    return tokens.includes('hidden') && (tokens.includes('dark-theme:block') || tokens.includes('dark:block'));
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
    const rawOg = $('meta[property="og:image"]').attr('content');
    const ogImage = unwrapNextImageUrl(rawOg, articleUrl) ?? resolveHttpUrl(rawOg, articleUrl);
    if (ogImage) {
        return ogImage;
    }

    for (const el of $body.find('img').toArray()) {
        const rawSrc = $(el).attr('src');
        const resolved = unwrapNextImageUrl(rawSrc, articleUrl) ?? resolveHttpUrl(rawSrc, articleUrl);
        if (resolved && isRasterImageUrl(resolved)) {
            return resolved;
        }
    }

    return undefined;
};

const extractAuthors = ($: CheerioAPI, articleUrl: string): AuthorItem[] | undefined => {
    const ldRaw = $('script[type="application/ld+json"]').first().text();
    if (ldRaw) {
        try {
            const parsed = JSON.parse(ldRaw) as JsonLdArticle;
            const rawAuthors = Array.isArray(parsed.author) ? parsed.author : parsed.author ? [parsed.author] : [];
            const ldAuthors = rawAuthors
                .filter((item): item is JsonLdAuthor & { name: string } => typeof item.name === 'string' && item.name.trim().length > 0)
                .map((item) => {
                    const url = resolveHttpUrl(item.url, articleUrl);
                    return url ? { name: item.name.trim(), url } : { name: item.name.trim() };
                });
            if (ldAuthors.length > 0) {
                return ldAuthors;
            }
        } catch {
            // Fall through to header inspection when JSON-LD is malformed.
        }
    }

    const teamLabel = $('article header button[aria-label*="Team"], main header button[aria-label*="Team"]').first().attr('aria-label');
    const teamName = teamLabel?.split(':', 1)[0]?.trim();
    return teamName ? [{ name: teamName }] : undefined;
};

const parseCssPercent = (style: string, prop: 'left' | 'top'): number | undefined => {
    const match = new RegExp(String.raw`(?:^|;)\s*${prop}\s*:\s*([\d.]+)%`, 'i').exec(style);
    if (!match?.[1]) {
        return undefined;
    }
    const num = Number(match[1]);
    return Number.isNaN(num) ? undefined : num;
};

const resolveLabelAnchor = (style: string): 'start' | 'middle' | 'end' => {
    const transformMatch = /translate\(([^,)]+)/i.exec(style);
    const xShift = transformMatch?.[1]?.trim();
    if (xShift === '-100%') {
        return 'end';
    }
    return xShift === '-50%' ? 'middle' : 'start';
};

const extractSvgOverlayLabels = ($: CheerioAPI, $overlay: Cheerio<Element>, vbWidth: number, vbHeight: number): ChartLabel[] => {
    const labels: ChartLabel[] = [];
    $overlay.find('span').each((_, span) => {
        const style = $(span).attr('style') ?? '';
        const leftPct = parseCssPercent(style, 'left');
        const topPct = parseCssPercent(style, 'top');
        const text = $(span).text().trim();
        if (leftPct === undefined || topPct === undefined || !text) {
            return;
        }
        labels.push({
            x: Math.round((leftPct / 100) * vbWidth * 10) / 10,
            y: Math.round((topPct / 100) * vbHeight * 10) / 10,
            anchor: resolveLabelAnchor(style),
            text,
        });
    });
    return labels;
};

const replaceSvgVarsInElement = ($el: Cheerio<Element>) => {
    for (const attr of ['fill', 'stroke', 'stop-color', 'style'] as const) {
        const val = $el.attr(attr);
        if (val?.includes('var(--ds-')) {
            $el.attr(
                attr,
                val.replaceAll(SVG_VAR_RE, (token) => SVG_CSS_VAR_FALLBACKS.get(token) ?? token)
            );
        }
    }
};

const normalizeSvgCharts = ($body: Cheerio<Element>, $: CheerioAPI) => {
    $body.find('svg').each((_, el) => {
        const $svg = $(el);
        const viewBox = ($svg.attr('viewBox') ?? '').trim().split(/\s+/).map(Number);
        const $overlay = $svg.next('div');
        if (viewBox.length === 4 && viewBox[2] > 0 && viewBox[3] > 0 && $overlay.length > 0 && $overlay.find('span[style*="left:"]').length > 0) {
            const labels = extractSvgOverlayLabels($, $overlay, viewBox[2], viewBox[3]);
            if (labels.length > 0) {
                $svg.append(renderChartLabels(labels));
                $overlay.remove();
            }
        }

        replaceSvgVarsInElement($svg);
        $svg.find('[fill], [stroke], [stop-color], [style]').each((__, child) => {
            replaceSvgVarsInElement($(child));
        });
    });
};

const extractBenchmarkRows = ($: CheerioAPI, $fig: Cheerio<Element>): BenchmarkTableData => {
    const rows: BenchmarkRow[] = [];
    const columnSet: string[] = [];

    $fig.find('[role="group"]').each((_, groupEl) => {
        const $group = $(groupEl);
        const $headerSpans = $group.prev().find('span');
        const metric = $headerSpans.first().text().replaceAll(/\s+/g, ' ').trim();
        const change = $headerSpans.length > 1 ? $headerSpans.last().text().replaceAll(/\s+/g, ' ').trim() : undefined;
        const values: BenchmarkMetricValue[] = [];

        $group.find('[role="progressbar"]').each((__, barEl) => {
            const $bar = $(barEl);
            const label = $bar.prev().text().replaceAll(/\s+/g, ' ').trim();
            const value = $bar.text().replaceAll(/\s+/g, ' ').trim() || $bar.attr('aria-label') || '';
            if (!label || !value) {
                return;
            }
            if (!columnSet.includes(label)) {
                columnSet.push(label);
            }
            values.push({ label, value });
        });

        if (metric && values.length > 0) {
            rows.push({ metric, values, change });
        }
    });

    return { columns: columnSet, rows };
};

const convertBenchmarkFigures = ($body: Cheerio<Element>, $: CheerioAPI) => {
    $body.find('figure').each((_, figEl) => {
        const $fig = $(figEl);
        if ($fig.find('[role="progressbar"]').length === 0) {
            return;
        }
        const title = $fig.children().first().text().replaceAll(/\s+/g, ' ').trim();
        const { columns, rows } = extractBenchmarkRows($, $fig);
        if (columns.length > 0 && rows.length > 0) {
            $fig.replaceWith(renderBenchmarkFigure(title, columns, rows));
        }
    });
};

const pruneNoiseAndDarkDuplicates = ($body: Cheerio<Element>, $: CheerioAPI) => {
    $body.find('script, style, noscript, template, button, .sr-only, a.next-site-heading-anchor-link, svg[data-slot="geist-icon"], [data-section="tabs"] svg').remove();

    $body
        .find('[class]')
        .filter((_, el) => isDarkOnlyElement($(el).attr('class')))
        .remove();

    $body
        .find('[style]')
        .filter((_, el) => $(el).closest('svg').length === 0)
        .removeAttr('style');

    $body
        .find('[class]')
        .filter((_, el) => $(el).closest('svg').length === 0 && el.tagName !== 'pre' && el.tagName !== 'code')
        .removeAttr('class');
};

const normalizeVideoDimensions = ($video: Cheerio<Element>) => {
    const rawW = $video.attr('width');
    const rawH = $video.attr('height');
    if (!rawW || !rawH) {
        return;
    }
    const w = Math.trunc(Number(rawW));
    const h = Math.trunc(Number(rawH));
    if (!(w > 0 && h > 0)) {
        $video.removeAttr('width').removeAttr('height');
        return;
    }
    if (w > VIDEO_RATIO_MAX || h > VIDEO_RATIO_MAX) {
        return;
    }
    $video.attr('width', String(VIDEO_TARGET_WIDTH));
    $video.attr('height', String(Math.round((VIDEO_TARGET_WIDTH * h) / w)));
};

const normalizeMediaElements = ($body: Cheerio<Element>, $: CheerioAPI, articleUrl: string) => {
    $body.find('img').each((_, el) => {
        const $img = $(el);
        const unwrappedSrc = unwrapNextImageUrl($img.attr('src'), articleUrl);
        if (unwrappedSrc) {
            $img.attr('src', unwrappedSrc);
        }
        $img.removeAttr('srcset').removeAttr('sizes').removeAttr('loading').removeAttr('decoding').removeAttr('data-nimg');
    });

    $body.find('video').each((_, el) => {
        const $video = $(el);
        const unwrappedPoster = unwrapNextImageUrl($video.attr('poster'), articleUrl);
        if (unwrappedPoster) {
            $video.attr('poster', unwrappedPoster);
        }
        if ($video.attr('controls') === undefined) {
            $video.attr('controls', '');
        }
        normalizeVideoDimensions($video);
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

const extractArticleContent = ($: CheerioAPI, articleUrl: string): CachedDetail => {
    const author = extractAuthors($, articleUrl);
    const pubDateRaw = $('meta[property="article:published_time"]').attr('content')?.trim() || undefined;
    const rawOg = $('meta[property="og:image"]').attr('content');
    const $body = $('article div, main div')
        .filter((_, el) => ($(el).attr('class') ?? '').includes('--article-full-width'))
        .first();

    if ($body.length === 0) {
        return {
            bodyHtml: '',
            author,
            pubDateRaw,
            image: unwrapNextImageUrl(rawOg, articleUrl) ?? resolveHttpUrl(rawOg, articleUrl),
        };
    }

    convertBenchmarkFigures($body, $);
    normalizeSvgCharts($body, $);
    pruneNoiseAndDarkDuplicates($body, $);
    normalizeMediaElements($body, $, articleUrl);
    pruneEmptyDivs($body, $);

    const image = pickCoverImage($, $body, articleUrl);
    const hasContent = Boolean($body.text().trim()) || $(MEDIA_KEEP_SELECTOR, $body).length > 0;
    const bodyHtml = hasContent ? ($body.html() || '').trim() : '';

    return {
        bodyHtml,
        author,
        pubDateRaw,
        image,
    };
};

const toFeedEntry = (item: RssItem): FeedEntry | undefined => {
    const link = resolveBlogArticleUrl(item.link);
    if (!link || !item.title) {
        return undefined;
    }
    const rawDate = item.isoDate ?? item.pubDate;
    return {
        title: item.title,
        link,
        summary: (item.contentSnippet ?? item.content ?? '').trim(),
        pubDate: rawDate ? parseDate(rawDate) : undefined,
    };
};

const mapFeedEntries = (items: RssItem[], limit: number): FeedEntry[] => {
    const seen = new Set<string>();
    const entries: FeedEntry[] = [];

    for (const item of items) {
        const entry = toFeedEntry(item);
        if (!entry || seen.has(entry.link)) {
            continue;
        }
        seen.add(entry.link);
        entries.push(entry);
        if (entries.length >= limit) {
            break;
        }
    }

    return entries;
};

const fetchCachedDetail = async (link: string): Promise<CachedDetail | undefined> => {
    try {
        const detail = await cache.tryGet(`nextjs:blog:v2:${link}`, async () => {
            const html = await ofetch<string>(link, { publicOnly: true });
            const $ = load(html);
            return extractArticleContent($, link);
        });
        return detail ?? undefined;
    } catch (error) {
        logger.warn(`Failed to fetch Next.js blog detail for ${link}: ${error instanceof Error ? error.message : String(error)}`);
        return undefined;
    }
};

const buildFeedItem = async (entry: FeedEntry): Promise<DataItem> => {
    const detail = await fetchCachedDetail(entry.link);
    const fallback = entry.summary ? renderFallbackDescription(entry.summary) : undefined;
    const description = detail?.bodyHtml || fallback;

    return {
        title: entry.title,
        link: entry.link,
        description,
        pubDate: (detail?.pubDateRaw ? parseDate(detail.pubDateRaw) : undefined) ?? entry.pubDate,
        author: detail?.author,
        image: detail?.image,
    };
};

const handler: Route['handler'] = async (ctx: Context): Promise<Data> => {
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const rssXml = await ofetch(RSS_URL, { responseType: 'text', publicOnly: true });
    const feed = await parser.parseString(rssXml);
    const entries = mapFeedEntries(feed.items, limit);

    const item = await pMap(entries, (entry) => buildFeedItem(entry), {
        concurrency: DETAIL_CONCURRENCY,
    });

    return {
        title: feed.title || 'Next.js Blog',
        description: feed.description || 'The official Next.js blog covering framework releases, engineering deep dives, and security advisories.',
        link: BLOG_URL,
        language: 'en-us',
        item,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'nextjs.org/blog',
    example: '/nextjs/blog',
    categories: ['program-update'],
    view: ViewType.Articles,
    maintainers: ['equt', 'ljh12138164'],
    description: 'Full-text articles, release notes, and security advisories from the official Next.js blog. Fetches up to 20 entries by default via the official RSS feed; supports the common `limit` query parameter.',
    zh: {
        name: '博客',
        description: '通过官方 RSS 抓取 Next.js 官方博客全文（涵盖版本发布、工程实践与安全通告），默认获取最多 20 篇，支持通用 `limit` 参数。',
    },
    radar: [
        {
            source: ['nextjs.org/blog', 'nextjs.org/blog/:slug', 'nextjs.org/feed.xml'],
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
