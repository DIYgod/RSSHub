import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/report',
    categories: ['new-media'],
    example: '/kchuhai/report',
    name: '资讯',
    maintainers: ['8430177'],
    handler,
};

async function handler() {
    const url = 'https://www.kchuhai.com/report/';

    const response = await ofetch(url);
    const $ = load(response);

    const items = $('.kch-ztListBox a[title]')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.attr('title'),
                link: $item.attr('href'),
            };
        });

    return {
        title: '出海 ~ 资讯',
        link: url,
        description: '出海 ~ 资讯',
        item: items,
    };
}
