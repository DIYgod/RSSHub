import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';
import type { Item as RssItem } from 'rss-parser';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

const BLOG_BASE_URL = 'https://aws.amazon.com/blogs';
const DEFAULT_CATEGORY = 'aws';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DETAIL_CONCURRENCY = 5;
const CATEGORY_RE = /^[a-z0-9-]+$/;
const AUTHOR_HEADING_RE = /^(?:about(?:\s+(?:the|our))?\s+authors?|authors?\s+bio(?:\(s\)|s)?):?$/i;
const SAFE_HTTP_PROTOCOLS = new Set(['http:', 'https:']);

interface FeedEnclosure {
    url: string;
    type?: string;
    length?: number;
}

interface CleanedContent {
    description: string;
    bodyImage?: string;
    boxAuthors: string[];
}

interface ArticlePageMeta {
    image?: string;
    authors: string[];
}

interface ParsedFeedEntry {
    title: string;
    link: string;
    guid: string;
    pubDate?: Temporal.Instant;
    creator?: string;
    category?: string[];
    description: string;
    bodyImage?: string;
    boxAuthors: string[];
    enclosure?: FeedEnclosure;
}

const normalizeText = (value: string | undefined): string => value?.replaceAll(/\s+/g, ' ').trim() ?? '';

const resolveHttpUrl = (rawUrl: string | undefined, baseUrl: string): string | undefined => {
    const trimmed = rawUrl?.trim();
    if (!trimmed) {
        return undefined;
    }
    const parsed = URL.parse(trimmed, baseUrl);
    return parsed && SAFE_HTTP_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
};

const extractCategories = (rawCategories: string[] | undefined): string[] | undefined => {
    const categories = (rawCategories ?? []).map((tag) => normalizeText(tag)).filter(Boolean);
    return categories.length > 0 ? categories : undefined;
};

const extractBoxAuthors = ($: CheerioAPI): string[] =>
    $('.blog-author-box')
        .toArray()
        .map((el) => normalizeText($(el).find('h2, h3, h4, h5').text()))
        .filter(Boolean);

const isAuthorHeading = ($node: Cheerio<Element>): boolean => $node.is('h1, h2, h3, h4, h5, h6, p') && AUTHOR_HEADING_RE.test(normalizeText($node.text()));

const isBlankParagraph = ($node: Cheerio<Element>): boolean => $node.is('p') && normalizeText($node.text()) === '' && $node.find('img, video, audio, iframe, svg').length === 0;

const isTrailingSectionBoundary = ($node: Cheerio<Element>): boolean => {
    if ($node.is('h1, h2, h3, h4, h5, h6')) {
        return !isAuthorHeading($node);
    }
    if ($node.is('ol.blog-footnotes')) {
        return true;
    }
    if (!$node.is('hr')) {
        return false;
    }
    let $after = $node.next();
    while ($after.length && isBlankParagraph($after)) {
        $after = $after.next();
    }
    return isTrailingSectionBoundary($after);
};

const removePrecedingAuthorChrome = ($target: Cheerio<Element>): void => {
    let $prev = $target.prev();
    while ($prev.length && ($prev.is('hr') || isAuthorHeading($prev) || isBlankParagraph($prev))) {
        const $toRemove = $prev;
        $prev = $prev.prev();
        $toRemove.remove();
    }
};

const removeAuthorBioSections = ($: CheerioAPI): void => {
    const headings = $('h1, h2, h3, h4, h5, h6, p')
        .filter((_, el) => isAuthorHeading($(el)))
        .toArray();
    for (const heading of headings) {
        if (!heading.parent) {
            continue;
        }
        const $heading = $(heading);
        removePrecedingAuthorChrome($heading);
        let $next = $heading.next();
        while ($next.length && !isTrailingSectionBoundary($next)) {
            const $toRemove = $next;
            $next = $next.next();
            $toRemove.remove();
        }
        $heading.remove();
    }
};

