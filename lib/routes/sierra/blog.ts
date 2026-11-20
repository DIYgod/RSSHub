import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderEmbed, renderFallbackDescription, renderInteractiveNotice, renderVideo } from './templates/description';

const SIERRA_ORIGIN = 'https://sierra.ai';
const RSS_URL = `${SIERRA_ORIGIN}/rss.xml`;
const SANITY_FILE_BASE_URL = 'https://cdn.sanity.io/files/ca4jck6w/production/';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;
const DETAIL_CONCURRENCY = 5;

const ARTICLE_HOST_ALLOWLIST = ['sierra.ai'] as const;
const EMBED_HOST_ALLOWLIST = ['fast.wistia.net', 'fast.wistia.com', 'wistia.com', 'wistia.net', 'youtube.com', 'youtube-nocookie.com', 'youtu.be', 'player.vimeo.com', 'vimeo.com'] as const;
const SANITY_FILE_REF_RE = /^file-([a-f0-9]+)-([a-z0-9]+)$/i;
const SAFE_ID_RE = /^[a-z0-9]+$/i;
const RESPONSIVE_VIDEO_MARKER = '"responsiveVideo":{';

interface RssEntry {
    title: string;
    link: string;
    pubDateRaw: string;
    authorRaw: string;
    excerpt: string;
}

interface JsonLdAuthor {
    name?: string;
    url?: string;
}

interface JsonLdNode {
    '@type'?: string;
    '@graph'?: JsonLdNode[];
    datePublished?: string;
    image?: string | string[] | { url?: string };
    author?: JsonLdAuthor | JsonLdAuthor[];
}

interface NextFileAsset {
    _ref?: string;
}

interface NextMediaFile {
    asset?: NextFileAsset;
}

interface NextResponsiveVideo {
    desktop?: NextMediaFile;
    mobile?: NextMediaFile;
}

interface ResponsiveVideoUrls {
    desktopUrl?: string;
    mobileUrl?: string;
}

interface ParsedArticleDetails {
    description: string;
    pubDateRaw?: string;
    image?: string;
    author?: DataItem['author'];
}

const isAllowedHost = (hostname: string, domains: readonly string[]): boolean => {
    const normalized = hostname.toLowerCase();
    return domains.some((domain) => normalized === domain || normalized.endsWith(`.${domain}`));
};

const parseHttpUrl = (rawUrl: string | undefined, base?: string): URL | undefined => {
    if (!rawUrl) {
        return undefined;
    }
    const parsed = URL.parse(rawUrl, base);
    return parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? parsed : undefined;
};

const parseArticleUrl = (rawUrl: string): string | undefined => {
    const parsed = URL.parse(rawUrl, SIERRA_ORIGIN);
    if (!parsed || parsed.protocol !== 'https:' || !isAllowedHost(parsed.hostname, ARTICLE_HOST_ALLOWLIST) || !parsed.pathname.startsWith('/blog/') || parsed.pathname === '/blog/') {
        return undefined;
    }
    return parsed.href;
};

const unwrapCdnImageUrl = (rawUrl: string | undefined): string | undefined => {
    const parsed = parseHttpUrl(rawUrl, SIERRA_ORIGIN);
    if (!parsed) {
        return undefined;
    }
    if (isAllowedHost(parsed.hostname, ARTICLE_HOST_ALLOWLIST) && parsed.pathname === '/-/cdn/image') {
        const target = parsed.searchParams.get('src') ?? parsed.searchParams.get('url');
        return parseHttpUrl(target ?? undefined)?.href;
    }
    return parsed.href;
};

const extractRssExcerpt = (rawDescription: string): string => {
    if (!rawDescription) {
        return '';
    }
    const $desc = load(rawDescription, null, false);
    return $desc.root().text().replaceAll(/\s+/g, ' ').trim();
};

const parseRssFeed = (xml: string, limit: number): RssEntry[] => {
    const $ = load(xml, { xml: true });
    const seenLinks = new Set<string>();
    const entries: RssEntry[] = [];

    $('item').each((_, el) => {
        if (entries.length >= limit) {
            return;
        }
        const $item = $(el);
        const link = parseArticleUrl($item.find('link').first().text().trim());
        const title = $item.find('title').first().text();
        if (!link || !title || seenLinks.has(link)) {
            return;
        }
        seenLinks.add(link);
        entries.push({
            title,
            link,
            pubDateRaw: $item.find('pubDate').first().text().trim(),
            authorRaw: $item
                .find(String.raw`dc\:creator`)
                .first()
                .text()
                .trim(),
            excerpt: extractRssExcerpt($item.find('description').first().text()),
        });
    });

    return entries;
};

