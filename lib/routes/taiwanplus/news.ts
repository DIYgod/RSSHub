import { type CheerioAPI, load } from 'cheerio';
import { escapeAttribute, escapeText } from 'entities';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const baseUrl = 'https://www.taiwanplus.com';

export const route: Route = {
    path: '/news/:category{.+}?',
    example: '/taiwanplus/news/taiwan-news',
    name: 'News',
    categories: ['traditional-media'],
    maintainers: ['DIYgod'],
    parameters: { category: 'News category path from the website URL, defaults to taiwan-news.' },
    radar: [
        { source: ['www.taiwanplus.com/news/:category'], target: '/news/:category' },
        { source: ['www.taiwanplus.com/news/:category/:subcategory'], target: '/news/:category/:subcategory' },
    ],
    handler,
};

function getVideoData($: CheerioAPI) {
    const payload: unknown[] = JSON.parse($('#__NUXT_DATA__').text() || '[]');
    return payload.some((value): value is Record<string, number> => typeof value === 'object' && value !== null && !Array.isArray(value) && Object.hasOwn(value, 'vodId') && Object.hasOwn(value, 'transcript')) ? payload : undefined;
}

async function getItem(item: DataItem) {
    const details = await cache.tryGet(`${item.link}:transcript:v3`, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        const articles = $('script[type="application/ld+json"]')
            .toArray()
            .flatMap((script) => {
                const data = JSON.parse($(script).text());
                return data['@graph'] ?? [data];
            });
        const article = articles.find((entry) => entry['@type'] === 'NewsArticle');
        const details: Omit<DataItem, 'title' | 'link'> = {};
        if (article) {
            details.pubDate = parseDate(article.datePublished);
            details.updated = article.dateModified ? parseDate(article.dateModified) : undefined;
            details.author = article.author?.name;
            const image = Array.isArray(article.image) ? article.image[0] : article.image;
            const payload = getVideoData($);
            const video = payload?.find((value): value is Record<string, number> => typeof value === 'object' && value !== null && !Array.isArray(value) && Object.hasOwn(value, 'vodId') && Object.hasOwn(value, 'transcript'));
            const transcript = video && payload ? payload[video.transcript] : undefined;
            const tags = video && payload ? payload[video.tags] : undefined;
            details.category = Array.isArray(tags)
                ? tags.flatMap((reference) => {
                      const tag = typeof reference === 'number' && payload ? payload[reference] : undefined;
                      const name = tag && typeof tag === 'object' && 'tagName' in tag && typeof tag.tagName === 'number' && payload ? payload[tag.tagName] : undefined;
                      return typeof name === 'string' ? [name] : [];
                  })
                : undefined;
            details.description = `${image ? `<img src="${escapeAttribute(image)}">` : ''}<p>${escapeText(article.description ?? '')}</p>${typeof transcript === 'string' ? transcript : ''}`;
        }
        return details;
    });
    return { ...item, ...details };
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'taiwan-news';
    const link = `${baseUrl}/news/${category}`;
    const response = await ofetch(link);
    const $ = load(response);
    const limit = getRouteLimit(ctx, 20);
    const seen = new Set<string>();
    const items = $('a.news[href]')
        .toArray()
        .map((element) => ({ title: $(element).find('h2, h3').text(), link: new URL($(element).attr('href')!, baseUrl).href }))
        .filter((item) => {
            if (seen.has(item.link)) {
                return false;
            }
            seen.add(item.link);
            return true;
        })
        .slice(0, limit);
    return {
        title: $('title').text(),
        link,
        language: 'en' as const,
        item: await pMap(items, getItem, { concurrency: 3 }),
    };
}
