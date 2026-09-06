import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/hamel/blog',
    radar: [
        {
            source: ['hamel.dev/'],
        },
    ],
    url: 'hamel.dev/',
    name: 'Blog',
    maintainers: ['liyaozhong'],
    handler,
    description: "Hamel's Blog Posts",
};

async function handler() {
    const rootUrl = 'https://hamel.dev';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);
    const $ = load(response.data);

    let items = $('tr[data-index]')
        .toArray()
        .map((item): DataItem | null => {
            const $item = $(item);
            const $link = $item.find('td a').last();
            const $date = $item.find('.listing-date');

            const href = $link.attr('href');
            const title = $link.text();
            const dateStr = $date.text();

            if (!href || !title || !dateStr) {
                return null;
            }

            const link = new URL(href, rootUrl).href;
            const pubDate = parseDate(dateStr, 'M/D/YY');

            return {
                title,
                link,
                pubDate,
            };
        })
        .filter((item): item is DataItem => item !== null);

    items = (
        await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link!, async (): Promise<DataItem> => {
                    try {
                        const detailResponse = await got(item.link);
                        const $detail = load(detailResponse.data);

                        return {
                            ...item,
                            description: $detail('.content').html(),
                        };
                    } catch {
                        return item;
                    }
                })
            )
        )
    ).filter((item): item is DataItem => item !== null);

    return {
        title: "Hamel's Blog",
        link: rootUrl,
        item: items,
    };
}
