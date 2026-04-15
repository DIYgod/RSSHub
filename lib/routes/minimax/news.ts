import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.minimax.io';
const targetUrl = `${baseUrl}/news`;

export const route: Route = {
    path: '/news',
    categories: ['program-update'],
    example: '/minimax/news',
    name: 'News',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['www.minimax.io/news'],
            target: '/news',
        },
    ],
    url: 'www.minimax.io/news',
};

async function handler() {
    const response = await ofetch(targetUrl);
    const $ = load(response);

    const list: DataItem[] = $('a[href^="/news/"]')
        .toArray()
        .map((element) => {
            const $element = $(element);
            return {
                title: $element.text().trim().replaceAll(/\s+/g, ' '),
                link: new URL($element.attr('href') ?? '', baseUrl).href,
            };
        })
        .filter((item, index, items) => item.title && item.link && items.findIndex((other) => other.link === item.link) === index)
        .slice(0, 20);

    const item = await pMap(
        list,
        (entry) =>
            cache.tryGet(entry.link!, async () => {
                const detail = await ofetch(entry.link!);
                const $$ = load(detail);
                const main = $$('main').first();
                const text = main.text().replaceAll(/\s+/g, ' ');
                const dateMatch = text.match(/(\d{4}\.\d{2}\.\d{2})/);
                entry.title = main.find('h1').first().text().trim() || entry.title;
                entry.pubDate = dateMatch ? parseDate(dateMatch[1].replaceAll('.', '-')) : undefined;
                entry.description = main.html() ?? undefined;
                return entry;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'MiniMax News',
        description: 'MiniMax AI product updates and partner news',
        link: targetUrl,
        item,
    };
}
