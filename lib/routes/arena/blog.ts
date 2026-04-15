import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://arena.ai';
const targetUrl = `${baseUrl}/blog/`;

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/arena/blog',
    name: 'Blog',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['arena.ai/blog'],
            target: '/blog',
        },
    ],
    url: 'arena.ai/blog/',
};

async function handler() {
    const response = await ofetch(targetUrl);
    const $ = load(response);

    const list: DataItem[] = $('a[href*="/blog/"]')
        .toArray()
        .map((element) => {
            const $element = $(element);
            return {
                title: $element.text().trim().replaceAll(/\s+/g, ' '),
                link: new URL($element.attr('href') ?? '', baseUrl).href,
            };
        })
        .filter((item, index, items) => item.title && item.link && !item.link.endsWith('/blog/') && items.findIndex((other) => other.link === item.link) === index)
        .slice(0, 20);

    const item = await pMap(
        list,
        (entry) =>
            cache.tryGet(entry.link!, async () => {
                const detail = await ofetch(entry.link!);
                const $$ = load(detail);
                const article = $$('article').first();
                entry.title = article.find('h1').first().text().trim() || entry.title;
                entry.pubDate = parseDate(article.find('time').first().attr('datetime') ?? article.find('time').first().text().trim());
                entry.description = $$('.gh-content').first().html() ?? article.html() ?? undefined;
                return entry;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Arena Blog',
        description: 'Latest updates, research, and leaderboard changes from Arena',
        link: targetUrl,
        item,
    };
}
