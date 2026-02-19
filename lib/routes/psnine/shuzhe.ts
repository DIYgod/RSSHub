import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const handler = async () => {
    const url = 'https://www.psnine.com/dd';
    const response = await ofetch(url);

    const $ = cheerio.load(response);

    const out = $('.dd_ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.dd_title').text(),
                link: $item.find('.dd_title a').attr('href'),
                description: $item.find('.dd_status').text(),
                author: $item.find('.meta a').text(),
            };
        });

    return {
        title: $('head title').text(),
        link: 'https://www.psnine.com/',
        item: out,
    };
};

export const route: Route = {
    path: '/shuzhe',
    categories: ['game'],
    example: '/psnine/shuzhe',
    name: '数折',
    maintainers: ['betta-cyber'],
    handler,
    radar: [
        {
            source: ['psnine.com/dd', 'psnine.com'],
        },
    ],
};
