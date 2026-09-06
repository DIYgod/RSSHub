import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://jwc.nchu.edu.cn';

const map = {
    notice: 'gg',
    news: 'xw',
};

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/nchu/jwc/notice',
    parameters: { type: '默认为 `notice`' },
    radar: [
        {
            source: ['jwc.nchu.edu.cn/xwzx/gg'],
            target: '/jwc/notice',
        },
        {
            source: ['jwc.nchu.edu.cn/xwzx/xw'],
            target: '/jwc/news',
        },
    ],
    name: '教务处公告与新闻',
    maintainers: ['Sg4Dylan'],
    description: `| 教务公告 | 教务新闻 |
| -------- | -------- |
| notice   | news     |`,
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const { type = 'notice' } = ctx.req.param();
    const link = `${host}/xwzx/${map[type]}`;

    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.pageTPList li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.title a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, host).href,
                description: $item.find('.intro').text().trim(),
                pubDate: timezone(parseDate($item.find('.date').text().replace('发表时间：', '')), 8),
            };
        });

    return {
        title: $('head title').text(),
        link,
        language: 'zh-CN',
        item: items,
    };
}
