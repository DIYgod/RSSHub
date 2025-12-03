import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const handler = async () => {
    const url = 'https://www.psnine.com/psngame';
    const response = await ofetch(url);

    const $ = cheerio.load(response);

    const out = $('table tr')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.title a').text(),
                link: $item.find('.title a').attr('href'),
                description: $item.find('.title span').text() + ' ' + $item.find('.twoge').text(),
            };
        });

    return {
        title: $('head title').text(),
        link: url,
        item: out,
    };
};

export const route: Route = {
    path: '/game',
    categories: ['game'],
    example: '/psnine/game',
    name: '游戏',
    maintainers: ['betta-cyber'],
    handler,
    radar: [
        {
            source: ['psnine.com/psngame', 'psnine.com'],
        },
    ],
};
