import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/gaming',
    categories: ['game'],
    example: '/yahoo/gaming',
    name: 'Gaming news',
    maintainers: ['DIYgod'],
    radar: [{ source: ['tech.yahoo.com/gaming'], target: '/gaming' }],
    handler,
};

function getStructuredData(content: CheerioAPI) {
    return content('script[type="application/ld+json"]')
        .toArray()
        .flatMap((element) => {
            try {
                const data = JSON.parse(content(element).text());
                const entries = Array.isArray(data) ? data : [data];
                return entries.flatMap((entry) => (entry && typeof entry === 'object' ? [entry, ...(Array.isArray(entry['@graph']) ? entry['@graph'] : [])] : []));
            } catch {
                return [];
            }
        })
        .filter((entry) => entry && typeof entry === 'object');
}

function parseArticleDate(value?: string) {
    if (typeof value !== 'string' || !value) {
        return;
    }

    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

function parseArticleImage(value?: string) {
    if (typeof value === 'string' && URL.canParse(value) && ['http:', 'https:'].includes(new URL(value).protocol)) {
        return value;
    }
}

async function fetchArticle(link: string) {
    const response = await ofetch(link);
    const $ = load(response);
    const metadata = getStructuredData($).find((entry) => entry['@type'] === 'NewsArticle');
    const body = $('.grid-cols-article-mobile').first().children('p, h2, h3, h4, ul, ol, blockquote, figure');
    return {
        author: metadata?.author?.name,
        image: parseArticleImage(metadata?.image?.url),
        pubDate: parseArticleDate(metadata?.datePublished),
        updated: parseArticleDate(metadata?.dateModified),
        category:
            typeof metadata?.articleSection === 'string' && metadata.articleSection
                ? [metadata.articleSection, ...(Array.isArray(metadata.keywords) ? metadata.keywords : typeof metadata.keywords === 'string' ? [metadata.keywords] : [])]
                : metadata?.keywords,
        description: body.length ? $.html(body) : metadata?.description,
    };
}

async function getArticle(item) {
    const details = await cache.tryGet(`yahoo:gaming:article:v4:${item.link}`, () => fetchArticle(item.link));
    return {
        ...item,
        author: details.author,
        image: details.image,
        pubDate: details.pubDate,
        updated: details.updated,
        category: details.category,
        description: details.description,
    };
}

async function handler(ctx) {
    const link = 'https://tech.yahoo.com/gaming/';
    const response = await ofetch(link);
    const $ = load(response);
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 20;
    const cards = $('h3 a[href^="https://tech.yahoo.com/gaming/"]')
        .toArray()
        .filter((element) => $(element).attr('href')!.includes('/articles/'))
        .map((element) => ({ title: $(element).text(), link: $(element).attr('href')! }));
    const items = new Map(cards.map((item) => [item.link, item])).values().toArray().slice(0, limit);
    return { title: 'Yahoo Tech - Gaming news', link, language: $('html').attr('lang')?.toLowerCase() === 'en-us' ? ('en-us' as const) : undefined, item: await pMap(items, getArticle, { concurrency: 3 }) };
}