const findArticleLdInParsed = (parsed: JsonLdNode | JsonLdNode[]): JsonLdNode | undefined => {
    const candidates = Array.isArray(parsed) ? parsed : (parsed['@graph'] ?? [parsed]);
    return candidates.find((node) => node['@type'] === 'Article' || node['@type'] === 'BlogPosting');
};

const findArticleLdNode = ($: CheerioAPI): JsonLdNode | undefined => {
    for (const el of $('script[type="application/ld+json"]').toArray()) {
        const raw = $(el).text().trim();
        if (!raw) {
            continue;
        }
        try {
            const parsed = JSON.parse(raw) as JsonLdNode | JsonLdNode[];
            const found = findArticleLdInParsed(parsed);
            if (found) {
                return found;
            }
        } catch {
            // Ignore malformed JSON-LD blocks on auxiliary embeds.
        }
    }
    return undefined;
};

const extractLdImageUrl = (node: JsonLdNode | undefined): string | undefined => {
    if (!node?.image) {
        return undefined;
    }
    if (typeof node.image === 'string') {
        return unwrapCdnImageUrl(node.image);
    }
    if (Array.isArray(node.image)) {
        return unwrapCdnImageUrl(node.image[0]);
    }
    return unwrapCdnImageUrl(node.image.url);
};

const extractLdAuthors = (node: JsonLdNode | undefined): DataItem['author'] | undefined => {
    if (!node?.author) {
        return undefined;
    }
    const list = Array.isArray(node.author) ? node.author : [node.author];
    const mapped = list
        .filter((entry) => Boolean(entry.name?.trim()))
        .map((entry) => {
            const name = entry.name!.trim();
            const url = parseHttpUrl(entry.url, SIERRA_ORIGIN)?.href;
            return url ? { name, url } : { name };
        });
    return mapped.length > 0 ? mapped : undefined;
};

const parseSanityFileUrl = (ref: string | undefined): string | undefined => {
    if (!ref) {
        return undefined;
    }
    const match = SANITY_FILE_REF_RE.exec(ref);
    if (!match) {
        return undefined;
    }
    return `${SANITY_FILE_BASE_URL}${match[1]}.${match[2].toLowerCase()}`;
};

const decodeFlightChunk = (scriptText: string): string => {
    const prefix = 'self.__next_f.push(';
    const startIdx = scriptText.indexOf(prefix);
    const endIdx = scriptText.lastIndexOf(')');
    if (startIdx === -1 || endIdx <= startIdx + prefix.length) {
        return '';
    }
    try {
        const tuple = JSON.parse(scriptText.slice(startIdx + prefix.length, endIdx)) as [number, string?];
        return typeof tuple[1] === 'string' ? tuple[1] : '';
    } catch {
        return '';
    }
};

const extractBalancedObjectEnd = (source: string, openBraceIndex: number): number => {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = openBraceIndex; i < source.length; i++) {
        const ch = source[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (inString) {
            if (ch === '\\') {
                escaped = true;
            } else if (ch === '"') {
                inString = false;
            }
            continue;
        }
        switch (ch) {
            case '"':
                inString = true;
                break;
            case '{':
                depth++;
                break;
            case '}':
                depth--;
                if (depth === 0) {
                    return i;
                }
                break;
            default:
                break;
        }
    }
    return -1;
};

const extractResponsiveVideos = ($: CheerioAPI): ResponsiveVideoUrls[] => {
    const flightStream = $('script')
        .toArray()
        .map((el) => decodeFlightChunk($(el).text()))
        .join('');

    const videos: ResponsiveVideoUrls[] = [];
    let searchFrom = 0;

    while (searchFrom < flightStream.length) {
        const markerIndex = flightStream.indexOf(RESPONSIVE_VIDEO_MARKER, searchFrom);
        if (markerIndex === -1) {
            break;
        }
        const openBraceIndex = markerIndex + RESPONSIVE_VIDEO_MARKER.length - 1;
        const closeBraceIndex = extractBalancedObjectEnd(flightStream, openBraceIndex);
        if (closeBraceIndex === -1) {
            break;
        }
        searchFrom = closeBraceIndex + 1;
        try {
            const parsed = JSON.parse(flightStream.slice(openBraceIndex, closeBraceIndex + 1)) as NextResponsiveVideo;
            const desktopUrl = parseSanityFileUrl(parsed.desktop?.asset?._ref);
            const mobileUrl = parseSanityFileUrl(parsed.mobile?.asset?._ref);
            if (desktopUrl || mobileUrl) {
                videos.push({ desktopUrl, mobileUrl });
            }
        } catch {
            // Skip non-JSON occurrences inside unrelated text strings.
        }
    }

    return videos;
};

