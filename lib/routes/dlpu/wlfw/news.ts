import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/wlfw/news/:type?',
    categories: ['university'],
    example: '/dlpu/wlfw/news/22',
    parameters: { type: '默认为 `22`' },
    name: '网络服务新闻',
    maintainers: ['xu42'],
    handler,
    description: `| 新闻动态 | 通知公告 |
| -------- | -------- |
| 22       | 23       |`,
};

const baseUrl = 'https://wlfw.dlpu.edu.cn';

const map = {
    22: '/more/22',
    23: '/more/23',
};

async function handler(ctx: Context) {
    const { type = '22' } = ctx.req.param();
    if (!Object.hasOwn(map, type)) {
        throw new InvalidParameterError('Unsupported category. Use 22 for news or 23 for notices.');
    }
    const link = `${baseUrl}${map[type]}`;

    const response = await ofetch(link);

    const $ = load(response);
    let list = $('.morelist>li')
        .slice(0, Math.max(10, getRouteLimit(ctx, 10)))
        .toArray()
        .map((elem) => ({
            link: new URL($('a', elem).attr('href')!, baseUrl).href,
            title: $('a', elem).attr('title')!,
            pubDate: timezone(parseDate($('.more_time', elem).text()), 8),
        }));
    if (ctx.req.query('sorted') !== 'false') {
        list.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    }
    list = list.slice(0, getRouteLimit(ctx, 10));
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch<string>(item.link);
                const page = load(response);
                const content = page('#content');
                if (!content.length) {
                    throw new Error('The official article page did not provide its main content.');
                }
                page('#aeinfo br').replaceWith('\n');
                const author = page('#aeinfo').text().trim() || undefined;
                content.find('#aeinfo, #hits').remove();
                return { ...item, description: content.html(), author };
            }),
        { concurrency: 3 }
    );

    return {
        link,
        title: $('#main>h1').text(),
        language: 'zh-CN' as const,
        item: items,
    };
}
