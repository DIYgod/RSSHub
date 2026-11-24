import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { renderYoutube } from '@/routes/youtube/utils';
import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const SITE_ORIGIN = 'https://developer.chrome.com';
const SITE_HOST = 'developer.chrome.com';
const BLOG_URL = `${SITE_ORIGIN}/blog`;
const API_URL = `${SITE_ORIGIN}/_d/dynamic_content`;
const DEFAULT_LANG = 'en';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DETAIL_CONCURRENCY = 5;
const SOURCE_TIMEZONE = 'America/Los_Angeles';
const VIDEO_ID_RE = /^[\w-]{6,32}$/;
const EN_PUBLISHED_RE = /Published:\s*([a-z]+\s+\d{1,2},\s+\d{4})/i;
const EN_UPDATED_RE = /Last updated:\s*([a-z]+\s+\d{1,2},\s+\d{4})/i;
const CJK_DATE_RE = /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/g;
const CATEGORY_PREFIX_RE = /^(?:category|product|language)-/;
const EXCLUDED_TAGS = new Set(['docType-Blog', 'product-Chrome']);
const SAFE_HTTP_PROTOCOLS = new Set(['http:', 'https:']);

interface LanguageConfig {
    hl: string;
    feedLanguage: Language;
}

const SUPPORTED_LANGUAGES = new Map<string, LanguageConfig>([
    ['en', { hl: 'en', feedLanguage: 'en' }],
    ['ar', { hl: 'ar', feedLanguage: 'other' }],
    ['bn', { hl: 'bn', feedLanguage: 'other' }],
    ['de', { hl: 'de', feedLanguage: 'de' }],
    ['es-419', { hl: 'es-419', feedLanguage: 'es' }],
    ['es', { hl: 'es-419', feedLanguage: 'es' }],
    ['fa', { hl: 'fa', feedLanguage: 'other' }],
    ['fr', { hl: 'fr', feedLanguage: 'fr' }],
    ['he', { hl: 'he', feedLanguage: 'other' }],
    ['hi', { hl: 'hi', feedLanguage: 'hi' }],
    ['id', { hl: 'id', feedLanguage: 'id' }],
    ['it', { hl: 'it', feedLanguage: 'it' }],
    ['ja', { hl: 'ja', feedLanguage: 'ja' }],
    ['ko', { hl: 'ko', feedLanguage: 'ko' }],
    ['nl', { hl: 'nl', feedLanguage: 'nl' }],
    ['pl', { hl: 'pl', feedLanguage: 'pl' }],
    ['pt-br', { hl: 'pt-br', feedLanguage: 'pt-br' }],
    ['ru', { hl: 'ru', feedLanguage: 'ru' }],
    ['th', { hl: 'th', feedLanguage: 'th' }],
    ['tr', { hl: 'tr', feedLanguage: 'tr' }],
    ['vi', { hl: 'vi', feedLanguage: 'vi' }],
    ['zh-cn', { hl: 'zh-cn', feedLanguage: 'zh-CN' }],
    ['zh-tw', { hl: 'zh-tw', feedLanguage: 'zh-TW' }],
]);
const SUPPORTED_LANG_LIST = SUPPORTED_LANGUAGES.keys().toArray().join(', ');

type DynamicContentCell = string | number | boolean | null | DynamicContentCell[];
type DynamicContentRow = DynamicContentCell[];
type DynamicContentResponse = [DynamicContentRow[]?, number?];

interface ParsedApiEntry {
    title: string;
    link: string;
    summary: string;
    thumbnail?: string;
    revision?: number;
    apiDate?: Temporal.Instant;
    apiAuthors: string[];
    category?: string[];
}

interface ArticleDetail {
    description: string;
    image?: string;
    authors: string[];
    publishedIso?: string;
    updatedIso?: string;
}

const normalizeText = (value: string | undefined): string => value?.replaceAll(/\s+/g, ' ').trim() ?? '';

const asString = (cell: DynamicContentCell | undefined): string | undefined => (typeof cell === 'string' ? cell : undefined);

const asStringList = (cell: DynamicContentCell | undefined): string[] => (Array.isArray(cell) ? cell.filter((item): item is string => typeof item === 'string') : []);

