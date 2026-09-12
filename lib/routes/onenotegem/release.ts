import { load } from 'cheerio';

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

    const list = $('.paragraph ul li a')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                const title = content('h1.wsite-content-title');

                item.description = title.next().next().next().html();
                item.pubDate = parseDate(title.next().text());

                return item;
            })
        )
    );

    return {
        title: 'OneNote Gem Addins Release History',
        link: currentUrl,
        item: items,
    };
}
