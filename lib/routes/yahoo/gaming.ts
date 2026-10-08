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

function getArticle(item) {
    return cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        const metadata = $('script[type="application/ld+json"]')
            .toArray()
            .map((element) => JSON.parse($(element).text()))
            .find((data) => data['@type'] === 'NewsArticle');
        const body = $('.grid-cols-article-mobile').first().children('p, h2, h3, h4, ul, ol, blockquote, figure');
        return {
            ...item,
            author: metadata?.author?.name,
            pubDate: metadata?.datePublished ? parseDate(metadata.datePublished) : undefined,
            category: metadata?.keywords,
            description: body.length ? $.html(body) : metadata?.description,
        };
    });
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
    return { title: 'Yahoo Tech - Gaming news', link, item: await pMap(items, getArticle, { concurrency: 3 }) };
}
