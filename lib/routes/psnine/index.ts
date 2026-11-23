import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/time';

function parseTopicDate(date: string) {
    const match = /^(\d+天前)\s+(\d{1,2}:\d{2})$/.exec(date);
    if (match) {
        const day = parseRelativeDate(match[1])?.toLocaleString('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });
        return parseDate(`${day} ${match[2]}`, 'YYYY-MM-DD HH:mm', 8);
    }
    return parseRelativeDate(date);
}

const handler = async () => {
    const url = 'https://www.psnine.com/';
    const response = await ofetch(url);

    const $ = load(response);

    const out = $('.topic-row')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.title').text(),
                link: $item.find('.title a').attr('href'),
                pubDate: parseTopicDate($item.find('.meta > span:not(.author):not(.replies)').text()),
                author: $item.find('.meta .author a').text(),
                category: $item
                    .find('.tag a')
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