const removeAuthorFooter = ($: CheerioAPI): void => {
    removeAuthorBioSections($);

    const authorFooters = $('footer')
        .filter((_, el) => $(el).find('.blog-author-box').length > 0)
        .toArray();
    for (const footer of authorFooters) {
        const $footer = $(footer);
        removePrecedingAuthorChrome($footer);
        $footer.remove();
    }
};

const pickFirstImage = ($: CheerioAPI, baseUrl: string): string | undefined => {
    for (const el of $('img').toArray()) {
        const resolved = resolveHttpUrl($(el).attr('src'), baseUrl);
        if (resolved) {
            return resolved;
        }
    }
    return undefined;
};

const cleanRssContent = (rawItem: RssItem, link: string): CleanedContent => {
    const contentHtml = rawItem['content:encoded'] ?? rawItem.content;
    if (!contentHtml) {
        const summary = rawItem.contentSnippet?.trim() ?? '';
        return {
            description: summary ? renderToString(<p>{summary}</p>) : '',
            boxAuthors: [],
        };
    }

    const $ = load(contentHtml, null, false);
    const boxAuthors = extractBoxAuthors($);
    removeAuthorFooter($);
    $('div.wp-caption[style]').removeAttr('style');

    return {
        description: $.html().trim(),
        bodyImage: pickFirstImage($, link),
        boxAuthors,
    };
};

const parseEnclosureLength = (rawLength: number | string | undefined): number | undefined => (rawLength ? Number(rawLength) : undefined);

const parseEnclosure = (rawEnclosure: RssItem['enclosure'], blogUrl: string): FeedEnclosure | undefined => {
    const url = resolveHttpUrl(rawEnclosure?.url, blogUrl);
    if (!url) {
        return undefined;
    }
    return {
        url,
        type: normalizeText(rawEnclosure?.type) || undefined,
        length: parseEnclosureLength(rawEnclosure?.length),
    };
};

const mergeAuthors = (orderedCandidates: ReadonlyArray<string | undefined>): DataItem['author'] => {
    const names = orderedCandidates.map((candidate) => normalizeText(candidate)).filter(Boolean);
    return names.length > 0 ? names.map((name) => ({ name })) : undefined;
};

const toParsedFeedEntry = (rawItem: RssItem, blogUrl: string): ParsedFeedEntry | undefined => {
    const link = resolveHttpUrl(rawItem.link, blogUrl);
    if (!link || !rawItem.title) {
        return undefined;
    }

    const cleaned = cleanRssContent(rawItem, link);
    const rawDate = rawItem.isoDate ?? rawItem.pubDate;

    return {
        title: rawItem.title,
        link,
        guid: rawItem.guid || link,
        pubDate: rawDate ? parseDate(rawDate) : undefined,
        creator: normalizeText(rawItem.creator) || undefined,
        category: extractCategories(rawItem.categories),
        description: cleaned.description,
        bodyImage: cleaned.bodyImage,
        boxAuthors: cleaned.boxAuthors,
        enclosure: parseEnclosure(rawItem.enclosure, blogUrl),
    };
};

const parseFeedEntries = (rawItems: RssItem[], blogUrl: string, limit: number): ParsedFeedEntry[] => rawItems.flatMap((rawItem) => toParsedFeedEntry(rawItem, blogUrl) ?? []).slice(0, limit);

const fetchArticlePageMeta = async (link: string): Promise<ArticlePageMeta> => {
    try {
        return await cache.tryGet<ArticlePageMeta>(`amazon:blogs:meta:${link}`, async () => {
            const html = await ofetch(link, { publicOnly: true });
            const $ = load(html);
            const ogImage = $('meta[property="og:image"]').attr('content') ?? $('meta[name="twitter:image"]').attr('content');
            const authors = $('[property="author"] [property="name"]')
                .toArray()
                .map((el) => normalizeText($(el).text()))
                .filter(Boolean);
            return {
                image: resolveHttpUrl(ogImage, link),
                authors: authors.length > 0 ? authors : extractBoxAuthors($),
            };
        });
    } catch {
        return { authors: [] };
    }
};