const isVideoPlaceholderFigure = ($: CheerioAPI, el: Element): boolean => {
    const $fig = $(el);
    if ($fig.find('video').length > 0) {
        return true;
    }
    const hasMediaOrTable = $fig.find('img, iframe, video, table').length > 0;
    const hasText = $fig.text().trim().length > 0;
    return !hasMediaOrTable && !hasText;
};

const replaceResponsiveVideoSlots = ($: CheerioAPI, $content: Cheerio<Element>, videos: ResponsiveVideoUrls[]): void => {
    const candidateFigures = $content
        .find('figure')
        .toArray()
        .filter((el) => isVideoPlaceholderFigure($, el));

    for (const [idx, el] of candidateFigures.entries()) {
        const $fig = $(el);
        const captionHtml = $fig.find('figcaption').first().html()?.trim();
        const media = videos[idx];
        const videoHtml = media ? renderVideo(media.desktopUrl, media.mobileUrl, captionHtml) : '';

        if (videoHtml) {
            $fig.html(videoHtml);
        } else {
            $fig.find('video').remove();
        }
    }

    $content.find('video').each((_, el) => {
        const $video = $(el);
        if (!$video.attr('src') && $video.find('source').length === 0) {
            $video.remove();
        }
    });
};

const parseWistiaPosterId = (src: string | undefined): string | undefined => {
    if (!src) {
        return undefined;
    }
    const parsed = URL.parse(src, SIERRA_ORIGIN);
    if (!parsed || !isAllowedHost(parsed.hostname, ARTICLE_HOST_ALLOWLIST) || parsed.pathname !== '/api/wistia-poster') {
        return undefined;
    }
    const id = parsed.searchParams.get('id');
    return id && SAFE_ID_RE.test(id) ? id : undefined;
};

const cleanButtons = ($: CheerioAPI, $content: Cheerio<Element>): void => {
    $content.find('button').each((_, el) => {
        const $button = $(el);
        if ($button.find('img').length > 0) {
            $button.replaceWith($button.contents());
            return;
        }
        $button.remove();
    });
};

const replaceWistiaPosters = ($: CheerioAPI, $content: Cheerio<Element>): void => {
    $content.find('img').each((_, el) => {
        const $img = $(el);
        const wistiaId = parseWistiaPosterId($img.attr('src'));
        if (!wistiaId) {
            return;
        }
        const embedUrl = `https://fast.wistia.net/embed/iframe/${wistiaId}?web_component=true&seo=true`;
        const watchUrl = `https://fast.wistia.net/embed/iframe/${wistiaId}`;
        const $parent = $img.parent();
        const $target = $parent.hasClass('wistia-bg') ? $parent : $img;
        $target.replaceWith(renderEmbed(embedUrl, watchUrl, 'Wistia video player'));
    });
};

const normalizeImages = ($: CheerioAPI, $content: Cheerio<Element>): void => {
    $content.find('img').each((_, el) => {
        const $img = $(el);
        const resolved = unwrapCdnImageUrl($img.attr('src'));
        if (!resolved) {
            $img.remove();
            return;
        }
        $img.attr('src', resolved);
        $img.removeAttr('srcset');
        $img.removeAttr('sizes');
        $img.removeAttr('decoding');
        $img.removeAttr('data-nimg');
        $img.removeAttr('loading');
        $img.removeAttr('style');
    });
};

const resolveEmbedWatchUrl = (embedUrl: URL): string => {
    if (isAllowedHost(embedUrl.hostname, ['youtube.com', 'youtube-nocookie.com']) && embedUrl.pathname.startsWith('/embed/')) {
        const videoId = embedUrl.pathname.slice('/embed/'.length).split('/', 1)[0];
        if (videoId) {
            return `https://www.youtube.com/watch?v=${videoId}`;
        }
    }
    if (isAllowedHost(embedUrl.hostname, ['fast.wistia.net', 'fast.wistia.com']) && embedUrl.pathname.startsWith('/embed/iframe/')) {
        return `${embedUrl.origin}${embedUrl.pathname}`;
    }
    return embedUrl.href;
};

const cleanIframes = ($: CheerioAPI, $content: Cheerio<Element>, articleUrl: string): void => {
    $content.find('iframe').each((_, el) => {
        const $iframe = $(el);
        const src = $iframe.attr('src')?.trim();
        const title = $iframe.attr('title')?.trim();

        if (!src && $iframe.attr('srcdoc') !== undefined) {
            $iframe.replaceWith(renderInteractiveNotice(articleUrl, title));
            return;
        }

        const parsed = src ? URL.parse(src, SIERRA_ORIGIN) : null;
        if (!parsed || parsed.protocol !== 'https:' || !isAllowedHost(parsed.hostname, EMBED_HOST_ALLOWLIST)) {
            $iframe.remove();
            return;
        }

        $iframe.replaceWith(renderEmbed(parsed.href, resolveEmbedWatchUrl(parsed), title));
    });
};

