import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/sxy/:type',
    categories: ['university'],
    example: '/zzu/sxy/xyxw',
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
            source: ['www5.zzu.edu.cn/sxy/'],
        },
    ],
    name: '商学院',
    maintainers: ['amandus1990'],
    handler,
    description: `| 学院新闻 | 通知公告 | 教学科研 | 党工团学 | 讲座报告 | 学者观点 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| xyxw     | tzgg     | jxky     | dgtx     | jzbg     | xzgd     |`,
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
        xyxw: ['学院新闻', 'https://www5.zzu.edu.cn/sxy/index/xyxw.htm'],
        tzgg: ['通知公告', 'https://www5.zzu.edu.cn/sxy/index/tzgg.htm'],
        jxky: ['教学科研', 'https://www5.zzu.edu.cn/sxy/index/jxky.htm'],
        dgtx: ['党工团学', 'https://www5.zzu.edu.cn/sxy/index/dgtx.htm'],
        jzbg: ['讲座报告', 'https://www5.zzu.edu.cn/sxy/index/jzbg.htm'],
        xzgd: ['学者观点', 'https://www5.zzu.edu.cn/sxy/index/xzgd.htm'],
    };

    // 获取页面内容
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);

    const list = type === 'xyxw' ? parseXyxwList($, typeDict, type, ctx) : parseOtherList($, typeDict, type, ctx);

    return {
        title: `郑大商学院-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}

function parseXyxwList($, typeDict, type, ctx) {
    return $('section.n_titu ul li')
        .slice(0, Math.max(6, getRouteLimit(ctx, 6)))
        .toArray()
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a');
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.attr('title') || $link.text();
            const description = $element.find('.right .con p').text().trim();

            const monthDay = $element.find('.time_con h3').text();
            const year = $element.find('.time_con h6').text();
            const pubDateText = `${year}-${monthDay}`;

            return {
                title,
                link,
                pubDate: parsePublishedDate(pubDateText),
                description,
            };
        });
}

function parseOtherList($, typeDict, type, ctx) {
    return $('.n_notice ul.ul li')
        .slice(0, Math.max(16, getRouteLimit(ctx, 16)))
        .toArray()
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a');
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.attr('title');

            const pubDateText = $element.find('span.span01').text();

            return {
                title,
                link,
                pubDate: parsePublishedDate(pubDateText),
            };
        });
}
