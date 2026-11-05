import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/release',
    categories: ['program-update'],
    example: '/onenotegem/release',
    name: 'Release History',
    maintainers: ['nczitzk'],
    handler,
};

const rootUrl = 'http://www.onenotegem.com';
const currentUrl = `${rootUrl}/a/release`;

async function handler() {
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.paragraph ul li a[href]')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, currentUrl).href,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`onenotegem:detail:v3:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                const title = content('h1.wsite-content-title');
                const publishedAt = title
                    .next()
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/)?.[0];

                return {
                    description: title.next().next().next().html(),
                    pubDate: publishedAt ? parseDate(publishedAt, 'YYYY-MM-DD HH:mm') : undefined,
                };
            });

            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: 'OneNote Gem Addins Release History',
        link: currentUrl,
        item: items,
    };
}
