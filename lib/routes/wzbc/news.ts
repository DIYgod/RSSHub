import { type CheerioAPI, load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.wzbc.edu.cn';
function parseSourceDate(value: string) {
    const text = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}:\d{2})?$/.test(text)) {
        return;
    }
    const date = timezone(parseDate(text, text.length === 10 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss', true), 8);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
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
                pubDate: parseSourceDate($item.find('.time').text()),
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
                pubDate: parseSourceDate($item.find('.w span').first().text()),
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
    name: '资讯',
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
    const feed = func(load(response));
    const items = await pMap<
        DataItem & {
            link: string;
        },
        DataItem
    >(
        feed.item,
        async (item) => {
            const detail = await cache.tryGet(item.link, async () => {
                const article = await ofetch(item.link);
                const $ = load(article);
                const pubDate = parseSourceDate(
                    $('.pro-con.deat .top .ti')
                        .text()
                        .replace(/^时间[：:]/, '')
                );
                return {
                    description: $('.pro-con.deat .bottom').html() || undefined,
                    author:
                        $('.pro-con.deat .top .auth')
                            .text()
                            .replace(/^作者[：:]\s*/, '')
                            .trim() || undefined,
                    ...(pubDate && { pubDate }),
                } satisfies Pick<DataItem, 'description' | 'pubDate' | 'author'>;
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );
    return {
        ...feed,
        item: items,
        link: `${host}/Col/${path}/Index.aspx`,
    };
}