const asEpochSeconds = (cell: DynamicContentCell | undefined): number | undefined => {
    if (!Array.isArray(cell)) {
        return undefined;
    }
    const first = cell[0];
    return typeof first === 'number' && !Number.isNaN(first) && first > 0 ? first : undefined;
};

const resolveHttpUrl = (rawUrl: string | undefined, baseUrl: string): string | undefined => {
    const trimmed = rawUrl?.trim();
    if (!trimmed) {
        return undefined;
    }
    const parsed = URL.parse(trimmed, baseUrl);
    return parsed && SAFE_HTTP_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
};

const resolveBlogUrl = (rawUrl: string | undefined): string | undefined => {
    const resolved = resolveHttpUrl(rawUrl, SITE_ORIGIN);
    if (!resolved) {
        return undefined;
    }
    const parsed = URL.parse(resolved);
    return parsed && parsed.hostname === SITE_HOST ? parsed.href : undefined;
};

const splitAuthorCandidates = (candidates: string[]): string[] =>
    candidates.flatMap((candidate) =>
        candidate
            .split(',')
            .map((part) => normalizeText(part))
            .filter(Boolean)
    );

const extractCategories = (rawTags: string[]): string[] | undefined => {
    const cleaned = rawTags
        .filter((tag) => !EXCLUDED_TAGS.has(tag))
        .map((tag) => normalizeText(tag.replace(CATEGORY_PREFIX_RE, '')))
        .filter(Boolean);
    const unique = [...new Set(cleaned)];
    return unique.length > 0 ? unique : undefined;
};

const toParsedApiEntry = (row: DynamicContentRow): ParsedApiEntry | undefined => {
    const title = asString(row[0]);
    const link = resolveBlogUrl(asString(row[6]));
    if (!title || !link) {
        return undefined;
    }

    const epochSeconds = asEpochSeconds(row[5]);
    const rawAuthorList = asStringList(row[16]);
    const rawAuthorText = asString(row[17]);
    const apiAuthors = splitAuthorCandidates(rawAuthorList.length > 0 ? rawAuthorList : rawAuthorText ? [rawAuthorText] : []);

    return {
        title,
        link,
        summary: normalizeText(asString(row[4])),
        thumbnail: resolveHttpUrl(asString(row[3]), SITE_ORIGIN),
        revision: epochSeconds,
        apiDate: epochSeconds ? parseDate(epochSeconds, 'X') : undefined,
        apiAuthors,
        category: extractCategories(asStringList(row[23])),
    };
};

const parseDynamicContentRows = (rawResponse: string, limit: number): ParsedApiEntry[] => {
    const jsonText = rawResponse.replace(/^\)\]\}'\s*/, '');
    const parsed = JSON.parse(jsonText) as DynamicContentResponse;
    const rows = Array.isArray(parsed[0]) ? parsed[0] : [];
    const seenLinks = new Set<string>();
    const entries: ParsedApiEntry[] = [];

    for (const row of rows) {
        const entry = toParsedApiEntry(row);
        if (!entry || seenLinks.has(entry.link)) {
            continue;
        }
        seenLinks.add(entry.link);
        entries.push(entry);
        if (entries.length >= limit) {
            break;
        }
    }

    return entries;
};

const extractDomAuthors = ($: CheerioAPI, $body: Cheerio<Element>): string[] =>
    $body
        .find('.dcc-author, .wd-author')
        .toArray()
        .map((el) => normalizeText($(el).find('> div > span').first().text()))
        .filter(Boolean);

interface ParsedPubdates {
    publishedIso?: string;
    updatedIso?: string;
}

