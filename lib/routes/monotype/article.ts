import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/article',
    categories: ['design'],
    example: '/monotype/article',
    name: 'Featured Article',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.monotype.com/resources';

    const response = await ofetch(rootUrl);
    const $ = load(response);
    const list = $('a.component-title')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.text().trim(),
                link: new URL($item.attr('href')!, rootUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await ofetch(item.link);
                const content = load(res);
                const publishedTime = content('meta[property="article:published_time"]').attr('content');
                if (publishedTime) {
                    item.pubDate = parseDate(publishedTime, 'ddd, MM/DD/YYYY - HH:mm');
                }
                item.description = content('.node__content').html();
                return item;
            })
        )
    );

    return {
        title: 'Monotype - Feature Articles',
        link: rootUrl,
        item: items,
    };
}
