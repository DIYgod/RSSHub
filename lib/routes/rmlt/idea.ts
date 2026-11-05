import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/idea',
    categories: ['new-media'],
    example: '/rmlt/idea',
    name: '思想理论',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.rmlt.com.cn';
    const currentUrl = `${rootUrl}/idea/`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('.txt-list a')
        .slice(0, 15)
        .toArray()
        .map((item) => ({
            link: $(item).attr('href')!,
        }));

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                const date = content('.date').text().trim();
                return {
                    ...item,
                    title: content('.article-title').text(),
                    description: content('.article-content').html(),
                    pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD HH:mm'), 8) : undefined,
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
