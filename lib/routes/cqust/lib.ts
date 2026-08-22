import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/lib/:type?',
    categories: ['university'],
    example: '/cqust/lib/news',
    parameters: { type: '可选，默认为 `news`' },
    name: '图书馆公告',
    maintainers: ['binarization'],
    description: `| 本馆公告 |
| -------- |
| news     |`,
    handler,
};

const host = 'http://lib.cqust.edu.cn';
const map = {
    news: '/node/410.jspx',
};

async function handler(ctx: Context) {
    const { type = 'news' } = ctx.req.param();
    const link = host + map[type];
    const response = await ofetch(link, {
        headers: {
            Cookie: `JSESSIONID=${Math.random()}`,
        },
    });
    const $ = load(response);

    return {
        title: '重科图书馆',
        link,
        description: $('meta[name="description"]').attr('content') || '重科图书馆公告',
        item: $('div[class="newsList"] li')
            .toArray()
            .slice(0, 10)
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('a').text(),
                    description: '重科图书馆公告',
                    pubDate: timezone(parseDate($item.find('span[class="time"]').text()), 8),
                    link: new URL($item.find('a').attr('href')!, host).href,
                };
            }),
    };
}
