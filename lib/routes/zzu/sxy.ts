import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

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
    name: '郑大商学院',
    maintainers: ['amandus1990'],
    handler,
    description: `| 学院新闻 | 通知公告 | 教学科研 | 党工团学 | 讲座报告 | 学者观点 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| xyxw     | tzgg     | jxky     | dgtx     | jzbg     | xzgd     |`,
};

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

    const list = type === 'xyxw' ? parseXyxwList($, typeDict, type) : parseOtherList($, typeDict, type);

    return {
        title: `郑大商学院-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: list,
    };
}

function parseXyxwList($, typeDict, type) {
    return $('section.n_titu ul li')
        .toArray()
        .slice(0, 6)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.attr('title') || $link.text().trim();
            const description = $element.find('.right .con p').text().trim();

            const monthDay = $element.find('.time_con h3').text().trim();
            const year = $element.find('.time_con h6').text().trim();
            const pubDateText = `${year}-${monthDay}`;

            return {
                title,
                link,
                pubDate: pubDateText,
                description,
            };
        });
}

function parseOtherList($, typeDict, type) {
    return $('.n_notice ul.ul li')
        .toArray()
        .slice(0, 16)
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('a').first();
            const link = new URL($link.attr('href'), typeDict[type][1]).href;
            const title = $link.attr('title');

            const pubDateText = $element.find('span.span01').text().trim();

            return {
                title,
                link,
                pubDate: pubDateText || null,
            };
        });
}
