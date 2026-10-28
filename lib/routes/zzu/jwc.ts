import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/jwc/:type',
    categories: ['university'],
    example: '/zzu/jwc/xwkd',
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
            source: ['www5.zzu.edu.cn/jwc/'],
        },
    ],
    name: '教务部',
    maintainers: ['amandus1990'],
    handler,
    description: `| 新闻快递 | 通知公告 |
| -------- | -------- |
| xwkd     | tzgg     |`,
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
        xwkd: ['新闻快递', 'https://www5.zzu.edu.cn/jwc/index/xwkd.htm'],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/jwc/index/tzgg.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    // 解析页面内容并提取文章信息
    const list = $('ul.list li')
        .slice(0, Math.max(15, getRouteLimit(ctx, 15)))
        .toArray()
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a[href]').first();
            const href = $link.attr('href');
            if (!href) {
                return;
            }
            const link = new URL(href, typeDict[type][1]).href;
            const title = $link.find('h3').text();

            // 获取发布时间
            const pubDateText = $element.find('span').text().trim();

            return {
                title,
                link,
                pubDate: parsePublishedDate(pubDateText),
            };
        })
        .filter((item) => item !== undefined);

    return {
        title: `郑大教务部-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}
