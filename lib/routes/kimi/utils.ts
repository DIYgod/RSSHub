import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { ChildNode, Element } from 'domhandler';

import MarkdownIt from '@/utils/markdown-it';
import { parseDate } from '@/utils/time';

const markdownRenderer = MarkdownIt({ html: false, linkify: true });

export const SITE_URL = 'https://www.kimi.com';
export const BLOG_LIST_URL = `${SITE_URL}/en/blog/`;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const DETAIL_CONCURRENCY = 5;

export type EntrySourceKind = 'kimi' | 'github' | 'huggingface' | 'github-pages' | 'external';

interface BlogListItem {
    id?: string;
    title?: string;
    description?: string;
    image?: string;
    href?: string;
    date?: string;
}

interface ArticleListPayload {
    items?: BlogListItem[];
}

export interface ParsedBlogEntry {
    title: string;
    link: string;
    summary: string;
    image?: string;
    pubDate?: Temporal.Instant;
    kind: EntrySourceKind;
}

const SAFE_HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const MEDIA_KEEP_SELECTOR = 'img, video, audio, table, iframe, svg, math, pre, code';
const DECORATIVE_VIEWBOXES = new Set(['0 0 16 16', '0 0 23 24']);

const isHostnameOrSubdomain = (hostname: string, domain: string): boolean => hostname === domain || hostname.endsWith(`.${domain}`);

const parseSafeUrl = (rawUrl: string | undefined, baseUrl: string, protocols: Set<string>): string | undefined => {
    const trimmed = rawUrl?.trim();
    if (!trimmed) {
        return undefined;
    }
    try {
        const parsed = new URL(trimmed, baseUrl);
        return protocols.has(parsed.protocol) ? parsed.href : undefined;
    } catch {
        return undefined;
    }
};

const resolveHttpUrl = (rawUrl: string | undefined, baseUrl = SITE_URL): string | undefined => parseSafeUrl(rawUrl, baseUrl, SAFE_HTTP_PROTOCOLS);

const unwrapImageUrl = (rawUrl: string | undefined, baseUrl = SITE_URL): string | undefined => {
    const absolute = resolveHttpUrl(rawUrl, baseUrl);
    if (!absolute) {
        return undefined;
    }
    try {
        const parsed = new URL(absolute);
        if (parsed.pathname === '/_next/image') {
            const inner = parsed.searchParams.get('url');
            if (inner) {
                return resolveHttpUrl(inner, baseUrl) ?? absolute;
            }
        }
        return parsed.href;
    } catch {
        return absolute;
    }
};

const classifySourceKind = (urlStr: string): EntrySourceKind => {
    const hostname = new URL(urlStr).hostname.toLowerCase();
    if (isHostnameOrSubdomain(hostname, 'kimi.com') || isHostnameOrSubdomain(hostname, 'kimi.ai')) {
        return 'kimi';
    }
    if (hostname === 'github.com') {
        return 'github';
    }
    if (hostname === 'huggingface.co') {
        return 'huggingface';
    }
    if (hostname === 'moonshotai.github.io') {
        return 'github-pages';
    }
    return 'external';
};

const findBalancedJsonObject = (text: string, markerPos: number): string | undefined => {
    const objStart = text.indexOf('{', markerPos);
    if (objStart === -1) {
        return undefined;
    }
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = objStart; i < text.length; i++) {
        const ch = text[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === '\\') {
            escaped = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString) {
            continue;
        }
        if (ch === '{') {
            depth++;
        } else if (ch === '}') {
            depth--;
            if (depth === 0) {
                return text.slice(objStart, i + 1);
            }
        }
    }
    return undefined;
};

const extractNextFlightChunks = ($: CheerioAPI): string[] => {
    const chunks: string[] = [];
    $('script').each((_, el) => {
        const text = $(el).text();
        if (!text.includes('__next_f')) {
            return;
        }
        for (const match of text.matchAll(/self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)/g)) {
            try {
                const decoded = JSON.parse(match[1]) as string;
                if (typeof decoded === 'string') {
                    chunks.push(decoded);
                }
            } catch {
                // Ignore malformed RSC flight chunks
            }
        }
    });
    return chunks;
};

