import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import type { ResourceLink } from './templates/ml-research';
import { renderChartNotice, renderFallbackDescription, renderHeroVideo, renderMlResearchDescription } from './templates/ml-research';

const APPLE_ML_ORIGIN = 'https://machinelearning.apple.com';
const HIGHLIGHTS_URL = `${APPLE_ML_ORIGIN}/highlights`;
const RESEARCH_URL = `${APPLE_ML_ORIGIN}/research`;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DETAIL_CONCURRENCY = 5;
const FALLBACK_AUTHOR = 'Apple Machine Learning Research';
const GENERIC_SHARE_IMAGE_PREFIX = '/media/Home_1200x630_';

type MlCategory = 'all' | 'highlights' | 'research';

interface MlTag {
    name?: string;
}

interface MlAuthor {
    name?: string;
}

interface MlLink {
    type?: string;
    url?: string;
}

interface MlSocial {
    url?: string;
}

interface MlPost {
    slug?: string;
    title?: string;
    description?: string;
    body?: string;
    published?: string;
    authorsOrdered?: string | null;
    authors?: MlAuthor[];
    tags?: MlTag[];
    events?: MlTag[];
    links?: MlLink[];
    social?: MlSocial | null;
}

interface MlNextData {
    props?: {
        pageProps?: {
            posts?: MlPost[];
        };
    };
}

interface IndexEntry {
    slug: string;
    title: string;
    link: string;
    publishedRaw?: string;
    summaryHtml: string;
    authorsList: string[];
    categories: string[];
}

interface HeroMedia {
    heroImageUrl?: string;
    heroImageAlt?: string;
    heroVideoHtml?: string;
}

interface CleanedBody {
    bodyHtml: string;
    firstBodyImage?: string;
}

interface ParsedDetail {
    title: string;
    description?: string;
    pubDateRaw?: string;
    author?: DataItem['author'];
    category?: string[];
    image?: string;
}

interface CategoryFeedInfo {
    title: string;
    link: string;
    description: string;
}

const parseHttpUrl = (rawUrl: string | undefined, base: string = APPLE_ML_ORIGIN): URL | undefined => {
    if (!rawUrl) {
        return undefined;
    }
    const parsed = URL.parse(rawUrl, base);
    return parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed : undefined;
};

const buildArticleUrl = (rawSlug: string | undefined): string | undefined => {
    if (!rawSlug) {
        return undefined;
    }
    const normalized = rawSlug.replaceAll(/^\/+|\/+$/g, '');
    if (!normalized || normalized.includes('/') || normalized.includes('..') || /[?#\\]/.test(normalized)) {
        return undefined;
    }
    const parsed = parseHttpUrl(`/research/${normalized}`);
    if (!parsed || parsed.hostname !== 'machinelearning.apple.com') {
        return undefined;
    }
    return parsed.href;
};

const isGenericShareImage = (url: URL): boolean => url.pathname.startsWith(GENERIC_SHARE_IMAGE_PREFIX);

const resolveValidCoverUrl = (rawUrl: string | undefined, base: string): string | undefined => {
    const parsed = parseHttpUrl(rawUrl, base);
    if (!parsed || isGenericShareImage(parsed)) {
        return undefined;
    }
    return parsed.href;
};

const parseCategory = (rawParam: string | undefined): MlCategory => {
    if (!rawParam || rawParam === 'all') {
        return 'all';
    }
    if (rawParam === 'highlights' || rawParam === 'research') {
        return rawParam;
    }
    throw new InvalidParameterError(`Invalid category: ${rawParam}`);
};

const getCategoryFeedInfo = (category: MlCategory): CategoryFeedInfo => {
    if (category === 'highlights') {
        return {
            title: 'Apple Machine Learning Research - Highlights',
            link: HIGHLIGHTS_URL,
            description: 'Featured highlights and in-depth engineering articles from Apple Machine Learning Research.',
        };
    }
    if (category === 'research') {
        return {
            title: 'Apple Machine Learning Research - Publications',
            link: RESEARCH_URL,
            description: 'Research publications, paper abstracts, authors, and code links from Apple Machine Learning Research.',
        };
    }
    return {
        title: 'Apple Machine Learning Research',
        link: RESEARCH_URL,
        description: 'Latest research highlights, engineering deep dives, and publications from Apple Machine Learning Research.',
    };
};

const stripTags = (rawHtml: string | undefined): string => (rawHtml ? load(rawHtml).text() : '');

const extractNextData = ($: CheerioAPI): MlNextData | undefined => {
    const payload = $('script#__NEXT_DATA__').first().text();
    if (!payload) {
        return undefined;
    }
    try {
        return JSON.parse(payload) as MlNextData;
    } catch {
        return undefined;
    }
};

const addTagNames = (seen: Set<string>, items: MlTag[] | undefined) => {
    if (!items) {
        return;
    }
    for (const item of items) {
        const name = item.name?.trim();
        if (name) {
            seen.add(name);
        }
    }
};

const extractCategoryNames = (post: MlPost): string[] => {
    const seen = new Set<string>();
    addTagNames(seen, post.tags);
    addTagNames(seen, post.events);
    return seen.values().toArray();
};

const extractAuthorNames = (authorsOrdered: string | null | undefined, authors: MlAuthor[] | undefined): string[] => {
    if (authorsOrdered) {
        return authorsOrdered
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean);
    }
    if (!authors) {
        return [];
    }
    const list: string[] = [];
    for (const author of authors) {
        const name = author.name?.trim();
        if (name) {
            list.push(name);
        }
    }
    return list;
};

