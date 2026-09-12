import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jw/:type?',
    categories: ['university'],
    example: '/cqust/jw/notify',
    parameters: { type: '可选，默认为 `notify`' },
    name: '教务处公告',
    maintainers: ['binarization'],
    description: `| 通知公告 | 教务快讯 |
| -------- | -------- |
| notify   | news     |`,
    handler,
};

const host = 'http://jw.cqust.edu.cn';
const map = {
    notify: '/tzgg/tz.htm',
    news: '/xwdt/xxyw.htm',
};

async function handler(ctx: Context) {
    const { type = 'notify' } = ctx.req.param();
    const link = host + map[type];
    const response = await ofetch(link);
    const $ = load(response);

    return {
        title: '重科教务处',
        link,
        description: $('meta[name="description"]').attr('content') || '重科教务处',
        item: $('li[id^="lineu"]')
            .toArray()
            .slice(0, 10)
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('a').text(),
                    description: $item.find('p').text() + ' [...]',
                    pubDate: timezone(parseDate($item.find('.shijian').text().replace('》', '')), 8),
                    link: new URL($item.find('a').attr('href')!, host).href,
                };
            }),
    };
}