const parseArticleListPayload = ($: CheerioAPI): BlogListItem[] => {
    const combinedStream = extractNextFlightChunks($).join('');
    let searchFrom = 0;
    while (searchFrom < combinedStream.length) {
        const marker = combinedStream.indexOf('"articleList":', searchFrom);
        if (marker === -1) {
            break;
        }
        searchFrom = marker + '"articleList":'.length;
        const rawJson = findBalancedJsonObject(combinedStream, marker);
        if (!rawJson) {
            continue;
        }
        try {
            const payload = JSON.parse(rawJson) as ArticleListPayload;
            if (Array.isArray(payload.items) && payload.items.length > 0) {
                return payload.items;
            }
        } catch {
            // Try any subsequent articleList markers in the combined Flight stream
        }
    }
    return [];
};

const extractFallbackDomItems = ($: CheerioAPI): BlogListItem[] => {
    const fallbackItems: BlogListItem[] = [];
    $('main a[href*="/blog/"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href')?.trim();
        const title = $el.text().replaceAll(/\s+/g, ' ');
        if (!href || href === '/en/blog/' || href === '/blog/' || !title) {
            return;
        }
        fallbackItems.push({
            href,
            title,
            image: $el.find('img').attr('src'),
        });
    });
    return fallbackItems;
};

export const extractBlogEntries = (html: string): ParsedBlogEntry[] => {
    const $ = load(html);
    const flightItems = parseArticleListPayload($);
    const rawItems = flightItems.length > 0 ? flightItems : extractFallbackDomItems($);

    const seenLinks = new Set<string>();
    const entries: ParsedBlogEntry[] = [];
    for (const item of rawItems) {
        const link = resolveHttpUrl(item.href, SITE_URL);
        if (!link || !item.title || seenLinks.has(link)) {
            continue;
        }
        seenLinks.add(link);
        entries.push({
            title: item.title,
            link,
            summary: item.description?.trim() ?? '',
            image: unwrapImageUrl(item.image, SITE_URL),
            pubDate: item.date ? parseDate(item.date, 8) : undefined,
            kind: classifySourceKind(link),
        });
    }
    return entries;
};

const removeSuspenseFallbackSiblings = (tpl: Element, $: CheerioAPI) => {
    let cursor: ChildNode | null = tpl.nextSibling;
    while (cursor) {
        const nextNode: ChildNode | null = cursor.nextSibling;
        if (cursor.type === 'comment' && cursor.data?.trim() === '/$') {
            $(cursor).remove();
            break;
        }
        $(cursor).remove();
        cursor = nextNode;
    }
};

const tryHydrateSingleSlot = ($: CheerioAPI, resolvedIds: Set<string>): boolean => {
    for (const tpl of $('template[id^="B:"]').toArray()) {
        const id = $(tpl).attr('id');
        if (!id || resolvedIds.has(id)) {
            continue;
        }
        const $slot = $(`div[id="S:${id.slice(2)}"]`).first();
        if ($slot.length === 0) {
            continue;
        }
        resolvedIds.add(id);
        removeSuspenseFallbackSiblings(tpl, $);
        $(tpl).replaceWith($slot.contents());
        $slot.remove();
        return true;
    }
    return false;
};

export const hydrateNextSuspenseSlots = ($: CheerioAPI) => {
    const resolvedIds = new Set<string>();
    while (tryHydrateSingleSlot($, resolvedIds)) {
        // Re-scan after each replacement so nested Suspense templates hydrate safely
    }
};

const convertCustomMarkdownAndLatex = ($root: Cheerio<Element>, $: CheerioAPI, baseUrl: string) => {
    $root.find('markdown').each((_, el) => {
        const $el = $(el);
        const src = resolveHttpUrl($el.attr('src'), baseUrl);
        if (src) {
            const $anchor = $('<a>').attr('href', src).text(src);
            $el.replaceWith($('<p>').append($anchor));
            return;
        }
        const rawText = $el.text().trim();
        $el.replaceWith(rawText ? markdownRenderer.render(rawText) : '');
    });

    $root.find('latex-inline').each((_, el) => {
        const $el = $(el);
        const text = $el.text().trim();
        $el.replaceWith(text ? $('<code>').text(text) : '');
    });

    $root.find('latex').each((_, el) => {
        const $el = $(el);
        const text = $el.text().trim();
        $el.replaceWith(text ? $('<pre>').append($('<code>').text(text)) : '');
    });
};

