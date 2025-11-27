import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

const handler = async () => {
    const url = 'https://www.psnine.com/trade';
    const response = await ofetch(url);

    const $ = cheerio.load(response);

    const out = $('.list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const touch = $item.find('.touch');
            return {
                title: $item.find('.content').text(),
                link: touch.attr('href'),
                description: $item.find('.r').text() + touch.html(),
                pubDate: parseRelativeDate(
                    $item
                        .find('div.meta')
                        .contents()
                        .filter((_, i) => i.nodeType === 3)
                        .text()
                        .trim()
                        .split(/\s{2,}/)[0]
                ),
                author: $item.find('.psnnode').text(),
                category: $item
                    .find('.node')
                    .toArray()
                    .map((a) => $(a).text()),
            };
        });

    return {
        title: $('head title').text(),
        link: url,
        item: out,
    };
};

export const route: Route = {
    path: '/trade',
    categories: ['game'],
    example: '/psnine/trade',
    name: '闲游',
    maintainers: ['betta-cyber'],
    handler,
    radar: [
        {
            source: ['psnine.com/trade', 'psnine.com'],
        },
    ],
};
