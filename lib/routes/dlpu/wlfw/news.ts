import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
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
    const link = `${baseUrl}${map[type]}`;

    const response = await ofetch(link);

    const $ = load(response);

    return {
        link,
        title: $('#main>h1').text(),
        item: $('.morelist>li')
            .slice(0, 10)
            .toArray()
            .map((elem) => ({
                link: new URL($('a', elem).attr('href')!, baseUrl).href,
                title: $('a', elem).attr('title')!.trim(),
                pubDate: timezone(parseDate($('.more_time', elem).text()), 8),
            })),
    };
}
