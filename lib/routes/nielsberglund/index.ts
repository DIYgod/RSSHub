import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/nielsberglund/blog',
    radar: [
        {
            source: ['nielsberglund.com/'],
        },
    ],
    url: 'nielsberglund.com/',
    name: 'Blog',
    maintainers: ['liyaozhong'],
    handler,
    description: 'Niels Berglund Blog Posts',
};

async function handler() {
    const rootUrl = 'https://nielsberglund.com';
    const currentUrl = rootUrl;

    const response = await got(currentUrl);
    const $ = load(response.data);

    let items = $('.post-preview')
        .toArray()
        .map((item): DataItem | null => {
            const $item = $(item);
            const $link = $item.find('a').first();
            const href = $link.attr('href');
            const title = $item.find('.post-title').text();
            const dateStr = $item.find('.post-meta').text().trim();

            if (!href || !title) {
                return null;
            }

            const link = new URL(href, rootUrl).href;
            const pubDate = parseDate(dateStr);

            return {
                title,
                link,
                pubDate,
            };
        })
        .filter((item): item is DataItem => item !== null);

    items = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`nielsberglund:details:v3:${item.link}`, async () => {
                const detailResponse = await got(item.link);
                const $detail = load(detailResponse.data);
                return { description: $detail('.post-container').html() };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: 'Niels Berglund Blog',
        link: rootUrl,
        item: items,
    };
}