const stripUtilityAttributes = ($: CheerioAPI, $content: Cheerio<Element>): void => {
    $content.find('script, style, noscript, template, svg, form').remove();
    $content.find('*').each((_, el) => {
        const $el = $(el);
        $el.removeAttr('class');
        $el.removeAttr('style');
        const attribs = 'attribs' in el ? el.attribs : undefined;
        if (!attribs) {
            return;
        }
        for (const attrName of Object.keys(attribs)) {
            if (attrName.startsWith('data-')) {
                $el.removeAttr(attrName);
            }
        }
    });
};

const extractMainColumn = ($: CheerioAPI): Cheerio<Element> | undefined => {
    const grid = $('article').first().children().eq(1).children().eq(0);
    if (grid.length === 0) {
        return undefined;
    }
    const mainColumn = grid.children().length > 1 ? grid.children().eq(1) : grid.children().eq(0);
    if (mainColumn.length === 0 || !mainColumn.html()?.trim()) {
        return undefined;
    }
    return mainColumn;
};

const parseArticlePage = (html: string, entry: RssEntry): ParsedArticleDetails => {
    const $ = load(html);
    const ldNode = findArticleLdNode($);
    const ogImage = unwrapCdnImageUrl($('meta[property="og:image"]').attr('content'));
    const ldImage = extractLdImageUrl(ldNode);
    const ldAuthors = extractLdAuthors(ldNode);
    const videos = extractResponsiveVideos($);

    const $content = extractMainColumn($);
    if (!$content) {
        return {
            description: renderFallbackDescription(entry.excerpt),
            pubDateRaw: ldNode?.datePublished,
            image: ogImage ?? ldImage,
            author: ldAuthors,
        };
    }

    cleanButtons($, $content);
    replaceResponsiveVideoSlots($, $content, videos);
    cleanIframes($, $content, entry.link);
    replaceWistiaPosters($, $content);
    normalizeImages($, $content);
    stripUtilityAttributes($, $content);

    const firstBodyImage = unwrapCdnImageUrl($content.find('img').first().attr('src'));
    const cleanedHtml = $content.html()?.trim() ?? '';

    return {
        description: cleanedHtml || renderFallbackDescription(entry.excerpt),
        pubDateRaw: ldNode?.datePublished,
        image: ogImage ?? ldImage ?? firstBodyImage,
        author: ldAuthors,
    };
};

const resolveItemAuthor = (detailsAuthor: DataItem['author'] | undefined, rssAuthorRaw: string): DataItem['author'] | undefined => {
    if (detailsAuthor) {
        return detailsAuthor;
    }
    if (!rssAuthorRaw) {
        return undefined;
    }
    const names = rssAuthorRaw
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
    return names.length > 0 ? names.map((name) => ({ name })) : undefined;
};

const fetchArticleDetails = (entry: RssEntry): Promise<ParsedArticleDetails> =>
    cache.tryGet(`sierra:blog:${entry.link}`, async () => {
        const html = await ofetch(entry.link, { responseType: 'text' });
        return parseArticlePage(html, entry);
    }) as Promise<ParsedArticleDetails>;

const handler = async (ctx: Context): Promise<Data> => {
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const rssXml = await ofetch(RSS_URL, { responseType: 'text' });
    const entries = parseRssFeed(rssXml, limit);

    const detailsList = await pMap(entries, (entry) => fetchArticleDetails(entry), { concurrency: DETAIL_CONCURRENCY });

    const items: DataItem[] = entries.map((entry, idx) => {
        const details = detailsList[idx];
        const pubDateSource = entry.pubDateRaw || details.pubDateRaw;
        return {
            title: entry.title,
            link: entry.link,
            pubDate: pubDateSource ? parseDate(pubDateSource) : undefined,
            author: resolveItemAuthor(details.author, entry.authorRaw),
            description: details.description,
            image: details.image,
        };
    });

    return {
        title: 'Sierra Blog',
        link: `${SIERRA_ORIGIN}/blog`,
        description: 'News, product updates, engineering deep dives, and customer stories from Sierra.',
        language: 'en',
        item: items,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'sierra.ai/blog',
    categories: ['programming'],
    example: '/sierra/blog',
    parameters: {},
    maintainers: ['ljh12138164'],
    description: 'Full-text news, product updates, engineering deep dives, and customer stories from the official Sierra blog via its RSS feed.',
    zh: {
        name: '博客',
        description: '通过官方 RSS 获取 Sierra 博客的产品更新、工程实践与客户案例全文。',
    },
    radar: [
        {
            source: ['sierra.ai/blog', 'sierra.ai/blog/:slug', 'sierra.ai/rss.xml'],
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
    },
    view: ViewType.Articles,
    handler,
};