const resolveDataAuthors = (post: MlPost | undefined, entry: IndexEntry): DataItem['author'] => {
    const fromDetail = post ? extractAuthorNames(post.authorsOrdered, post.authors) : [];
    const names = fromDetail.length > 0 ? fromDetail : entry.authorsList.length > 0 ? entry.authorsList : [FALLBACK_AUTHOR];
    return names.map((name) => ({ name }));
};

const toIndexEntry = (post: MlPost): IndexEntry | undefined => {
    const slug = post.slug?.trim();
    const link = slug ? buildArticleUrl(slug) : undefined;
    if (!slug || !link) {
        return undefined;
    }
    const publishedRaw = post.published?.trim();
    return {
        slug,
        title: post.title ? stripTags(post.title) : slug,
        link,
        publishedRaw: publishedRaw || undefined,
        summaryHtml: post.body || post.description || '',
        authorsList: extractAuthorNames(post.authorsOrdered, post.authors),
        categories: extractCategoryNames(post),
    };
};

const parseIndexPage = (html: string): IndexEntry[] => {
    const $ = load(html);
    const posts = extractNextData($)?.props?.pageProps?.posts ?? [];
    const entries: IndexEntry[] = [];

    for (const post of posts) {
        const entry = toIndexEntry(post);
        if (entry) {
            entries.push(entry);
        }
    }

    return entries;
};

const fetchMergedIndex = async (category: MlCategory, limit: number): Promise<IndexEntry[]> => {
    const urls = category === 'highlights' ? [HIGHLIGHTS_URL] : category === 'research' ? [RESEARCH_URL] : [HIGHLIGHTS_URL, RESEARCH_URL];
    const pages = await Promise.all(urls.map((url) => ofetch(url, { responseType: 'text' })));

    const bySlug = new Map<string, IndexEntry>();
    for (const html of pages) {
        for (const entry of parseIndexPage(html)) {
            if (!bySlug.has(entry.slug)) {
                bySlug.set(entry.slug, entry);
            }
        }
    }

    return bySlug
        .values()
        .toArray()
        .toSorted((a, b) => (b.publishedRaw ?? '').localeCompare(a.publishedRaw ?? ''))
        .slice(0, limit);
};

const extractHeroMedia = ($: CheerioAPI, articleUrl: string): HeroMedia => {
    const $hero = $('#hero').first();
    if (!$hero.length) {
        return {};
    }

    const $video = $hero.find('video').first();
    if ($video.length) {
        const $source = $video.find('source[src]').first();
        const videoUrl = parseHttpUrl($source.attr('src') || $video.attr('src'), articleUrl)?.href;
        if (videoUrl) {
            const posterUrl = resolveValidCoverUrl($video.attr('poster'), articleUrl);
            return {
                heroImageUrl: posterUrl,
                heroVideoHtml: renderHeroVideo(videoUrl, $source.attr('type'), posterUrl),
            };
        }
    }

    const $img = $hero.find('img').first();
    const heroImageUrl = resolveValidCoverUrl($img.attr('src'), articleUrl);
    if (!heroImageUrl) {
        return {};
    }
    return {
        heroImageUrl,
        heroImageAlt: $img.attr('alt')?.trim(),
    };
};

const resolvePostLinkLabel = (rawType: string | undefined): string => {
    if (rawType === 'publication') {
        return 'View publication';
    }
    if (rawType === 'code') {
        return 'View source code';
    }
    return rawType || 'External link';
};

