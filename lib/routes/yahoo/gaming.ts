import { load } from 'cheerio';
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

async function fetchArticle(link: string) {
    const response = await ofetch(link);
    const $ = load(response);
    const metadata = $('script[type="application/ld+json"]')
        .toArray()
        .map((element) => JSON.parse($(element).text()))
        .find((data) => data['@type'] === 'NewsArticle');
    const body = $('.grid-cols-article-mobile').first().children('p, h2, h3, h4, ul, ol, blockquote, figure');
    return {
        author: metadata.author.name,
        image: metadata.image.url,
        pubDate: parseDate(metadata.datePublished),
        updated: parseDate(metadata.dateModified),
        category: [metadata.articleSection, ...metadata.keywords],
        description: body.length ? $.html(body) : metadata.description,
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
    const cards = $('h3 a[href^="https://tech.yahoo.com/gaming/"]')
        .toArray()
        .filter((element) => $(element).attr('href')!.includes('/articles/'))
        .map((element) => ({ title: $(element).text(), link: $(element).attr('href')! }));
    const items = new Map(cards.map((item) => [item.link, item]))
        .values()
        .toArray()
        .slice(0, Number(ctx.req.query('limit')) || 20);
    return { title: 'Yahoo Tech - Gaming news', link, language: 'en-us' as const, item: await pMap(items, getArticle, { concurrency: 3 }) };
}
