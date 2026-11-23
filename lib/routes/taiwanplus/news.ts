import { load } from 'cheerio';
import { escapeAttribute, escapeText } from 'entities';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

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

async function getItem(item: DataItem) {
    const details = await cache.tryGet(`${item.link}:transcript:v3`, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        const article = JSON.parse($('script[type="application/ld+json"]:contains("NewsArticle")').text())['@graph'].find((entry) => entry['@type'] === 'NewsArticle');
        const payload = JSON.parse($('#__NUXT_DATA__').text());
        const video = payload.find((value) => value?.vodId !== undefined && value.transcript !== undefined);
        const tags = payload[video.tags];
        return {
            pubDate: parseDate(article.datePublished),
            updated: article.dateModified ? parseDate(article.dateModified) : undefined,
            author: article.author?.name,
            category: Array.isArray(tags) ? tags.map((reference) => payload[payload[reference].tagName]) : undefined,
            description: `<img src="${escapeAttribute(article.image[0])}"><p>${escapeText(article.description)}</p>${payload[video.transcript]}`,
        };
    });
    return { ...item, ...details };
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'taiwan-news';
    const link = `${baseUrl}/news/${category}`;
    const response = await ofetch(link);
    const $ = load(response);
    const limit = getRouteLimit(ctx, 20);
    const items = $('a.news[href]')
        .toArray()
        .map((element) => ({ title: $(element).find('h2, h3').text(), link: new URL($(element).attr('href')!, baseUrl).href }))
        .filter((item, index, items) => items.findIndex((candidate) => candidate.link === item.link) === index)
        .slice(0, limit);
    return {
        title: $('title').text(),
        link,
        language: 'en' as const,
        item: await pMap(items, getItem, { concurrency: 3 }),
    };
}
