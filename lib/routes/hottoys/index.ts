import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['shopping'],
    example: '/hottoys',
    radar: [
        {
            source: ['hottoys.com.hk/'],
        },
    ],
    name: 'Toys List',
    maintainers: ['jw0903'],
    handler,
    url: 'hottoys.com.hk/',
    features: {
        requirePuppeteer: false,
    },
};

async function handler() {
    const baseUrl = 'https://www.hottoys.com.hk';

    const response = await ofetch(baseUrl);
    const $ = load(response);
    const items = $('li.productListItem')
        .toArray()
        .map((item) => {
            const dom = $(item);
            const a = dom.find('a').first();
            const img = dom.find('img').first();
            return {
                title: img.attr('title') ?? 'hottoys',
                link: `${baseUrl}/${a.attr('href')}`,
                description: `<img src="${baseUrl}${img.attr('src')}" />`,
                guid: a.attr('href'),
            };
        });
    return {
        title: 'Hot Toys New Products',
        link: baseUrl,
        item: items,
    };
}
