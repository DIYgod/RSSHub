import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const baseUrl = 'https://physics.scnu.edu.cn';

async function fetchCategory(category: string, path: string) {
    const response = await ofetch(`${baseUrl}/${path}`);
    const $ = load(response);

    return $('ul.article-list li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate($item.find('span.time').text(), 8),
                category: [category],
            };
        });
}

export async function fetchItems(categories: Record<string, string>) {
    const lists = await Promise.all(Object.entries(categories).map(([category, path]) => fetchCategory(category, path)));

    return Promise.all(
        lists.flat().map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                item.description = $('div.detail').html() ?? undefined;
                return item;
            })
        )
    );
}
