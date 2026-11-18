import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderFallbackDescription } from './templates/description';

const SITE_URL = 'https://developers.openai.com';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DETAIL_CONCURRENCY = 5;

const SAFE_HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const MEDIA_KEEP_SELECTOR = 'img, video, audio, source, track, table, iframe, svg, math, pre, code, hr';

const LOCALE_CONFIGS = {
    en: {
        listPath: '/blog',
        topicPrefix: '/blog/topic/',
        postPrefix: '/blog/',
        feedLanguage: 'en',
        defaultTitle: 'OpenAI Developer Blog',
        defaultDescription: 'Insights for developers building with OpenAI',
    },
    zhHans: {
        listPath: '/zh-Hans/blog',
        topicPrefix: '/zh-Hans/blog/topic/',
        postPrefix: '/zh-Hans/blog/',
        feedLanguage: 'zh-CN',
        defaultTitle: 'OpenAI 开发者博客',
        defaultDescription: '为使用 OpenAI 技术的开发者分享经验与见解',
    },
} as const;

type LocaleConfig = (typeof LOCALE_CONFIGS)[keyof typeof LOCALE_CONFIGS];

interface BlogEntry {
    title: string;
    link: string;
    summary: string;
    topic: string;
    listImage?: string;
}

const EN_LANG_CODES = new Set(['en', 'en-us']);
const ZH_LANG_CODES = new Set(['zh-hans', 'zh-cn', 'zh']);

const resolveLocaleConfig = (rawLang?: string): LocaleConfig => {
    const normalized = (rawLang || 'en').toLowerCase();
    if (EN_LANG_CODES.has(normalized)) {
        return LOCALE_CONFIGS.en;
    }
    if (ZH_LANG_CODES.has(normalized)) {
        return LOCALE_CONFIGS.zhHans;
    }
    throw new InvalidParameterError(`Unsupported language parameter "${rawLang}". Expected "en" or "zh-Hans".`);
};

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

const isBlogPostUrl = (url: string, config: LocaleConfig): boolean => {
    try {
        const parsed = new URL(url);
        return parsed.origin === SITE_URL && parsed.pathname.startsWith(config.postPrefix) && !parsed.pathname.startsWith(config.topicPrefix);
    } catch {
        return false;
    }
};

const extractListEntries = ($: CheerioAPI, listUrl: string, config: LocaleConfig, limit: number): BlogEntry[] => {
    const seen = new Set<string>();
    const entries: BlogEntry[] = [];

    $('main a.resource-item[href]').each((_, el) => {
        if (entries.length >= limit) {
            return false;
        }
        const $card = $(el);
        const link = resolveHttpUrl($card.attr('href'), listUrl);
        if (!link || seen.has(link) || !isBlogPostUrl(link, config)) {
            return;
        }
        const title = $card.find('.line-clamp-2').first().text();
        if (!title) {
            return;
        }
        seen.add(link);
        entries.push({
            title,
            link,
            summary: $card.find('p.line-clamp-3').first().text().trim(),
            topic: $card.children('div').last().text().trim(),
            listImage: resolveHttpUrl($card.find('img').first().attr('src'), listUrl),
        });
    });

    return entries;
};

