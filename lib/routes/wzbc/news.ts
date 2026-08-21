import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.wzbc.edu.cn';

const parserAbb = ($: CheerioAPI) => ({
    title: $('title').text(),
    item: $('.pro-con.list li')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.word a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, host).href,
                pubDate: timezone(parseDate($item.find('.time').text(), 'YYYY-MM-DD'), 8),
            };
        }),
});

const parserFull = ($: CheerioAPI) => ({
    title: $('title').text(),
    item: $('.pro-con.son .item')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('h2 a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, host).href,
                description: $item.find('p').text(),
                pubDate: timezone(parseDate($item.find('.w span').first().text(), 'YYYY-MM-DD'), 8),
            };
        }),
});

const MAP = {
    news: { path: 'Col46', func: parserFull },
    media: { path: 'Col48', func: parserFull },
    notice: { path: 'Col52', func: parserAbb },
    jobs: { path: 'Col49', func: parserAbb },
    workday: { path: 'Col51', func: parserAbb },
    activity: { path: 'Col50', func: parserAbb },
};

export const route: Route = {
    path: '/:type?',
    categories: ['university'],
    example: '/wzbc/notice',
    parameters: { type: '分类，见下表' },
    name: '温州商学院',
    maintainers: ['howel52'],
    handler,
    description: `| 校园新闻 | 媒体商院 | 通知公告 | 人才招聘 | 行事历  | 学术动态 |
| -------- | -------- | -------- | -------- | ------- | -------- |
| news     | media    | notice   | jobs     | workday | activity |`,
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const { path, func } = MAP[type] ?? MAP.notice;

    const response = await ofetch(`${host}/Col/${path}/Index.aspx`);

    return func(load(response));
}