const resolveAuthorCandidates = (boxAuthors: string[], pageMeta: ArticlePageMeta | undefined, creator: string | undefined): ReadonlyArray<string | undefined> => {
    if (boxAuthors.length > 0) {
        return boxAuthors;
    }
    if (pageMeta?.authors.length) {
        return pageMeta.authors;
    }
    return [creator];
};

const enrichFeedEntry = async (entry: ParsedFeedEntry): Promise<DataItem> => {
    const needPageMeta = !entry.bodyImage || entry.boxAuthors.length === 0;
    const pageMeta = needPageMeta ? await fetchArticlePageMeta(entry.link) : undefined;
    const orderedAuthors = resolveAuthorCandidates(entry.boxAuthors, pageMeta, entry.creator);

    return {
        title: entry.title,
        link: entry.link,
        description: entry.description,
        pubDate: entry.pubDate,
        author: mergeAuthors(orderedAuthors),
        category: entry.category,
        guid: entry.guid,
        image: entry.bodyImage ?? pageMeta?.image,
        enclosure_url: entry.enclosure?.url,
        enclosure_type: entry.enclosure?.type,
        enclosure_length: entry.enclosure?.length,
    };
};

async function handler(ctx: Context): Promise<Data> {
    const category = ctx.req.param('category') ?? DEFAULT_CATEGORY;
    if (!CATEGORY_RE.test(category)) {
        throw new InvalidParameterError('Invalid blog category');
    }

    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const blogUrl = `${BLOG_BASE_URL}/${category}/`;
    const feedUrl = `${blogUrl}feed/`;
    const rssXml = await ofetch(feedUrl, { responseType: 'text' });
    const feed = await parser.parseString(rssXml);
    const entries = parseFeedEntries(feed.items, blogUrl, limit);
    const items = await pMap(entries, enrichFeedEntry, { concurrency: DETAIL_CONCURRENCY });

    return {
        title: feed.title || `AWS ${category} Blog`,
        description: feed.description || 'Official AWS Blog',
        link: blogUrl,
        language: feed.language || 'en-us',
        item: items,
    };
}

export const route: Route = {
    path: '/blogs/:category?',
    name: 'AWS Blog',
    url: 'aws.amazon.com/blogs',
    example: '/amazon/blogs/machine-learning',
    categories: ['blog'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    parameters: {
        category: {
            description: 'Blog category slug from the URL path (e.g. `aws`, `machine-learning`, `compute`, `security`, `architecture`, `containers`, `devops`, `database`)',
            default: DEFAULT_CATEGORY,
        },
    },
    description:
        'Full-text articles from a specific AWS Blog category via `aws.amazon.com/blogs/<category>/feed/`, stripping the WordPress author bio footer, merging co-authors, and resolving article `og:image` covers when posts have no body images.',
    zh: {
        name: 'AWS 博客',
        parameters: {
            category: {
                description: 'AWS 博客分类路径标识（如 `aws`、`machine-learning`、`compute`、`security`、`architecture`、`containers`、`devops`、`database`）',
                default: DEFAULT_CATEGORY,
            },
        },
        description: '通过 `aws.amazon.com/blogs/<category>/feed/` 获取指定 AWS 博客分类全文，清理文末作者简介页脚、补全合著作者，并在正文无配图时抓取页面 `og:image` 作为封面，默认对应 `aws` 分类。',
    },
    radar: [
        {
            source: ['aws.amazon.com/blogs', 'aws.amazon.com/blogs/:category', 'aws.amazon.com/blogs/:category/feed', 'aws.amazon.com/blogs/:category/:slug'],
            target: '/blogs/:category?',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};