const parseUtcDate = (dateText: string): Date | undefined => {
    const trimmed = dateText.trim();
    if (!trimmed) {
        return undefined;
    }
    const parsed = timezone(parseDate(trimmed, ['MMM D, YYYY', 'MMMM D, YYYY'], 'en', true), 0);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const isDynamicOgCard = (imageUrl: string): boolean => {
    try {
        return new URL(imageUrl).pathname.startsWith('/og/');
    } catch {
        return false;
    }
};

const pickCoverImage = ($: CheerioAPI, $header: Cheerio<Element>, articleUrl: string, listImage?: string): string | undefined => {
    const ogImage = resolveHttpUrl($('meta[property="og:image"]').attr('content'), articleUrl);
    if (ogImage && !isDynamicOgCard(ogImage)) {
        return ogImage;
    }
    const heroImage = resolveHttpUrl($header.next('div').find('img').first().attr('src'), articleUrl);
    return heroImage ?? listImage ?? ogImage;
};

const cleanArticleBody = ($body: Cheerio<Element>, $: CheerioAPI): string => {
    if ($body.length === 0) {
        return '';
    }

    $body.find('script, style, noscript, template, button, [role="tablist"], .exclude-from-copy, .syntax-highlighter-line-numbers, svg[aria-hidden="true"]').remove();
    $body.find('[hidden]').removeAttr('hidden');
    $body.find('.code-block.hidden').removeClass('hidden');
    $body.find('[data-panel], [role="tabpanel"], [role="region"]').removeAttr('inert').removeAttr('aria-hidden');
    $body.find('video').each((_, el) => {
        const $video = $(el);
        if ($video.attr('controls') === undefined) {
            $video.attr('controls', '');
        }
    });
    $body.find('img').each((_, el) => {
        $(el).removeAttr('loading').removeAttr('decoding').removeAttr('fetchpriority');
    });
    $body
        .find('[style]')
        .filter((_, el) => $(el).closest('svg, pre, code').length === 0)
        .removeAttr('style');

    $body.find('div').each((_, el) => {
        const $el = $(el);
        const hasText = $el.text().replaceAll('\u{A0}', '').trim().length > 0;
        if (!hasText && $(MEDIA_KEEP_SELECTOR, el).length === 0) {
            $el.remove();
        }
    });

    const hasContent = Boolean($body.text().trim()) || $(MEDIA_KEEP_SELECTOR, $body).length > 0;
    return hasContent ? ($body.html() || '').trim() : '';
};

const extractArticleDetails = ($: CheerioAPI, entry: BlogEntry) => {
    const $header = $('main header').first();
    const dateText = $header.find('span.text-default.font-medium').first().text();
    const topicText = $header.find('span.text-secondary').first().text().trim() || entry.topic;
    const authorText = $header
        .find('p')
        .has('span.font-medium.text-default')
        .first()
        .text()
        .trim()
        .replace(/^(?:Authors?|作者)\s*[:：]\s*/i, '')
        .replaceAll(/\s+/g, ' ')
        .trim();

    const image = pickCoverImage($, $header, entry.link, entry.listImage);
    const bodyHtml = cleanArticleBody($('article#mainContent').first(), $);
    const description = bodyHtml || renderFallbackDescription(entry.summary, entry.link, entry.title);

    return {
        description,
        pubDate: parseUtcDate(dateText),
        author: authorText || undefined,
        category: topicText ? [topicText] : undefined,
        image,
    };
};

const fetchArticleDetail = (entry: BlogEntry) =>
    cache.tryGet(`openai:developers:blog:${entry.link}`, async () => {
        const html = await ofetch<string>(entry.link);
        const $ = load(html);
        const details = extractArticleDetails($, entry);

        const dataItem: DataItem = {
            title: entry.title,
            link: entry.link,
            description: details.description,
            pubDate: details.pubDate,
            author: details.author,
            category: details.category,
            image: details.image,
        };

        return dataItem;
    });

async function handler(ctx: Context): Promise<Data> {
    const localeConfig = resolveLocaleConfig(ctx.req.param('lang'));
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const listUrl = `${SITE_URL}${localeConfig.listPath}`;
    const html = await ofetch<string>(listUrl);
    const $ = load(html);

    const entries = extractListEntries($, listUrl, localeConfig, limit);
    const items = await pMap(entries, (entry) => fetchArticleDetail(entry), {
        concurrency: DETAIL_CONCURRENCY,
    });

    const pageTitle = $('main header h1').first().text().trim() || localeConfig.defaultTitle;
    const pageDescription = $('meta[name="description"]').attr('content')?.trim() || localeConfig.defaultDescription;

    return {
        title: pageTitle,
        description: pageDescription,
        link: listUrl,
        language: localeConfig.feedLanguage,
        item: items as DataItem[],
    };
}

export const route: Route = {
    path: '/developers/blog/:lang?',
    name: 'Developers Blog',
    url: 'developers.openai.com/blog',
    example: '/openai/developers/blog',
    categories: ['programming'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    parameters: {
        lang: {
            description: 'Language code (`en` by default, `zh-Hans` for Simplified Chinese).',
            default: 'en',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh-Hans', label: '简体中文' },
            ],
        },
    },
    description:
        'Full-text engineering and developer posts from the official OpenAI Developer Blog (`developers.openai.com/blog` by default, or `zh-Hans` for Simplified Chinese). Fetches up to 20 entries by default; supports the common `limit` parameter.',
    zh: {
        name: '开发者博客',
        parameters: {
            lang: {
                description: '语言版本（默认 `en` 对应英文站，传入 `zh-Hans` 可切换简体中文站）。',
                default: 'en',
                options: [
                    { value: 'en', label: 'English' },
                    { value: 'zh-Hans', label: '简体中文' },
                ],
            },
        },
        description: '抓取 OpenAI 官方开发者博客全文（涵盖 Codex、Agents SDK、API 工程实践等，默认英文站，传入 `zh-Hans` 切换中文站），默认返回最多 20 篇，支持通用 `limit` 参数。',
    },
    radar: [
        {
            source: ['developers.openai.com/blog', 'developers.openai.com/blog/:slug'],
            target: '/developers/blog',
        },
        {
            source: ['developers.openai.com/zh-Hans/blog', 'developers.openai.com/zh-Hans/blog/:slug'],
            target: '/developers/blog/zh-Hans',
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