const pruneChromeAndDuplicates = ($root: Cheerio<Element>, $: CheerioAPI) => {
    $root.find('h1, nav, header, footer, button, script, style, noscript, template, #toc-popup, #toc-btn, .toc, .floating-cta-root, [class*="BlogV2MiniNav"], [class*="animate-pulse"], .katex-html, a.anchor, img#banner').remove();

    $root.find('img').each((_, img) => {
        const cls = $(img).attr('class') || '';
        if (cls.includes('hidden!') && cls.includes('dark:block!')) {
            $(img).remove();
        }
    });

    $root.find('svg').each((_, svg) => {
        const $svg = $(svg);
        const cls = $svg.attr('class') || '';
        const viewBox = $svg.attr('viewBox') || '';
        if (cls.includes('quoteIcon') || DECORATIVE_VIEWBOXES.has(viewBox)) {
            $svg.remove();
        }
    });
};

const sanitizeLinksAndMedia = ($root: Cheerio<Element>, $: CheerioAPI, baseUrl: string) => {
    $root.find('[node]').removeAttr('node');
    $root
        .find('[style]')
        .filter((_, el) => $(el).closest('svg').length === 0)
        .removeAttr('style');

    $root.find('img').each((_, el) => {
        const $img = $(el);
        const resolved = unwrapImageUrl($img.attr('src') || $img.attr('data-src'), baseUrl);
        if (!resolved) {
            $img.remove();
            return;
        }
        $img.attr('src', resolved);
        $img.removeAttr('srcset').removeAttr('sizes').removeAttr('data-nimg').removeAttr('decoding').removeAttr('fetchpriority');
    });

    $root.find('video, audio').each((_, el) => {
        const $media = $(el);
        if (el.tagName === 'video' && $media.attr('controls') === undefined) {
            $media.attr('controls', '');
        }
        const src = resolveHttpUrl($media.attr('src'), baseUrl);
        if (src) {
            $media.attr('src', src);
        } else {
            $media.removeAttr('src');
        }
        const poster = resolveHttpUrl($media.attr('poster'), baseUrl);
        if (poster) {
            $media.attr('poster', poster);
        }
        if (!src && $media.find('source[src]').length === 0) {
            $media.remove();
        }
    });

    $root.find('source').each((_, el) => {
        const $src = $(el);
        const resolved = resolveHttpUrl($src.attr('src'), baseUrl);
        if (resolved) {
            $src.attr('src', resolved);
        } else {
            $src.remove();
        }
    });

    $root.find('a[href]').each((_, el) => {
        const $a = $(el);
        const href = $a.attr('href')?.trim();
        if (!href || href.startsWith('#')) {
            return;
        }
        const safeHref = parseSafeUrl(href, baseUrl, SAFE_LINK_PROTOCOLS);
        if (safeHref) {
            $a.attr('href', safeHref);
        } else {
            $a.replaceWith($a.contents());
        }
    });
};

const pruneEmptyContainers = ($root: Cheerio<Element>, $: CheerioAPI) => {
    $root.find('div').each((_, el) => {
        const $el = $(el);
        const hasText = $el.text().replaceAll('\u{A0}', '').trim().length > 0;
        if (!hasText && $(MEDIA_KEEP_SELECTOR, el).length === 0) {
            $el.remove();
        }
    });
};

export const normalizeContentContainer = ($container: Cheerio<Element>, $: CheerioAPI, baseUrl: string) => {
    if ($container.length === 0) {
        return { bodyHtml: '', hasContent: false };
    }
    pruneChromeAndDuplicates($container, $);
    convertCustomMarkdownAndLatex($container, $, baseUrl);
    sanitizeLinksAndMedia($container, $, baseUrl);
    pruneEmptyContainers($container, $);
    const hasContent = Boolean($container.text().trim()) || $container.find('img, video, audio, table, iframe, svg, math').length > 0;
    return { bodyHtml: ($container.html() || '').trim(), hasContent };
};
