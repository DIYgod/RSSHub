import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

export const SITE_URL = 'https://80.lv';
export const API_BASE_URL = 'https://80.lv/api/articles';
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const DETAIL_CONCURRENCY = 5;

export const CATEGORY_OPTIONS = [
    { slug: 'all', name: 'All Articles' },
    { slug: 'news', name: 'News' },
    { slug: 'interview', name: 'Interviews' },
    { slug: 'game-development', name: 'Game Development' },
    { slug: 'gamedev', name: 'Gamedev' },
    { slug: 'environment-art', name: 'Environment Art' },
    { slug: 'character-art', name: 'Character Art' },
    { slug: 'vfx', name: 'VFX' },
    { slug: 'props', name: 'Props' },
    { slug: 'animation', name: 'Animation' },
    { slug: 'materials', name: 'Materials' },
    { slug: 'tech', name: 'Tech' },
    { slug: 'events', name: 'Events' },
    { slug: 'digest', name: 'Digest' },
    { slug: 'feature', name: 'Feature' },
    { slug: 'marketplace', name: 'Marketplace' },
    { slug: 'game-biz-institute', name: 'GBI' },
    { slug: '80-level-china', name: '80 Level China' },
] as const;

export const CATEGORY_NAME_MAP = new Map<string, string>(CATEGORY_OPTIONS.map((item) => [item.slug, item.name]));

export interface ImageUrls {
    original?: string;
    src?: string;
    src2x?: string;
}

interface ArticleTag {
    name?: string;
    is_category?: boolean;
    slug?: string;
}

interface ArticlePerson {
    name?: string;
    pseudonym?: string;
    position?: string | null;
    city?: string | null;
    avatar?: ImageUrls;
}

export interface ArticleListItem {
    id: number;
    slug: string;
    title: string;
    description?: string;
    date?: string;
    isChineseArticle?: boolean;
    author?: ArticlePerson;
    image?: ImageUrls;
    preview?: ImageUrls;
    tags?: ArticleTag[];
}

export interface ArticleListResponse {
    total?: number;
    items?: ArticleListItem[];
}

export interface ArticleImageWrapper {
    id?: number;
    url?: ImageUrls | string;
}

export interface ArticleBlockContent {
    text?: string;
    description?: string;
    isQuote?: boolean;
    size?: string;
    url?: string;
    isLink?: boolean;
    value?: string;
    language?: string;
    code?: string;
    title?: string;
    name?: string;
    position?: string;
    city?: string;
    avatar?: ArticleImageWrapper;
    image?: ArticleImageWrapper;
    images?: Array<ArticleImageWrapper & ImageUrls>;
}

export interface ArticleBlock {
    id?: number;
    type: string;
    content?: ArticleBlockContent | ArticleBlock[];
}

interface ArticleMetaEntry {
    content?: string;
}

interface ArticleMeta {
    'article-article:published_time'?: ArticleMetaEntry;
    'article-article:modified_time'?: ArticleMetaEntry;
    'og-og:image'?: ArticleMetaEntry;
}

interface ArticleAside {
    author?: ArticlePerson;
    interviewer?: ArticlePerson;
    date?: string;
    tags?: ArticleTag[];
}

export interface ArticleDetail {
    id?: number;
    title?: string;
    subtitle?: string;
    image?: ImageUrls | string;
    description?: string;
    content?: ArticleBlock[];
    iframe_url?: string;
    aside?: ArticleAside;
    meta?: ArticleMeta;
}

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const SAFE_HTTP_PROTOCOLS = new Set(['http:', 'https:']);

const parseUrlWithProtocols = (raw: string | undefined, protocols: Set<string>): string | undefined => {
    const trimmed = raw?.trim();
    if (!trimmed) {
        return undefined;
    }
    try {
        const parsed = new URL(trimmed, SITE_URL);
        return protocols.has(parsed.protocol) ? parsed.href : undefined;
    } catch {
        return undefined;
    }
};

export const resolveSafeUrl = (raw?: string): string | undefined => parseUrlWithProtocols(raw, SAFE_LINK_PROTOCOLS);

export const resolveHttpUrl = (raw?: string): string | undefined => parseUrlWithProtocols(raw, SAFE_HTTP_PROTOCOLS);

export const isHostnameOrSubdomain = (hostname: string, domain: string): boolean => hostname === domain || hostname.endsWith(`.${domain}`);

export const pickImageUrl = (source?: ImageUrls | ArticleImageWrapper | string): string | undefined => {
    if (!source) {
        return undefined;
    }
    if (typeof source === 'string') {
        return resolveHttpUrl(source);
    }
    if ('url' in source && source.url) {
        return pickImageUrl(source.url);
    }
    const candidate = (source as ImageUrls).original || (source as ImageUrls).src2x || (source as ImageUrls).src;
    return resolveHttpUrl(candidate);
};

export const extractPlainText = (rawHtml?: string): string => {
    if (!rawHtml) {
        return '';
    }
    return load(rawHtml, null, false).text().replaceAll(/\s+/g, ' ').trim().toLowerCase();
};

const NON_EMPTY_MEDIA_SELECTOR = 'img, iframe, video, audio, pre, table, blockquote, svg, hr';
const IMAGE_SRC_ATTRS = ['src', 'data-src', 'data-lazy-src', 'data-original'] as const;

const pickSafeSrcAttr = ($el: Cheerio<Element>, attrs: readonly string[]): string | undefined => {
    for (const attr of attrs) {
        const candidate = resolveHttpUrl($el.attr(attr));
        if (candidate) {
            return candidate;
        }
    }
    return undefined;
};

const sanitizeMediaElements = ($: CheerioAPI) => {
    $('img').each((_, el) => {
        const $el = $(el);
        const safeSrc = pickSafeSrcAttr($el, IMAGE_SRC_ATTRS);
        if (!safeSrc) {
            $el.remove();
            return;
        }
        $el.attr('src', safeSrc);
    });

    $('iframe, source').each((_, el) => {
        const $el = $(el);
        const safeSrc = pickSafeSrcAttr($el, ['src', 'data-src']);
        if (!safeSrc) {
            $el.remove();
            return;
        }
        $el.attr('src', safeSrc);
    });

    $('video, audio').each((_, el) => {
        const $el = $(el);
        const safeSrc = pickSafeSrcAttr($el, ['src', 'data-src']);
        if (safeSrc) {
            $el.attr('src', safeSrc);
        } else {
            $el.removeAttr('src');
        }
        const safePoster = resolveHttpUrl($el.attr('poster'));
        if (safePoster) {
            $el.attr('poster', safePoster);
        } else {
            $el.removeAttr('poster');
        }
        if (!safeSrc && $('source[src]', el).length === 0) {
            $el.remove();
        }
    });
};

export const sanitizeRichHtml = (rawHtml?: string): string => {
    if (!rawHtml) {
        return '';
    }
    const $ = load(rawHtml, null, false);
    $('script, style, ins, .ad-unit, .ecom-root, [data-pogo], [data-google-query-id]').remove();

    $('a').each((_, el) => {
        const $el = $(el);
        const safeHref = resolveSafeUrl($el.attr('href'));
        if (safeHref) {
            $el.attr('href', safeHref);
            return;
        }
        $el.replaceWith($el.contents());
    });

    sanitizeMediaElements($);

    $('p, div').each((_, el) => {
        const $el = $(el);
        const hasText = $el.text().replaceAll('\u{A0}', '').trim().length > 0;
        if (!hasText && $(NON_EMPTY_MEDIA_SELECTOR, el).length === 0) {
            $el.remove();
        }
    });

    return $.html().trim();
};