const extractResourceLinks = ($: CheerioAPI, post: MlPost | undefined, articleUrl: string): ResourceLink[] => {
    const seen = new Set<string>();
    const links: ResourceLink[] = [];

    $('[data-testid="links"] a[href]').each((_, el) => {
        const $el = $(el);
        const href = parseHttpUrl($el.attr('href'), articleUrl)?.href;
        const label = $el.text().replaceAll(/\s+/g, ' ').trim();
        if (!href || !label || seen.has(href)) {
            return;
        }
        seen.add(href);
        links.push({ label, href });
    });

    if (links.length > 0 || !post?.links) {
        return links;
    }

    for (const item of post.links) {
        const href = parseHttpUrl(item.url, articleUrl)?.href;
        if (!href || seen.has(href)) {
            continue;
        }
        seen.add(href);
        links.push({ label: resolvePostLinkLabel(item.type), href });
    }

    return links;
};

const replaceInteractiveCharts = ($: CheerioAPI, $body: Cheerio<Element>, articleUrl: string) => {
    const noticedFigures = new Set<AnyNode>();

    $body.find('[role="tabpanel"], .inner-bleed-grid').each((_, panel) => {
        const $panel = $(panel);
        const $figure = $panel.closest('figure');
        const hasStaticMediaOrData = $panel.find('img, video, audio, table, pre, code').length > 0;
        const hasText = $panel.text().replaceAll(/\s+/g, ' ').trim().length > 0;
        if (hasStaticMediaOrData || hasText) {
            return;
        }

        const figureNode = $figure.get(0);
        if (!figureNode) {
            $panel.remove();
            return;
        }

        if (noticedFigures.has(figureNode)) {
            $panel.remove();
            return;
        }

        noticedFigures.add(figureNode);
        const figId = $figure.attr('id')?.trim();
        const headingText = $figure.find('.figure-canvas h3, .figure-canvas h4').first().text().replaceAll(/\s+/g, ' ').trim();
        const chartUrl = figId ? `${articleUrl}#${figId}` : articleUrl;
        $panel.replaceWith(renderChartNotice(chartUrl, headingText));
    });
};

const normalizeMediaElements = ($: CheerioAPI, $body: Cheerio<Element>, articleUrl: string) => {
    $body.find('img[aria-hidden], [role="tabpanel"][aria-hidden]').removeAttr('aria-hidden');

    $body.find('video').each((_, el) => {
        const $video = $(el);
        $video.attr('controls', '');
        if (!$video.attr('preload')) {
            $video.attr('preload', 'metadata');
        }
        const videoSrc = parseHttpUrl($video.attr('src'), articleUrl)?.href;
        if (videoSrc) {
            $video.attr('src', videoSrc);
        }
        const posterSrc = resolveValidCoverUrl($video.attr('poster'), articleUrl);
        if (posterSrc) {
            $video.attr('poster', posterSrc);
        } else {
            $video.removeAttr('poster');
        }
    });

    $body.find('audio').each((_, el) => {
        const $audio = $(el);
        $audio.attr('controls', '');
        const audioSrc = parseHttpUrl($audio.attr('src'), articleUrl)?.href;
        if (audioSrc) {
            $audio.attr('src', audioSrc);
        }
    });

    $body.find('source[src]').each((_, el) => {
        const $source = $(el);
        const sourceUrl = parseHttpUrl($source.attr('src'), articleUrl)?.href;
        if (sourceUrl) {
            $source.attr('src', sourceUrl);
        } else {
            $source.remove();
        }
    });
};

const cleanBodyHtml = ($: CheerioAPI, articleUrl: string): CleanedBody => {
    const $body = $('.post-article, .postBody').first();
    if (!$body.length) {
        return { bodyHtml: '' };
    }

    $body.find('script, style, noscript, iframe, button, .js-only, .dotnav, .paddlenav, .katex-html, [hidden]').remove();
    $body.find('h1').each((_, el) => {
        el.tagName = 'h2';
    });
    replaceInteractiveCharts($, $body, articleUrl);
    $body.find('[role="tablist"]').remove();
    normalizeMediaElements($, $body, articleUrl);
    $body
        .find('[style]')
        .filter((_, el) => $(el).closest('svg').length === 0)
        .removeAttr('style');

    const firstBodyImage = resolveValidCoverUrl($body.find('img').first().attr('src'), articleUrl);
    return {
        bodyHtml: $body.html()?.trim() ?? '',
        firstBodyImage,
    };
};

const buildDetailTitle = ($: CheerioAPI, post: MlPost | undefined, fallbackTitle: string): string => {
    const headingTitle = $('h1').first().text();
    if (headingTitle) {
        return headingTitle;
    }
    return post?.title ? stripTags(post.title) : fallbackTitle;
};

const resolveDetailCategories = (post: MlPost | undefined, entry: IndexEntry): string[] | undefined => {
    const detailCategories = post ? extractCategoryNames(post) : [];
    const categories = detailCategories.length > 0 ? detailCategories : entry.categories;
    return categories.length > 0 ? categories : undefined;
};

