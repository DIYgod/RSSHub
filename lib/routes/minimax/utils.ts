import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { renderArticleVideo } from './templates/description';

export const DETAIL_CONCURRENCY = 5;
export const DEFAULT_LIMIT = 20;

export interface LocaleConfig {
    langKey: 'zh-CN' | 'en';
    baseUrl: string;
    apiLocale: 'zh' | 'en';
    feedLanguage: 'zh-CN' | 'en';
    titleSuffix: string;
}

const LOCALE_CONFIGS = {
    zh: {
        langKey: 'zh-CN',
        baseUrl: 'https://www.minimax.cn',
        apiLocale: 'zh',
        feedLanguage: 'zh-CN',
        titleSuffix: 'zh-CN',
    },
    en: {
        langKey: 'en',
        baseUrl: 'https://www.minimax.io',
        apiLocale: 'en',
        feedLanguage: 'en',
        titleSuffix: 'en',
    },
} as const satisfies Record<'zh' | 'en', LocaleConfig>;

export const LANG_PARAM_EN = {
    description: 'Site language edition (`en` for `minimax.io`, `zh-CN` for `minimax.cn`).',
    default: 'en',
    options: [
        { value: 'en', label: 'English (minimax.io)' },
        { value: 'zh-CN', label: '中文 (minimax.cn)' },
    ],
};

export const LANG_PARAM_ZH = {
    description: '站点语言版本（默认 `en` 对应英文站 `minimax.io`，`zh-CN` 对应中文站 `minimax.cn`）。',
    default: 'en',
    options: [
        { value: 'en', label: 'English (minimax.io)' },
        { value: 'zh-CN', label: '中文 (minimax.cn)' },
    ],
};

export const resolveLocaleConfig = (langParam?: string): LocaleConfig => {
    const normalized = (langParam || 'en').toLowerCase();
    if (normalized === 'zh-cn' || normalized === 'zh') {
        return LOCALE_CONFIGS.zh;
    }
    if (normalized === 'en' || normalized === 'en-us') {
        return LOCALE_CONFIGS.en;
    }
    throw new InvalidParameterError(`Unsupported language parameter "${langParam}". Expected "en" or "zh-CN".`);
};

export const fetchHtml = (url: string) => ofetch<string>(url);

export const resolveAbsoluteUrl = (rawUrl: string | undefined, baseUrl: string): string | undefined => {
    const trimmed = rawUrl?.trim();
    if (!trimmed) {
        return undefined;
    }
    try {
        const parsed = new URL(trimmed, baseUrl);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed.href;
        }
    } catch {
        return undefined;
    }
    return undefined;
};

export const unwrapNextImageUrl = (rawUrl: string | undefined, baseUrl: string): string | undefined => {
    const absolute = resolveAbsoluteUrl(rawUrl, baseUrl);
    if (!absolute) {
        return undefined;
    }
    try {
        const parsed = new URL(absolute);
        if (parsed.pathname === '/_next/image') {
            const inner = parsed.searchParams.get('url');
            if (inner) {
                return resolveAbsoluteUrl(inner, baseUrl) ?? absolute;
            }
        }
        return parsed.href;
    } catch {
        return absolute;
    }
};

export const toValidDate = (value: string | number | undefined): Temporal.Instant | undefined => {
    if (value === undefined || value === '') {
        return undefined;
    }
    return parseDate(value);
};

interface RscVideoCandidate {
    type?: string;
    props?: {
        src?: string;
    };
}

const isRecordObject = (value: unknown): value is RscVideoCandidate => Boolean(value && typeof value === 'object');

const readArticleVideoSrc = (candidate: RscVideoCandidate): string | undefined => (candidate.type === 'ArticleVideo' && typeof candidate.props?.src === 'string' ? candidate.props.src : undefined);

const collectRscRowArticleVideos = (rowBody: string, urls: string[]) => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(rowBody);
    } catch {
        return;
    }
    const stack: unknown[] = [parsed];
    while (stack.length > 0) {
        const current = stack.pop();
        if (!isRecordObject(current)) {
            continue;
        }
        if (Array.isArray(current)) {
            stack.push(...current);
            continue;
        }
        const videoSrc = readArticleVideoSrc(current);
        if (videoSrc) {
            urls.push(videoSrc);
        }
        stack.push(...Object.values(current));
    }
};

const collectNextFChunks = ($: CheerioAPI): string => {
    const chunks: string[] = [];
    $('script').each((_, el) => {
        const text = $(el).text();
        if (!text.includes('__next_f')) {
            return;
        }
        for (const match of text.matchAll(/self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)/g)) {
            try {
                const decoded = JSON.parse(match[1]);
                if (typeof decoded === 'string') {
                    chunks.push(decoded);
                }
            } catch {
                // Ignore malformed RSC flight chunks
            }
        }
    });
    return chunks.join('');
};

