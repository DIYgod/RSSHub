import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parseNodeDate(date: string) {
    if (!date) {
        return;
    }
    const relative = /^(\d+天前|今天|昨天|前天)\s+(\d{1,2}:\d{2})$/.exec(date);
    if (relative) {
        const day = parseRelativeDate(relative[1]).toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
        return timezone(parseDate(`${day} ${relative[2]}`, 'YYYY-MM-DD HH:mm'), 8);
    }
    return timezone(parseDate(date, ['YYYY-MM-DD HH:mm', 'MM-DD HH:mm']), 8);
}

const handler = async (ctx) => {
    const { id = 'news', order = 'obdate' } = ctx.req.param();

    const rootUrl = 'https://www.psnine.com';
    const currentUrl = `${rootUrl}/node/${id}?ob=${order}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    $('.psnnode, .node').remove();

    const list = $('.title a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const meta = $item.parent().next();
            return {
                title: $item.text(),
                link: $item.attr('href'),
                pubDate: parseNodeDate(
                    meta
                        .contents()
                        .filter((_, i) => i.nodeType === 3)
                        .text()
                        .trim()
                        .split(/\s{2,}/, 1)[0]
                ),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const $ = load(detailResponse);

                return {
                    author: $('a[itemprop="author"]').eq(0).text(),
                    description: $('div[itemprop="articleBody"]').html(),
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: `${$('title').text()} - PSN中文站`,
        link: currentUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/node/:id?/:order?',
    parameters: {
        id: '节点 id，见下表，默认为 news',
        order: '排序，`date` 即最新，默认为 `obdate` 即综合排序',
    },
    categories: ['game'],
    example: '/psnine/node/news',
    name: '节点',
    maintainers: ['betta-cyber', 'nczitzk'],
    handler,
    radar: [
        {
            source: ['psnine.com/node/:id'],
        },
    ],
};
