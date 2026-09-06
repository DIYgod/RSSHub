import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/worldhappiness/news',
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.worldhappiness.report';
    const currentUrl = `${rootUrl}/news/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('.news-card')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a.post-link');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, rootUrl).href,
                pubDate: parseDate($item.find('time.post-date').attr('datetime')!),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                return {
                    ...item,
                    description: content('.post-body').html(),
                };
            })
        )
    );

    return {
        title: $('head title').text(),
        link: currentUrl,
        item: items,
    };
}