const advanceNextFRow = (buf: Buffer, pos: number, urls: string[]): number => {
    const colonIdx = buf.indexOf(0x3a, pos);
    if (colonIdx === -1) {
        return -1;
    }
    const prefix = buf.subarray(colonIdx + 1, colonIdx + 24).toString('utf8');
    const textFrame = /^T([0-9a-f]+),/.exec(prefix);
    if (textFrame) {
        const nextPos = colonIdx + 1 + textFrame[0].length + Number.parseInt(textFrame[1], 16);
        return Number.isFinite(nextPos) && nextPos > pos ? nextPos : -1;
    }
    const newlineIdx = buf.indexOf(0x0a, colonIdx + 1);
    const endIdx = newlineIdx === -1 ? buf.length : newlineIdx;
    const rowBody = buf.subarray(colonIdx + 1, endIdx).toString('utf8');
    if (rowBody.startsWith('[') || rowBody.startsWith('{')) {
        collectRscRowArticleVideos(rowBody, urls);
    }
    return newlineIdx === -1 ? buf.length : newlineIdx + 1;
};

export const extractRscVideoUrls = ($: CheerioAPI, baseUrl: string): string[] => {
    const combined = collectNextFChunks($);
    if (!combined.includes('ArticleVideo')) {
        return [];
    }

    const rawUrls: string[] = [];
    // Parse Next.js RSC Flight stream: T<hexLen>, rows carry byte-counted raw text with no trailing newline
    const buf = Buffer.from(combined, 'utf8');
    let pos = 0;
    while (pos !== -1 && pos < buf.length) {
        pos = advanceNextFRow(buf, pos, rawUrls);
    }

    return rawUrls.map((u) => resolveAbsoluteUrl(u, baseUrl)).filter((u): u is string => Boolean(u));
};

export const normalizeRichContent = ($root: Cheerio<Element>, $: CheerioAPI, baseUrl: string, rscVideoUrls: string[] = []): string => {
    $root.find('script, style, noscript').remove();

    // Remove visual CSS glyph layer from KaTeX blocks while keeping accessible MathML
    $root.find('.katex').each((_, el) => {
        const $katex = $(el);
        if ($katex.find('.katex-mathml').length > 0) {
            $katex.find('.katex-html').remove();
        }
    });

    // Replace legacy CSR video player placeholders with native <video> elements
    let videoIndex = 0;
    $root
        .find('.cursor-pointer')
        .filter((_, el) => $(el).find('img[alt="icon"]').length > 0 && $(el).text().includes('00:00'))
        .each((_, el) => {
            const videoUrl = rscVideoUrls[videoIndex];
            videoIndex += 1;
            const $container = $(el).parent();
            const $target = $container.length > 0 && $container[0] !== $root[0] && $container.children().length === 1 ? $container : $(el);
            if (videoUrl) {
                $target.replaceWith(renderArticleVideo(videoUrl));
            } else {
                $target.remove();
            }
        });

    $root.find('img').each((_, el) => {
        const $img = $(el);
        const resolved = unwrapNextImageUrl($img.attr('src') || $img.attr('data-src'), baseUrl);
        if (resolved) {
            $img.attr('src', resolved);
        }
        $img.removeAttr('srcset').removeAttr('sizes').removeAttr('data-nimg').removeAttr('decoding').removeAttr('fetchpriority');
        const style = $img.attr('style');
        if (style?.includes('position:absolute')) {
            $img.removeAttr('style');
        }
    });

    $root.find('video, audio, source').each((_, el) => {
        const $el = $(el);
        const resolvedSrc = resolveAbsoluteUrl($el.attr('src'), baseUrl);
        if (resolvedSrc) {
            $el.attr('src', resolvedSrc);
        }
        const resolvedPoster = resolveAbsoluteUrl($el.attr('poster'), baseUrl);
        if (resolvedPoster) {
            $el.attr('poster', resolvedPoster);
        }
    });

    $root.find('a[href]').each((_, el) => {
        const $link = $(el);
        const href = $link.attr('href')?.trim();
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }
        const resolvedHref = resolveAbsoluteUrl(href, baseUrl);
        if (resolvedHref) {
            $link.attr('href', resolvedHref);
        }
    });

    $root
        .children('div')
        .filter((_, el) => {
            const $el = $(el);
            return !$el.text().trim() && $el.find('img, video, audio, table, iframe, svg, math').length === 0;
        })
        .remove();

    return $root.html() || '';
};

export const hasRenderableContent = (html: string): boolean => {
    if (!html) {
        return false;
    }
    const $ = load(html, null, false);
    return Boolean($.text().trim()) || $('img, video, audio, table, iframe, svg, math').length > 0;
};
