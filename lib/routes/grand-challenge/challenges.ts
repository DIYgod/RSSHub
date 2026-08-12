import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/challenges',
    categories: ['other'],
    example: '/grand-challenge/challenges',
    name: 'Challenge 列表',
    maintainers: ['WhoIsSure'],
    handler,
};

async function handler() {
    const link = 'https://grand-challenge.org/challenges/';
    const response = await ofetch(link);

    const $ = load(response);

    return {
        title: 'Grand-Challenge-challenges',
        link,
        item: $('.equal-height .card')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const itemPicUrl = $item.find('img').attr('src');
                const description = $item.find('a[data-description]').attr('data-description') || 'No description';
                return {
                    title: $item.find('h5').text(),
                    description: `${description}<br><img src="${itemPicUrl}">`,
                    link: $item.find('.stretched-link').attr('href'),
                };
            }),
    };
}
