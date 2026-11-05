import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/kjc/:type',
    categories: ['university'],
    example: '/zzu/kjc/xwzx',
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
            source: ['www7.zzu.edu.cn/kjc/'],
        },
    ],
    name: '科研院',
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
        xwzx: ['新闻资讯', 'https://www7.zzu.edu.cn/kjc/index/kydt.htm'],
        tzgg: ['通知公告', 'https://www7.zzu.edu.cn/kjc/index/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('.list_guild')
        .slice(0, Math.max(14, getRouteLimit(ctx, 14)))
        .toArray()
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a');
            const link = new URL($link.attr('href')!, typeDict[type][1]).href;
            const title = $link.attr('title') || $link.text();

            // 获取发布时间
            const pubDateText = $element.find('span').text();

            return {
                title,
                link,
                pubDate: parsePublishedDate(pubDateText),
            };
        });

    return {
        title: `郑大科研院-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
