import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parseTradeDate(date: string) {
    if (!date) {
        return;
    }
    const relative = /^(\d+天前|今天|昨天|前天)\s+(\d{1,2}:\d{2})$/.exec(date);
    if (relative) {
        const day = parseRelativeDate(relative[1]).toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
        return timezone(parseDate(`${day} ${relative[2]}`, 'YYYY-MM-DD HH:mm'), 8);
    }
    if (/^(?:\d{4}-)?\d{2}-\d{2}\s+\d{1,2}:\d{2}$/.test(date)) {
        return timezone(parseDate(date, ['YYYY-MM-DD HH:mm', 'MM-DD HH:mm']), 8);
    }
    return parseRelativeDate(date);
}

const handler = async () => {
    const url = 'https://www.psnine.com/trade';
    const response = await ofetch(url);

    const $ = load(response);

    const out = $('.list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const touch = $item.find('.touch');
            return {
                title: $item.find('.content').text(),
                link: touch.attr('href'),
                description: $item.find('.r').text() + touch.html(),
                pubDate: parseTradeDate(
                    $item
                        .find('div.meta')
                        .contents()
                        .filter((_, i) => i.nodeType === 3)
                        .text()
                        .trim()
                        .split(/\s{2,}/, 1)[0]
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
