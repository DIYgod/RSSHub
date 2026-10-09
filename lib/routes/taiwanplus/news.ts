import { load } from 'cheerio';
import { escapeAttribute, escapeText } from 'entities';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.taiwanplus.com';

export const route: Route = {
    path: '/news/:category{.+}?',
    example: '/taiwanplus/news/taiwan-news',
    name: 'News',
    categories: ['traditional-media'],
    maintainers: ['DIYgod'],
    parameters: { category: 'News category path from the website URL, defaults to taiwan-news.' },
    radar: [{ source: ['www.taiwanplus.com/news/:category*'], target: '/news/:category' }],
    handler,
};

function getItem(item: DataItem) {
    return cache.tryGet(item.link!, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        const articles = $('script[type="application/ld+json"]')
            .toArray()
            .flatMap((script) => {
                const data = JSON.parse($(script).text());
                return data['@graph'] ?? [data];
            });
        const article = articles.find((entry) => entry['@type'] === 'NewsArticle');
        if (article) {
            item.title = article.headline;
            item.pubDate = parseDate(article.datePublished);
            item.updated = article.dateModified ? parseDate(article.dateModified) : undefined;
            item.author = article.author?.name;
            const image = Array.isArray(article.image) ? article.image[0] : article.image;
            item.description = `${image ? `<img src="${escapeAttribute(image)}">` : ''}<p>${escapeText(article.description ?? '')}</p>`;
        }
        return item;
    });
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'taiwan-news';
    const link = `${baseUrl}/news/${category}`;
    const response = await ofetch(link);
    const $ = load(response);
    const limit = Number(ctx.req.query('limit')) || 20;
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
