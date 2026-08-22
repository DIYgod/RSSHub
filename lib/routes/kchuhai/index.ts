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
            const title = $item.attr('title');
            if (title === undefined) {
                return;
            }
            return {
                title,
                link: $item.attr('href'),
            };
        })
        .filter((item) => item !== undefined);

    return {
        title: '出海 ~ 资讯',
        link: url,
        description: '出海 ~ 资讯',
        item: items,
    };
}