const parseDetailPage = (html: string, entry: IndexEntry): ParsedDetail => {
    const $ = load(html);
    const post = extractNextData($)?.props?.pageProps?.posts?.[0];
    const hero = extractHeroMedia($, entry.link);
    const resourceLinks = extractResourceLinks($, post, entry.link);
    const { bodyHtml, firstBodyImage } = cleanBodyHtml($, entry.link);

    const socialCover = resolveValidCoverUrl(post?.social?.url, entry.link);
    const ogImage = resolveValidCoverUrl($('meta[property="og:image"]').attr('content'), entry.link);
    const contentHtml = bodyHtml || entry.summaryHtml;
    const hasHeroOrLinks = Boolean(hero.heroVideoHtml || hero.heroImageUrl || resourceLinks.length > 0);
    const description = contentHtml || hasHeroOrLinks ? renderMlResearchDescription(contentHtml, hero.heroImageUrl, hero.heroImageAlt, hero.heroVideoHtml, resourceLinks) : undefined;

    return {
        title: buildDetailTitle($, post, entry.title),
        description,
        pubDateRaw: post?.published?.trim() || entry.publishedRaw,
        author: resolveDataAuthors(post, entry),
        category: resolveDetailCategories(post, entry),
        image: socialCover ?? ogImage ?? hero.heroImageUrl ?? firstBodyImage,
    };
};

const buildFallbackDetail = (entry: IndexEntry): ParsedDetail => ({
    title: entry.title,
    description: renderFallbackDescription(entry.summaryHtml, []),
    pubDateRaw: entry.publishedRaw,
    author: resolveDataAuthors(undefined, entry),
    category: entry.categories.length > 0 ? entry.categories : undefined,
});

const fetchPostDetail = async (entry: IndexEntry): Promise<ParsedDetail> => {
    try {
        return await cache.tryGet<ParsedDetail>(`apple:ml-research:${entry.link}`, async () => {
            const html = await ofetch(entry.link, { responseType: 'text' });
            return parseDetailPage(html, entry);
        });
    } catch {
        // Keep the feed healthy on transient single-article 404/timeout without caching degraded output
        return buildFallbackDetail(entry);
    }
};

const handler = async (ctx: Context): Promise<Data> => {
    const category = parseCategory(ctx.req.param('category'));
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const entries = await fetchMergedIndex(category, limit);
    const details = await pMap(entries, (entry) => fetchPostDetail(entry), { concurrency: DETAIL_CONCURRENCY });

    const items: DataItem[] = entries.map((entry, idx) => {
        const detail = details[idx];
        const pubDateSource = detail.pubDateRaw ?? entry.publishedRaw;
        return {
            title: detail.title,
            link: entry.link,
            pubDate: pubDateSource ? parseDate(pubDateSource) : undefined,
            author: detail.author,
            category: detail.category,
            description: detail.description,
            image: detail.image,
        };
    });

    const feedInfo = getCategoryFeedInfo(category);
    return {
        title: feedInfo.title,
        link: feedInfo.link,
        description: feedInfo.description,
        language: 'en',
        item: items,
    };
};

export const route: Route = {
    path: '/ml-research/:category?',
    name: 'Machine Learning Research',
    url: 'machinelearning.apple.com',
    categories: ['programming'],
    view: ViewType.Articles,
    example: '/apple/ml-research',
    maintainers: ['ljh12138164'],
    parameters: {
        category: {
            description: 'Content category: `all` (default, highlights + research papers), `highlights` (featured research & engineering articles), or `research` (research publications).',
            default: 'all',
            options: [
                { value: 'all', label: 'All' },
                { value: 'highlights', label: 'Highlights' },
                { value: 'research', label: 'Research Publications' },
            ],
        },
    },
    description: 'Full-text engineering highlights and research publications (with full abstracts, KaTeX math, audio/video, and arXiv/GitHub links) from Apple Machine Learning Research (`machinelearning.apple.com`).',
    zh: {
        name: '机器学习研究',
        description: '获取 Apple Machine Learning Research（`machinelearning.apple.com`）的精选技术长文与研究论文（含完整摘要、公式、音视频及 arXiv/GitHub 源码链接）。',
        parameters: {
            category: '内容分类：默认 `all`（精选文章 + 研究论文合并按时间排序），可选 `highlights`（精选工程与研究博客）或 `research`（论文全库）。',
        },
    },
    radar: [
        {
            source: ['machinelearning.apple.com/', 'machinelearning.apple.com/research/:slug'],
            target: '/ml-research',
        },
        {
            source: ['machinelearning.apple.com/highlights'],
            target: '/ml-research/highlights',
        },
        {
            source: ['machinelearning.apple.com/research'],
            target: '/ml-research/research',
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
