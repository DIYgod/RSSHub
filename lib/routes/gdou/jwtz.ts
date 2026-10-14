import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit, hasItemFilters } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/gdou/jwc',
    radar: [
        {
            source: ['jwc.gdou.edu.cn/jwdt/jwtz.htm'],
        },
    ],
    name: '教务通知',
    maintainers: ['Xiaotouming'],
    handler,
    url: 'jwc.gdou.edu.cn/jwdt/jwtz.htm',
};

async function handler(ctx: Context) {
    const link = 'https://jwc.gdou.edu.cn/jwdt/jwtz.htm';
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('li[id^="line_u8_"] a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('em').text(),
                link: new URL($item.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('span').text(), 'YYYY-MM-DD'), 8),
                author: '教务部',
            };
        });
    if (ctx.req.query('sorted') === 'false' || list.every((item) => item.pubDate && Number.isFinite(new Date(item.pubDate).getTime()))) {
        if (ctx.req.query('sorted') !== 'false') {
            list.sort((a, b) => new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime());
        }
        list.splice(getRouteLimit(ctx, hasItemFilters(ctx) ? list.length : 10));
    }

    const items = await pMap(
        list,
        async (item) => {
            const article = await cache.tryGet(`${item.link}#article-content`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                return { description: $('.v_news_content').html() };
            });

            return { ...item, ...article };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
