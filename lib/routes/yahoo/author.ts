import { type CheerioAPI, load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/author/:author',
    categories: ['traditional-media'],
    example: '/yahoo/author/hannah-keyser',
    parameters: { author: 'Author' },
    name: 'News By Author',
    maintainers: ['loganrockmore'],
    description: 'Provides all of the articles by the specified Yahoo! author.',
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
    const detailResponse = await ofetch(link);
    const content = load(detailResponse);
    const metadata = getStructuredData(content).find((entry) => entry['@type'] === 'NewsArticle');
    content('button').remove();
    const cover = content('div.story-cover');
    cover.find('img').removeAttr('style');
    const body = content('div.content-body');
    body.find('div.sda-placeholder-txt, div.bodyad-wrapper, div.content-videowrapper, .consent').remove();
    content('div.story-cover img, div.content-body img').each((_, img) => {
        const src = content(img).attr('src');
        if (!src?.startsWith('https://s.yimg.com/lo/mysterio/')) {
            return;
        }
        content(img).attr('src', decodeURIComponent(src.split('/').at(-1)!));
        content(img).siblings('source').remove();
    });
    return {
        title: content('meta[property="og:title"]').attr('content')!,
        author: typeof metadata?.author?.name === 'string' ? metadata.author.name : undefined,
        image: parseArticleImage(metadata?.image?.url),
        category: Array.isArray(metadata?.keywords) ? metadata.keywords.filter((keyword) => typeof keyword === 'string') : typeof metadata?.keywords === 'string' ? metadata.keywords : undefined,
        description: (cover.html() ?? '') + (body.html() ?? ''),
        pubDate: parseArticleDate(metadata?.datePublished) ?? parseArticleDate(content('time').attr('datetime')),
        updated: parseArticleDate(metadata?.dateModified),
    };
}
async function handler(ctx: Context) {
    const { author } = ctx.req.param();
    const response = await ofetch.raw<string>(`https://www.yahoo.com/author/${author}/`);
    const url = response.url;
    const $ = load(response._data!);
    const title = $('meta[property="og:title"]').attr('content') ?? '';
    const description = $('meta[property="og:description"]').attr('content');
    const list: Array<{
        link: string;
    }> = (getStructuredData($).find((data) => Array.isArray(data.hasPart?.mainEntity?.itemListElement))?.hasPart.mainEntity.itemListElement ?? []).slice(0, 10).map((item) => ({
        link: item.url,
    }));
    const items = await pMap(
        list,
        (item) =>
            mapResolvedValue(
                cache.tryGet(`yahoo:author:article:v3:${item.link}`, () => fetchArticle(item.link)),
                (detail) => ({
                    link: item.link,
                    title: detail.title,
                    author: detail.author,
                    category: detail.category,
                    image: detail.image,
                    description: detail.description,
                    pubDate: detail.pubDate,
                    updated: detail.updated,
                })
            ),
        { concurrency: 3 }
    );
    return {
        title,
        link: url,
        description,
        language: $('html').attr('lang')?.toLowerCase() === 'en-us' ? ('en-us' as const) : undefined,
        item: items,
    };
}
async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}
