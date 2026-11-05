import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parseTopicDate(date: string) {
    if (!date) {
        return;
    }
    const match = /^(\d+天前)\s+(\d{1,2}:\d{2})$/.exec(date);
    if (match) {
        const day = parseRelativeDate(match[1]).toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
        return timezone(parseDate(`${day} ${match[2]}`, 'YYYY-MM-DD HH:mm'), 8);
    }
    return parseRelativeDate(date);
}

const handler = async () => {
    const url = 'https://www.psnine.com/';
    const response = await ofetch(url);

    const $ = load(response);

    const out = $('.list li, .topic-row')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.title').text(),
                link: $item.find('.title a').attr('href'),
                pubDate: parseTopicDate(
                    $item.hasClass('topic-row')
                        ? $item.find('.meta > span:not(.author):not(.replies)').text()
                        : $item
                              .find('.meta')
                              .contents()
                              .filter((_, i) => i.nodeType === 3)
                              .text()
                              .trim()
                              .split(/\s{2,}/, 1)[0]
                ),
                author: $item.find('.meta a.psnnode, .meta .author a').text(),
                category: $item
                    .find('.meta a.node, .tag a')
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
