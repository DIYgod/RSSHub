import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/releases',
    categories: ['program-update'],
    example: '/checkra.in/releases',
    name: '新版本发布',
    maintainers: ['ntzyz'],
    handler,
};

async function handler() {
    const homepage = 'https://checkra.in/releases/';

    const response = await ofetch(homepage);
    const $ = load(response);

    const items = $('.release')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const address = 'https://checkra.in' + $item.find('a').attr('href');

            return {
                title: $item.find('h3').first().text(),
                description: $item.find('.changelog').html(),
                link: address,
                guid: address,
            };
        });

    return {
        title: 'Checkra1n All Releases',
        link: homepage,
        item: items,
    };
}