const parseCjkDate = (year: string, month: string, day: string): Temporal.Instant | undefined => parseDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`, 'YYYY-MM-DD', SOURCE_TIMEZONE);

const extractPubdates = ($body: Cheerio<Element>): ParsedPubdates => {
    const text = normalizeText($body.find('.wd-pubdates').first().text());
    if (!text) {
        return {};
    }

    const enPubMatch = EN_PUBLISHED_RE.exec(text);
    const enUpdMatch = EN_UPDATED_RE.exec(text);
    if (enPubMatch) {
        const pub = parseDate(enPubMatch[1], 'MMMM D, YYYY', SOURCE_TIMEZONE);
        const upd = enUpdMatch ? parseDate(enUpdMatch[1], 'MMMM D, YYYY', SOURCE_TIMEZONE) : undefined;
        return {
            publishedIso: pub?.toString(),
            updatedIso: upd?.toString(),
        };
    }

    const cjkMatches = text.matchAll(CJK_DATE_RE).toArray();
    if (cjkMatches.length > 0) {
        const pub = parseCjkDate(cjkMatches[0][1], cjkMatches[0][2], cjkMatches[0][3]);
        const upd = cjkMatches.length > 1 ? parseCjkDate(cjkMatches[1][1], cjkMatches[1][2], cjkMatches[1][3]) : undefined;
        return {
            publishedIso: pub?.toString(),
            updatedIso: upd?.toString(),
        };
    }

    return {};
};

const isBlankParagraph = ($node: Cheerio<Element>): boolean => $node.is('p') && normalizeText($node.text()) === '' && $node.find('img, video, audio, iframe, svg').length === 0;

const replaceDevsiteVideos = ($: CheerioAPI, $body: Cheerio<Element>): void => {
    for (const el of $body.find('devsite-video').toArray()) {
        const $el = $(el);
        const videoId = $el.attr('video-id')?.trim();
        if (videoId && VIDEO_ID_RE.test(videoId)) {
            $el.replaceWith(renderYoutube(true, videoId));
        } else {
            $el.remove();
        }
    }
};

const unwrapCustomContainers = ($: CheerioAPI, $body: Cheerio<Element>): void => {
    for (const el of $body.find('devsite-code, devsite-selector').toArray()) {
        const $el = $(el);
        $el.replaceWith($el.html() ?? '');
    }
    for (const caption of $body.find('video > figcaption').toArray()) {
        const $caption = $(caption);
        const $video = $caption.parent('video');
        if ($video.length) {
            $video.after($caption);
        }
    }
};

const stripLeadingMetadataChrome = ($body: Cheerio<Element>, entryTitle: string): void => {
    $body.find('style, script, .dcc-authors, .wd-authors, .wd-pubdates').remove();
    const expectedTitle = normalizeText(entryTitle);

    let $first = $body.children().first();
    while ($first.length && (isBlankParagraph($first) || ($first.is('h1') && normalizeText($first.text()) === expectedTitle))) {
        const $toRemove = $first;
        $first = $first.next();
        $toRemove.remove();
    }
};

const pickFirstImage = ($: CheerioAPI, $body: Cheerio<Element>, baseUrl: string): string | undefined => {
    for (const el of $body.find('img').toArray()) {
        const resolved = resolveHttpUrl($(el).attr('src'), baseUrl);
        if (resolved) {
            return resolved;
        }
    }
    return undefined;
};

const mergeAuthors = (orderedCandidates: string[]): DataItem['author'] => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const candidate of orderedCandidates) {
        const name = normalizeText(candidate);
        if (!name) {
            continue;
        }
        const key = name.toLowerCase();
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        names.push(name);
    }
    return names.length > 0 ? names.map((name) => ({ name })) : undefined;
};

const buildFallbackDetail = (entry: ParsedApiEntry): ArticleDetail => ({
    description: entry.summary ? renderToString(<p>{entry.summary}</p>) : '',
    image: entry.thumbnail,
    authors: [],
});

const fetchArticleDetail = async (entry: ParsedApiEntry, lang: string): Promise<ArticleDetail> => {
    try {
        return await cache.tryGet<ArticleDetail>(
            `chrome:blog:${lang}:${entry.link}:${entry.revision ?? 0}`,
            async () => {
                const html = await ofetch(entry.link, { responseType: 'text', publicOnly: true });
                const $ = load(html);
                const $body = $('.devsite-article-body').first();
                if (!$body.length) {
                    return buildFallbackDetail(entry);
                }

                const authors = extractDomAuthors($, $body);
                const { publishedIso, updatedIso } = extractPubdates($body);
                stripLeadingMetadataChrome($body, entry.title);
                replaceDevsiteVideos($, $body);
                unwrapCustomContainers($, $body);

                const bodyHtml = ($body.html() ?? '').trim();
                const ogImage = resolveHttpUrl($('meta[property="og:image"]').attr('content'), entry.link);
                const description = bodyHtml || (entry.summary ? renderToString(<p>{entry.summary}</p>) : '');

                return {
                    description,
                    image: pickFirstImage($, $body, entry.link) ?? entry.thumbnail ?? ogImage,
                    authors,
                    publishedIso,
                    updatedIso,
                };
            },
            config.cache.contentExpire,
            false
        );
    } catch {
        return buildFallbackDetail(entry);
    }
};

const enrichEntry = async (entry: ParsedApiEntry, lang: string): Promise<DataItem> => {
    const detail = await fetchArticleDetail(entry, lang);
    const authorCandidates = detail.authors.length > 0 ? detail.authors : entry.apiAuthors;
    const parsedPublished = detail.publishedIso ? parseDate(detail.publishedIso) : undefined;
    const parsedUpdated = detail.updatedIso ? parseDate(detail.updatedIso) : undefined;
    const hasDistinctUpdate = Boolean(parsedUpdated && (!parsedPublished || parsedUpdated.epochMilliseconds !== parsedPublished.epochMilliseconds));

    return {
        title: entry.title,
        link: entry.link,
        description: detail.description,
        pubDate: parsedPublished ?? entry.apiDate,
        updated: hasDistinctUpdate ? (entry.apiDate ?? parsedUpdated) : undefined,
        author: mergeAuthors(authorCandidates),
        category: entry.category,
        guid: entry.link,
        image: detail.image ?? entry.thumbnail,
    };
};

async function handler(ctx: Context): Promise<Data> {
    const rawLang = ctx.req.param('lang') ?? DEFAULT_LANG;
    const langConfig = SUPPORTED_LANGUAGES.get(rawLang.toLowerCase().replaceAll('_', '-'));
    if (!langConfig) {
        throw new InvalidParameterError(`Invalid language parameter. Supported codes: ${SUPPORTED_LANG_LIST}`);
    }

    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const rawResponse = await ofetch(`${API_URL}?hl=${encodeURIComponent(langConfig.hl)}`, {
        method: 'POST',
        headers: {
            'content-type': 'text/plain;charset=UTF-8',
            'x-requested-with': 'XMLHttpRequest',
        },
        body: JSON.stringify([null, null, null, 'type:blog', null, null, null, null, limit, null, null, null, 2]),
        responseType: 'text',
        publicOnly: true,
    });

    const entries = parseDynamicContentRows(rawResponse, limit);
    const items = await pMap(entries, (entry) => enrichEntry(entry, langConfig.hl), { concurrency: DETAIL_CONCURRENCY });

    return {
        title: 'Blog - Chrome for Developers',
        description: 'News, updates, and technical deep dives from the Chrome for Developers team.',
        link: langConfig.hl === DEFAULT_LANG ? BLOG_URL : `${BLOG_URL}?hl=${encodeURIComponent(langConfig.hl)}`,
        language: langConfig.feedLanguage,
        item: items,
    };
}

export const route: Route = {
    path: '/blog/:lang?',
    name: 'Blog',
    url: 'developer.chrome.com/blog',
    example: '/chrome/blog',
    categories: ['programming'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    parameters: {
        lang: {
            description: `Language code (\`hl\` parameter on \`developer.chrome.com\`, supported: ${SUPPORTED_LANG_LIST})`,
            default: DEFAULT_LANG,
        },
    },
    description:
        'Full-text articles from the Chrome for Developers Blog (`developer.chrome.com/blog`), stripping DevSite inline CSS/author header chrome and converting `<devsite-video>` embeds into standard YouTube `<iframe>` players.',
    zh: {
        name: '博客',
        parameters: {
            lang: {
                description: `语言代码（对应 \`developer.chrome.com\` 的 \`hl\` 参数，支持：${SUPPORTED_LANG_LIST}）`,
                default: DEFAULT_LANG,
            },
        },
        description: '获取 Chrome for Developers 官方博客全文（基于最新动态接口，清理头部内联样式与作者卡片，并将 `<devsite-video>` 转换为标准 YouTube `<iframe>` 播放器），支持 `:lang?` 参数（默认英文 `en`）。',
    },
    radar: [
        {
            source: ['developer.chrome.com/blog', 'developer.chrome.com/blog/:slug'],
            target: '/blog/:lang?',
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
