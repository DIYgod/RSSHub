import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/ss/:type',
    categories: ['university'],
    example: '/zzu/ss/xwzx',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www5.zzu.edu.cn/ss/'],
        },
    ],
    name: '社科院',
    maintainers: ['amandus1990'],
    handler,
    description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`,
};

function parsePublishedDate(value?: string) {
    if (!value) {
        return;
    }
    const match = value.match(/^\s*(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s|T|$)/);
    if (!match) {
        return;
    }
    const calendarDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    if (!Number.isFinite(parseDate(calendarDate, 'YYYY-MM-DD', true).getTime())) {
        return;
    }
    const date = parseDate(Date.parse(value));
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        xwzx: ['新闻资讯', 'https://www5.zzu.edu.cn/ss/index/skxw.htm'],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/ss/index/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.list_notice > a')
        .slice(0, Math.max(10, getRouteLimit(ctx, 10)))
        .toArray()
        .map((element) => {
            const $element = $(element);
            const link = new URL($element.attr('href')!, typeDict[type][1]).href;
            const title = $element.find('h3').text();

            const time = $element.find('time');
            const pubDateText = time.attr('datetime') || time.attr('title') || time.text();
            // A month/day label does not identify its publication year.

            return {
                title,
                link,
                pubDate: parsePublishedDate(pubDateText),
            };
        });

    return {
        title: `郑大社科院-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
