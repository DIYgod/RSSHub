import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/explore',
    categories: ['travel'],
    example: '/huodongxing/explore',
    name: '最新活动',
    maintainers: ['nakadaole'],
    handler,
};

async function handler() {
    const host = 'https://www.huodongxing.com';
    const response = await ofetch(`${host}/eventlist`);
    const $ = load(response);

    const list = $('div.search-tab-content-item')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const $a = $item.find('.item-title');

            const link = new URL($a.attr('href')!, host);
            link.search = '';

            return {
                title: $a.text(),
                link: link.href,
                author: $item.find('.user-name').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = $('#event_desc_page').html();

                return item;
            })
        )
    );

    return {
        title: '活动行',
        link: `${host}/eventlist`,
        item: items,
    };
}
