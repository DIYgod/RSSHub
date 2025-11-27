import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

const handler = async () => {
    const url = 'https://www.psnine.com/';
    const response = await ofetch(url);

    const $ = cheerio.load(response);

    const out = $('.list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.title').text(),
                link: $item.find('.title a').attr('href'),
                pubDate: parseRelativeDate(
                    $item
                        .find('.meta')
                        .contents()
                        .filter((_, i) => i.nodeType === 3)
                        .text()
                        .trim()
                        .split(/\s{2,}/)[0]
                ),
                author: $item.find('.meta a.psnnode').text(),
                category: $item
                    .find('.meta a.node')
                    .toArray()
                    .map((a) => $(a).text()),
            };
        });

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: `${url}/View/aimage/p9.png`,
        link: url,
        item: out,
    };
};

export const route: Route = {
    path: '/',
    categories: ['game'],
    example: '/psnine',
    name: '首页',
    maintainers: ['betta-cyber'],
    handler,
    radar: [
        {
            source: ['psnine.com'],
        },
    ],
};
